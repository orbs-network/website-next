import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { BLOG_INDEX_PATH, HOME_PATH, postPath } from '@/app/lib/routes'

/**
 * On-demand revalidation for Contentful.
 *
 * Configure a webhook in the Contentful space pointing at this route for
 * Entry publish / unpublish / delete, with a custom header:
 *
 *   x-contentful-webhook-secret: <CONTENTFUL_REVALIDATE_SECRET>
 *
 * Publishing a post refreshes that post plus the pages that list it, rather
 * than forcing a full redeploy. The `revalidate = 3600` on the content routes
 * is the fallback if a webhook is ever missed.
 */

const SECRET_HEADER = 'x-contentful-webhook-secret'
const LOCALE = process.env.CONTENTFUL_LOCALE || 'en-US'

type ContentfulWebhookBody = {
  sys?: {
    id?: string
    contentType?: { sys?: { id?: string } }
  }
  fields?: {
    slug?: Record<string, string | undefined>
  }
}

/** Constant-time comparison that does not leak length via early return. */
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false

  return timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const expected = process.env.CONTENTFUL_REVALIDATE_SECRET
  if (!expected) {
    console.error('[revalidate] CONTENTFUL_REVALIDATE_SECRET is not set; refusing all requests')
    return NextResponse.json({ message: 'Revalidation is not configured' }, { status: 500 })
  }

  if (!secretMatches(request.headers.get(SECRET_HEADER), expected)) {
    console.warn('[revalidate] rejected request with missing or invalid secret')
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: ContentfulWebhookBody
  try {
    body = await request.json()
  } catch (error) {
    console.error('[revalidate] could not parse webhook body:', error)
    return NextResponse.json({ message: 'Body is not valid JSON' }, { status: 400 })
  }

  const topic = request.headers.get('x-contentful-topic') ?? 'unknown'
  const contentType = body.sys?.contentType?.sys?.id
  const entryId = body.sys?.id ?? 'unknown'

  // Anything that isn't a blog post (an author, an asset, a delete payload with
  // no contentType) can affect an unknown number of pages. Revalidating the
  // layout is blunt but correct; these are rare compared to post publishes.
  if (contentType !== 'blogPost') {
    revalidatePath(HOME_PATH, 'layout')
    console.info(`[revalidate] ${topic} ${contentType ?? 'unknown type'} ${entryId} -> revalidated all paths`)
    return NextResponse.json({ revalidated: ['layout'], topic, contentType: contentType ?? null })
  }

  const paths = [HOME_PATH, BLOG_INDEX_PATH]

  // Delete and unpublish payloads carry no fields, so there may be no slug to
  // target. The index pages still need refreshing either way.
  const slug = body.fields?.slug?.[LOCALE]
  if (slug) {
    paths.push(postPath(slug))
  } else {
    console.info(`[revalidate] ${topic} for ${entryId} carried no slug; refreshing index pages only`)
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  console.info(`[revalidate] ${topic} ${entryId} -> ${paths.join(', ')}`)
  return NextResponse.json({ revalidated: paths, topic })
}

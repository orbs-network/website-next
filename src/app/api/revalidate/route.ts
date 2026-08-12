import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { BLOG_INDEX_PATH, HOME_PATH, postPath } from '@/app/lib/routes'
import { isValidSlug, secretMatches } from '@/app/lib/secrets'

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
  const action = topic.split('.').pop() ?? 'unknown'
  const contentType = body.sys?.contentType?.sys?.id
  const entryId = body.sys?.id ?? 'unknown'
  const slug = body.fields?.slug?.[LOCALE]

  // Cases where a targeted revalidation cannot be correct, so sweep everything:
  //
  //  - Removal (unpublish / delete / archive). Delete sends a DeletedEntry with
  //    no fields, so there is often no slug to target — and this is precisely
  //    when stale HTML must not keep being served.
  //  - Anything that isn't a blogPost. An author or asset change can affect an
  //    unbounded number of posts.
  //
  // A layout sweep is blunt, but these are rare next to routine publishes.
  const isRemoval = action === 'unpublish' || action === 'delete' || action === 'archive'

  if (isRemoval || contentType !== 'blogPost') {
    revalidatePath(HOME_PATH, 'layout')
    const reason = isRemoval ? action : `non-blogPost type "${contentType ?? 'unknown'}"`
    console.info(`[revalidate] ${topic} ${entryId} (${reason}) -> swept all paths`)
    return NextResponse.json({ revalidated: ['layout'], topic, reason })
  }

  const paths = [HOME_PATH, BLOG_INDEX_PATH]

  if (slug && isValidSlug(slug)) {
    paths.push(postPath(slug))
  } else if (slug) {
    console.warn(`[revalidate] ${topic} for ${entryId} carried a malformed slug; refreshing index pages only`)
  } else {
    // A publish with no slug shouldn't happen, but refreshing the indexes is
    // strictly better than doing nothing.
    console.warn(`[revalidate] ${topic} for ${entryId} carried no slug; refreshing index pages only`)
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  console.info(`[revalidate] ${topic} ${entryId} -> ${paths.join(', ')}`)
  return NextResponse.json({ revalidated: paths, topic })
}

/*
 * Known limitation: renaming a slug.
 *
 * The publish payload carries only the new slug, so the old URL keeps serving
 * cached HTML until the 1h `revalidate` fallback expires. Fixing it properly
 * means tracking slug history, which is not worth it while renames are rare and
 * the staleness is bounded. If that changes, the fix is to store the previous
 * slug per entry ID and revalidate both.
 */

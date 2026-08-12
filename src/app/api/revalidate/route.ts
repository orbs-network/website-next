import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { BLOG_INDEX_PATH, BLOG_PAGE_ROUTE, HOME_PATH, postPath } from '@/app/lib/routes'
import { secretMatches } from '@/app/lib/secrets'

/**
 * On-demand revalidation for Contentful.
 *
 * Configure a webhook in the Contentful space pointing at this route with the
 * custom header:
 *
 *   x-contentful-webhook-secret: <CONTENTFUL_REVALIDATE_SECRET>
 *
 * IMPORTANT — the URL must end with a trailing slash:
 *
 *   https://<host>/api/revalidate/          correct
 *   https://<host>/api/revalidate           308 redirect
 *
 * `trailingSlash: true` in next.config.mjs applies to route handlers as well
 * as pages. A POST to the slashless form returns a 308, and while 308 is
 * defined to preserve method and body, whether the webhook client follows it
 * at all is out of our hands. Point it at the canonical form and the question
 * never arises.
 *
 * Subscribe it to ALL of the following, since the handler depends on each:
 *
 *   Entry:  publish, unpublish, delete, archive
 *   Asset:  publish, unpublish, delete, archive
 *
 * Entry events cover posts and authors. Asset events matter because a
 * re-uploaded hero image or changed caption alters pages that no entry event
 * would touch. Omitting archive leaves archived posts live.
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
  //  - A blogPost publish carrying no slug. `slug` is optional in the content
  //    model, so an editor can clear it. The entry's old URL is then
  //    unreachable from this payload and would otherwise stay cached.
  //
  // A layout sweep is blunt, but these are rare next to routine publishes.
  const isRemoval = action === 'unpublish' || action === 'delete' || action === 'archive'
  const isBlogPost = contentType === 'blogPost'

  // Narrowing on `!slug` directly (rather than via a derived boolean) is what
  // lets TypeScript treat `slug` as a string below.
  if (isRemoval || !isBlogPost || !slug) {
    revalidatePath(HOME_PATH, 'layout')

    const reason = isRemoval
      ? action
      : !isBlogPost
        ? `non-blogPost type "${contentType ?? 'unknown'}"`
        : 'blogPost publish with no slug'

    console.info(`[revalidate] ${topic} ${entryId} (${reason}) -> swept all paths`)
    return NextResponse.json({ revalidated: ['layout'], topic, reason })
  }

  // No shape check on the slug here, on purpose. It is only ever handed to
  // revalidatePath(), never to a redirect, so an odd value is at worst a no-op
  // against a path that does not exist. Validating would mean *skipping*
  // revalidation for a post the [slug] route serves happily, which is the
  // worse failure — it would leave real content stale.
  const paths = [HOME_PATH, BLOG_INDEX_PATH, postPath(slug)]

  for (const path of paths) {
    revalidatePath(path)
  }

  // Publishing shifts every later post down a page, so one publish changes all
  // N archive pages, not just the first. Passing the route pattern with type
  // 'page' invalidates every generated instance in a single call, which avoids
  // fetching the page count on every webhook.
  revalidatePath(BLOG_PAGE_ROUTE, 'page')

  const revalidated = [...paths, BLOG_PAGE_ROUTE]
  console.info(`[revalidate] ${topic} ${entryId} -> ${revalidated.join(', ')}`)
  return NextResponse.json({ revalidated, topic })
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

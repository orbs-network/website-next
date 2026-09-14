import { cache } from 'react'
import * as contentful from 'contentful'
import type { Asset, Entry, UnresolvedLink } from 'contentful'
import { TypeBlogPostSkeleton, TypeAuthorSkeleton, TypeMediaMentionSkeleton } from '../generated-types'
import { isReservedRootSlug } from './routes'

// Resolved blog post type - what we get back from the API
type BlogPost = Entry<TypeBlogPostSkeleton, undefined, string>
export type BlogPostFields = BlogPost['fields']

// Type for assets that may or may not be resolved
type MaybeAsset = Asset | UnresolvedLink<'Asset'> | undefined

// Type for author entries that may or may not be resolved
type MaybeAuthor = Entry<TypeAuthorSkeleton, undefined, string> | UnresolvedLink<'Entry'> | undefined

// Author info extracted from an entry
export type AuthorInfo = {
  name: string
  profilePictureUrl: string | null
  profileUrl: string | null
}

/**
 * Safely extract URL from a Contentful asset that may be unresolved
 */
export function getAssetUrl(asset: MaybeAsset): string | null {
  if (!asset || !('fields' in asset)) {
    return null
  }
  const url = asset.fields?.file?.url
  return url ? `https:${url}` : null
}

/**
 * Safely extract author info from a Contentful entry that may be unresolved
 */
export function getAuthorInfo(author: MaybeAuthor): AuthorInfo | null {
  if (!author || !('fields' in author)) {
    return null
  }

  const fields = author.fields
  return {
    name: fields.name || 'Unknown Author',
    profilePictureUrl: getAssetUrl(fields.profilePicture as MaybeAsset),
    profileUrl: fields.profileUrl || null,
  }
}

const spaceId = process.env.CONTENTFUL_SPACE_ID
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
const previewAccessToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN

/**
 * @param preview When true, read through Contentful's Preview API so that
 *   unpublished drafts are returned. Only ever set from `draftMode()`, which
 *   requires the signed bypass cookie issued by /api/preview.
 */
function getClient(preview = false) {
  if (!spaceId || !accessToken) {
    throw new Error(
      'Contentful environment variables are not set. ' + 'Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN.'
    )
  }

  if (preview) {
    if (!previewAccessToken) {
      throw new Error('Draft mode is enabled but CONTENTFUL_PREVIEW_ACCESS_TOKEN is not set.')
    }

    return contentful.createClient({
      space: spaceId,
      accessToken: previewAccessToken,
      host: 'preview.contentful.com',
    })
  }

  return contentful.createClient({
    space: spaceId,
    accessToken: accessToken,
  })
}

/**
 * Let the BUILD finish without Contentful, when explicitly allowed to.
 *
 * Two conditions, both required. `CONTENTFUL_ALLOW_DEGRADED=1` is the
 * operator's opt-in; `NEXT_PHASE` restricts it to `next build`. With both, a
 * Contentful AVAILABILITY failure stops being fatal for that query, which lets
 * work with nothing to do with the blog — the marketing pages, all of Phase 3 —
 * ship while the space is down (#115).
 *
 * THE PHASE CHECK IS THE LOAD-BEARING HALF. Without it the same fallback
 * applies to request-time rendering, and empty is not a safe answer there:
 *
 *  - `sitemap.ts` and the RSS route are `force-dynamic`, so they render per
 *    request. Degrading them serves a sitemap listing no posts and a feed
 *    containing no items — with a 200, so the CDN caches it for the 24 hours
 *    #117 and #118 configured. Telling crawlers the entire archive has gone,
 *    then holding that answer for a day, is far worse than the 500 they would
 *    otherwise get and retry.
 *  - An ISR page rendered empty at request time caches an empty 200 for its
 *    revalidate window, so a transient blip outlives itself.
 *
 * A build-time empty is contained by comparison: it lands in the deploy's
 * initial static output and is corrected by the first revalidation once the
 * space recovers. That is the trade being made, and it is only worth making
 * because orbs.com still serves from the legacy host, so this deployment has no
 * public readers. **Unset the flag before the DNS cutover (#39).**
 */
const DEGRADE_DURING_BUILD =
  process.env.CONTENTFUL_ALLOW_DEGRADED === '1' && process.env.NEXT_PHASE === 'phase-production-build'

/**
 * The HTTP status of a Contentful failure, if that failure is an availability
 * one — and `null` for anything else.
 *
 * Availability means the space is there but cannot serve right now: 402 (quota
 * exhausted or blocked), 429 (rate limited), 5xx (upstream). Those are worth
 * riding out.
 *
 * 401, 403 and 404 are deliberately NOT in that set. A bad token, a revoked
 * key or a wrong space id must stay fatal — degrading those would turn a
 * misconfigured deployment into a site that builds happily with no content,
 * which is far worse than a failed build.
 *
 * The SDK reports the status inconsistently — sometimes on the error, sometimes
 * on a `response`, and for the blocked-space case only inside a JSON string in
 * `message` — so all three are checked rather than assuming one shape.
 */
function availabilityFailureStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null

  const candidate = error as { status?: unknown; response?: { status?: unknown }; message?: unknown }
  const reported = candidate.response?.status ?? candidate.status
  let status = typeof reported === 'number' ? reported : null

  if (status === null && typeof candidate.message === 'string') {
    const embedded = candidate.message.match(/"status"\s*:\s*(\d{3})/)
    if (embedded) status = Number(embedded[1])
  }

  if (status === null) return null

  // Bounded at 600: a status outside the defined range is a malformed response,
  // not an upstream saying "try later", and should stay fatal rather than be
  // read as one.
  const isAvailability = status === 402 || status === 429 || (status >= 500 && status < 600)

  return isAvailability ? status : null
}

/**
 * Run a Contentful query, falling back to `empty` only when the space is
 * unavailable AND `DEGRADE_DURING_BUILD` allows it.
 *
 * Everything else propagates untouched: any error at request time, any error
 * with the flag unset, and any non-availability error in either case. So the
 * default behaviour of both the build and the running site is exactly what it
 * was.
 */
async function degradable<T>(what: string, empty: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    const status = availabilityFailureStatus(error)
    if (status === null || !DEGRADE_DURING_BUILD) throw error

    console.warn(
      `[api] ${what}: Contentful returned ${status} and CONTENTFUL_ALLOW_DEGRADED is set — ` +
        'building with no data. This will be empty in the deployed output until the space ' +
        'recovers and the page revalidates.'
    )
    return empty
  }
}

// Contentful's CDA caps a single response at 1000 entries and defaults to 100.
// Always pass an explicit limit — the default silently truncates.
const CDA_MAX_LIMIT = 1000

/** Posts per page on the blog index. Divides evenly into the 1/2/3-col grid. */
export const POSTS_PER_PAGE = 12

/**
 * The single ordering used by every post query.
 *
 * `sys.id` breaks ties on `date`. Dates are day-precision and 18 of the current
 * 320 posts share one with another post, so date alone is not a total order.
 * That matters in two ways:
 *
 *  - Any query paginating on `skip` can return a tie group in a different
 *    order between consecutive pages, so a post lands on both pages or on
 *    neither. For `getAllPostSlugs` that means a post never gets prerendered.
 *  - Two queries using different orderings disagree with each other, so the
 *    home page's recent posts can contradict page 1 of the blog.
 *
 * Anything ordering posts must use this. Do not inline a different one.
 */
const POST_ORDER = ['-fields.date', 'sys.id'] as const

export type PostPage = {
  items: BlogPostFields[]
  total: number
}

/**
 * One page of posts, newest first, plus the total count for pagination.
 *
 * Ordering is done by Contentful rather than in JS, so each page is a slice of
 * a globally sorted set. Sorting client-side over a partial result is what
 * previously disguised the fact that only the first 100 entries were being
 * returned at all.
 */
/**
 * Drops posts whose slug collides with a site route.
 *
 * Applied to the listing queries as well as the archive enumeration: a card or
 * feed item for a colliding post links to `/jp/` or `/blog/` rather than the
 * article, so surfacing it publishes a broken link even though the post is
 * excluded from prerendering.
 *
 * A filtered page returns fewer items than `total` claims. That is accepted —
 * this should never fire, and one short page beats a link that goes somewhere
 * else entirely.
 */
function withoutReservedSlugs(posts: BlogPostFields[]): BlogPostFields[] {
  return posts.filter((post) => {
    if (!post.slug || !isReservedRootSlug(post.slug)) return true

    console.warn(`[api] Hiding post with reserved slug "${post.slug}" from listings — it collides with a site route.`)
    return false
  })
}

export async function getPosts({ skip = 0, limit = POSTS_PER_PAGE } = {}): Promise<PostPage> {
  return degradable('getPosts', { items: [], total: 0 }, async () => {
    const client = getClient()

    const page = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      order: [...POST_ORDER],
      limit: Math.min(limit, CDA_MAX_LIMIT),
      skip,
    })

    return {
      items: withoutReservedSlugs(page.items.map((post) => post.fields)),
      total: page.total,
    }
  })
}

/**
 * The N most recent posts. Asks Contentful for N rather than fetching a larger
 * set and discarding most of it.
 */
export async function getRecentPosts(count: number): Promise<BlogPostFields[]> {
  return degradable('getRecentPosts', [], async () => {
    const client = getClient()

    const posts = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      order: [...POST_ORDER],
      limit: count,
    })

    return withoutReservedSlugs(posts.items.map((post) => post.fields))
  })
}

/** Media mentions per page. Matches the blog's 12 for a consistent grid. */
export const MEDIA_PER_PAGE = 12

type MediaMention = Entry<TypeMediaMentionSkeleton, undefined, string>
export type MediaMentionFields = MediaMention['fields']

export type MediaPage = {
  items: MediaMentionFields[]
  total: number
}

/**
 * One page of press mentions, newest first.
 *
 * Ordered by `-fields.date` with `sys.id` as tiebreaker, for the same reason
 * the blog does: offset pagination over a non-total order puts an item on two
 * pages or on neither.
 */
export async function getMediaMentions({ skip = 0, limit = MEDIA_PER_PAGE } = {}): Promise<MediaPage> {
  return degradable('getMediaMentions', { items: [], total: 0 }, async () => {
    const client = getClient()

    const page = await client.getEntries<TypeMediaMentionSkeleton>({
      content_type: 'mediaMention',
      order: ['-fields.date', 'sys.id'],
      limit: Math.min(limit, CDA_MAX_LIMIT),
      skip,
    })

    return {
      items: page.items.map((item) => item.fields),
      total: page.total,
    }
  })
}

/**
 * Newest modification across all mentions, plus the total.
 *
 * Ordered by `sys.updatedAt`, NOT `fields.date`. An editor republishing an
 * older mention or backfilling a dated article changes the /news pages without
 * moving the newest article date — the blog sitemap already uses modification
 * time for the same reason.
 */
export async function getMediaSummary(): Promise<{ total: number; lastModified: Date | null }> {
  return degradable('getMediaSummary', { total: 0, lastModified: null }, async () => {
    const client = getClient()

    const page = await client.getEntries<TypeMediaMentionSkeleton>({
      content_type: 'mediaMention',
      order: ['-sys.updatedAt'],
      select: ['sys.updatedAt'],
      limit: 1,
    })

    const newest = page.items[0]?.sys.updatedAt

    return {
      total: page.total,
      lastModified: newest ? new Date(newest) : null,
    }
  })
}

export type PostRef = {
  slug: string
  /** Publish date, from the content model. Drives ordering and display. */
  date: string
  /**
   * Last modification, from Contentful's sys metadata. Distinct from `date`:
   * editing a published article does not move its publish date, so `date` would
   * make <lastmod> permanently wrong for every post that is ever corrected.
   */
  updatedAt: string
}

/**
 * Every post as `{ slug, date }`, newest first.
 *
 * Uses `select` so Contentful returns two fields rather than each post's full
 * Rich Text body. Callers here enumerate the archive — `generateStaticParams()`
 * and the sitemap — and fetching ~460 complete documents for a list of URLs is
 * a build-time cost that grows with the archive for no benefit.
 */
export async function getAllPostRefs(): Promise<PostRef[]> {
  return degradable('getAllPostRefs', [], async () => {
    const client = getClient()
    const refs: PostRef[] = []
    let skip = 0

    for (;;) {
      const page = await client.getEntries<TypeBlogPostSkeleton>({
        content_type: 'blogPost',
        select: ['fields.slug', 'fields.date', 'sys.updatedAt'],
        order: [...POST_ORDER],
        limit: CDA_MAX_LIMIT,
        skip,
      })

      for (const post of page.items) {
        if (!post.fields.slug) continue

        // A post slugged `blog`, `jp`, `ko`... is shadowed by a real route, since
        // static segments beat `[slug]`. Emitting it anyway would prerender a URL
        // that renders something else and list it in the sitemap as the post.
        // Dropped rather than published broken, and logged so it is fixable —
        // silence here would look exactly like the post never existing.
        if (isReservedRootSlug(post.fields.slug)) {
          console.warn(
            `[api] Post ${post.sys.id} has the reserved slug "${post.fields.slug}", which collides with a site route. ` +
              'It is excluded from generateStaticParams and the sitemap. Rename the slug in Contentful.'
          )
          continue
        }

        refs.push({
          slug: post.fields.slug,
          date: post.fields.date,
          updatedAt: post.sys.updatedAt || post.fields.date,
        })
      }

      skip += page.items.length
      if (skip >= page.total || page.items.length === 0) break
    }

    return refs
  })
}

/** Slugs only, for `generateStaticParams()`. */
export async function getAllPostSlugs(): Promise<string[]> {
  return (await getAllPostRefs()).map((ref) => ref.slug)
}

/**
 * Look a post up by its Contentful entry ID.
 *
 * Used by the preview route. An entry ID is opaque and ASCII, so it survives a
 * query string untouched — unlike a slug, where the two legacy `&` slugs would
 * be truncated at the ampersand (`slug=Orbs-Farming-&-Single...` parses as
 * `slug=Orbs-Farming-`) and the two U+200A slugs need encoding.
 */
export async function getPostById(entryId: string, preview = false): Promise<BlogPostFields | null> {
  const client = getClient(preview)

  try {
    const entry = await client.getEntry<TypeBlogPostSkeleton>(entryId)
    return entry.fields
  } catch {
    return null
  }
}

/**
 * Wrapped in React `cache()` so the two reads of one post share a request.
 *
 * Every post route reads this twice — once in `generateMetadata`, once in the
 * page body — because the metadata has to come from the same source the body
 * renders or a draft renders under published metadata. Next dedupes repeated
 * `fetch()` calls automatically, but the Contentful SDK uses its own HTTP
 * client, so those two reads were invisible to it and went out as two requests.
 * Across a full prerender of the archive that was ~460 wasted round trips per
 * build, each pulling a complete Rich Text document.
 *
 * `cache()` is scoped to a single render pass, so this dedupes the pair without
 * holding anything between requests — freshness still comes from `revalidate`
 * and the Contentful webhook, unchanged.
 *
 * NB: the memo key is the argument LIST, so `getPostBySlug(slug)` and
 * `getPostBySlug(slug, false)` are separate entries despite being equivalent.
 * Both call sites pass `isDraft` explicitly. Keep it that way, or the dedupe
 * silently stops working.
 *
 * @param preview Read through the Preview API so unpublished drafts resolve.
 *   Pass `(await draftMode()).isEnabled` — never a value derived from user input.
 */
export const getPostBySlug = cache(async (slug: string, preview = false): Promise<BlogPostFields | null> => {
  return degradable('getPostBySlug', null, async () => {
    const client = getClient(preview)

    const posts = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    })

    if (!posts.items.length) {
      return null
    }

    return posts.items[0].fields
  })
})

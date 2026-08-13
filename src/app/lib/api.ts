import * as contentful from 'contentful'
import type { Asset, Entry, UnresolvedLink } from 'contentful'
import { TypeBlogPostSkeleton, TypeAuthorSkeleton } from '../generated-types'

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
export async function getPosts({ skip = 0, limit = POSTS_PER_PAGE } = {}): Promise<PostPage> {
  const client = getClient()

  const page = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    order: [...POST_ORDER],
    limit: Math.min(limit, CDA_MAX_LIMIT),
    skip,
  })

  return {
    items: page.items.map((post) => post.fields),
    total: page.total,
  }
}

/**
 * The N most recent posts. Asks Contentful for N rather than fetching a larger
 * set and discarding most of it.
 */
export async function getRecentPosts(count: number): Promise<BlogPostFields[]> {
  const client = getClient()

  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    order: [...POST_ORDER],
    limit: count,
  })

  return posts.items.map((post) => post.fields)
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
      if (post.fields.slug) {
        refs.push({
          slug: post.fields.slug,
          date: post.fields.date,
          updatedAt: post.sys.updatedAt || post.fields.date,
        })
      }
    }

    skip += page.items.length
    if (skip >= page.total || page.items.length === 0) break
  }

  return refs
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
 * @param preview Read through the Preview API so unpublished drafts resolve.
 *   Pass `(await draftMode()).isEnabled` — never a value derived from user input.
 */
export async function getPostBySlug(slug: string, preview = false): Promise<BlogPostFields | null> {
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
}


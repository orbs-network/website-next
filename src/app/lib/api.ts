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

/**
 * Every blog post, newest first.
 *
 * Ordering is done by Contentful (`-fields.date`) rather than in JS so that
 * each page of a paginated fetch is drawn from a globally sorted set. Sorting
 * client-side over a partial result is what previously disguised the fact that
 * only the first 100 entries were being returned at all.
 */
export async function getAllPosts(): Promise<BlogPostFields[]> {
  const client = getClient()
  const items: BlogPostFields[] = []
  let skip = 0

  for (;;) {
    const page = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      order: ['-fields.date'],
      limit: CDA_MAX_LIMIT,
      skip,
    })

    items.push(...page.items.map((post) => post.fields))

    skip += page.items.length
    if (skip >= page.total || page.items.length === 0) break
  }

  return items
}

/**
 * The N most recent posts. Prefer this over slicing `getAllPosts()` — it asks
 * Contentful for N rather than pulling the whole archive to discard most of it.
 */
export async function getRecentPosts(count: number): Promise<BlogPostFields[]> {
  const client = getClient()

  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    order: ['-fields.date'],
    limit: count,
  })

  return posts.items.map((post) => post.fields)
}

/**
 * Slugs only, for `generateStaticParams()`.
 *
 * Uses `select` so Contentful returns just the slug field instead of every
 * post's full Rich Text body — the route only needs the slugs to enumerate
 * paths, and fetching complete documents for that is a large build-time cost
 * that grows with the archive.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const client = getClient()
  const slugs: string[] = []
  let skip = 0

  for (;;) {
    const page = await client.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      select: ['fields.slug'],
      order: ['-fields.date'],
      limit: CDA_MAX_LIMIT,
      skip,
    })

    for (const post of page.items) {
      if (post.fields.slug) slugs.push(post.fields.slug)
    }

    skip += page.items.length
    if (skip >= page.total || page.items.length === 0) break
  }

  return slugs
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


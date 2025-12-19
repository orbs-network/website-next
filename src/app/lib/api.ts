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

function getClient() {
  if (!spaceId || !accessToken) {
    throw new Error(
      'Contentful environment variables are not set. ' + 'Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN.'
    )
  }

  return contentful.createClient({
    space: spaceId,
    accessToken: accessToken,
  })
}

export async function getAllPosts(): Promise<BlogPostFields[]> {
  const client = getClient()

  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
  })

  return posts.items
    .map((post) => post.fields)
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

export async function getPostBySlug(slug: string): Promise<BlogPostFields | null> {
  const client = getClient()

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

export async function getPostAndMorePosts(slug: string): Promise<{
  post: BlogPostFields | null
  morePosts: BlogPostFields[]
}> {
  const client = getClient()

  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
  })

  if (!posts.items.length) {
    return { post: null, morePosts: [] }
  }

  const post = posts.items[0].fields

  // Fetch more posts excluding the current one
  const allPosts = await getAllPosts()
  const morePosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3)

  return { post, morePosts }
}

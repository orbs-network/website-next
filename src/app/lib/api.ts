import * as contentful from 'contentful'
import { TypeBlogPost, TypeBlogPostFields } from '../generated-types'

const spaceId = process.env.CONTENTFUL_SPACE_ID
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

if (!spaceId || !accessToken) {
  throw new Error('Contentful environment variables are not set')
}

const client = contentful.createClient({
  space: spaceId,
  accessToken: accessToken,
})

export async function getAllPosts(): Promise<TypeBlogPostFields[]> {
  const posts = await client.getEntries<TypeBlogPost>({
    content_type: 'blogPost',
  })

  return posts.items
    .map((post) => post.fields)
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

export async function getPostAndMorePosts(
  slug: string
): Promise<{ post: TypeBlogPostFields; morePosts: TypeBlogPostFields[] }> {
  const query: Record<string, string> = {
    'fields.slug': slug,
  }

  const posts = await client.getEntries<TypeBlogPost>({
    content_type: 'blogPost',
    ...query,
  })

  return {
    post: posts.items[0].fields,
    morePosts: [],
  }
}

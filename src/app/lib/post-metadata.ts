import type { Document, Block, Inline, Text } from '@contentful/rich-text-types'
import { getAssetImage, getAssetUrl, getAuthorInfo, type BlogPostFields } from './api'
import { encodedPostPath } from './routes'
import { absoluteUrl } from './site'
import { withSocialMetadata } from './social-metadata'

function textContent(node: Document | Block | Inline | Text): string {
  return node.nodeType === 'text' ? node.value : node.content.map(textContent).join(' ')
}

export function postMetadata(post: BlogPostFields, slug: string) {
  const text = textContent(post.content).replace(/\s+/g, ' ').trim() || post.title
  const excerpt = text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text
  const description = post.shortDescription?.trim() || excerpt
  const heroUrl = getAssetUrl(post.heroImage)
  const image = getAssetImage(post.heroImage) ?? (heroUrl ? { url: heroUrl } : undefined)
  const author = getAuthorInfo(post.author)

  return withSocialMetadata(
    {
      title: post.title,
      description,
      alternates: { canonical: absoluteUrl(encodedPostPath(slug)) },
    },
    {
      image,
      article: { publishedTime: post.date, ...(author ? { authors: [author.profileUrl ?? author.name] } : {}) },
    }
  )
}

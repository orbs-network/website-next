import type { ReactNode } from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { getAllPosts, getPostBySlug, getAssetUrl, getAuthorInfo } from '../lib/api'
import { Author } from '../components/blog/author'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Helper to unwrap paragraph from list item children
function unwrapParagraphFromListItem(children: ReactNode): ReactNode {
  // Children is typically an array with a single <p> element
  // We want to extract the content from inside the <p>
  if (Array.isArray(children) && children.length === 1) {
    const child = children[0]
    // Check if it's a paragraph element and extract its children
    if (
      child &&
      typeof child === 'object' &&
      'type' in child &&
      child.type === 'p' &&
      'props' in child &&
      child.props?.children
    ) {
      return child.props.children
    }
  }
  return children
}

// Rich text rendering options for embedded assets and entries
const richTextOptions: Options = {
  renderNode: {
    // Fix list items containing unnecessary <p> tags
    [BLOCKS.LIST_ITEM]: (node, children) => <li>{unwrapParagraphFromListItem(children)}</li>,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields
      const url = file?.url
      const mimeType = file?.contentType

      if (!url) return null

      // Handle images
      if (mimeType?.startsWith('image/')) {
        return (
          <figure className="my-8">
            <Image
              src={`https:${url}`}
              alt={description || title || 'Embedded image'}
              width={file.details?.image?.width || 800}
              height={file.details?.image?.height || 600}
              className="rounded-lg w-full h-auto"
              unoptimized
            />
            {description && <figcaption className="text-center text-sm text-gray-500 mt-2">{description}</figcaption>}
          </figure>
        )
      }

      // Handle videos
      if (mimeType?.startsWith('video/')) {
        return (
          <video controls className="w-full my-8 rounded-lg">
            <source src={`https:${url}`} type={mimeType} />
          </video>
        )
      }

      // Handle other files as download links
      return (
        <a
          href={`https:${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          📎 {title || 'Download file'}
        </a>
      )
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a href={node.data.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {children}
      </a>
    ),
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return posts
    .filter((post) => post.slug)
    .map((post) => ({
      slug: post.slug as string,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.shortDescription || '',
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const heroImageUrl = getAssetUrl(post.heroImage)
  const author = getAuthorInfo(post.author)

  return (
    <div className="container mx-auto p-5">
      <Button variant="outline" asChild className="mb-10" size="sm">
        <Link href="/blog">
          <ArrowLeft /> Back
        </Link>
      </Button>

      <article className="container mx-auto px-5 py-10 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 text-gray-500">
            {author && <Author author={author} />}
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        {heroImageUrl && (
          <div className="mb-10 relative aspect-video">
            <Image src={heroImageUrl} alt={post.title} fill className="object-cover rounded-lg" unoptimized />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {documentToReactComponents(post.content, richTextOptions)}
        </div>
      </article>
    </div>
  )
}

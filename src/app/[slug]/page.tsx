import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { Author } from '../components/blog/author'
import { getAllPosts, getAssetUrl, getAuthorInfo, getPostBySlug } from '../lib/api'
import { BackButton } from './back-button'
import { Heading3 } from '../components/typography'
import { Separator } from '@/components/ui/separator'

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
            {description && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">{description}</figcaption>
            )}
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
          className="inline-flex items-center gap-2 text-primary no-underline hover:underline hover:text-secondary"
        >
          📎 {title || 'Download file'}
        </a>
      )
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary no-underline hover:underline hover:text-secondary"
      >
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
      <BackButton />
      <article className="container mx-auto px-5 py-8 max-w-4xl">
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

        <Separator className="my-10" />

        <footer className="mt-10 prose dark:prose-invert max-w-none">
          <Heading3>About Orbs</Heading3>

          <p>
            Orbs is a decentralized Layer-3 (L3) blockchain designed specifically for advanced on-chain trading.
            Utilizing a Proof-of-Stake consensus, Orbs acts as a supplementary execution layer, facilitating complex
            logic and scripts beyond the native functionalities of smart contracts. Orbs-powered protocols, including
            dLIMIT, dTWAP, Liquidity Hub, and Perpetual Hub, push the boundaries of DeFi by introducing CeFi-level
            execution to on-chain trading.
          </p>

          <p>
            With a global team of over forty dedicated contributors based in Tel Aviv, London, New York, Tokyo, Seoul,
            Lisbon, and Limassol, Orbs continues to innovate at the forefront of blockchain technology.
          </p>

          <p>
            For more information, visit{' '}
            <a
              href="https://www.orbs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary no-underline hover:underline hover:text-secondary"
            >
              www.orbs.com
            </a>{' '}
            or join our community:
          </p>

          <ul>
            <li>
              <a
                href="https://t.me/OrbsNetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary no-underline hover:underline hover:text-secondary"
              >
                Telegram
              </a>
            </li>
            <li>
              <a
                href="https://x.com/orbs_network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary no-underline hover:underline hover:text-secondary"
              >
                X
              </a>
            </li>
          </ul>
        </footer>
      </article>
    </div>
  )
}

import { Separator } from '@/components/ui/separator'
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'
import { Author } from '@/app/components/blog/author'
import { H4 } from '@/app/components/typography'
import { getAllPostSlugs, getAssetUrl, getAuthorInfo, getPostBySlug } from '@/app/lib/api'
import { encodedPostPath } from '@/app/lib/routes'
import { absoluteUrl } from '@/app/lib/site'
import { BackButton } from './back-button'

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
              className="rounded-[var(--radius)] w-full h-auto"
              sizes="(min-width: 896px) 896px, 100vw"
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
          <video controls className="w-full my-8 rounded-[var(--radius)]">
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

// Time-based fallback. On-demand invalidation via the Contentful webhook
// (#19) is the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

/**
 * How much of the archive a production build renders ahead of time.
 *
 * Sized to the traffic pattern rather than the archive. Posts get their views
 * in bursts from Twitter link-backs, and what gets linked is a post that was
 * just published — so warming the newest window covers essentially every burst,
 * while the older ~400 posts, which are linked rarely and read rarely, do not
 * need to be paid for on every deploy.
 *
 * Raise it if link-backs to older posts turn out to be common. The cost is
 * linear: one Contentful read per post per production build.
 */
const PRERENDERED_POST_COUNT = 50

/**
 * Prerender the newest posts, and only on production builds.
 *
 * Returning a slug here means "render this page at build time", so each one
 * costs a Contentful read on every build. Two things bound that:
 *
 *  - **Environment.** Preview deploys are built on every push and nobody reads
 *    their archive; local builds run constantly while developing. Between them
 *    they were the bulk of this project's Contentful consumption, and in
 *    September 2026 they exhausted the space's Delivery API allowance outright,
 *    blocking every build including production (#115).
 *  - **Count.** Prerendering all ~456 posts made deploys the single largest
 *    consumer even after the environment gate — roughly 15% of the monthly
 *    allowance spent on shipping rather than on serving anyone.
 *
 * `dynamicParams` is left at its default of `true`, so the posts omitted here
 * are not gone: they render on first request and are then cached and
 * revalidated exactly as a prerendered page is. The only difference is who pays
 * for the first render — and for a post nobody has opened in a year, nobody
 * was going to.
 *
 * The sitemap enumerates posts independently (`getAllPostRefs`), so what is
 * prerendered has no bearing on what crawlers are told exists.
 *
 * To exercise the production path locally, set `VERCEL_ENV=production`.
 */
export async function generateStaticParams() {
  if (process.env.VERCEL_ENV !== 'production') return []

  // Newest first — `getAllPostSlugs` preserves POST_ORDER, so this is the most
  // recent window rather than an arbitrary slice.
  const slugs = await getAllPostSlugs()

  return slugs.slice(0, PRERENDERED_POST_COUNT).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Must match the source the page body reads, or previewing an unpublished or
  // retitled draft renders draft content under published (or "Post Not Found")
  // metadata.
  const { isEnabled: isDraft } = await draftMode()
  const post = await getPostBySlug(slug, isDraft)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.shortDescription || '',
    alternates: {
      // Absolute, matching the sitemap. A relative canonical resolves against
      // the request host, so a post served from a Vercel alias would
      // self-canonicalize that hostname and compete with the real domain.
      canonical: absoluteUrl(encodedPostPath(slug)),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = await getPostBySlug(slug, isDraft)

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
            <Image
              src={heroImageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover rounded-[var(--radius)]"
              sizes="(min-width: 896px) 896px, 100vw"
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {documentToReactComponents(post.content, richTextOptions)}
        </div>

        <Separator className="my-10" />

        <footer className="mt-10 prose dark:prose-invert max-w-none">
          <H4>About Orbs</H4>

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

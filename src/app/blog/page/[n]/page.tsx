import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogIndex, getTotalPages } from '../../blog-index'
import { blogPagePath } from '../../../lib/routes'
import { absoluteUrl } from '../../../lib/site'

type Props = {
  params: Promise<{ n: string }>
}

// Time-based fallback. On-demand invalidation via the Contentful webhook
// (#19) is the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

/**
 * Page 1 is served by /blog, so this route starts at 2. Generating a
 * /blog/page/1 would create a second URL for identical content.
 */
export async function generateStaticParams() {
  const totalPages = await getTotalPages()

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    n: String(index + 2),
  }))
}

/**
 * Far above any plausible archive (10k pages is 120k posts), but low enough
 * that `skip` stays a small integer Contentful accepts.
 *
 * Without an upper bound, `/blog/page/999999999999999999999` parses to an
 * imprecise float, multiplies into an invalid `skip`, and Contentful rejects
 * it — turning a bad URL into a user-triggerable 500 instead of a 404.
 */
const MAX_PAGE = 10_000

/** Rejects `1`, `0`, `-3`, `2.5`, `abc`, `02` — anything but a plain integer in [2, MAX_PAGE]. */
function parsePageNumber(raw: string): number | null {
  // Bound the digit count before Number(), so an over-long string never
  // becomes Infinity or loses precision.
  if (!/^[1-9][0-9]{0,5}$/.test(raw)) return null

  const parsed = Number(raw)
  if (!Number.isSafeInteger(parsed)) return null

  return parsed >= 2 && parsed <= MAX_PAGE ? parsed : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params
  const pageNumber = parsePageNumber(n)

  if (pageNumber === null) {
    return { title: 'Page Not Found' }
  }

  return {
    title: `Blog — page ${pageNumber}`,
    description: 'Read our latest blog posts',
    alternates: {
      // Self-canonical, deliberately. Canonicalising pages 2+ back to /blog
      // would mark them duplicates and drop everything but the newest 12 posts
      // from the index.
      canonical: absoluteUrl(blogPagePath(pageNumber)),
    },
  }
}

/*
 * No rel="prev" / rel="next".
 *
 * Google stopped using them as an indexing signal in 2019, and Next's Metadata
 * API cannot emit `<link rel="prev">` — routing them through `other` produces
 * `<meta name="prev">`, which no crawler consumes. Shipping markup that only
 * looks like it does something is worse than omitting it. The per-page
 * canonical above is the part that actually matters, and the pagination
 * component gives crawlers real <a href> links to follow.
 */

export default async function BlogPaginatedPage({ params }: Props) {
  const { n } = await params
  const pageNumber = parsePageNumber(n)

  if (pageNumber === null) {
    notFound()
  }

  return <BlogIndex currentPage={pageNumber} />
}

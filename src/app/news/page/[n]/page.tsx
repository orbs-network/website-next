import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsIndex, getTotalNewsPages } from '../../news-index'
import { newsPagePath } from '../../../lib/routes'
import { absoluteUrl } from '../../../lib/site'

type Props = {
  params: Promise<{ n: string }>
}

export const revalidate = 3600

/** Page 1 is served by /news, so this route starts at 2. */
export async function generateStaticParams() {
  const totalPages = await getTotalNewsPages()

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    n: String(index + 2),
  }))
}

/**
 * Rejects `1`, `0`, `2.5`, `abc`, `02`, and anything long enough to lose
 * precision as a Number — an unbounded value multiplies into an invalid
 * Contentful `skip` and turns a bad URL into a 500 instead of a 404.
 */
const MAX_PAGE = 10_000

function parsePageNumber(raw: string): number | null {
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
    title: `Media — page ${pageNumber}`,
    description: 'Press coverage and publications featuring Orbs.',
    alternates: {
      // Self-canonical. Pointing pages 2+ at /news would mark them duplicates
      // and drop all but the newest 12 mentions from the index.
      canonical: absoluteUrl(newsPagePath(pageNumber)),
    },
  }
}

export default async function NewsPaginatedPage({ params }: Props) {
  const { n } = await params
  const pageNumber = parsePageNumber(n)

  if (pageNumber === null) {
    notFound()
  }

  return <NewsIndex currentPage={pageNumber} />
}

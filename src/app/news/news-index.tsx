import { notFound } from 'next/navigation'
import { H1 } from '../components/typography'
import { Pagination } from '../components/pagination'
import { getMediaMentions, MEDIA_PER_PAGE } from '../lib/api'
import { newsPagePath } from '../lib/routes'
import { MediaCard } from './news-card'

/** Copy lifted from the legacy content/news/hero. */
function Heading() {
  return (
    <div className="flex flex-col items-center justify-center pt-10 pb-20">
      <H1 className="inline-block text-center mx-auto">Orbs in the News</H1>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Check out the latest articles and publications featuring Orbs.
      </p>
    </div>
  )
}

/**
 * Shared body for `/news` and `/news/page/[n]` so the two routes cannot drift.
 * Same shape as BlogIndex deliberately — one pattern, two collections.
 */
export async function NewsIndex({ currentPage }: { currentPage: number }) {
  const { items, total } = await getMediaMentions({
    skip: (currentPage - 1) * MEDIA_PER_PAGE,
    limit: MEDIA_PER_PAGE,
  })

  const totalPages = Math.max(1, Math.ceil(total / MEDIA_PER_PAGE))

  // A page past the end would otherwise render an empty grid at a crawlable
  // URL. Page 1 is exempt: an empty collection is a valid state.
  if (currentPage > 1 && items.length === 0) {
    notFound()
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-5 py-10">
        <Heading />
        <p className="text-gray-600 dark:text-gray-400">No coverage yet. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-10">
      <Heading />
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((mention) => (
          <MediaCard key={mention.url} mention={mention} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pathFor={newsPagePath}
        label="Media coverage pagination"
      />
    </div>
  )
}

/** Page count, for `generateStaticParams` and out-of-range checks. */
export async function getTotalNewsPages(): Promise<number> {
  // limit: 1 — only `total` is wanted, not the entries.
  const { total } = await getMediaMentions({ skip: 0, limit: 1 })
  return Math.max(1, Math.ceil(total / MEDIA_PER_PAGE))
}

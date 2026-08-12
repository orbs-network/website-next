import { notFound } from 'next/navigation'
import { H1 } from '../components/typography'
import { getPosts, POSTS_PER_PAGE } from '../lib/api'
import { BlogCard } from './blog-card'
import { Pagination } from './pagination'

function Heading() {
  return (
    <div className="flex flex-col items-center justify-center pt-10 pb-32">
      <H1 className="inline-block text-center mx-auto">The Orbs Project Blog</H1>
      <p className="text-gray-600 dark:text-gray-400">
        Thoughts about the Orbs project, open source, blockchain and engineering.
      </p>
    </div>
  )
}

/**
 * Shared body for `/blog` and `/blog/page/[n]` so the two routes cannot drift.
 */
export async function BlogIndex({ currentPage }: { currentPage: number }) {
  const { items, total } = await getPosts({
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    limit: POSTS_PER_PAGE,
  })

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  // A page number past the end would otherwise render an empty grid at a
  // crawlable URL. Page 1 is exempt: an empty archive is a valid state.
  if (currentPage > 1 && items.length === 0) {
    notFound()
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-5 py-10">
        <Heading />
        <p className="text-gray-600 dark:text-gray-400">No posts found. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-10">
      <Heading />
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}

/** Page count, for `generateStaticParams` and canonical/prev-next metadata. */
export async function getTotalPages(): Promise<number> {
  // limit: 1 — we only want `total`, not the entries.
  const { total } = await getPosts({ skip: 0, limit: 1 })
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE))
}

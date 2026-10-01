import { Metadata } from 'next'
import { H1 } from '@/app/components/typography'
import { getPostsBySlugs } from '@/app/lib/api'
import { GOVERNANCE_PATH } from '@/app/lib/routes'
import { absoluteUrl } from '@/app/lib/site'
import { GOVERNANCE_POST_SLUGS } from '@/content/shared/governance'
import { BlogCard } from '../blog/blog-card'

// Same fallback as the blog. A publish of one of these posts also revalidates
// this page directly — see the webhook route.
export const revalidate = 86400

const INTRO = 'All posts related to community governance of the Orbs Network.'

export const metadata: Metadata = {
  title: 'Governance',
  description: INTRO,
  alternates: { canonical: absoluteUrl(GOVERNANCE_PATH) },
}

/**
 * The governance index, rebuilt (#224).
 *
 * The migration redirected `/governance-blog` to `/blog` on the grounds that
 * the section was being dropped (#38). The footer's Governance link needs a
 * destination, and the blog index buries eight posts among three hundred, so
 * the page is back: the legacy heading and intro over the same cards as the
 * blog. English only, like the blog — Contentful has one locale.
 */
export default async function GovernancePage() {
  const posts = await getPostsBySlugs(GOVERNANCE_POST_SLUGS)

  return (
    <div className="container py-10">
      <div className="flex flex-col items-center justify-center pb-32 pt-10">
        <H1 className="mx-auto inline-block text-center">The Orbs Governance Blog</H1>
        <p className="text-fg-muted">{INTRO}</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-fg-muted">No posts found. Check back soon!</p>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

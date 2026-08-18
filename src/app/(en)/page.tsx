import type { Metadata } from 'next'
import { HomeHero } from '@/app/components/home-hero'
import { H3 } from '@/app/components/typography'
import { getRecentPosts } from '@/app/lib/api'
import { localeAlternates } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'
import { BlogCard } from './blog/blog-card'

// Time-based fallback. On-demand invalidation via the Contentful webhook
// (#19) is the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: localeAlternates(HOME_PATH, 'en'),
}

export default async function Home() {
  const recentPosts = await getRecentPosts(3)

  return (
    <div className="container mx-auto px-5 py-16">
      <HomeHero />

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section>
          <H3 weight="medium">Recent Posts</H3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

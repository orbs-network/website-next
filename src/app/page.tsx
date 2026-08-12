import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BlogCard } from './blog/blog-card'
import { OrbsLogo } from '@/components/icons'
import { H1, H3 } from './components/typography'
import { getRecentPosts } from './lib/api'

// Time-based fallback. On-demand invalidation via the Contentful webhook
// (#19) is the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

export default async function Home() {
  const recentPosts = await getRecentPosts(3)

  return (
    <div className="container mx-auto px-5 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="mb-6 flex justify-center items-center">
          <OrbsLogo className="w-48 h-auto" />
        </div>
        <H1 className="mb-8">Bringing CeFi execution to DeFi</H1>

        <Button asChild size="lg">
          <Link href="/blog">View Blog</Link>
        </Button>
      </section>

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

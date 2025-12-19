import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BlogCard } from './blog/blog-card'
import { OrbsLogo } from './components/layout/orbs-logo'
import { Heading1, Heading3 } from './components/typography'
import { getAllPosts } from './lib/api'

export default async function Home() {
  const recentPosts = await getAllPosts().then((posts) => posts.slice(0, 3))

  return (
    <div className="container mx-auto px-5 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="mb-6 flex justify-center items-center">
          <OrbsLogo className="w-48 h-auto" />
        </div>
        <Heading1 className="mb-8">Bringing CeFi execution to DeFi</Heading1>

        <Button asChild size="lg" className="uppercase font-semibold">
          <Link href="/blog">View Blog</Link>
        </Button>
      </section>

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section>
          <Heading3>Recent Posts</Heading3>
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

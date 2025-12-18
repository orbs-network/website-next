import Link from 'next/link'
import { getAllPosts } from './lib/api'
import { OrbsLogo } from './components/layout/orbs-logo'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const recentPosts = await getAllPosts().then((posts) => posts.slice(0, 3))

  return (
    <div className="container mx-auto px-5 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="mb-6 flex justify-center items-center">
          <OrbsLogo className="w-48 h-auto" />
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Bringing CeFi execution to DeFi.
        </p>

        <Button asChild size="lg">
          <Link href="/blog"> View Blog</Link>
        </Button>
      </section>

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">Recent Posts</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <article
                key={post.slug}
                className="group border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <Link href={`/${post.slug}`} className="block">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  {post.shortDescription && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {post.shortDescription}
                    </p>
                  )}
                  <time className="text-sm text-gray-500" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

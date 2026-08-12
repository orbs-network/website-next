import { Metadata } from 'next'
import { H1 } from '../components/typography'
import { getAllPosts } from '../lib/api'
import { BlogCard } from './blog-card'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts',
}

// Time-based fallback. On-demand invalidation via the Contentful webhook
// (#19) is the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

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

export default async function BlogPage() {
  const allPosts = await getAllPosts()

  if (!allPosts || allPosts.length === 0) {
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
        {allPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}

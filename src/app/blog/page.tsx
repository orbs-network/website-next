import { Metadata } from 'next'
import { BlogIndex, getTotalPages } from './blog-index'
import { blogPagePath } from '../lib/routes'

// Time-based fallback. On-demand invalidation via the Contentful webhook
// (#19) is the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts',
  alternates: {
    // Each page in the series is its own canonical. Pointing every page at
    // /blog would tell crawlers pages 2+ are duplicates and drop those posts
    // from the index entirely.
    canonical: blogPagePath(1),
  },
}

export default async function BlogPage() {
  return <BlogIndex currentPage={1} />
}

import { Metadata } from 'next'
import { NewsIndex } from './news-index'
import { newsPagePath } from '../lib/routes'
import { absoluteUrl } from '../lib/site'

// Time-based fallback. On-demand invalidation via the Contentful webhook is
// the primary path; this bounds staleness if a webhook is missed.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Media',
  description: 'Press coverage and publications featuring Orbs.',
  alternates: {
    canonical: absoluteUrl(newsPagePath(1)),
  },
}

export default async function NewsPage() {
  return <NewsIndex currentPage={1} />
}

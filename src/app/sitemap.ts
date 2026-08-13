import type { MetadataRoute } from 'next'
import { getAllPostRefs, POSTS_PER_PAGE } from './lib/api'
import { HOME_PATH, blogPagePath, postPath } from './lib/routes'
import { absoluteUrl } from './lib/site'

// Matches the content routes. Publishing also triggers on-demand revalidation
// through the Contentful webhook, which sweeps the layout and takes this with it.
export const revalidate = 3600

/**
 * Covers what exists today: the home page, the paginated blog index, and every
 * published post.
 *
 * Not yet included, because the routes do not exist:
 *  - marketing pages (Phase 3)
 *  - media mentions (#25)
 *  - hreflang alternates for JP/KO (Phase 2)
 *
 * All paths come from `lib/routes` so they carry the trailing slash that
 * `trailingSlash: true` makes canonical. Emitting the slashless form here would
 * hand crawlers a URL that 308s on every request.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostRefs()

  const newestPostDate = posts.length > 0 ? new Date(posts[0].date) : new Date()
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))

  const home: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(HOME_PATH),
      lastModified: newestPostDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  // Page 1 is /blog/, not /blog/page/1/ — blogPagePath enforces that, so there
  // is exactly one URL per page of results and no self-duplicate.
  const blogPages: MetadataRoute.Sitemap = Array.from({ length: totalPages }, (_, index) => ({
    url: absoluteUrl(blogPagePath(index + 1)),
    lastModified: newestPostDate,
    changeFrequency: 'weekly' as const,
    // Later pages are older content and matter less than the first.
    priority: index === 0 ? 0.8 : 0.4,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(postPath(post.slug)),
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...home, ...blogPages, ...postEntries]
}

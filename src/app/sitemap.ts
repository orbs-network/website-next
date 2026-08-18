import type { MetadataRoute } from 'next'
import { getAllPostRefs, getMediaSummary, MEDIA_PER_PAGE, POSTS_PER_PAGE } from './lib/api'
import { HOME_PATH, blogPagePath, encodedPostPath, newsPagePath } from './lib/routes'
import { absoluteUrl } from './lib/site'
import { localesFor } from '@/i18n/availability'
import { DEFAULT_LOCALE, localePath } from '@/i18n/locales'

/**
 * Computed per request, matching robots.ts.
 *
 * Under ISR this was prerendered, so absoluteUrl() ran at build time and the
 * origin was frozen in — a build served with a different SITE_URL kept emitting
 * the build-time host in every <loc> while robots.txt correctly switched. Two
 * SEO files disagreeing about the canonical domain is worse than either being
 * stale.
 *
 * The cost is one Contentful query per request. A sitemap is fetched by
 * crawlers a handful of times a day, so that is not a hot path — and it is one
 * `select`-narrowed query returning slug and date, not the full archive.
 */
export const dynamic = 'force-dynamic'

/**
 * Covers what exists today: the home page, the paginated blog index, and every
 * published post.
 *
 * Not yet included, because the routes do not exist:
 *  - marketing pages, and their JP/KO variants (Phase 3)
 *
 * hreflang is not declared here. Each localised page carries its own
 * `<link rel="alternate">` set via `localeAlternates`, which is equivalent for
 * crawlers and keeps one source of truth — the availability map — rather than
 * restating the relationships in a second place that can drift.
 *
 * All paths come from `lib/routes` so they carry the trailing slash that
 * `trailingSlash: true` makes canonical. Emitting the slashless form here would
 * hand crawlers a URL that 308s on every request.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostRefs()
  // Modification time, not newest article date. The news pages change when an
  // older mention is edited or a backdated one is added, neither of which moves
  // the newest `fields.date` — matching how the blog entries below use
  // sys.updatedAt.
  const { total: mediaTotal, lastModified: lastMediaChange } = await getMediaSummary()

  // Newest MODIFICATION across the archive, not newest publish date — the
  // listing pages change whenever any post on them changes.
  const lastArchiveChange =
    posts.length > 0 ? new Date(Math.max(...posts.map((p) => new Date(p.updatedAt).getTime()))) : new Date()
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))

  // The home page in each locale it is actually built in. Localised marketing
  // pages arrive in Phase 3; until then `/jp/` and `/ko/` are the only two.
  const home: MetadataRoute.Sitemap = localesFor(HOME_PATH).map((locale) => ({
    url: absoluteUrl(localePath(locale, HOME_PATH)),
    lastModified: lastArchiveChange,
    changeFrequency: 'weekly' as const,
    // English is the entry point and the x-default target; the translations are
    // secondary.
    priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
  }))

  // Page 1 is /blog/, not /blog/page/1/ — blogPagePath enforces that, so there
  // is exactly one URL per page of results and no self-duplicate.
  const blogPages: MetadataRoute.Sitemap = Array.from({ length: totalPages }, (_, index) => ({
    url: absoluteUrl(blogPagePath(index + 1)),
    lastModified: lastArchiveChange,
    changeFrequency: 'weekly' as const,
    // Later pages are older content and matter less than the first.
    priority: index === 0 ? 0.8 : 0.4,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(encodedPostPath(post.slug)),
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  // Media mention pages. The mentions themselves are NOT listed: each links
  // out to a publisher and has no URL of ours to index.
  const newsPages: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(1, Math.ceil(mediaTotal / MEDIA_PER_PAGE)) },
    (_, index) => ({
      url: absoluteUrl(newsPagePath(index + 1)),
      lastModified: lastMediaChange ?? lastArchiveChange,
      changeFrequency: 'weekly' as const,
      priority: index === 0 ? 0.7 : 0.3,
    })
  )

  return [...home, ...blogPages, ...newsPages, ...postEntries]
}

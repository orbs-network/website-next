import type { MetadataRoute } from 'next'
import { getAllPostRefs, getMediaSummary, MEDIA_PER_PAGE, POSTS_PER_PAGE } from './lib/api'
import { HOME_PATH, blogPagePath, encodedPostPath, newsPagePath } from './lib/routes'
import { absoluteUrl } from './lib/site'
import { isArchived, translatedLocalesFor } from '@/i18n/availability'
import { MARKETING_PAGE_PATHS } from '@/content/pages'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { DEFAULT_LOCALE, localePath } from '@/i18n/locales'

/**
 * Computed per request, matching robots.ts.
 *
 * The original reason was the origin: this was prerendered, so `absoluteUrl()`
 * ran at build time and froze the build host into every `<loc>` while
 * robots.txt, being dynamic, correctly switched — two SEO files disagreeing
 * about the canonical domain. #71 removed that failure mode at the source by
 * making the origin a constant, so it can no longer differ between the two.
 *
 * Still dynamic, for the reason that outlives it: a sitemap's job is to list
 * what exists NOW, and a prerendered one omits every post published since the
 * last build. Indexing is also a per-deployment decision that has to be read at
 * runtime, which is why robots.ts stays dynamic regardless.
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
 * Marketing pages come from MARKETING_PAGE_PATHS, so a page added in Phase 3
 * appears here automatically — in each locale it is genuinely translated into.
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

  // Only locales whose copy is genuinely translated. `/jp/` and `/ko/` exist and
  // are reachable, but they currently render the English placeholder and are
  // marked noindex, so listing them would advertise URLs we are simultaneously
  // asking crawlers to ignore. Phase 3 gives them real copy and they appear.
  const home: MetadataRoute.Sitemap = translatedLocalesFor(HOME_PATH).map((locale) => ({
    url: absoluteUrl(localePath(locale, HOME_PATH)),
    lastModified: lastArchiveChange,
    changeFrequency: 'weekly' as const,
    // English is the entry point and the x-default target; the translations are
    // secondary.
    priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
  }))

  // Marketing pages, in each locale whose copy is genuinely translated. A
  // locale still rendering the English placeholder is `noindex`, so listing it
  // would advertise a URL we are simultaneously asking crawlers to ignore.
  const marketingPages: MetadataRoute.Sitemap = MARKETING_PAGE_PATHS.filter((path) => !isArchived(path)).flatMap(
    (path) =>
      translatedLocalesFor(path).map((locale) => ({
        url: absoluteUrl(localePath(locale, `${path}/`)),
        lastModified: lastArchiveChange,
        changeFrequency: 'monthly' as const,
        // Product pages are the commercial point of the site, so they rank above
        // the blog archive but below the home page.
        priority: 0.9,
      }))
  )

  /*
   * The individual white papers.
   *
   * Not covered by the loop above: that reads MARKETING_PAGE_PATHS, which holds
   * only the `/white-papers` index — the 23 papers are a dynamic route and
   * would otherwise be absent from the sitemap entirely.
   *
   * English only, and no locale variants, because the pages are: each wraps one
   * PDF that exists in a single language, so there is one canonical URL per
   * paper and every locale's index links at it.
   */
  const whitePapers: MetadataRoute.Sitemap = WHITE_PAPERS.map((paper) => ({
    url: absoluteUrl(`/white-papers/${paper.slug}/`),
    lastModified: lastArchiveChange,
    changeFrequency: 'yearly' as const,
    // Below the product pages: these are reference documents, several of them
    // years old, not the commercial surface.
    priority: 0.5,
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

  return [...home, ...marketingPages, ...whitePapers, ...blogPages, ...newsPages, ...postEntries]
}

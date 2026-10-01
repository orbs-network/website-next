import { sitemapEntries } from '@/app/lib/sitemap-entries'
import { renderSitemapXml } from '@/app/lib/sitemap-xml'

/**
 * The sitemap, as a route handler rather than a `sitemap.ts` metadata route.
 *
 * A metadata route cannot set its own response headers, and the `headers()`
 * entry in next.config that was meant to give it `s-maxage` never applied:
 * production answered `x-vercel-cache: MISS` on every request (#141), so every
 * crawl queried Contentful. This is the pattern `blog/rss.xml` uses, which is
 * measured to cache at the edge.
 */
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const xml = renderSitemapXml(await sitemapEntries())

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      /*
       * Same policy as the RSS feed, for the same reasons. A day at the edge
       * bounds Contentful reads to about one a day per region, regardless of
       * how often crawlers fetch. `max-age=0` keeps browsers revalidating, and
       * `stale-while-revalidate` means a Contentful outage serves a stale
       * sitemap rather than a 500. A post can take up to a day to appear here,
       * which is fine for a sitemap: crawlers re-read it on their own schedule.
       */
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

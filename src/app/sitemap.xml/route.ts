import { sitemapEntries } from '@/app/lib/sitemap-entries'
import { renderSitemapXml } from '@/app/lib/sitemap-xml'

/**
 * The sitemap, as a route handler rather than a `sitemap.ts` metadata route, so
 * it can set its own `Content-Type` and share the RSS feed's caching.
 *
 * ISR, like the RSS feed (see `blog/rss.xml/route.ts` for the full reasoning):
 * prerendered at build, served from the ISR cache, regenerated at most once a
 * day or when the Contentful webhook (`api/revalidate`) says the archive
 * changed. A request can no longer reach Contentful by missing the CDN cache,
 * which is how a client polling the RSS feed pushed the organisation over its
 * monthly API quota in November 2026.
 */
export const revalidate = 86400

export async function GET(): Promise<Response> {
  const xml = renderSitemapXml(await sitemapEntries())

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}

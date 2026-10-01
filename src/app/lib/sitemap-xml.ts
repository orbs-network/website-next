import type { MetadataRoute } from 'next'
import { escapeXml } from './xml'

/**
 * Serialises sitemap entries the way Next's `sitemap.ts` convention did, so
 * moving to a route handler changes the response headers and nothing a
 * crawler reads.
 *
 * Only the fields this site emits (`url`, `lastModified`, `changeFrequency`,
 * `priority`). Alternates, images and videos are not supported here because
 * nothing produces them.
 */
export function renderSitemapXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries.map((entry) => {
    const lines = [`<loc>${escapeXml(entry.url)}</loc>`]

    if (entry.lastModified !== undefined) {
      lines.push(`<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`)
    }
    if (entry.changeFrequency !== undefined) {
      lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`)
    }
    if (entry.priority !== undefined) {
      lines.push(`<priority>${entry.priority}</priority>`)
    }

    return `<url>\n${lines.join('\n')}\n</url>`
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

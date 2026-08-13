import type { MetadataRoute } from 'next'
import { absoluteUrl, shouldAllowIndexing, siteHost } from './lib/site'

// Computed per request, not baked at build. robots.txt is a few hundred bytes,
// and it must reflect the environment actually serving it — a build promoted
// from preview to production would otherwise keep serving `Disallow: /`.
export const dynamic = 'force-dynamic'

/**
 * Preview deployments are blocked from indexing entirely.
 *
 * Every Vercel preview gets its own *.vercel.app hostname serving identical
 * content. Left crawlable, that is duplicate content on a second domain
 * competing with the real site — and a preview URL outranking orbs.com for its
 * own article is a genuinely bad outcome that is slow to undo.
 */
export default function robots(): MetadataRoute.Robots {
  if (!shouldAllowIndexing()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Route handlers, not content. /api/preview in particular takes a
        // secret and sets a draft cookie; there is nothing there to index.
        disallow: '/api/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // Hostname only — a scheme or trailing path makes the directive invalid
    // and crawlers that honour Host will ignore it.
    host: siteHost,
  }
}

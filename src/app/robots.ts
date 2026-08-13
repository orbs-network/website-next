import type { MetadataRoute } from 'next'
import { absoluteUrl, isProductionDeployment } from './lib/site'

export const revalidate = 3600

/**
 * Preview deployments are blocked from indexing entirely.
 *
 * Every Vercel preview gets its own *.vercel.app hostname serving identical
 * content. Left crawlable, that is duplicate content on a second domain
 * competing with the real site — and a preview URL outranking orbs.com for its
 * own article is a genuinely bad outcome that is slow to undo.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment) {
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
    host: absoluteUrl('/'),
  }
}

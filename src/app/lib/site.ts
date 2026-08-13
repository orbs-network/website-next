/**
 * Canonical origin, and whether this deployment is the real one.
 *
 * Vercel sets VERCEL_ENV to production | preview | development, and gives every
 * deployment its own *.vercel.app hostname. Both matter for SEO:
 *
 *  - Absolute URLs in the sitemap must point at the canonical domain, not at
 *    whatever ephemeral hostname built them.
 *  - Preview deployments must not be indexed at all. A crawlable preview is the
 *    same content on a second domain, which is duplicate content competing with
 *    the real site.
 */

const FALLBACK_SITE_URL = 'https://www.orbs.com'

/** True only on a Vercel production deployment. */
export const isProductionDeployment = process.env.VERCEL_ENV === 'production'

/**
 * Origin without a trailing slash. Paths from `lib/routes` supply their own
 * leading slash, and carry a trailing one to match `trailingSlash: true`.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '')

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

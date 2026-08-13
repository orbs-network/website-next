/**
 * Canonical origin, and whether this deployment should be indexed.
 *
 * Both matter for SEO, in opposite directions:
 *
 *  - Absolute URLs in the sitemap must point at the canonical domain, not at
 *    whatever ephemeral hostname built them.
 *  - Preview deployments must not be indexed. A crawlable preview is the same
 *    content on a second domain, competing with the real site.
 */

const FALLBACK_SITE_URL = 'https://www.orbs.com'

/**
 * Origin without a trailing slash. Paths from `lib/routes` supply their own
 * leading slash, and carry a trailing one to match `trailingSlash: true`.
 *
 * Deliberately NOT prefixed NEXT_PUBLIC_. That prefix is what makes Next inline
 * a value at build time, which would freeze the origin into the prerendered
 * metadata routes — so a build promoted to another environment would keep
 * serving the previous one's URLs. These routes are server-only, so a plain
 * server env var is both correct and read at runtime.
 */
export const siteUrl = (process.env.SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '')

/** Hostname only — the robots.txt `Host` directive takes no scheme or path. */
export const siteHost = new URL(siteUrl).host

/**
 * Should crawlers index this deployment?
 *
 * Deliberately not "VERCEL_ENV === 'production'" alone. That reads correctly on
 * Vercel but makes any deployment without the variable — `next start` behind a
 * proxy, a container, a different host — permanently `Disallow: /`. That
 * failure is silent and severe: the site is simply never indexed, and nobody
 * notices until traffic doesn't arrive.
 *
 * So: block what we can positively identify as non-production, allow the rest,
 * and provide an explicit override for cases neither rule fits.
 */
export function shouldAllowIndexing(): boolean {
  const override = process.env.ALLOW_INDEXING
  if (override === 'true') return true
  if (override === 'false') return false

  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv) return vercelEnv === 'production'

  // Not on Vercel. Trust NODE_ENV, so a self-hosted production build indexes
  // and a local dev server does not.
  return process.env.NODE_ENV === 'production'
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

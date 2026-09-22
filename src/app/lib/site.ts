/**
 * Canonical origin, and whether this deployment should be indexed.
 *
 * Both matter for SEO, and they are deliberately different KINDS of value:
 *
 *  - The origin is a property of the CONTENT. Every absolute URL — canonical,
 *    hreflang, sitemap entry, feed link — names the one domain this content is
 *    authoritative at, whichever host is serving the request. It is a constant.
 *  - Indexing is a property of the DEPLOYMENT. A preview must not be crawled;
 *    the same content on a second domain competes with the real site. That has
 *    to be read at runtime, and `robots.ts` is `force-dynamic` so it is.
 *
 * Conflating the two is what #71 was: an origin read from the environment, at
 * build time, on pages that are prerendered.
 */

/**
 * The one domain this content is canonically served from.
 *
 * A CONSTANT, not an environment variable, and that is the fix for #71 rather
 * than an oversight.
 *
 * It used to read `SITE_URL`. Page canonicals and hreflang are emitted by
 * `generateMetadata`, which runs at BUILD time for prerendered routes, so
 * whatever origin the build happened to see was frozen into the HTML. Promote a
 * build artifact between environments — which is exactly what Vercel's "Promote
 * to Production" does, reusing the artifact rather than rebuilding — and every
 * canonical keeps naming the environment it was built in. Two domains serving
 * identical content with canonicals pointing at the wrong one is a real ranking
 * problem, and nothing about it is visible in a diff or a test run.
 *
 * Making it configurable was the bug. A canonical URL is an assertion about
 * which copy of this content is authoritative, and the answer does not depend
 * on which host is answering the request: a preview deployment should say
 * `www.orbs.com` too, because the preview is not the authoritative copy and
 * must not be indexed as one. `shouldAllowIndexing()` already blocks previews.
 *
 * So a value that must be identical in every environment for correctness is not
 * configuration. `SITE_URL` was unset in every Vercel environment anyway, so
 * every deployment was already using this exact string — pinning it changes no
 * output and removes the failure mode.
 *
 * Changing the domain is now a code change. That is the point: it cannot drift
 * per environment, and it goes through review.
 */
export const CANONICAL_ORIGIN = 'https://www.orbs.com'

/**
 * Origin without a trailing slash. Paths from `lib/routes` supply their own
 * leading slash, and carry a trailing one to match `trailingSlash: true`.
 */
export const siteUrl = CANONICAL_ORIGIN

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

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { expandedRedirects } from './src/lib/redirects'

// Points at the request config rather than the default `./i18n/request.ts`,
// because this project keeps source under `src/`.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/*
  TypeScript rather than `.mjs`, and for one reason: the redirect map is a
  typed module under `src/` that BOTH this file and its test import. A `.mjs`
  config cannot import TypeScript, and the alternative was keeping the map in
  plain JavaScript or writing it out twice — and a redirect map that exists in
  two places is a redirect map that will disagree with itself.

  Next transpiles this itself; see `next-config-ts/transpile-config`.
*/
const nextConfig: NextConfig = {
  // Production serves post URLs with a trailing slash (`/Some-Post/`), and
  // every indexed URL and inbound link uses that form. Next's default would
  // 308 each of them to the slashless variant — one redirect hop on every
  // request to the entire archive. Matching production means zero hops.
  //
  //   https://www.orbs.com/SpookySwap-Integrates-dSLTP  ->  301  .../dSLTP/
  //
  // NB: this applies to route handlers too — see src/app/api/revalidate for
  // what that means for the Contentful webhook URL.
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
  // Enable React Compiler for automatic memoization (Next.js 16)
  reactCompiler: true,
  /**
   * Keep the legal markdown in the deployment.
   *
   * `src/content/legal/index.ts` reads these with `fs` at module scope. Today
   * that happens at build, because every marketing route is fully static — so
   * strictly this is not needed. It is here so that stays true by design rather
   * than by luck: if one of those pages ever gains `revalidate` or a dynamic
   * API, the read moves to request time, and without the files traced into the
   * bundle it would fail in production while working locally.
   */
  outputFileTracingIncludes: {
    '/**': ['./src/content/legal/**'],
  },
  /**
   * Edge-cache the sitemap.
   *
   * `sitemap.ts` is `force-dynamic` — it has to be, or `absoluteUrl()` freezes
   * the build-time SITE_URL into every `<loc>` (#71) — which means every
   * request costs two Contentful reads, `getAllPostRefs` plus
   * `getMediaSummary`. Crawlers poll a sitemap on their own schedule, so that
   * is the one remaining path to the Delivery API with no ceiling on it (#115).
   *
   * The header lives here rather than in the route because a Next metadata
   * route returns a `MetadataRoute.Sitemap` array, not a `Response`, so it has
   * nowhere to set one itself. The RSS feed, which is a route handler, sets the
   * equivalent header inline.
   *
   * A day of staleness is invisible to crawlers: they recheck on a much longer
   * cycle than that, and `<lastmod>` tells them what actually moved.
   */
  /**
   * Permanent redirects for URLs we have moved ourselves.
   *
   * The map and the rules that keep it honest live in `src/lib/redirects.ts` —
   * every destination must resolve to a real route, and no source may also be
   * one. Both are enforced by `src/lib/redirects.test.ts` rather than by
   * review, because a redirect pointing at a 404 looks exactly like a redirect
   * that works until somebody follows it.
   *
   * Sources carry the trailing slash, matching `trailingSlash: true`: the
   * canonical form is the slashed one, and matching the slashless variant would
   * cost a second hop before this rule ever fired.
   */
  async redirects() {
    return expandedRedirects()
  },

  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)

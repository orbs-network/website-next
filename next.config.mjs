import createNextIntlPlugin from 'next-intl/plugin'

// Points at the request config rather than the default `./i18n/request.ts`,
// because this project keeps source under `src/`.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
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

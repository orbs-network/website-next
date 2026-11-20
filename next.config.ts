import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { expandedRedirects, expandedTemporaryRedirects } from './src/lib/redirects'

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
// Same policy as the meta CSP in public/oip10-burn/index.html, plus
// frame-ancestors (header only).
const BURN_TRACKER_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self' https://rpcman.orbs.network",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
].join('; ')

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
   * Keep the legal and archived-article markdown in the deployment.
   *
   * `src/content/legal/index.ts` reads these with `fs` at module scope. Today
   * that happens at build, because every marketing route is fully static — so
   * strictly this is not needed. It is here so that stays true by design rather
   * than by luck: if one of those pages ever gains `revalidate` or a dynamic
   * API, the read moves to request time, and without the files traced into the
   * bundle it would fail in production while working locally.
   * The three inline product illustrations also read their reviewed SVG source
   * on the server; retain both theme variants if those routes become dynamic.
   */
  outputFileTracingIncludes: {
    '/**': [
      './src/content/legal/**',
      './src/content/archive/*.md',
      './public/marketing/dperps/venue*.svg',
      './public/marketing/execution-services/*-interface*.svg',
    ],
  },
  /**
   * Permanent moves and temporary redirects during the inner-page refresh.
   *
   * The map and the rules that keep it honest live in `src/lib/redirects.ts` —
   * every destination must resolve to a real route. Permanent moves cannot
   * shadow live pages; temporary moves deliberately preserve them for restoration. Both are enforced by `src/lib/redirects.test.ts` rather than by
   * review, because a redirect pointing at a 404 looks exactly like a redirect
   * that works until somebody follows it.
   *
   * Sources carry the trailing slash, matching `trailingSlash: true`: the
   * canonical form is the slashed one, and matching the slashless variant would
   * cost a second hop before this rule ever fired.
   */
  async redirects() {
    return [...expandedRedirects(), ...expandedTemporaryRedirects()]
  },
  /**
   * The OIP-10 burn tracker is a self-contained static page in
   * `public/oip10-burn/` (its own HTML, CSS, JS and meta CSP, no site layout).
   * Next serves files from `public/` by exact path only, so the directory URL
   * needs mapping to its index.html. The slashless form is already 308ed to
   * `/oip10-burn/` by `trailingSlash: true`, which also keeps the page's
   * relative asset URLs (`./app.js`) resolving inside the directory.
   */
  async rewrites() {
    return [{ source: '/oip10-burn/', destination: '/oip10-burn/index.html' }]
  },
  /**
   * Security headers for the OIP-10 burn tracker only; the rest of the site
   * is untouched. Header rules match the request path before rewrites, so
   * `/oip10-burn/` (rewritten to index.html) and its assets are both covered.
   *
   * The CSP repeats the page's meta CSP (kept as defence in depth) and adds
   * `frame-ancestors`, which only works as a header. HSTS is already sent by
   * Vercel and is deliberately not set here. No `noindex`: the page is public.
   * CORP `same-origin` is safe: it governs who may embed OUR responses, not
   * the Google Fonts the page loads. The price route keeps its own
   * Cache-Control and gets no CORS header (it is consumed same-origin only).
   */
  async headers() {
    const burnTrackerHeaders = [
      { key: 'Content-Security-Policy', value: BURN_TRACKER_CSP },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Frame-Options', value: 'DENY' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
      },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ]
    return [
      { source: '/oip10-burn', headers: burnTrackerHeaders },
      { source: '/oip10-burn/:path*', headers: burnTrackerHeaders },
      {
        source: '/api/oip10-burn/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)

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
}

export default withNextIntl(nextConfig)

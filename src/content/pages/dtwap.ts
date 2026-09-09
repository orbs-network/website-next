/**
 * Structural data for the dTWAP page.
 *
 * This file holds everything that is NOT copy: image paths, external URLs,
 * brand colours, ordering. The legacy site mixed the two in one frontmatter
 * block —
 *
 *     logo: /assets/img/dtwap/quickswap.svg
 *     background: "#1C1E28"
 *     title: Price Impact Reduction        <- the only translatable line
 *
 * — which meant translating a page required editing the same file that defines
 * its layout, and every locale carried a duplicate copy of the image paths that
 * could drift. Splitting them means a translator only ever touches a message
 * catalog, and adding a locale changes no structure at all.
 *
 * Copy for this page lives under `pages.dtwap` in `src/i18n/messages/*.json`.
 */

/** A DEX that has integrated the protocol. */
export type Integration = {
  /** Message key under `pages.dtwap.integrations.items`, and the React key. */
  id: string
  /** Brand name. Not translated — these are proper nouns. */
  name: string
  logo: string
  /** Screenshot of the integration running on their site. */
  screenshot: string
  /** Brand background the screenshot is composed against. */
  background: string
  repo: string
  demo: string
}

export const DTWAP_HERO = {
  image: '/marketing/dtwap/hero.svg',
  repo: 'https://github.com/orbs-network/twap',
  telegram: 'https://t.me/dTWAPSupportGroup',
  /** In-page anchor to the integrations section. */
  ctaHref: '#get-started',
} as const

/**
 * Ordered oldest-integrated first, matching the legacy list. Arbidex, BaseSwap
 * and Chronos were added after the JP and KO pages were last translated, so
 * they exist only in the English content tree — but they render in every locale
 * regardless, because a DEX's name and logo are not copy.
 */
export const DTWAP_INTEGRATIONS: readonly Integration[] = [
  {
    id: 'pangolin',
    name: 'Pangolin',
    logo: '/marketing/dtwap/pangolin-logo.png',
    screenshot: '/marketing/dtwap/pangolin-demo.png',
    background: '#111111',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/pangolin',
    demo: 'https://app.pangolin.exchange/#/swap',
  },
  {
    id: 'spiritswap',
    name: 'SpiritSwap',
    logo: '/marketing/dtwap/spiritswap-logo.png',
    screenshot: '/marketing/dtwap/spiritswap-demo.png',
    background: '#111725',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/spiritswap',
    demo: 'https://www.spiritswap.finance/swap/FTM/SPIRIT',
  },
  {
    id: 'spookyswap',
    name: 'SpookySwap',
    logo: '/marketing/dtwap/spookyswap-logo.svg',
    screenshot: '/marketing/dtwap/spookyswap-demo.png',
    background: '#1B2237',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/spookyswap',
    demo: 'https://spooky.fi/#/swap',
  },
  {
    id: 'quickswap',
    name: 'QuickSwap',
    logo: '/marketing/dtwap/quickswap-logo.png',
    screenshot: '/marketing/dtwap/quickswap-demo.png',
    background: '#1C1E28',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/quickswap',
    demo: 'https://quickswap.exchange/#/swap?swapIndex=4&currency0=ETH',
  },
  {
    id: 'chronos',
    name: 'Chronos',
    logo: '/marketing/dtwap/chronos-logo.svg',
    screenshot: '/marketing/dtwap/chronos-demo.png',
    background: '#242135',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/chronos',
    demo: 'https://app.chronos.exchange/?type=twap',
  },
  {
    id: 'arbidex',
    name: 'Arbidex',
    logo: '/marketing/dtwap/arbidex-logo.png',
    screenshot: '/marketing/dtwap/arbidex-demo.png',
    background: '#000620',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/arbidex',
    demo: 'https://arbidex.fi/swap/',
  },
  {
    id: 'baseswap',
    name: 'BaseSwap',
    logo: '/marketing/dtwap/baseswap-logo.webp',
    screenshot: '/marketing/dtwap/baseswap-demo.png',
    background: '#000620',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/baseswap',
    demo: 'https://baseswap.fi/swap',
  },
]

/** Screenshots for the UI walkthrough. Captions come from the catalog. */
export const DTWAP_SLIDES = [
  { id: 'limit', image: '/marketing/dtwap/slide-1.jpg' },
  { id: 'duration', image: '/marketing/dtwap/slide-2.jpg' },
  { id: 'manage', image: '/marketing/dtwap/slide-3.png' },
] as const

/** Protocol architecture diagram, alongside the maker/taker explanation. */
export const DTWAP_SCHEMA_IMAGE = { src: '/marketing/dtwap/schema.png', width: 2235, height: 1328 } as const

/**
 * Taken from the legacy components, not from the content frontmatter — the
 * frontmatter carries only the link TEXT (`whitePaper: read the white paper`)
 * while the hrefs are hardcoded in `code/partials/dtwap/Schema.js` and
 * `code/partials/shared/Integrations/Integrate.js`.
 *
 * Trailing slashes on internal links because `trailingSlash: true` makes the
 * slashless form 308.
 */
export const DTWAP_LINKS = {
  whitePaper: '/white-papers/dTWAP/',
  audit: 'https://github.com/orbs-network/twap/blob/master/Audit-Report-PeckShield.pdf',
  faq: '/dtwap-and-dlimit-faq/',
  /** "Integrate your DEX" CTA, and the README link on the code section. */
  integrationGuide: 'https://github.com/orbs-network/twap',
} as const

/** The two benefits, in order. Copy is `pages.dtwap.benefits.items.<id>`. */
export const DTWAP_BENEFITS = ['priceImpact', 'dca'] as const

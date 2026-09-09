import type { Integration } from './dtwap'

/**
 * Structural data for the dLIMIT page — image paths, external URLs, brand
 * colours, ordering. Copy lives under `pages.dlimit` in the message catalogs,
 * for the reasons set out at the top of `dtwap.ts`.
 *
 * dLIMIT is dTWAP with the order size equal to the whole trade, and the page
 * mirrors that relationship: same sections, same components, one fewer (there
 * is no explanation slider in the legacy dLIMIT page).
 */

/**
 * No hero image, deliberately.
 *
 * The legacy page points at `/assets/img/dlimit/hero.svg`, which has never
 * existed — it is a 404 on production today, so the live dLIMIT page renders a
 * broken image. Borrowing dTWAP's illustration would imply a dLIMIT asset that
 * was never designed, so `ProductHero` treats the image as optional and this
 * page ships without one until design supplies a real asset (#88).
 */
export const DLIMIT_HERO = {
  /** Shared with dTWAP: one repo backs both protocols. */
  repo: 'https://github.com/orbs-network/twap',
  telegram: 'https://t.me/dTWAPSupportGroup',
  /** In-page anchor to the integrations section. */
  ctaHref: '#get-started',
} as const

/**
 * Ordered as the legacy list has them.
 *
 * The logos are shared with dTWAP rather than duplicated — a DEX has one
 * wordmark whichever protocol it integrated — while the screenshots are
 * dLIMIT's own, because they show the limit-order UI rather than the TWAP one.
 * QuickSwap is the exception in both directions: the legacy dLIMIT page reuses
 * dTWAP's screenshot for it, so this does too rather than inventing one.
 */
export const DLIMIT_INTEGRATIONS: readonly Integration[] = [
  {
    id: 'quickswap',
    name: 'QuickSwap',
    logo: '/marketing/dtwap/quickswap-logo.png',
    screenshot: '/marketing/dtwap/quickswap-demo.png',
    background: '#1C1E28',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/quickswap',
    demo: 'https://quickswap.exchange/#/swap?swapIndex=3&currency0=ETH',
  },
  {
    id: 'thena',
    name: 'Thena',
    logo: '/marketing/dlimit/thena-logo.svg',
    screenshot: '/marketing/dlimit/thena-demo.png',
    background: '#1B023B',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/thena',
    demo: 'https://www.thena.fi/swap',
  },
  {
    id: 'chronos',
    name: 'Chronos',
    logo: '/marketing/dtwap/chronos-logo.svg',
    screenshot: '/marketing/dlimit/chronos-demo.png',
    background: '#242135',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/chronos',
    demo: 'https://app.chronos.exchange/?type=limit',
  },
  {
    id: 'arbidex',
    name: 'Arbidex',
    logo: '/marketing/dtwap/arbidex-logo.png',
    screenshot: '/marketing/dlimit/arbidex-demo.png',
    background: '#000620',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/arbidex',
    demo: 'https://arbidex.fi/swap/',
  },
  {
    id: 'baseswap',
    name: 'BaseSwap',
    logo: '/marketing/dtwap/baseswap-logo.webp',
    screenshot: '/marketing/dlimit/baseswap-demo.png',
    background: '#000620',
    repo: 'https://github.com/orbs-network/twap-ui/tree/master/packages/baseswap',
    demo: 'https://baseswap.fi/swap',
  },
]

/**
 * Taken from the legacy components rather than the content frontmatter, which
 * carries only the link TEXT — the hrefs are hardcoded in
 * `code/partials/dlimit/Schema.js` and the shared Integrate partial.
 *
 * Trailing slashes on internal links because `trailingSlash: true` makes the
 * slashless form 308. `whitePaper` and `faq` point at pages Phase 3 has not
 * built yet; see the note in `dtwap.ts` and #32.
 */
export const DLIMIT_LINKS = {
  whitePaper: '/white-papers/dTWAP/',
  audit: 'https://github.com/orbs-network/twap/blob/master/Audit-Report-PeckShield.pdf',
  faq: '/dtwap-and-dlimit-faq/',
  /** "Integrate your DEX" CTA, and the README link on the code section. */
  integrationGuide: 'https://github.com/orbs-network/twap',
} as const

/** The five benefit cards, in legacy order. Copy is `pages.dlimit.benefits.items.<id>`. */
export const DLIMIT_BENEFITS = ['bestPrice', 'reliable', 'decentralized', 'userProtection', 'trackRecord'] as const

export const DLIMIT_SCHEMA_IMAGE = { src: '/marketing/dlimit/schema.png', width: 9921, height: 6098 } as const

/**
 * Structural data for the Overview page — destinations and ordering. Copy lives
 * under `pages.overview` in the message catalogs.
 *
 * Each product card links to its product page. The legacy cards did not, which
 * left a page describing four protocols with no way to reach any of them. Their
 * lockups and colours live with the page (see `PRODUCT_PRESENTATION`), because
 * Tailwind only scans `src/app` and `src/components`.
 */
export const OVERVIEW_PRODUCTS = [
  { id: 'dtwap', href: '/dtwap' },
  { id: 'dlimit', href: '/dlimit' },
  { id: 'liquidityHub', href: '/liquidity-hub' },
  { id: 'perpetualHub', href: '/dperps' },
] as const

export type OverviewProductId = (typeof OVERVIEW_PRODUCTS)[number]['id']

/**
 * The three reader benefits, in legacy order. Text only: the legacy icons were
 * generic line art, and the master's points carry none.
 */
export const OVERVIEW_BENEFITS = ['access', 'pricing', 'decentralization'] as const

export const OVERVIEW_LINKS = {
  /** The hero's button scrolls to the protocol cards on this page. */
  protocols: '#protocols',
  contact: '/contact',
} as const

/**
 * The closing block's scrolling phrases: the three things "What is Orbs?" says
 * the network provides, so the marquee repeats the page rather than new copy.
 */
export const OVERVIEW_MARQUEE = ['liquidity', 'orders', 'derivatives'] as const

/**
 * Structural data for the Overview page — icons, destinations, ordering. Copy
 * lives under `pages.overview` in the message catalogs.
 *
 * Each product card links to its product page. The legacy cards did not, which
 * left a page describing four protocols with no way to reach any of them.
 */
export const OVERVIEW_PRODUCTS = [
  { id: 'dtwap', icon: '/marketing/overview/dtwap-logo.svg', href: '/dtwap' },
  { id: 'dlimit', icon: '/marketing/overview/dlimit-logo.svg', href: '/dlimit' },
  { id: 'liquidityHub', icon: '/marketing/overview/liquidity-hub-logo.svg', href: '/liquidity-hub' },
  { id: 'perpetualHub', icon: '/marketing/overview/perpetual-hub-logo.svg', href: '/dperps' },
] as const

/** The three reader benefits, in legacy order. */
export const OVERVIEW_BENEFITS = [
  { id: 'access', icon: '/marketing/overview/how-item1.svg' },
  { id: 'pricing', icon: '/marketing/overview/how-item2.svg' },
  { id: 'decentralization', icon: '/marketing/overview/how-item3.svg' },
] as const

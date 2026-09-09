import type { Partner } from '@/components/marketing/partner-showcase'

/**
 * Structural data for the Liquidity Hub page — image paths, external URLs,
 * ordering. Copy lives under `pages.liquidityHub` in the message catalogs.
 *
 * The page opens without a call to action: the legacy header declares no
 * button, unlike every other product page, so `ProductHero` takes its CTA
 * optionally. It has no hero illustration either — `hero.svg` exists in the
 * legacy assets but the header never references it, and inventing a use for an
 * unreferenced file would be guessing at a design decision.
 */

/** The two liquidity sources, in legacy order. Copy is `boxes.items.<id>`. */
export const LIQUIDITY_HUB_SOURCES = ['solverAuctions', 'apiOrders'] as const

/** Six benefit cards. No icons: the legacy cards borrow `ton-vote/tools/*.svg` filler. */
export const LIQUIDITY_HUB_BENEFITS = [
  'lpCannibalization',
  'mevProtection',
  'composable',
  'ceFiMarketMakers',
  'gasless',
  'sameFlow',
] as const

/** "New DEX Standard": who benefits, one column each. */
export const LIQUIDITY_HUB_AUDIENCES = ['users', 'dex', 'solvers'] as const

export const LIQUIDITY_HUB_DIAGRAM = {
  src: '/marketing/liquidity-hub/diagram.png',
  width: 2006,
  height: 926,
} as const

/**
 * Launch partners.
 *
 * Screenshots are the partners' own swap interfaces at quite different sizes,
 * which is why their intrinsic dimensions travel with them rather than being
 * forced into a shared frame.
 */
export const LIQUIDITY_HUB_PARTNERS: readonly Partner[] = [
  {
    id: 'quickswap',
    name: 'QuickSwap',
    logo: '/marketing/liquidity-hub/quickswap-logo.svg',
    screenshot: { src: '/marketing/liquidity-hub/quickswap-screenshot.png', width: 954, height: 1191 },
    href: 'https://quickswap.exchange/#/swap',
  },
  {
    id: 'thena',
    name: 'Thena',
    logo: '/marketing/liquidity-hub/thena-logo.svg',
    screenshot: { src: '/marketing/liquidity-hub/thena-screenshot.png', width: 544, height: 699 },
    href: 'https://www.thena.fi/swap',
  },
]

/**
 * The terms link in the closing section.
 *
 * Internal, so it resolves through `localeHref` and picks up its prefix once
 * that page exists. It does not yet — #32 — and 404s until then, the same
 * deliberate call as the footer in #83.
 */
export const LIQUIDITY_HUB_LINKS = {
  terms: { href: '/liquidity-hub-terms-of-use' },
  orbsVm: { href: 'https://docs.orbs.network/v3/orbs-vm/what-is-orbs-vm' },
} as const

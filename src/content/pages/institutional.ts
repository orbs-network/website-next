import type { LogoRowItem } from '@/components/marketing/logo-row'

/**
 * Structural data for the Orbs Institutional page. Copy lives under
 * `pages.institutional`.
 *
 * A standalone sales landing page rather than a product page: nine short
 * sections aimed at trading desks, custodians and institutional platforms.
 * English only — there is no `jp/institutional` or `ko/institutional` in the
 * legacy repo.
 */

/** The three headline figures, in legacy order. */
export const INSTITUTIONAL_STATS = ['volume', 'chains', 'venues'] as const

/**
 * The four products, each linking to its own page.
 *
 * All four now exist, which they did not when this migration started — so
 * unlike most cross-links in Phase 3 these resolve today.
 */
export const INSTITUTIONAL_PRODUCTS = [
  { id: 'liquidityHub', href: '/liquidity-hub', icon: '/marketing/institutional/product-liquidity-hub.svg' },
  { id: 'dtwap', href: '/dtwap', icon: '/marketing/institutional/product-dtwap.svg' },
  { id: 'dlimit', href: '/dlimit', icon: '/marketing/institutional/product-dlimit.svg' },
  { id: 'dsltp', href: '/dsltp', icon: '/marketing/institutional/product-dsltp.svg' },
] as const

/**
 * Venues that have integrated the stack.
 *
 * The legacy page shows their brand marks, most of them reused from the home
 * page's partner strip. An earlier version of this listed names only, which
 * turned a branding strip into a text list.
 */
export const INSTITUTIONAL_VENUES: readonly LogoRowItem[] = [
  { name: 'PancakeSwap', logo: { src: '/marketing/institutional/venue-pancakeswap.png', width: 286, height: 44 } },
  { name: 'SushiSwap', logo: { src: '/marketing/institutional/venue-sushiswap.png', width: 300, height: 93 } },
  { name: 'QuickSwap', logo: { src: '/marketing/institutional/venue-quickswap.png', width: 240, height: 37 } },
  { name: 'Blackhole', logo: { src: '/marketing/institutional/venue-blackhole.png', width: 1249, height: 107 } },
  { name: 'Thena', logo: { src: '/marketing/institutional/venue-thena.png', width: 188, height: 42 } },
]

/**
 * Signers and custody platforms the stack works with.
 *
 * Every one of these marks is a monochrome `fill="white"` SVG, so they are
 * inverted in the light theme — without that they are white on a near-white
 * background and simply do not appear. Real light-theme assets from the brand
 * owners would be better; this is correct rather than merely visible.
 */
export const INSTITUTIONAL_SIGNERS: readonly LogoRowItem[] = [
  { name: 'Ledger', logo: { src: '/marketing/institutional/infra-ledger.svg', width: 160, height: 54 }, invertOnLight: true },
  { name: 'Safe', logo: { src: '/marketing/institutional/infra-safe.svg', width: 158, height: 46 }, invertOnLight: true },
  { name: 'Fireblocks', logo: { src: '/marketing/institutional/infra-fireblocks.svg', width: 227, height: 35 }, invertOnLight: true },
  { name: 'copper.co', logo: { src: '/marketing/institutional/infra-copper.svg', width: 208, height: 53 }, invertOnLight: true },
  { name: 'BitGo', logo: { src: '/marketing/institutional/infra-bitgo.svg', width: 146, height: 39 }, invertOnLight: true },
]

/**
 * The hero's call to action.
 *
 * The legacy page hardcodes `https://www.orbs.com/contact/`; kept internal so
 * it resolves through `localeHref` and leaves no self-referential absolute URL
 * to unpick at cutover — the same normalisation applied on #100.
 */
export const INSTITUTIONAL_LINKS = {
  contact: { href: '/contact' },
  github: { href: 'https://github.com/orbs-network' },
} as const

/** The two integration paths, and the two audiences they map to. */
export const INSTITUTIONAL_PATHS = ['institutional', 'partners'] as const

/** The eight key features, in legacy order. */
export const INSTITUTIONAL_FEATURES = [
  'nonCustodial',
  'gasless',
  'mev',
  'permissionless',
  'robust',
  'whiteLabel',
  'reporting',
  'audited',
] as const

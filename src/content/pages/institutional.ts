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

/** Venues that have integrated the stack. Names only — the legacy content has no logos. */
export const INSTITUTIONAL_VENUES: readonly LogoRowItem[] = [
  { name: 'PancakeSwap' },
  { name: 'SushiSwap' },
  { name: 'QuickSwap' },
  { name: 'Blackhole' },
  { name: 'Thena' },
]

/** Signers and custody platforms the stack works with. */
export const INSTITUTIONAL_SIGNERS: readonly LogoRowItem[] = [
  { name: 'Ledger', logo: '/marketing/institutional/infra-ledger.svg' },
  { name: 'Safe', logo: '/marketing/institutional/infra-safe.svg' },
  { name: 'Fireblocks', logo: '/marketing/institutional/infra-fireblocks.svg' },
  { name: 'copper.co', logo: '/marketing/institutional/infra-copper.svg' },
  { name: 'BitGo', logo: '/marketing/institutional/infra-bitgo.svg' },
]

/**
 * The hero's call to action.
 *
 * The legacy page hardcodes `https://www.orbs.com/contact/`; kept internal so
 * it resolves through `localeHref` and leaves no self-referential absolute URL
 * to unpick at cutover — the same normalisation applied on #100.
 */
export const INSTITUTIONAL_LINKS = { contact: { href: '/contact' } } as const

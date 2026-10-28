import type { LogoRowItem } from '@/components/marketing/logo-row'

/** October 28 page structure. Copy lives in the English and Korean catalogs. */
export const DPERPS_LINKS = {
  contact: { href: '/contact' },
} as const

/** The six services retain their approved English and Korean copy. */
export const DPERPS_FEATURES = ['pricing', 'execution', 'positions', 'hedging', 'liquidation', 'settlement'] as const
export type DperpsFeatureId = (typeof DPERPS_FEATURES)[number]

/** The current page graphics; no changes to illustrations used on other pages. */
export const DPERPS_GRAPHICS = {
  hero: {
    src: '/marketing/dperps/futures-hero.svg',
    lightSrc: '/marketing/dperps/futures-hero-light.svg',
    width: 696,
    height: 696,
  },
  network: {
    src: '/marketing/dperps/network.svg',
    lightSrc: '/marketing/dperps/network-light.svg',
    width: 677,
    height: 660,
  },
  security: {
    src: '/marketing/dperps/security.svg',
    lightSrc: '/marketing/dperps/security-light.svg',
    width: 800,
    height: 800,
  },
  venue: { src: '/marketing/dperps/venue.svg', lightSrc: '/marketing/dperps/venue-light.svg', width: 646, height: 616 },
} as const

export const DPERPS_MARQUEE = ['precision', 'perpetuals', 'exposure'] as const

export const DPERPS_FEATURE_ICONS = {
  pricing: '/marketing/dperps/features/pricing.svg',
  execution: '/marketing/dperps/features/execution.svg',
  positions: '/marketing/dperps/features/positions.svg',
  hedging: '/marketing/dperps/features/hedging.svg',
  liquidation: '/marketing/dperps/features/liquidation.svg',
  settlement: '/marketing/dperps/features/settlement.svg',
} as const

/** The six wordmarks in Sara's supplied dPERPS PDF, in that order. */
export const DPERPS_PARTNERS: readonly LogoRowItem[] = [
  {
    name: 'TrebleSwap',
    logo: { src: '/marketing/dperps/trebleswap.svg', width: 136, height: 32 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'Gryps',
    logo: { src: '/marketing/dperps/gryps.svg', width: 145, height: 37 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'QuickSwap',
    logo: {
      src: '/marketing/home/venues/quickswap.svg',
      onLight: '/marketing/home/venues/quickswap-on-light.svg',
      width: 153,
      height: 36,
    },
    wordmark: true,
  },
  {
    name: 'THENA',
    logo: {
      src: '/marketing/home/venues/thena.svg',
      onLight: '/marketing/home/venues/thena-on-light.svg',
      width: 129,
      height: 30,
    },
    wordmark: true,
  },
  {
    name: 'SpookySwap',
    logo: {
      src: '/marketing/home/venues/spookyswap.svg',
      onLight: '/marketing/home/venues/spookyswap-on-light.svg',
      width: 167,
      height: 40,
    },
    wordmark: true,
  },
  {
    name: 'Atlantis',
    logo: { src: '/marketing/dperps/atlantis.png', width: 238, height: 40 },
    invertOnLight: true,
    wordmark: true,
  },
]

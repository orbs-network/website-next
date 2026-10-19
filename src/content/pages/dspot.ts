import type { LogoRowItem } from '@/components/marketing/logo-row'

/**
 * Structural data for the dSPOT page (#155). Copy lives under `pages.dspot`.
 *
 * From the `Desktop / Products / dSPOT (dark mode)` template frame, 2026-09-28.
 * The Templates page carries two frames of that name with identical copy; this
 * follows `2200:17900`, the one whose hero has the finished mark stack.
 *
 * The cards describe the order types without linking to the individual pages
 * while those pages are being refreshed. Their URLs temporarily lead here.
 */

import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { NETWORK_DOCS_URL } from '@/content/shared/sdk'
import { HOME_LINKS } from './home'

export const DSPOT_LINKS = {
  /** The hero's "Discover order types" scrolls to the modules on this page. */
  modules: '#modules',
  /** The network section's docs link: the network's own docs, not the SDK's. */
  docs: NETWORK_DOCS_URL,
  x: HOME_LINKS.x,
  telegram: HOME_LINKS.telegram,
  contact: '/contact',
} as const

/** The four products under dSPOT, in design order. Presentation lives with the page. */
export const DSPOT_MODULES = [{ id: 'dlimit' }, { id: 'dtwap' }, { id: 'dsltp' }, { id: 'liquidityHub' }] as const

export type DspotModuleId = (typeof DSPOT_MODULES)[number]['id']

/** The "Built for best execution" list, in design order. */
export const DSPOT_POINTS = ['pricing', 'custody', 'settlement'] as const

/**
 * Exported from the template frame.
 *
 * `*-light.svg` is the same file with `fill`/`stroke="white"` turned to
 * `#121214` — everywhere EXCEPT inside `<mask>`, where white is luminance and
 * darkening it blanks the whole graphic. See `ThemedGraphic`.
 *
 * The light sphere is the exception: its nodes, rings and outer dashed circle
 * are `#59595A`, the grey the light dSPOT frame draws them in (#231). Near-black
 * nodes read heavier than the art around them, and the outer ring was left the
 * dark file's `#D6D6D6`, which all but vanished on the light page.
 */
export const DSPOT_GRAPHICS = {
  /** The stacked hexagon planes with the order-type marks. */
  hero: HERO_GRAPHICS.dspot,
  /** The sphere network, shared with Venues. */
  network: {
    src: '/marketing/shared/network-sphere.svg',
    lightSrc: '/marketing/shared/network-sphere-light.svg',
    width: 677,
    height: 660,
  },
} as const

/** The closing block's scrolling phrases, in design order. */
export const DSPOT_MARQUEE = ['control', 'liquidity', 'custody'] as const

/** Sara's October 15 approved solver/liquidity-source strip, in design order. */
export const DSPOT_SOLVERS: readonly LogoRowItem[] = [
  {
    name: 'Odos',
    logo: { src: '/marketing/dspot/solvers/odos.svg', width: 136, height: 48 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'Velora (formerly ParaSwap)',
    logo: { src: '/marketing/dspot/solvers/velora.svg', width: 130, height: 34 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'OpenOcean',
    logo: {
      src: '/marketing/dspot/solvers/openocean-dark.svg',
      width: 140,
      height: 28,
    },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'KyberSwap',
    logo: {
      src: '/marketing/dspot/solvers/kyberswap.svg',
      width: 160,
      height: 53,
    },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'Rango',
    logo: { src: '/marketing/dspot/solvers/rango.svg', width: 942, height: 345 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'DODO',
    logo: {
      src: '/marketing/dspot/solvers/dodo.svg',
      width: 141,
      height: 30,
    },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'Lumia',
    logo: { src: '/marketing/dspot/solvers/lumia.svg', width: 136, height: 37 },
    invertOnLight: true,
    wordmark: true,
  },
  // Bird outline traced from the existing mark, without its purple tile.
  {
    name: 'Magpie',
    logo: { src: '/marketing/dspot/solvers/magpie.svg', width: 109, height: 176 },
    invertOnLight: true,
  },
]

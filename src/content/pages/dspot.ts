/**
 * Structural data for the dSPOT page (#155). Copy lives under `pages.dspot`.
 *
 * From the `Desktop / Products / dSPOT (dark mode)` template frame, 2026-09-28.
 * The Templates page carries two frames of that name with identical copy; this
 * follows `2200:17900`, the one whose hero has the finished mark stack.
 *
 * dSPOT is a hub: the cards link DOWN to the order-type pages, which keep
 * their URLs and their translations (#149). No redirects.
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
export const DSPOT_MODULES = [
  { id: 'dlimit', href: '/dlimit' },
  { id: 'dtwap', href: '/dtwap' },
  { id: 'dsltp', href: '/dsltp' },
  { id: 'liquidityHub', href: '/liquidity-hub' },
] as const

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

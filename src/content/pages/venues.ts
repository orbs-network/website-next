/**
 * Structural data for the Venues page (#157). Copy lives under `pages.venues`.
 *
 * From the `Desktop / Solutions / Venues` template frame, 2026-09-28 — the SDK
 * page's skeleton with venue-facing copy.
 *
 * "Explore the UI kit" goes to the brand assets page, per Sarbloc. The closing
 * block's copy of that button carries an X (Twitter) mark in the frame; that
 * is a slip in the design, and it renders with the standard arrow here.
 */

import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'

export const VENUES_LINKS = {
  uiKit: '/brand-assets',
  contact: '/contact',
} as const

/** Exported and themed like dSPOT's — see `DSPOT_GRAPHICS`. */
export const VENUES_GRAPHICS = {
  /** The bow-tie of order routes through one venue. */
  hero: HERO_GRAPHICS.venues,
  /** The sphere network, shared with dSPOT. */
  frontend: {
    src: '/marketing/shared/network-sphere.svg',
    lightSrc: '/marketing/shared/network-sphere-light.svg',
    width: 677,
    height: 660,
  },
} as const

/** The closing block's scrolling phrases, in design order. */
export const VENUES_MARQUEE = ['advancedOrders', 'liquidityRoutes', 'yourBrand'] as const

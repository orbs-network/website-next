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

export const VENUES_LINKS = {
  uiKit: '/brand-assets',
  contact: '/contact',
} as const

export const VENUES_GRAPHICS = {
  /** The orbital ellipses. */
  hero: { src: '/marketing/venues/hero.svg', width: 672, height: 672 },
  /** The sphere network, shared with the SDK page's integration section. */
  frontend: { src: '/marketing/shared/network-sphere.svg', width: 676, height: 659 },
} as const

/** The closing block's scrolling phrases, in design order. */
export const VENUES_MARQUEE = ['advancedOrders', 'liquidityRoutes', 'yourBrand'] as const

/**
 * Structural data for the SDK / API page (#156). Copy lives under `pages.sdk`.
 *
 * From the `Desktop / Products / SDK` template frame, 2026-09-28. The same
 * skeleton as Venues: hero, statement, gradient band, graphic split, closing
 * block.
 *
 * The primary call to action is the developer docs, not "talk to the team" —
 * this is the one page where reading the docs IS the conversion.
 */

export const SDK_LINKS = {
  docs: 'https://docs.orbs.network/',
  contact: '/contact',
} as const

export const SDK_GRAPHICS = {
  /** The hexagon network with the API mark at its centre. */
  hero: { src: '/marketing/sdk/hero.svg', width: 696, height: 696 },
  /** The sphere network, shared with Venues' frontend section. */
  integration: { src: '/marketing/shared/network-sphere.svg', width: 676, height: 659 },
} as const

/** The closing block's scrolling phrases, in design order. */
export const SDK_MARQUEE = ['oneApi', 'spotAndPerps', 'buildTestLaunch'] as const

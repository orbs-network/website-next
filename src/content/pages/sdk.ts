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

/**
 * Exported from the template frame, 2026-09-28. The hero composes the hexagon
 * group and the API icon onto the design's 696px square at their Figma
 * offsets, so the slot is the size the frame draws.
 *
 * `*-light.svg` is the same file with `fill`/`stroke="white"` turned to
 * `#121214` — everywhere EXCEPT inside `<mask>`, where white is luminance and
 * darkening it blanks the whole graphic. See `ThemedGraphic`.
 */
export const SDK_GRAPHICS = {
  /** The hexagon network with the API mark at its centre. */
  hero: { src: '/marketing/sdk/hero.svg', lightSrc: '/marketing/sdk/hero-light.svg', width: 696, height: 696 },
  /** The sphere network, shared with Venues' frontend section. */
  integration: {
    src: '/marketing/shared/network-sphere.svg',
    lightSrc: '/marketing/shared/network-sphere-light.svg',
    width: 677,
    height: 660,
  },
} as const

/** The closing block's scrolling phrases, in design order. */
export const SDK_MARQUEE = ['oneApi', 'spotAndPerps', 'buildTestLaunch'] as const

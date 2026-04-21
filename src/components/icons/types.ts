import type { SVGAttributes } from 'react'

/**
 * Base props shared by every icon component in the library. Icons default to
 * `1em × 1em` so the containing element's `font-size` (e.g. Tailwind
 * `text-2xl`) controls the rendered size. Colors default to `currentColor`
 * inside the SVG paths so Tailwind `text-*` utilities control them on the
 * parent — unless a color variant explicitly hard-codes brand fills.
 * Wordmark-style components (`OrbsLogo`, partner logos) use wider
 * aspect-ratio defaults that approximate their intrinsic text dimensions.
 */
export type IconBaseProps = SVGAttributes<SVGSVGElement>

/** Brand variants used by social icons and the Orbs logo. */
export type BrandVariant = 'color' | 'white' | 'dark'

/** Arrow/chevron visual variants. */
export type ArrowVariant = 'default' | 'ghost' | 'accent'

/** Theme-toggle glyph. */
export type Theme = 'light' | 'dark'

/** Partner logo variants. */
export type PartnerVariant = 'dark' | 'light'

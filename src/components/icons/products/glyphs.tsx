import type { IconBaseProps } from '../types'

/**
 * The product glyphs on their own, without the wordmark.
 *
 * The `<Product>` components in this directory are lockups — glyph plus label
 * in one span — which is right for a product heading and wrong for a menu row,
 * where the label is a sibling supplied by `MenuItemW`. Rendering a lockup
 * there would print the product name twice.
 *
 * The paths live here and the lockups compose from these, so there is one
 * definition of each mark rather than two that can drift.
 *
 * Every glyph defaults to `aria-hidden`. In both usages the name is already
 * carried by adjacent text — the lockup's own label, or the menu row's — so an
 * exposed `role="img"` would be a second accessible name inside one control.
 * Pass `aria-hidden={false}` with an `aria-label` if one is ever used alone.
 */
function Glyph({ children, ...rest }: IconBaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Two cyan triangles, up and down. */
export function LiquidityHubGlyph(props: IconBaseProps) {
  return (
    <Glyph {...props}>
      <path fill="#2CEDFC" d="M6 3 L11 11 L1 11 Z" />
      <path fill="#2CEDFC" d="M18 21 L23 13 L13 13 Z" />
    </Glyph>
  )
}

/** The Liquidity Hub mark in pink — same shape, different product. */
export function PerpetualHubGlyph(props: IconBaseProps) {
  return (
    <Glyph {...props}>
      <path fill="#DC8AE0" d="M6 3 L11 11 L1 11 Z" />
      <path fill="#DC8AE0" d="M18 21 L23 13 L13 13 Z" />
    </Glyph>
  )
}

/** Rewind / fast-backward double arrow. Inherits `currentColor`. */
export function DLimitGlyph(props: IconBaseProps) {
  return (
    <Glyph {...props}>
      <path fill="currentColor" d="M11 5 L11 19 L1 12 Z" />
      <path fill="currentColor" d="M22 5 L22 19 L12 12 Z" />
    </Glyph>
  )
}

/** Fast-forward double arrow. Inherits `currentColor`. */
export function DTwapGlyph(props: IconBaseProps) {
  return (
    <Glyph {...props}>
      <path fill="currentColor" d="M1 5 L1 19 L11 12 Z" />
      <path fill="currentColor" d="M12 5 L12 19 L22 12 Z" />
    </Glyph>
  )
}

/** Downward triangle. Inherits `currentColor`. */
export function DSltpGlyph(props: IconBaseProps) {
  return (
    <Glyph {...props}>
      <path fill="currentColor" d="M2 6 L22 6 L12 21 Z" />
    </Glyph>
  )
}

/**
 * The dSPOT mark: four rounded triangles turning around a centre. The same
 * paths as `public/marketing/home/icons/dspot.svg` (Figma `2141:133216`), with
 * the one triangle defined once and placed four times.
 *
 * Its own viewBox, not the shared 24-unit one: the paths come from Figma at
 * their native size, and rescaling them by hand is how a mark ends up subtly
 * not the brand's.
 */
export function DSpotGlyph(props: IconBaseProps) {
  const triangle =
    'M17.81 14.48C18.29 15.02 18.08 15.52 17.36 15.59L1.02 17.24C.3 17.32-.14 16.81.04 16.12L4.13.61C4.32-.08 4.84-.2 5.32.33L17.81 14.48Z'

  return (
    <Glyph viewBox="0 0 47.72 45.37" {...props}>
      <path fill="#3346F2" d={triangle} transform="matrix(0.747 0.665 -0.665 0.747 17.345 0)" />
      <path fill="#3346F2" d={triangle} transform="matrix(0.747 0.665 -0.665 0.747 34.221 0)" />
      <path fill="#3346F2" d={triangle} transform="matrix(-0.747 -0.665 0.665 -0.747 30.377 45.371)" />
      <path fill="#3346F2" d={triangle} transform="matrix(-0.747 -0.665 0.665 -0.747 13.502 45.371)" />
    </Glyph>
  )
}

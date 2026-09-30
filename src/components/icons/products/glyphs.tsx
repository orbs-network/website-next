import { useId } from 'react'
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

/*
 * The four Products-menu marks, from the 2026-09-30 design export
 * (`API Icon.svg`, `dSPOT Icon.svg`, `Agentic Icon.svg`, and the dPERPS mark
 * cropped from the `dPERPS.svg` sheet). Paths are copied as exported; only the
 * viewBoxes are tightened to each mark's own bounds, so the four render at the
 * same visual size in a square box, as the `Main Menu / Product` frame draws
 * them (#210).
 */

/** Execution SDK/API: six rounded petals. #7764E8 per the icon file; the menu frame's #9747FF reads as a Figma swatch artefact. */
export function SdkApiGlyph(props: IconBaseProps) {
  return (
    <Glyph viewBox="0 0 16.32 17.02" {...props}>
      <path
        fill="#7764E8"
        d="M8.62932 2.84399C8.62932 1.21862 8.62932 0.40594 9.14742 0.101184C9.66553 -0.203572 10.3563 0.202769 11.738 1.01545L12.7367 1.60295C14.1184 2.41563 14.8092 2.82197 14.8092 3.43148C14.8092 4.041 14.1184 4.44734 12.7367 5.26002L11.738 5.84752C10.3563 6.6602 9.66553 7.06654 9.14742 6.76179C8.62932 6.45703 8.62932 5.64435 8.62932 4.01898V2.84399Z"
      />
      <path
        fill="#7764E8"
        d="M13.2078 6.09117C14.5894 5.27848 15.2802 4.87214 15.7983 5.1769C16.3164 5.48165 16.3164 6.29434 16.3164 7.9197V9.0947C16.3164 10.7201 16.3164 11.5327 15.7983 11.8375C15.2802 12.1423 14.5894 11.7359 13.2078 10.9232L12.209 10.3357C10.8274 9.52305 10.1365 9.11671 10.1365 8.5072C10.1365 7.89769 10.8274 7.49135 12.209 6.67867L13.2078 6.09117Z"
      />
      <path
        fill="#7764E8"
        d="M12.7367 11.7544C14.1184 12.5671 14.8092 12.9734 14.8092 13.5829C14.8092 14.1924 14.1184 14.5988 12.7367 15.4115L11.738 15.999C10.3563 16.8116 9.66553 17.218 9.14742 16.9132C8.62932 16.6085 8.62932 15.7958 8.62932 14.1704V12.9954C8.62932 11.3701 8.62932 10.5574 9.14742 10.2526C9.66553 9.94786 10.3563 10.3542 11.738 11.1669L12.7367 11.7544Z"
      />
      <path
        fill="#7764E8"
        d="M7.6873 14.1704C7.6873 15.7958 7.6873 16.6084 7.1692 16.9132C6.65109 17.2179 5.96028 16.8116 4.57866 15.9989L3.5799 15.4114C2.19828 14.5988 1.50748 14.1924 1.50748 13.5829C1.50748 12.9734 2.19828 12.5671 3.5799 11.7544L4.57866 11.1669C5.96028 10.3542 6.65109 9.94787 7.1692 10.2526C7.6873 10.5574 7.6873 11.3701 7.6873 12.9954V14.1704Z"
      />
      <path
        fill="#7764E8"
        d="M3.1089 10.9232C1.72729 11.7359 1.03648 12.1422 0.518371 11.8375C0.000263214 11.5327 0.000263214 10.72 0.000263214 9.09468V7.91972C0.000263214 6.29436 0.000263214 5.48167 0.518371 5.17692C1.03648 4.87216 1.72729 5.2785 3.10891 6.09119L4.10767 6.67867C5.48928 7.49135 6.18009 7.89769 6.18009 8.5072C6.18009 9.11671 5.48928 9.52305 4.10766 10.3357L3.1089 10.9232Z"
      />
      <path
        fill="#7764E8"
        d="M3.5799 5.26003C2.19828 4.44735 1.50748 4.04101 1.50748 3.43149C1.50748 2.82198 2.19828 2.41564 3.5799 1.60296L4.57866 1.01548C5.96028 0.202798 6.65109 -0.203543 7.1692 0.101212C7.6873 0.405968 7.6873 1.21865 7.6873 2.84402V4.01897C7.6873 5.64434 7.6873 6.45702 7.1692 6.76178C6.65109 7.06653 5.96028 6.66019 4.57866 5.84751L3.5799 5.26003Z"
      />
    </Glyph>
  )
}

/**
 * dSPOT's MENU mark: rewind over fast-forward, columns aligned. Deliberately
 * not `DSpotGlyph` — that is the staggered lockup mark from the home page, and
 * the menu frame draws this smaller, squarer variant instead.
 */
export function DSpotMenuGlyph(props: IconBaseProps) {
  return (
    <Glyph viewBox="5 3.95 15 17.15" {...props}>
      <path
        fill="#3346F2"
        d="M11.5337 12.2236C11.5337 12.5293 11.3208 12.6312 11.0547 12.4274L5.1996 8.4017C4.93347 8.24883 4.93347 7.94308 5.1996 7.7902L11.0547 4.07024C11.3208 3.91736 11.5337 4.01928 11.5337 4.32503V12.2236Z"
      />
      <path
        fill="#3346F2"
        d="M19.9996 12.2236C19.9996 12.5293 19.7867 12.6312 19.5206 12.4274L13.6654 8.4017C13.3993 8.24883 13.3993 7.94308 13.6654 7.7902L19.5206 4.07024C19.7867 3.91736 19.9996 4.01928 19.9996 4.32503V12.2236Z"
      />
      <path
        fill="#3346F2"
        d="M5 12.8436C5 12.5378 5.21292 12.4359 5.47906 12.6397L11.3341 16.6655C11.6003 16.8183 11.6003 17.1241 11.3341 17.277L5.47906 20.9969C5.21292 21.1498 5 21.0479 5 20.7421V12.8436Z"
      />
      <path
        fill="#3346F2"
        d="M13.4658 12.8436C13.4658 12.5378 13.6787 12.4359 13.9449 12.6397L19.8 16.6655C20.0661 16.8183 20.0661 17.1241 19.8 17.277L13.9449 20.9969C13.6787 21.1498 13.4658 21.0479 13.4658 20.7421V12.8436Z"
      />
    </Glyph>
  )
}

/**
 * dPERPS: two up-triangles over two down-triangles, in #DC8AE0. Replaces
 * `PerpetualHubGlyph` in the menu, which draws one of each and is not the
 * brand mark (#210, #211).
 */
export function DPerpsGlyph(props: IconBaseProps) {
  return (
    <Glyph viewBox="12.05 12.45 32.35 25.8" {...props}>
      <path
        fill="#DC8AE0"
        d="M12.8335 24.6291C12.2557 24.6226 12.0688 24.2362 12.4062 23.7631L20.1259 13.0973C20.4671 12.6199 21.005 12.6286 21.3174 13.104L28.4302 23.8279C28.7426 24.3032 28.5323 24.6846 27.9629 24.6857L12.8335 24.6291Z"
      />
      <path
        fill="#DC8AE0"
        d="M12.8335 38.1598C12.2557 38.1534 12.0688 37.767 12.4062 37.2939L20.1259 26.628C20.4671 26.1507 21.005 26.1594 21.3174 26.6347L28.4302 37.3587C28.7426 37.834 28.5323 38.2154 27.9629 38.2165L12.8335 38.1598Z"
      />
      <path
        fill="#DC8AE0"
        d="M43.6149 12.4835C44.1927 12.4881 44.3808 12.8739 44.045 13.348L36.3595 24.0387C36.0199 24.5171 35.482 24.5101 35.1681 24.0358L28.0209 13.3348C27.7069 12.8604 27.916 12.4784 28.4854 12.4754L43.6149 12.4835Z"
      />
      <path
        fill="#DC8AE0"
        d="M43.6149 26.0133C44.1927 26.0178 44.3808 26.4036 44.045 26.8778L36.3595 37.5685C36.0199 38.0469 35.482 38.0399 35.1681 37.5656L28.0209 26.8645C27.7069 26.3902 27.916 26.0082 28.4854 26.0052L43.6149 26.0133Z"
      />
    </Glyph>
  )
}

/**
 * Orbs Agentic: a four-point sparkle on a periwinkle-to-cyan gradient.
 *
 * The gradient id comes from `useId`: this renders once per menu (desktop and
 * mobile both), and two `<linearGradient>`s sharing an id in one document let
 * the browser pick either — harmless while they are identical, a mystery the
 * day one changes.
 */
export function AgenticGlyph(props: IconBaseProps) {
  const gradient = `agentic-${useId()}`

  return (
    <Glyph viewBox="3 4.84 19 19" {...props}>
      <defs>
        <linearGradient
          id={gradient}
          x1="0.585511"
          y1="4.60345"
          x2="25.2614"
          y2="22.8605"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#95A1ED" />
          <stop offset="1" stopColor="#99F2F6" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradient})`}
        d="M12.321 4.83887C12.321 9.88456 7.62006 14.3263 3 14.3389C7.62006 14.3514 12.321 18.7932 12.321 23.8389C12.321 18.7932 17.3799 14.3514 22 14.3389C17.3799 14.3263 12.321 9.88456 12.321 4.83887Z"
      />
    </Glyph>
  )
}

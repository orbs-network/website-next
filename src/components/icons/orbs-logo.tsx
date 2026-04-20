import type { BrandVariant, IconBaseProps } from './types'

type OrbsLogoProps = IconBaseProps & {
  variant?: BrandVariant
}

/**
 * Orbs wordmark + glyph. Placeholder-quality approximation of the real
 * brand mark — three overlapping orbs (periwinkle / pink / cyan) next to an
 * "ORBS" wordmark. The designer will swap in the real asset before launch.
 *
 * The `color` variant keeps brand hex fills on the glyph but renders the
 * wordmark in `currentColor` so it inherits the parent `text-*` color and
 * stays legible in both light and dark themes. The `dark` variant uses
 * `currentColor` for both glyph and wordmark; `white` hard-codes white.
 */
export function OrbsLogo({ variant = 'color', width = '6em', height = '1.5em', ...rest }: OrbsLogoProps) {
  const wordmarkFill = variant === 'white' ? '#ffffff' : 'currentColor'
  const orb1 = variant === 'white' ? '#ffffff' : variant === 'dark' ? 'currentColor' : '#7A89E9'
  const orb2 = variant === 'white' ? '#ffffff' : variant === 'dark' ? 'currentColor' : '#DC8AE0'
  const orb3 = variant === 'white' ? '#ffffff' : variant === 'dark' ? 'currentColor' : '#2CEDFC'

  return (
    <svg
      viewBox="0 0 120 32"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Orbs"
      {...rest}
    >
      <g opacity={variant === 'color' ? 0.9 : 1}>
        <circle cx="11" cy="11" r="8" fill={orb1} />
        <circle cx="21" cy="11" r="8" fill={orb2} opacity={variant === 'color' ? 0.85 : 1} />
        <circle cx="16" cy="20" r="8" fill={orb3} opacity={variant === 'color' ? 0.85 : 1} />
      </g>
      <text
        x="38"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="700"
        fontSize="18"
        letterSpacing="2"
        fill={wordmarkFill}
      >
        ORBS
      </text>
    </svg>
  )
}

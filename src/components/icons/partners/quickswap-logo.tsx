// placeholder — swap for real brand asset pre-launch
import type { IconBaseProps, PartnerVariant } from '../types'

type QuickSwapLogoProps = IconBaseProps & {
  variant?: PartnerVariant
}

/** QuickSwap wordmark placeholder — abstract "q" glyph + "QUICKSWAP" label. */
export function QuickSwapLogo({
  variant = 'dark',
  width = '7em',
  height = '1.5em',
  ...rest
}: QuickSwapLogoProps) {
  const fill = variant === 'dark' ? '#121214' : '#ffffff'
  return (
    <svg
      viewBox="0 0 140 32"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="QuickSwap"
      {...rest}
    >
      <circle cx="14" cy="16" r="10" fill="none" stroke={fill} strokeWidth="3" />
      <rect x="18" y="20" width="8" height="3" fill={fill} transform="rotate(30 22 21.5)" />
      <text
        x="32"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="700"
        fontSize="16"
        letterSpacing="2"
        fill={fill}
      >
        QUICKSWAP
      </text>
    </svg>
  )
}

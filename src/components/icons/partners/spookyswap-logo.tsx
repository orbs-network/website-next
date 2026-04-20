// placeholder — swap for real brand asset pre-launch
import type { IconBaseProps, PartnerVariant } from '../types'

type SpookySwapLogoProps = IconBaseProps & {
  variant?: PartnerVariant
}

/**
 * SpookySwap wordmark placeholder — simple geometric ninja approximation
 * (filled circle + eye-band) + "SpookySwap" label.
 */
export function SpookySwapLogo({
  variant = 'dark',
  width = '8em',
  height = '1.5em',
  ...rest
}: SpookySwapLogoProps) {
  const fill = variant === 'dark' ? '#121214' : '#ffffff'
  const band = variant === 'dark' ? '#ffffff' : '#121214'
  return (
    <svg
      viewBox="0 0 160 32"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SpookySwap"
      {...rest}
    >
      <circle cx="14" cy="16" r="11" fill={fill} />
      <rect x="4" y="13" width="20" height="4" fill={band} />
      <text
        x="32"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="700"
        fontSize="18"
        fill={fill}
      >
        SpookySwap
      </text>
    </svg>
  )
}

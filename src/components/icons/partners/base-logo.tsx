// placeholder — swap for real brand asset pre-launch
import type { IconBaseProps, PartnerVariant } from '../types'

type BaseLogoProps = IconBaseProps & {
  variant?: PartnerVariant
}

/** Base (Coinbase L2) placeholder — filled square + "base" wordmark. */
export function BaseLogo({ variant = 'dark', width = '5em', height = '1.5em', ...rest }: BaseLogoProps) {
  const fill = variant === 'dark' ? '#121214' : '#ffffff'
  return (
    <svg
      viewBox="0 0 100 32"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Base"
      {...rest}
    >
      <rect x="2" y="6" width="20" height="20" rx="2" fill={fill} />
      <text
        x="30"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="600"
        fontSize="18"
        fill={fill}
      >
        base
      </text>
    </svg>
  )
}

// placeholder — swap for real brand asset pre-launch
import type { IconBaseProps, PartnerVariant } from '../types'

type SwapXLogoProps = IconBaseProps & {
  variant?: PartnerVariant
}

/** SwapX wordmark placeholder — "Swap" with bolded "X". */
export function SwapXLogo({ variant = 'dark', width = '5em', height = '1.5em', ...rest }: SwapXLogoProps) {
  const fill = variant === 'dark' ? '#121214' : '#ffffff'
  return (
    <svg
      viewBox="0 0 100 32"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SwapX"
      {...rest}
    >
      <text
        x="0"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="500"
        fontSize="18"
        fill={fill}
      >
        Swap
      </text>
      <text
        x="50"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="800"
        fontSize="20"
        fill={fill}
      >
        X
      </text>
    </svg>
  )
}

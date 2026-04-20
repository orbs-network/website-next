// placeholder — swap for real brand asset pre-launch
import type { IconBaseProps, PartnerVariant } from '../types'

type LynexLogoProps = IconBaseProps & {
  variant?: PartnerVariant
}

/** Lynex wordmark placeholder — "<>LYNEX" with diamond brackets. */
export function LynexLogo({ variant = 'dark', width = '6em', height = '1.5em', ...rest }: LynexLogoProps) {
  const fill = variant === 'dark' ? '#121214' : '#ffffff'
  return (
    <svg
      viewBox="0 0 120 32"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lynex"
      {...rest}
    >
      <text
        x="0"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="700"
        fontSize="18"
        letterSpacing="1.5"
        fill={fill}
      >
        &lt;&gt;LYNEX
      </text>
    </svg>
  )
}

// placeholder — swap for real brand asset pre-launch
import type { IconBaseProps, PartnerVariant } from '../types'

type ThenaLogoProps = IconBaseProps & {
  variant?: PartnerVariant
}

/** Thena wordmark placeholder — "THENA" in heavy Montserrat. */
export function ThenaLogo({ variant = 'dark', width = '6em', height = '1.5em', ...rest }: ThenaLogoProps) {
  const fill = variant === 'dark' ? '#121214' : '#ffffff'
  return (
    <svg
      viewBox="0 0 120 32"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Thena"
      {...rest}
    >
      <text
        x="0"
        y="22"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="800"
        fontSize="20"
        letterSpacing="3"
        fill={fill}
      >
        THENA
      </text>
    </svg>
  )
}

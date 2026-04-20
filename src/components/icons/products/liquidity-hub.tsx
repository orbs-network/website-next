import type { HTMLAttributes } from 'react'

type LiquidityHubProps = HTMLAttributes<HTMLSpanElement>

/**
 * Liquidity Hub product lockup — two cyan triangles (up + down) next to the
 * "LIQUIDITY HUB" label.
 */
export function LiquidityHub({ className, ...rest }: LiquidityHubProps) {
  const classes = ['inline-flex items-center gap-2 text-h5 uppercase tracking-wider', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Liquidity Hub glyph"
      >
        <path fill="#2CEDFC" d="M6 3 L11 11 L1 11 Z" />
        <path fill="#2CEDFC" d="M18 21 L23 13 L13 13 Z" />
      </svg>
      <span>Liquidity Hub</span>
    </span>
  )
}

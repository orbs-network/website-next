import type { HTMLAttributes } from 'react'

type DTwapProps = HTMLAttributes<HTMLSpanElement>

/**
 * dTWAP product lockup — fast-forward double arrow + label. Uses
 * `currentColor` so the glyph inherits the parent `text-*` color.
 */
export function DTwap({ className, ...rest }: DTwapProps) {
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
        aria-label="dTWAP glyph"
      >
        <path fill="currentColor" d="M1 5 L1 19 L11 12 Z" />
        <path fill="currentColor" d="M12 5 L12 19 L22 12 Z" />
      </svg>
      <span>
        d<strong>TWAP</strong>
      </span>
    </span>
  )
}

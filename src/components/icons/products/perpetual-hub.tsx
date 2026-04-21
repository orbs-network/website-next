import type { HTMLAttributes } from 'react'

type PerpetualHubProps = HTMLAttributes<HTMLSpanElement>

/**
 * Perpetual Hub product lockup — two pink triangles (up + down) next to the
 * "PERPETUAL HUB" label.
 */
export function PerpetualHub({ className, ...rest }: PerpetualHubProps) {
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
        aria-label="Perpetual Hub glyph"
      >
        <path fill="#DC8AE0" d="M6 3 L11 11 L1 11 Z" />
        <path fill="#DC8AE0" d="M18 21 L23 13 L13 13 Z" />
      </svg>
      <span>Perpetual Hub</span>
    </span>
  )
}

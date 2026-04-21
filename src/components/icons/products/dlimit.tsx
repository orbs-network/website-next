import type { HTMLAttributes } from 'react'

type DLimitProps = HTMLAttributes<HTMLSpanElement>

/**
 * dLIMIT product lockup — rewind / fast-backward double arrow + label.
 * Uses `currentColor` so the glyph inherits the parent `text-*` color.
 */
export function DLimit({ className, ...rest }: DLimitProps) {
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
        aria-label="dLIMIT glyph"
      >
        <path fill="currentColor" d="M11 5 L11 19 L1 12 Z" />
        <path fill="currentColor" d="M22 5 L22 19 L12 12 Z" />
      </svg>
      <span>
        d<strong>LIMIT</strong>
      </span>
    </span>
  )
}

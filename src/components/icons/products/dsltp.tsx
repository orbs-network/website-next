import type { HTMLAttributes } from 'react'

type DSltpProps = HTMLAttributes<HTMLSpanElement>

/**
 * dSLTP product lockup — a downward triangle / chevron glyph + label. Uses
 * `currentColor` so the glyph inherits the parent `text-*` color.
 */
export function DSltp({ className, ...rest }: DSltpProps) {
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
        aria-label="dSLTP glyph"
      >
        <path fill="currentColor" d="M2 6 L22 6 L12 21 Z" />
      </svg>
      <span>
        d<strong>SLTP</strong>
      </span>
    </span>
  )
}

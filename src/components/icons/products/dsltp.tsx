import type { HTMLAttributes } from 'react'
import { DSltpGlyph } from './glyphs'

type DSltpProps = HTMLAttributes<HTMLSpanElement>

/**
 * dSLTP product lockup — downward triangle + label. The glyph uses
 * `currentColor`, so it inherits the parent `text-*` color.
 *
 * The mark itself lives in `./glyphs` so the menu rows can use it without the
 * wordmark. It is `aria-hidden` there, because the label beside it already
 * names the product.
 */
export function DSltp({ className, ...rest }: DSltpProps) {
  const classes = ['inline-flex items-center gap-2 text-h5 uppercase tracking-wider', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      <DSltpGlyph />
      <span>
        d<strong>SLTP</strong>
      </span>
    </span>
  )
}

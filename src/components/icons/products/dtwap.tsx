import type { HTMLAttributes } from 'react'
import { DTwapGlyph } from './glyphs'

type DTwapProps = HTMLAttributes<HTMLSpanElement>

/**
 * dTWAP product lockup — fast-forward double arrow + label. The glyph uses
 * `currentColor`, so it inherits the parent `text-*` color.
 *
 * The mark itself lives in `./glyphs` so the menu rows can use it without the
 * wordmark. It is `aria-hidden` there, because the label beside it already
 * names the product.
 */
export function DTwap({ className, ...rest }: DTwapProps) {
  const classes = ['inline-flex items-center gap-2 text-h5 uppercase tracking-wider', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      <DTwapGlyph />
      <span>
        d<strong>TWAP</strong>
      </span>
    </span>
  )
}

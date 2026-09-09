import type { HTMLAttributes } from 'react'
import { PerpetualHubGlyph } from './glyphs'

type PerpetualHubProps = HTMLAttributes<HTMLSpanElement>

/**
 * Perpetual Hub product lockup — the Liquidity Hub mark in pink, plus label.
 *
 * The mark itself lives in `./glyphs` so the menu rows can use it without the
 * wordmark. It is `aria-hidden` there, because the label beside it already
 * names the product.
 */
export function PerpetualHub({ className, ...rest }: PerpetualHubProps) {
  const classes = ['inline-flex items-center gap-2 text-h5 uppercase tracking-wider', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      <PerpetualHubGlyph />
      <span>Perpetual Hub</span>
    </span>
  )
}

import type { HTMLAttributes } from 'react'
import { LiquidityHubGlyph } from './glyphs'

type LiquidityHubProps = HTMLAttributes<HTMLSpanElement>

/**
 * Liquidity Hub product lockup — two cyan triangles next to the label.
 *
 * The mark itself lives in `./glyphs` so the menu rows can use it without the
 * wordmark. It is `aria-hidden` there, because the label beside it already
 * names the product.
 */
export function LiquidityHub({ className, ...rest }: LiquidityHubProps) {
  const classes = ['inline-flex items-center gap-2 text-h5 uppercase tracking-wider', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      <LiquidityHubGlyph />
      <span>Liquidity Hub</span>
    </span>
  )
}

import { cn } from '@/lib/utils'

/**
 * A decorative layer behind a section.
 *
 * The 3.4 design puts four full-width background layers behind the home page —
 * a line grid behind the hero, a gradient wash, and a glow behind the closing
 * call to action. The first build of that page shipped without any of them, so
 * the hero rendered flat black where the design has texture. This is that gap.
 *
 * **CSS, not exported images.** The grid came out of Figma as a 173 KB SVG; a
 * repeating gradient draws the same thing at zero bytes, at any viewport size,
 * and cannot go blurry on a high-DPI display. The glow is a radial gradient for
 * the same reasons. The only thing lost is the handful of coloured squares the
 * design scatters at certain grid intersections — those sit at specific points
 * rather than a repeating one, which a gradient cannot express. See the note in
 * `tailwind.config.ts`.
 *
 * **Always `aria-hidden`, always `pointer-events-none`.** This is texture. It
 * says nothing, and it must never intercept a click meant for the content above
 * it — an invisible full-width layer that swallows clicks is a genuinely
 * horrible bug to track down.
 *
 * The caller owns positioning: this fills its nearest positioned ancestor, so
 * the section it decorates needs `relative`.
 */

export type BackdropVariant = 'grid' | 'glow'

export function SectionBackdrop({
  variant,
  className,
}: {
  /**
   * `grid` — the line grid behind the hero and upper sections.
   * `glow` — the soft radial wash behind the closing call to action.
   */
  variant: BackdropVariant
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        variant === 'grid' && [
          'bg-grid-lines',
          /*
            Faded out towards the bottom so the grid does not simply stop at a
            hard edge where the section ends. `mask-image` rather than a
            gradient overlay: an overlay would have to match the page background
            exactly, and would be wrong the moment the theme changes.
          */
          '[mask-image:linear-gradient(to_bottom,black,transparent)]',
        ],
        variant === 'glow' && 'bg-[radial-gradient(ellipse_at_center,rgb(99_102_241/0.25),transparent_70%)]',
        className
      )}
    />
  )
}

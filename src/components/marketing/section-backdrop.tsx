import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * A decorative layer behind a section.
 *
 * The 3.4 design puts four full-width background layers behind the home page —
 * a line grid behind the hero, a gradient wash, and a glow behind the closing
 * call to action. The first build of that page shipped without any of them, so
 * the hero rendered flat black where the design has texture. This is that gap.
 *
 * **Native vectors/CSS, not exported screenshots.** The square-dot hero grid
 * uses inline SVG patterns; the line grid uses CSS. Both scale cleanly on
 * high-DPI displays without repeating CSS image masks on the mobile hero. The glow is a radial gradient for
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
 * the section it decorates needs `relative` AND `isolate`.
 *
 * `isolate` is the part worth explaining. `-z-10` puts this behind its
 * siblings; without a stacking context on the section, "behind" is resolved
 * against the root, and an opaque background anywhere up the tree would hide it
 * entirely. That is not the case today — measured, with and without the element,
 * over a text-free strip of the hero: 34 distinct colours painted, 1 without —
 * but it is one `bg-*` on an ancestor away from being true, and the failure is
 * silent. `isolate` confines the negative index to the section and removes the
 * dependency on anything above it.
 */

export type BackdropVariant = 'grid' | 'dots' | 'glow'

export function SectionBackdrop({
  variant,
  className,
}: {
  /**
   * `grid` — the line grid, from `orbs-grid-clean-editable`.
   * `dots` — the 40.5px square-dot grid from `Grid Pattern Top`, behind the
   *   hero. NOT interchangeable with `grid`: they are two different layers in
   *   the design and the hero shipped wearing the wrong one.
   * `glow` — the soft radial wash behind the closing call to action.
   */
  variant: BackdropVariant
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const small = `${id}-small`
  const large = `${id}-large`
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
        // SVG patterns paint the static dots without CSS image masks.
        variant === 'dots' && 'hero-dot-field',
        /*
          The glow was a single indigo blob at 25% opacity centred in the
          section — a guess, made before the design's own construction was
          read. What the design has is three brand-coloured circles sitting
          below the section with their middle masked out, so the visible result
          is a wide cyan-blue-pink band along the bottom edge. `bg-orbs-glow`
          is that, in `tailwind.config.ts`, with the hues and centres taken
          from the Figma geometry.
        */
        variant === 'glow' && 'bg-orbs-glow',
        className
      )}
    >
      {variant === 'dots' ? (
        <svg className="hero-dot-grid absolute inset-0 h-full w-full text-fg" aria-hidden="true">
          <defs>
            <pattern
              id={small}
              className="hero-dot-grid-small"
              width="40.5"
              height="40.5"
              patternUnits="userSpaceOnUse"
            >
              <rect width="2" height="2" fill="currentColor" />
            </pattern>
            <pattern
              id={large}
              className="hero-dot-grid-large"
              width="202.5"
              height="202.5"
              patternUnits="userSpaceOnUse"
            >
              <rect x="79.75" y="79.75" width="4.5" height="4.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${small})`} />
          <rect width="100%" height="100%" fill={`url(#${large})`} />
        </svg>
      ) : null}
    </div>
  )
}

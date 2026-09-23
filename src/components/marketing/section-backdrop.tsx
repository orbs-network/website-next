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
        /*
          The dot grid, and the only variant that renders a child element
          rather than a background on this one. It needs two masks — the dots
          themselves, and the hole `HeroFacetField` punches under the cursor —
          and stacking both on one element means `mask-composite`. See the
          note in `globals.css`.
        */
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
        /*
          NO BOTTOM FADE. The grid runs at full strength to the edge of the
          section and stops.

          An earlier version faded it over the bottom third. That was the one
          thing in this variant not taken from the design — reasoning that
          `Grid Pattern Top` is 810px and ends flat, but sits behind a shorter
          hero, so its hard edge lands under later content rather than in the
          open, and a fade was the safer translation. The section is 810px now,
          exactly as tall as the grid layer, so there is nothing to translate:
          the edge falls where the design puts it and the fade was only ever
          washing out the bottom two hundred pixels of a grid that should be
          uniform.

          Removing it also removed an element. Each of these carries exactly
          one mask — the cursor hole on the root, the dots below — and the fade
          needed a third in between. Worth remembering if one is ever added
          back: stacking two `mask-image`s on one element is how this shipped
          the dot tile's `mask-size: 40.5px` applied to a FADE GRADIENT, tiling
          it into horizontal stripes across the hero.
        */
        <div className="hero-dot-grid absolute inset-0">
          <div className="hero-dot-grid-small absolute inset-0" />
          {/* Every fifth dot on both axes, at 4.5px against 2px. */}
          <div className="hero-dot-grid-large absolute inset-0" />
        </div>
      ) : null}
    </div>
  )
}

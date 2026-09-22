/**
 * The hero's dot grid, and the facet field that fans out under the cursor.
 *
 * Every number here was measured off the 3.4 design rather than chosen, because
 * the effect is a field of 192 small shapes and "looks about right" is not a
 * thing anyone can check. The sources are two nodes on the `3.4 Home` page:
 *
 *  - `Grid Pattern Top` (2132:127029) — a 1440x810 clipped frame holding the
 *    base grid as a single vector.
 *  - `Hover-rounded-facets` (2132:127034) — the hover state, which the designer
 *    drew out explicitly as 192 vectors named `facet-<row>-<col>`, clustered
 *    around a `Cursor` graphic. That group IS the specification; the constants
 *    below are fits to it.
 *
 * Sara's note on the frame: "Dots become small Orbs-style triangular facets
 * around the cursor, using the brand gradient. Soft edges; fade back to dots.
 * Keep text still."
 */

/**
 * Spacing of the resting dot grid, in CSS px.
 *
 * Measured off a PNG export of `Grid Pattern Top` in isolation rather than off
 * the full-page frame: 36 dot columns across 1440, 40.5px apart, stable to
 * ±0.25px and identical on both axes. Reading it off the whole-page export
 * first gave the same answer, which is the only reason it is trusted — the
 * hero also carries a 66px LINE grid from a different layer, and the two are
 * easy to confuse at a glance.
 */
export const DOT_SPACING = 40.5

/** Side length of one dot. Square, not round — measured at a flat 2px. */
export const DOT_SIZE = 2

/**
 * Spacing of the facet lattice under the cursor — HALF the dot spacing.
 *
 * This is the surprising part and it is deliberate, not a units slip. The
 * facet group's 16 columns span 312px (20.47px apart, from the node geometry),
 * and a PNG of the rendered cluster independently measures 16 coloured runs at
 * ~20.5px. The dot grid underneath is 40.5px. So hovering does not merely
 * recolour the dots in place — the lattice SUBDIVIDES, which is what makes it
 * read as a fan-out rather than a spotlight.
 *
 * Derived from `DOT_SPACING` rather than written as 20.25 so the two cannot
 * drift apart if the grid is ever retuned.
 */
export const FACET_SPACING = DOT_SPACING / 2

/**
 * Radius of the cursor's influence, in CSS px.
 *
 * The drawn group is a 16x16 block with its four corners absent — 192 of 256
 * cells. That is a disc, and a clean one: converted to cell space, the furthest
 * PRESENT cell sits at radius 7.78 and the nearest MISSING cell at 7.91, so the
 * cut is exactly 8 cells with nothing straddling it.
 */
export const FACET_CELL_RADIUS = 8
export const FACET_RADIUS = FACET_CELL_RADIUS * FACET_SPACING

/**
 * Facet side length at the cursor and at the rim of the disc.
 *
 * The drawn facets run 13.99px down to 3.72px. Rounded to 14 and 3.7: the
 * source figures are the bounding boxes of hand-placed vectors, so their last
 * decimal is where the designer's hand was, not a specification.
 */
export const FACET_SIZE_MAX = 14
export const FACET_SIZE_MIN = 3.7

/**
 * Facet alpha at the cursor and at the rim.
 *
 * Node opacity in the design runs 0.888 down to 0.173, and it tracks size at a
 * correlation of 0.992 — near enough to proportional that treating them as one
 * curve is a description of the design rather than a simplification of it.
 */
export const FACET_OPACITY_MAX = 0.89
export const FACET_OPACITY_MIN = 0.17

/**
 * The brand gradient painted across the disc, top to bottom.
 *
 * Each drawn facet carries its own linear gradient whose handles run far past
 * the shape itself — a 5px facet with a 65px gradient. That is Figma's record
 * of ONE gradient spanning the group, sampled per shape, so it is rebuilt here
 * as a single gradient over the disc rather than as 192 individual ones.
 *
 * These are the stops on the 180 facets that share the dominant palette. The
 * other 12 use a more saturated pair (#DC8AE0 -> #2CEDFC, the same pink and
 * cyan as `orbs-glow`), scattered rather than banded — a designer's highlight,
 * not a second rule. Not reproduced: 12 of 192 shapes at up to 0.89 alpha is
 * not a visible effect, and inventing a scatter function to place them would be
 * adding a rule the design does not contain.
 */
export const FACET_GRADIENT_STOPS: readonly { offset: number; color: string }[] = [
  { offset: 0, color: '#CB7CDA' },
  { offset: 0.46, color: '#7764E8' },
  { offset: 1, color: '#6EAEE9' },
]

/**
 * How a facet's size and alpha fall away from the cursor.
 *
 * `1 - t^2`, fitted against the 192 drawn facets. It is not a guess between
 * plausible curves — the alternatives were measured against the same data:
 *
 *   1 - t^2      0.42px mean error   <- this
 *   1 - t^3      1.30px
 *   linear       1.44px
 *   cosine       1.83px
 *   smoothstep   1.80px
 *   (1 - t)^1.5  2.51px
 *   1 - sqrt(t)  2.80px
 *
 * Returns 0 outside the radius so a caller can use it as the disc test too,
 * rather than repeating the comparison and risking the two disagreeing.
 */
export function falloff(distance: number, radius: number = FACET_RADIUS): number {
  if (!(radius > 0)) return 0
  if (distance >= radius) return 0

  const t = distance / radius

  return 1 - t * t
}

/** Linear interpolation, clamped by the caller's `amount`. */
function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

/**
 * Which way a facet's apex points, in radians from the positive x axis.
 *
 * `-Math.PI / 2` is straight up — the Orbs mark's own orientation.
 *
 * THIS WAS RADIAL FIRST, AND THE DESIGN SAYS IT SHOULD NOT BE. Pointing each
 * facet away from the cursor is the obvious reading of "a fan out that follows
 * the mouse", it was built that way, and then measuring the designer's own
 * render of the cluster contradicted it. The method and the numbers, because
 * this is the one place here where the obvious answer is the wrong one:
 *
 * The 192 facets were segmented out of a PNG export of `Grid Pattern Top`,
 * their orientation recovered by maximising the third moment of each shape's
 * pixels (the estimator for a 3-fold symmetric blob), then grouped into eight
 * 45-degree sectors around the cursor. Orientation is only defined mod 120
 * degrees for a triangle, so all of the statistics below use 3*theta.
 *
 *   sector centre   radial predicts   design measures   within-sector R
 *     -157.5             -37.5            -55.9              0.58
 *     -112.5               7.5             39.7              0.82
 *      -67.5              52.5             22.2              0.77
 *      -22.5             -22.5             19.9              0.81
 *       22.5              22.5             39.4              0.81
 *       67.5             -52.5            -54.4              0.60
 *      112.5              -7.5            -21.5              0.73
 *      157.5              37.5            -22.1              0.62
 *
 * Two things follow. The high within-sector concentration says rotation is
 * systematic rather than noise — neighbouring facets agree with each other.
 * But it does not track the angle to the cursor, and no constant offset
 * reconciles the two columns. Scored across the whole field, radial (27.0
 * degrees mean error), constant (27.9) and tangential (29.9) are all
 * indistinguishable from the 30 degrees a uniform random field would give.
 *
 * So the honest position is that the design's rotation has no rule this
 * analysis could recover, and the visible fact is the one to build to: in the
 * design, facets near the cursor all point much the same way and drift slowly
 * — they do not pinwheel. A radial field pinwheels hardest exactly where the
 * cursor is, which is the most looked-at part of the effect.
 *
 * Exported and used in one place so swapping it back is a single line.
 */
export const FACET_ORIENTATION = -Math.PI / 2

export type Facet = {
  /** Centre, in the same space as the cursor passed in. */
  x: number
  y: number
  /** Side length of the equilateral triangle. */
  size: number
  /** 0-1. Already includes the field's overall intensity. */
  opacity: number
  /** Radians from the positive x axis. See `FACET_ORIENTATION`. */
  angle: number
}

/**
 * The facets visible for a cursor at (`cursorX`, `cursorY`).
 *
 * Walks the lattice cells covering the disc rather than the whole hero, so the
 * cost is the ~200 cells that can possibly be visible and does not grow with
 * the size of the section.
 *
 * `intensity` scales size and alpha together and is how the field fades in and
 * out — "fade back to dots" in the designer's note. At 0 this returns nothing,
 * so an idle field costs one comparison.
 */
export function facetsAround(
  cursorX: number,
  cursorY: number,
  {
    intensity = 1,
    spacing = FACET_SPACING,
    radius = FACET_RADIUS,
  }: { intensity?: number; spacing?: number; radius?: number } = {}
): Facet[] {
  if (intensity <= 0 || spacing <= 0 || radius <= 0) return []

  const facets: Facet[] = []

  /*
    Snap to the lattice rather than centring cells on the cursor. The grid is a
    property of the page, not of the pointer: if the lattice followed the
    cursor, every facet would hold its position relative to the mouse and the
    field would slide as a rigid block instead of individual dots lighting up
    and dimming as the pointer passes over them.
  */
  const firstCol = Math.ceil((cursorX - radius) / spacing)
  const lastCol = Math.floor((cursorX + radius) / spacing)
  const firstRow = Math.ceil((cursorY - radius) / spacing)
  const lastRow = Math.floor((cursorY + radius) / spacing)

  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const x = col * spacing
      const y = row * spacing
      const dx = x - cursorX
      const dy = y - cursorY
      const strength = falloff(Math.hypot(dx, dy), radius)

      if (strength <= 0) continue

      const scaled = strength * intensity

      facets.push({
        x,
        y,
        size: lerp(FACET_SIZE_MIN, FACET_SIZE_MAX, scaled),
        opacity: lerp(FACET_OPACITY_MIN, FACET_OPACITY_MAX, scaled),
        angle: FACET_ORIENTATION,
      })
    }
  }

  return facets
}

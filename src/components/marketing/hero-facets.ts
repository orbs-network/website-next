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
 * The orientation a facet has at zero phase, in radians from the positive x
 * axis. `-Math.PI / 2` is straight up — the Orbs mark's own orientation.
 */
export const FACET_ORIENTATION = -Math.PI / 2

/**
 * How far the rotation lags per pixel of distance from the cursor, in radians.
 *
 * THE FACETS ROTATE, AND THE ROTATION TRAVELS OUTWARD. This went through two
 * wrong answers before the design gave up the right one, which is worth
 * recording because both were reasonable:
 *
 *  1. Facets point radially away from the cursor. The obvious reading of "a
 *     fan out that follows the mouse". Measured against the design: 27.0
 *     degrees mean error, where a uniform random field scores 30.
 *  2. Facets share one fixed orientation. Scored 27.9 — equally useless.
 *
 * Both failed because they are STATIC models of an ANIMATION. A Figma frame is
 * one instant of it, so every facet is caught at a different point in its
 * turn, and no static rule can fit that. Once orientation is binned against
 * DISTANCE FROM THE CURSOR rather than angle around it, the structure is
 * obvious (orientation is mod 120 degrees for a triangle, so these are
 * circular means on 3*theta):
 *
 *   distance   mean orientation   concentration R
 *    20- 40         49.4               0.81
 *    40- 60         53.7               0.56
 *    60- 80         51.9               0.37
 *    80-100         36.9               0.21
 *   100-120        -12.9               0.10
 *   120-140        -29.1               0.33
 *   140-160        -19.2               0.86
 *
 * A phase that slides with distance, not with bearing. Unwrapped across the
 * stretch where the estimator is most reliable (d = 50 to 130, where the
 * measurement is not aliasing through a half turn), it runs about -83 degrees
 * over 80 pixels. Rounded to one degree per pixel: a full 120-degree visual
 * turn every 120px, which is what makes the rotation read as a wave rolling
 * out from the pointer rather than as everything spinning at once.
 *
 * The low R in the middle bands is the estimator aliasing as the wave crosses
 * a half turn, not an absence of signal — the bands either side of it are 0.81
 * and 0.86.
 */
export const FACET_STAGGER = Math.PI / 180

/**
 * Seconds for one 120-degree turn — one full visual cycle, since a triangle at
 * 120 degrees is indistinguishable from where it started.
 *
 * NOT measurable from the design: a still frame carries the stagger, because
 * that is written across space, but it cannot carry a rate. Chosen slow enough
 * to read as motion rather than as flicker, and it is the one number here that
 * is taste rather than measurement.
 */
export const FACET_SPIN_SECONDS = 2.6

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
    elapsed = 0,
  }: { intensity?: number; spacing?: number; radius?: number; elapsed?: number } = {}
): Facet[] {
  if (intensity <= 0 || spacing <= 0 || radius <= 0) return []

  const facets: Facet[] = []

  /*
    The rotation every facet shares, before its own distance lag is taken off.
    Computed once rather than per facet: it is the same for all ~200 of them.
  */
  const spin = ((elapsed % FACET_SPIN_SECONDS) / FACET_SPIN_SECONDS) * ((2 * Math.PI) / 3)

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
      const distance = Math.hypot(dx, dy)
      const strength = falloff(distance, radius)

      if (strength <= 0) continue

      /*
        DISTANCE FIRST, THEN INTENSITY AS A MULTIPLIER — not one combined
        `strength * intensity` fed into the interpolation.

        The two are different quantities. Distance decides where a facet sits
        between the rim size and the cursor size, and the design's floor of
        3.7px/0.17 alpha is what a facet looks like at the EDGE OF THE DISC,
        not what it looks like on its way out. Folding intensity into the same
        interpolation applies that floor to the fade as well: every facet
        shrinks to 3.7px, holds at 0.17 alpha, and then vanishes at the
        cutoff — a pop, not the "fade back to dots" the note asks for.

        At full intensity this is arithmetically identical to the old form, so
        the measured match against the design is unchanged.
      */
      const size = lerp(FACET_SIZE_MIN, FACET_SIZE_MAX, strength) * intensity
      const opacity = lerp(FACET_OPACITY_MIN, FACET_OPACITY_MAX, strength) * intensity

      facets.push({
        x,
        y,
        size,
        opacity,
        /*
          MINUS the lag, so the near facets lead and the far ones follow. The
          sign is the whole effect: flipped, the wave collapses inward toward
          the pointer instead of spreading from it, which looks like a drain
          rather than a bloom.
        */
        angle: FACET_ORIENTATION + spin - distance * FACET_STAGGER,
      })
    }
  }

  return facets
}

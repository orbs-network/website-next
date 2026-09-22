import { describe, expect, it } from 'vitest'
import {
  DOT_SPACING,
  FACET_CELL_RADIUS,
  FACET_OPACITY_MAX,
  FACET_OPACITY_MIN,
  FACET_ORIENTATION,
  FACET_RADIUS,
  FACET_SIZE_MAX,
  FACET_SIZE_MIN,
  FACET_SPACING,
  facetsAround,
  falloff,
} from './hero-facets'

/**
 * The facet field is 200-odd small shapes that move with the pointer, which
 * makes it close to unreviewable by eye: a wrong falloff exponent, a lattice at
 * the wrong pitch, or facets rotated the wrong way all produce something that
 * looks like a plausible effect. These assertions exist because "looks right"
 * cannot distinguish the design from a near miss.
 */

describe('falloff', () => {
  it('is 1 at the cursor and 0 at the rim', () => {
    expect(falloff(0, 100)).toBe(1)
    expect(falloff(100, 100)).toBe(0)
  })

  it('is 0 beyond the rim rather than negative', () => {
    // A caller uses this as the disc test. Going negative would invert the
    // shapes instead of omitting them, and would do it silently.
    expect(falloff(101, 100)).toBe(0)
    expect(falloff(10_000, 100)).toBe(0)
  })

  it('follows 1 - t^2, not a linear ramp', () => {
    // Half way out, a linear falloff reads 0.5. The design reads 0.75, and
    // that difference is most of why the field looks like a soft glow rather
    // than a cone.
    expect(falloff(50, 100)).toBeCloseTo(0.75, 10)
    expect(falloff(25, 100)).toBeCloseTo(0.9375, 10)
  })

  it('decreases all the way out', () => {
    let previous = Infinity

    for (let d = 0; d < 100; d += 1) {
      const value = falloff(d, 100)
      expect(value).toBeLessThan(previous)
      previous = value
    }
  })

  it('treats a zero or negative radius as no field rather than dividing by it', () => {
    expect(falloff(0, 0)).toBe(0)
    expect(falloff(5, -10)).toBe(0)
  })
})

describe('the lattice', () => {
  it('subdivides the dot grid exactly in half', () => {
    // The single most surprising number in the design, and the one most likely
    // to be "corrected" by someone who assumes facets land on dots. They do
    // not: the drawn cluster measures ~20.5px against a 40.5px dot grid.
    expect(FACET_SPACING).toBe(DOT_SPACING / 2)
    expect(FACET_SPACING).toBeCloseTo(20.25, 10)
  })

  it('reaches eight cells from the cursor', () => {
    expect(FACET_RADIUS).toBeCloseTo(FACET_CELL_RADIUS * FACET_SPACING, 10)
  })
})

describe('facetsAround', () => {
  it('fills a disc, not the bounding square', () => {
    const facets = facetsAround(0, 0)

    expect(facets.length).toBeGreaterThan(150)

    for (const facet of facets) {
      expect(Math.hypot(facet.x, facet.y)).toBeLessThan(FACET_RADIUS)
    }

    // The corners of the covering square must be absent. This is the assertion
    // that fails if the disc test is ever dropped for a cheaper box test — the
    // count alone would barely move.
    const corner = FACET_CELL_RADIUS * FACET_SPACING * 0.99

    expect(facets.some((f) => Math.abs(f.x) > corner && Math.abs(f.y) > corner)).toBe(false)
  })

  it('snaps to a fixed lattice rather than carrying the grid with the cursor', () => {
    // If the lattice were centred on the pointer, every facet would hold its
    // offset and the whole field would slide as one rigid block. Moving the
    // cursor by half a cell must therefore change which points are lit, not
    // translate them.
    const atOrigin = facetsAround(0, 0)
    const nudged = facetsAround(FACET_SPACING / 2, 0)

    const xs = new Set(atOrigin.map((f) => f.x))

    for (const facet of nudged) {
      expect(xs.has(facet.x) || facet.x % FACET_SPACING === 0).toBe(true)
      expect(facet.x % FACET_SPACING).toBeCloseTo(0, 10)
    }
  })

  it('does NOT rotate facets around the cursor', () => {
    /*
      Guards a finding rather than a preference, so it is worth the words.

      Pointing each facet away from the pointer is the obvious reading of "a
      fan out that follows the mouse", and this component did exactly that
      first. Measuring the designer's own render of the cluster says otherwise:
      facets near the cursor point much the same way and drift slowly, and a
      radial field pinwheels hardest precisely where the cursor is. The sector
      table is in `FACET_ORIENTATION`.

      If this is ever changed back, change it there — the point of the
      assertion is that it cannot happen by accident.
    */
    for (const facet of facetsAround(500, 300)) {
      expect(facet.angle).toBe(FACET_ORIENTATION)
    }
  })

  it('is largest and most opaque nearest the cursor', () => {
    const facets = facetsAround(0, 0).sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))

    expect(facets[0].size).toBeGreaterThan(facets[facets.length - 1].size)
    expect(facets[0].opacity).toBeGreaterThan(facets[facets.length - 1].opacity)

    for (const facet of facets) {
      expect(facet.size).toBeGreaterThanOrEqual(FACET_SIZE_MIN)
      expect(facet.size).toBeLessThanOrEqual(FACET_SIZE_MAX)
      expect(facet.opacity).toBeGreaterThanOrEqual(FACET_OPACITY_MIN)
      expect(facet.opacity).toBeLessThanOrEqual(FACET_OPACITY_MAX)
    }
  })

  it('costs nothing at zero intensity', () => {
    // How the field fades back to dots. A pointer that has left the section
    // must stop producing work, not merely produce invisible work.
    expect(facetsAround(0, 0, { intensity: 0 })).toEqual([])
  })

  it('scales size and alpha together as intensity drops', () => {
    const full = facetsAround(0, 0)
    const half = facetsAround(0, 0, { intensity: 0.5 })

    expect(half).toHaveLength(full.length)

    const centreFull = full.find((f) => f.x === 0 && f.y === 0)
    const centreHalf = half.find((f) => f.x === 0 && f.y === 0)

    expect(centreFull?.size).toBeCloseTo(FACET_SIZE_MAX, 10)
    expect(centreHalf?.size).toBeCloseTo((FACET_SIZE_MIN + FACET_SIZE_MAX) / 2, 10)
  })

  it('costs the same wherever the cursor is', () => {
    /*
      Walks the cells covering the disc, not the hero, so work is bounded by
      the radius rather than by the size of the section.

      NOT a fixed count, and the first version of this test wrongly demanded
      one. The cursor lands at an arbitrary phase within a cell, and a disc
      sampled on a fixed lattice catches a few more or fewer points depending
      on that phase — 193 at the origin, 205 offset. The invariant is that the
      count stays in a narrow band, not that it is constant.
    */
    const counts = []

    for (let i = 0; i < 40; i++) {
      counts.push(facetsAround(i * 977.3, i * 613.7).length)
    }

    expect(Math.min(...counts)).toBeGreaterThan(180)
    expect(Math.max(...counts)).toBeLessThan(220)
  })
})

describe('against the measured design', () => {
  /**
   * Facet size at distance, read off the 192 vectors in `Hover-rounded-facets`
   * and binned in 20px steps from the group centre. Each entry is
   * `[bin midpoint, mean side length]`.
   *
   * This is the only assertion that ties the model to the artwork rather than
   * to itself. Everything else above would still pass if the curve were
   * replaced wholesale, as long as it were replaced consistently.
   */
  const MEASURED: readonly [number, number][] = [
    [10, 13.66],
    [30, 12.83],
    [50, 12.2],
    [70, 11.09],
    [90, 10.09],
    [110, 8.51],
    [130, 6.99],
    [150, 5.03],
  ]

  it('reproduces the drawn facet sizes within a pixel', () => {
    for (const [distance, expected] of MEASURED) {
      const size = FACET_SIZE_MIN + (FACET_SIZE_MAX - FACET_SIZE_MIN) * falloff(distance, FACET_RADIUS)

      // A pixel of tolerance on shapes between 3.7 and 14px across. The design
      // figures are bounding boxes of hand-placed vectors, so they carry the
      // designer's hand; tightening this further would be fitting to noise.
      expect(Math.abs(size - expected), `${distance}px: modelled ${size.toFixed(2)} vs drawn ${expected}`).toBeLessThan(
        1.2
      )
    }
  })
})

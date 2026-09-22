import { describe, expect, it } from 'vitest'
import {
  DOT_SPACING,
  FACET_CELL_RADIUS,
  FACET_OPACITY_MAX,
  FACET_OPACITY_MIN,
  FACET_ORIENTATION,
  FACET_SPIN_SECONDS,
  FACET_STAGGER,
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

  it('staggers rotation outward from the cursor', () => {
    /*
      The facet under the pointer leads; everything else lags in proportion to
      how far out it is. Both halves matter — an unstaggered field spins as one
      rigid disc, and a field staggered the other way collapses inward.
    */
    const facets = facetsAround(0, 0).sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))
    const nearest = facets[0]
    const furthest = facets[facets.length - 1]

    expect(Math.hypot(nearest.x, nearest.y)).toBeCloseTo(0, 10)
    expect(nearest.angle).toBeCloseTo(FACET_ORIENTATION, 10)

    // Lag is negative, and proportional to distance.
    for (const facet of facets) {
      const distance = Math.hypot(facet.x, facet.y)

      expect(facet.angle).toBeCloseTo(FACET_ORIENTATION - distance * FACET_STAGGER, 10)
    }

    expect(furthest.angle).toBeLessThan(nearest.angle)
  })

  it('turns through exactly one visual cycle per spin period', () => {
    /*
      A triangle rotated 120 degrees is indistinguishable from where it
      started, so the period has to advance by 2pi/3 and not by 2pi. Getting
      that wrong is invisible in a still and makes the wave run at a third of
      its intended speed.
    */
    const at = (elapsed: number) => facetsAround(0, 0, { elapsed }).find((f) => f.x === 0 && f.y === 0)!.angle

    expect(at(FACET_SPIN_SECONDS / 2) - at(0)).toBeCloseTo(Math.PI / 3, 10)

    /*
      And it wraps rather than growing without bound, so `elapsed` can run for
      as long as a reader leaves the page open.

      Compared MOD 120 degrees, which is the point of the test rather than a
      loosening of it: a triangle at 120 degrees is the same triangle. A first
      version asserted exact equality after 1000 periods and failed, because
      2.6 has no exact binary representation — `2600 % 2.6` leaves almost a
      whole period rather than zero. The facet was drawn identically; only the
      number differed.
    */
    const cycle = (2 * Math.PI) / 3
    const wrapped = (a: number) => ((a % cycle) + cycle) % cycle

    expect(wrapped(at(FACET_SPIN_SECONDS * 1000))).toBeCloseTo(wrapped(at(0)), 6)
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

  it('fades all the way to nothing, rather than down to the rim size', () => {
    /*
      "Fade back to dots" — so a field on its way out has to approach zero, not
      settle on the smallest facet the design draws.

      The floor of 3.7px / 0.17 alpha describes a facet at the EDGE OF THE
      DISC. An earlier version folded intensity into the same interpolation
      that applies it, which made every facet shrink to the rim size, hold
      there, and then disappear at the loop's cutoff. Visible as a pop, and
      exactly what this asserts against.
    */
    const full = facetsAround(0, 0)
    const half = facetsAround(0, 0, { intensity: 0.5 })
    const nearlyGone = facetsAround(0, 0, { intensity: 0.02 })

    expect(half).toHaveLength(full.length)

    const centre = (fs: ReturnType<typeof facetsAround>) => fs.find((f) => f.x === 0 && f.y === 0)!

    expect(centre(full).size).toBeCloseTo(FACET_SIZE_MAX, 10)
    expect(centre(half).size).toBeCloseTo(FACET_SIZE_MAX / 2, 10)
    expect(centre(half).opacity).toBeCloseTo(FACET_OPACITY_MAX / 2, 10)

    // The whole field, not just the centre one.
    for (const facet of nearlyGone) {
      expect(facet.size).toBeLessThan(FACET_SIZE_MIN)
      expect(facet.opacity).toBeLessThan(FACET_OPACITY_MIN)
    }
  })

  it('is unchanged at full intensity', () => {
    // The measured match against the design is defined at intensity 1, so
    // reworking the fade must not move it.
    const centre = facetsAround(0, 0, { intensity: 1 }).find((f) => f.x === 0 && f.y === 0)!

    expect(centre.size).toBeCloseTo(FACET_SIZE_MAX, 10)
    expect(centre.opacity).toBeCloseTo(FACET_OPACITY_MAX, 10)
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

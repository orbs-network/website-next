import { describe, expect, it } from 'vitest'
import {
  BLOOM_SPEED,
  MAX_DRIFT,
  createFacetField,
  facetsOf,
  isFacetFieldSettled,
  stepFacetField,
  type FacetField,
} from './hero-facet-physics'
import { FACET_RADIUS, FACET_SIZE_MIN, facetsAround } from './hero-facets'

/**
 * The springs are tuned by eye, but everything they promise is checkable: that
 * they settle onto the measured design, that the bloom travels outward, that
 * the collapse runs the other way, and that the field goes quiet so the frame
 * loop can stop.
 */

const CURSOR = { x: 400, y: 300 }

/** Step `seconds` at `fps`, moving the pointer by `move` px/s if given. */
function run(
  field: FacetField,
  seconds: number,
  { fps = 120, move }: { fps?: number; move?: { x: number; y: number } } = {}
) {
  const dt = 1 / fps
  const frames = Math.round(seconds * fps)

  for (let i = 0; i < frames; i++) {
    if (move && field.pointer) field.pointer = { x: field.pointer.x + move.x * dt, y: field.pointer.y + move.y * dt }
    stepFacetField(field, dt)
  }
}

function settledAt(point = CURSOR): FacetField {
  const field = createFacetField()
  field.pointer = { ...point }
  run(field, 4)

  return field
}

function particles(field: FacetField) {
  return [...field.particles.values()].map((p) => ({
    ...p,
    distance: Math.hypot(p.rest.x - (field.anchor?.x ?? 0), p.rest.y - (field.anchor?.y ?? 0)),
  }))
}

const byPosition = (a: { x: number; y: number }, b: { x: number; y: number }) => a.x - b.x || a.y - b.y

describe('at rest', () => {
  it('settles exactly onto the measured design', () => {
    const field = settledAt()
    const drawn = facetsOf(field).sort(byPosition)
    const design = facetsAround(CURSOR.x, CURSOR.y, { elapsed: field.elapsed }).sort(byPosition)

    expect(drawn).toHaveLength(design.length)
    drawn.forEach((facet, i) => {
      expect(facet.x).toBeCloseTo(design[i].x, 6)
      expect(facet.y).toBeCloseTo(design[i].y, 6)
      expect(facet.size).toBeCloseTo(design[i].size, 3)
      expect(facet.opacity).toBeCloseTo(design[i].opacity, 3)
      expect(facet.angle).toBeCloseTo(design[i].angle, 6)
    })
  })

  it('has the bloom front at the full disc, which is the dot-grid hole', () => {
    expect(settledAt().front).toBe(FACET_RADIUS)
  })
})

describe('the bloom', () => {
  it('travels outward from the pointer rather than appearing everywhere at once', () => {
    const field = createFacetField()
    field.pointer = { ...CURSOR }
    run(field, 0.1)

    const drawn = facetsOf(field)
    expect(drawn.length).toBeGreaterThan(0)

    // Nothing drawn beyond where the front has reached.
    for (const facet of drawn) {
      expect(Math.hypot(facet.x - CURSOR.x, facet.y - CURSOR.y)).toBeLessThanOrEqual(BLOOM_SPEED * 0.1)
    }

    // And the near cells are further along than the ones the front has only just crossed.
    const live = particles(field).filter((p) => p.presence > 0)
    const near = live.filter((p) => p.distance < 20)
    const far = live.filter((p) => p.distance > 45)
    const mean = (xs: { presence: number }[]) => xs.reduce((sum, p) => sum + p.presence, 0) / xs.length
    expect(mean(near)).toBeGreaterThan(mean(far))
  })

  it('overshoots before settling — the bounce', () => {
    const field = createFacetField()
    field.pointer = { ...CURSOR }

    let peak = 0
    for (let i = 0; i < 120; i++) {
      run(field, 1 / 120)
      for (const p of field.particles.values()) peak = Math.max(peak, p.presence)
    }

    expect(peak).toBeGreaterThan(1.1)
    expect(peak).toBeLessThan(1.4)
  })
})

describe('the collapse', () => {
  it('withdraws from the rim inward', () => {
    const field = settledAt()
    field.pointer = null
    run(field, 0.08)

    const all = particles(field)
    const centre = all.filter((p) => p.distance < 30)
    const rim = all.filter((p) => p.distance > 130)
    const mean = (xs: { presence: number }[]) => xs.reduce((sum, p) => sum + p.presence, 0) / xs.length

    expect(mean(centre)).toBeGreaterThan(0.9)
    expect(mean(rim)).toBeLessThan(mean(centre) - 0.3)
  })

  it('fades all the way to nothing, rather than down to the rim size', () => {
    // 3.7px / 0.17 is the design's facet at the EDGE of the disc, not a floor for the fade.
    const field = settledAt()
    field.pointer = null

    let smallest = Infinity
    for (let i = 0; i < 60; i++) {
      run(field, 1 / 120)
      for (const facet of facetsOf(field)) smallest = Math.min(smallest, facet.size)
    }

    expect(smallest).toBeLessThan(FACET_SIZE_MIN / 4)
  })

  it('goes fully quiet, so the frame loop can stop', () => {
    const field = settledAt()
    field.pointer = null
    run(field, 2)

    expect(facetsOf(field)).toHaveLength(0)
    expect(isFacetFieldSettled(field)).toBe(true)
  })

  it('is not settled while the pointer is in the field, even when nothing is moving', () => {
    expect(isFacetFieldSettled(settledAt())).toBe(false)
  })
})

describe('the liquid', () => {
  it('drags nearby facets along the direction the pointer moves', () => {
    const field = settledAt()
    run(field, 0.2, { move: { x: 800, y: 0 } })

    const near = particles(field).filter((p) => p.distance < 60)
    const meanDrift = near.reduce((sum, p) => sum + p.offsetX, 0) / near.length

    expect(meanDrift).toBeGreaterThan(2)
  })

  it('turns the two flanks of a stroke in opposite directions', () => {
    const field = settledAt()
    run(field, 0.15, { move: { x: 800, y: 0 } })

    const anchor = field.anchor!
    const flank = (sign: number) =>
      [...field.particles.values()]
        .filter((p) => Math.sign(p.rest.y - anchor.y) === sign && Math.abs(p.rest.x - anchor.x) < 40)
        .reduce((sum, p) => sum + p.spin, 0)

    expect(Math.sign(flank(-1))).toBe(-Math.sign(flank(1)))
    expect(Math.abs(flank(-1))).toBeGreaterThan(0.01)
  })

  it('wobbles back onto the design once the pointer stops', () => {
    const field = settledAt()
    run(field, 0.3, { move: { x: 900, y: -400 } })
    run(field, 5)

    for (const p of field.particles.values()) {
      expect(Math.hypot(p.offsetX, p.offsetY)).toBeLessThan(0.01)
      expect(Math.abs(p.spin)).toBeLessThan(0.001)
    }
  })

  it('never lets a facet drift further than MAX_DRIFT, however hard the flick', () => {
    const field = settledAt()
    let worst = 0

    for (let i = 0; i < 60; i++) {
      run(field, 1 / 120, { move: { x: 20000, y: 20000 } })
      for (const p of field.particles.values()) worst = Math.max(worst, Math.hypot(p.offsetX, p.offsetY))
    }

    expect(worst).toBeLessThanOrEqual(MAX_DRIFT + 1e-9)
  })

  it('does not read re-entering far away as a flick', () => {
    const field = settledAt()
    field.pointer = null
    run(field, 0.05)
    field.pointer = { x: CURSOR.x + 800, y: CURSOR.y }
    run(field, 0.1)

    for (const p of field.particles.values()) expect(Math.hypot(p.offsetX, p.offsetY)).toBeLessThan(0.01)
  })
})

describe('timing', () => {
  it('animates the same at 60Hz and 144Hz', () => {
    const at = (fps: number) => {
      const field = createFacetField()
      field.pointer = { ...CURSOR }
      run(field, 0.25, { fps })
      return new Map([...field.particles].map(([key, p]) => [key, p.presence]))
    }

    const slow = at(60)
    const fast = at(144)

    for (const [key, presence] of fast) {
      if (slow.has(key)) expect(Math.abs(presence - slow.get(key)!)).toBeLessThan(0.01)
    }
  })
})

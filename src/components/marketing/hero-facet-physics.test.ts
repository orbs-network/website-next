import { describe, expect, it } from 'vitest'
import {
  BLOOM_SPEED,
  MAX_DRIFT,
  TAP_HOLD,
  createFacetField,
  facetsOf,
  isFacetFieldSettled,
  moveFacetPointer,
  stepFacetField,
  tapFacetField,
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
    if (move && field.pointer)
      moveFacetPointer(field, { x: field.pointer.x + move.x * dt, y: field.pointer.y + move.y * dt })
    stepFacetField(field, dt)
  }
}

function settledAt(point = CURSOR): FacetField {
  const field = createFacetField()
  moveFacetPointer(field, { ...point })
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
    moveFacetPointer(field, { ...CURSOR })
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
    moveFacetPointer(field, { ...CURSOR })

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
    moveFacetPointer(field, null)
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
    moveFacetPointer(field, null)

    let smallest = Infinity
    for (let i = 0; i < 60; i++) {
      run(field, 1 / 120)
      for (const facet of facetsOf(field)) smallest = Math.min(smallest, facet.size)
    }

    expect(smallest).toBeLessThan(FACET_SIZE_MIN / 4)
  })

  it('goes fully quiet, so the frame loop can stop', () => {
    const field = settledAt()
    moveFacetPointer(field, null)
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

  it('does not read a leave and re-enter between two frames as a flick', () => {
    // Both events land before the next step, so the step never sees the pointer outside.
    const field = settledAt()
    moveFacetPointer(field, null)
    moveFacetPointer(field, { x: CURSOR.x + 800, y: CURSOR.y })
    run(field, 0.1)

    for (const p of field.particles.values()) expect(Math.hypot(p.offsetX, p.offsetY)).toBeLessThan(0.01)
  })

  it('does not read re-entering far away as a flick', () => {
    const field = settledAt()
    moveFacetPointer(field, null)
    run(field, 0.05)
    moveFacetPointer(field, { x: CURSOR.x + 800, y: CURSOR.y })
    run(field, 0.1)

    for (const p of field.particles.values()) expect(Math.hypot(p.offsetX, p.offsetY)).toBeLessThan(0.01)
  })
})

describe('the tap', () => {
  /** Mean drift of each facet along its own bearing from the anchor: positive is outward. */
  const outward = (field: FacetField) => {
    const anchor = field.anchor!
    const all = [...field.particles.values()].filter((p) => p.rest.x !== anchor.x || p.rest.y !== anchor.y)

    return (
      all.reduce((sum, p) => {
        const d = Math.hypot(p.rest.x - anchor.x, p.rest.y - anchor.y)
        return sum + (p.offsetX * (p.rest.x - anchor.x) + p.offsetY * (p.rest.y - anchor.y)) / d
      }, 0) / all.length
    )
  }

  it('blooms outward from the touch point', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })
    run(field, 0.1)

    const drawn = facetsOf(field)
    expect(drawn.length).toBeGreaterThan(0)
    for (const facet of drawn) {
      // Drawn position includes the ripple's push, which is bounded by MAX_DRIFT.
      expect(Math.hypot(facet.x - CURSOR.x, facet.y - CURSOR.y)).toBeLessThanOrEqual(BLOOM_SPEED * 0.1 + MAX_DRIFT)
    }
  })

  it('pushes facets outward as the front passes — the ripple — where a still mouse does not', () => {
    const tapped = createFacetField()
    tapFacetField(tapped, { ...CURSOR })
    run(tapped, 0.2)

    const hovered = createFacetField()
    moveFacetPointer(hovered, { ...CURSOR })
    run(hovered, 0.2)

    expect(outward(tapped)).toBeGreaterThan(1)
    expect(Math.abs(outward(hovered))).toBeLessThan(1e-9)
  })

  it('keeps the ripple inside MAX_DRIFT', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })

    let worst = 0
    for (let i = 0; i < 120; i++) {
      run(field, 1 / 120)
      for (const p of field.particles.values()) worst = Math.max(worst, Math.hypot(p.offsetX, p.offsetY))
    }

    expect(worst).toBeGreaterThan(3)
    expect(worst).toBeLessThanOrEqual(MAX_DRIFT + 1e-9)
  })

  it('holds the disc up for TAP_HOLD, then collapses on its own', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })

    run(field, TAP_HOLD - 0.05)
    expect(field.pointer).not.toBeNull()
    expect(field.front).toBe(FACET_RADIUS)

    run(field, 0.1)
    expect(field.pointer).toBeNull()
    expect(field.front).toBeLessThan(FACET_RADIUS)
  })

  it('has faded to nothing visible about a second after the tap', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })
    run(field, 1.1)

    for (const facet of facetsOf(field)) expect(facet.size * facet.opacity).toBeLessThan(0.5)
  })

  it('goes fully quiet with no further input, so the frame loop stops', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })
    run(field, 2)

    expect(facetsOf(field)).toHaveLength(0)
    expect(isFacetFieldSettled(field)).toBe(true)
  })

  it('restarts the front at the new touch point on a second tap', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })
    run(field, 0.3)
    expect(field.front).toBe(FACET_RADIUS)

    tapFacetField(field, { x: CURSOR.x + 300, y: CURSOR.y })
    expect(field.front).toBe(0)
    expect(field.anchor).toEqual(CURSOR)
    run(field, 1 / 120)
    expect(field.anchor).toEqual({ x: CURSOR.x + 300, y: CURSOR.y })
  })

  it('does not leave the first disc drawn outside the restarted front on a second tap', () => {
    // The dot-grid hole is the front; anything drawn beyond it sits on top of dots that have come back.
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })
    run(field, 0.3)
    expect(facetsOf(field).length).toBeGreaterThan(100)

    tapFacetField(field, { ...CURSOR })
    run(field, 1 / 60)

    for (const facet of facetsOf(field)) {
      expect(Math.hypot(facet.x - CURSOR.x, facet.y - CURSOR.y)).toBeLessThanOrEqual(field.front + MAX_DRIFT)
    }
  })

  it('does not read a tap far from the last pointer position as a flick', () => {
    const field = settledAt()
    run(field, 0.2, { move: { x: 800, y: 0 } })
    expect(Math.abs(field.pointerVelocityX)).toBeGreaterThan(100)

    tapFacetField(field, { x: CURSOR.x + 600, y: CURSOR.y + 200 })
    run(field, 1 / 60)

    expect(field.pointerVelocityX).toBe(0)
    expect(field.pointerVelocityY).toBe(0)
  })

  it('hands over to a real pointer, which then holds the field up as usual', () => {
    const field = createFacetField()
    tapFacetField(field, { ...CURSOR })
    run(field, 0.1)

    moveFacetPointer(field, { ...CURSOR })
    run(field, 2)

    expect(field.pointer).toEqual(CURSOR)
    expect(isFacetFieldSettled(field)).toBe(false)
  })
})

describe('timing', () => {
  it('animates the same at 60Hz and 144Hz', () => {
    const at = (fps: number) => {
      const field = createFacetField()
      moveFacetPointer(field, { ...CURSOR })
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

import { FACET_RADIUS, FACET_SPACING, facetsAround, falloff, type Facet } from '@/components/marketing/hero-facets'

/**
 * The facet field as a set of sprung particles: the motion that `facetsAround`
 * cannot express, because it has no memory.
 *
 * `facetsAround` is still the specification. It says what every facet looks
 * like for a cursor that has been sitting still — the measured design — and
 * each particle here springs toward exactly that. Hold the pointer still and
 * the springs settle onto it; `hero-facet-physics.test.ts` pins that, so the
 * motion can be retuned freely without drifting off the design.
 *
 * What the springs add, all of it in motion and none of it at rest:
 *
 *  - **Bloom.** Facets scale up in a wave from the pointer rather than all at
 *    once, and overshoot before settling.
 *  - **Liquid.** A moving pointer drags nearby facets along its path, pushes
 *    them aside and sets them turning; they wobble back when it stops.
 *  - **Collapse.** On leaving, the field shrinks back from the rim inward.
 *
 * Pure and deterministic — no DOM, no clock — so every behaviour above is a
 * node test rather than something checked by eye.
 */

/** A damped spring, as the two coefficients the integrator needs. */
type Spring = { stiffness: number; damping: number }

/**
 * A spring described the way it is tuned: how fast it oscillates and how
 * quickly that dies away. `dampingRatio` below 1 overshoots; 0.4 settles with
 * one visible bounce, 0.3 with two.
 */
function spring(frequencyHz: number, dampingRatio: number): Spring {
  const omega = 2 * Math.PI * frequencyHz

  return { stiffness: omega * omega, damping: 2 * dampingRatio * omega }
}

/**
 * How fast the bloom wave travels out from the pointer, in px/s. At 650 the
 * rim of the 162px disc is reached ~250ms after the pointer arrives — long
 * enough to read as a wave, short enough not to feel like lag.
 *
 * A travelling FRONT rather than a per-facet delay, which matters once the
 * pointer moves: after the first quarter-second the front covers the whole
 * disc, so cells entering it at the leading edge light immediately. A delay
 * taken from each cell's distance would leave the leading edge of a moving
 * disc permanently empty.
 */
export const BLOOM_SPEED = 650

/** The same front, shrinking, after the pointer leaves. Faster than the bloom: exits should not linger. */
export const COLLAPSE_SPEED = 900

/** Scale. Snappy, with one clear overshoot (~25%) — the "bounce" in the bloom. */
export const SCALE_SPRING = spring(2.4, 0.4)

/** Position. Loose and underdamped, so a displaced facet wobbles home like something floating. */
export const DRIFT_SPRING = spring(1.1, 0.3)

/** Rotation offset. Looser still; it has to hand back to the travelling wave without a snap. */
export const SPIN_SPRING = spring(0.8, 0.35)

/**
 * How strongly the pointer's motion moves the facets it passes over, per px/s
 * of pointer speed. Tuned so a brisk 800px/s sweep shifts the nearest facets by
 * ~10px — about half a lattice cell, enough to disturb the grid without
 * scrambling it.
 *
 *  - `DRAG` pulls along the direction of travel: the wake.
 *  - `PUSH` pushes away from the pointer: the bow wave.
 *  - `SWIRL` turns facets by which side of the path they are on, so the two
 *    flanks of a stroke spin opposite ways, like eddies.
 */
export const DRAG = 0.6
export const PUSH = 0.5
export const SWIRL = 0.04

/** The furthest a facet may drift from its cell, in px. A flick across the hero should stir the field, not scatter it. */
export const MAX_DRIFT = 28

/**
 * The integration step. Springs are stepped at a fixed 120Hz whatever the
 * display runs at, so a 60Hz laptop and a 144Hz monitor animate the same —
 * the old single-line ease was frame-rate dependent, which a decorative fade
 * could live with and a bouncing spring cannot.
 */
const STEP = 1 / 120

/** Time constant of the pointer-velocity smoothing, in seconds. Irons out the jitter of per-frame deltas. */
const VELOCITY_SMOOTHING = 0.05

/** Faster than any real hand. Caps the spike from a scroll or a pointer re-entering far from where it left. */
const MAX_POINTER_SPEED = 4000

/** Below this, a presence spring aiming at zero is finished and its particle is dropped. */
const SETTLED = 0.001

type Point = { x: number; y: number }

type Particle = {
  /** What this cell looks like with the pointer still — the design. The spring target. */
  rest: Facet
  /** Whether the cell was in the disc the last time the pointer was in the field. */
  live: boolean
  /** Scale, 0-1 with overshoot. Multiplies the rest size and (clamped) the rest opacity. */
  presence: number
  presenceVelocity: number
  /** Drift from the cell centre, in px. */
  offsetX: number
  offsetY: number
  velocityX: number
  velocityY: number
  /** Rotation on top of the travelling wave, in radians. */
  spin: number
  spinVelocity: number
}

export type FacetField = {
  /** The pointer, in field space, or `null` when it is outside the field. Set by the caller. */
  pointer: Point | null
  /** Where the pointer last was. The field collapses toward it after the pointer leaves. */
  anchor: Point | null
  /** How far out the bloom has reached, 0 to `FACET_RADIUS`. Also the radius of the hole in the dot grid. */
  front: number
  /** Seconds the field has been stepped. Drives the facets' rotation, as `elapsed` does in `facetsAround`. */
  elapsed: number
  /** @internal */
  particles: Map<string, Particle>
  /** @internal */
  previousPointer: Point | null
  /** @internal */
  pointerVelocityX: number
  /** @internal */
  pointerVelocityY: number
  /** @internal Unstepped time carried to the next frame. */
  remainder: number
}

export function createFacetField(): FacetField {
  return {
    pointer: null,
    anchor: null,
    front: 0,
    elapsed: 0,
    particles: new Map(),
    previousPointer: null,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    remainder: 0,
  }
}

/** Keyed by lattice cell rather than by position, so float noise in a centre can never split one cell into two particles. */
function cellKey(facet: Facet): string {
  return `${Math.round(facet.x / FACET_SPACING)},${Math.round(facet.y / FACET_SPACING)}`
}

function trackPointerVelocity(field: FacetField, dt: number) {
  const { pointer, previousPointer } = field

  /*
    No velocity on the frame the pointer ARRIVES. Measured from wherever it
    left, re-entering the hero at the far side would register as a flick of
    the full width in one frame and throw every facet across the screen.
  */
  if (!pointer || !previousPointer || dt <= 0) {
    if (!pointer) {
      field.pointerVelocityX = 0
      field.pointerVelocityY = 0
    }
    field.previousPointer = pointer ? { ...pointer } : null
    return
  }

  let rawX = (pointer.x - previousPointer.x) / dt
  let rawY = (pointer.y - previousPointer.y) / dt
  const speed = Math.hypot(rawX, rawY)

  if (speed > MAX_POINTER_SPEED) {
    rawX *= MAX_POINTER_SPEED / speed
    rawY *= MAX_POINTER_SPEED / speed
  }

  const blend = 1 - Math.exp(-dt / VELOCITY_SMOOTHING)
  field.pointerVelocityX += (rawX - field.pointerVelocityX) * blend
  field.pointerVelocityY += (rawY - field.pointerVelocityY) * blend
  field.previousPointer = { ...pointer }
}

/**
 * Refresh every particle's target from `facetsAround`, creating particles for
 * cells the disc has just reached.
 *
 * Only a PRESENT pointer changes which cells are live. After it leaves, the
 * last live set collapses as the front withdraws, and the targets keep being
 * refreshed around the anchor only so the collapsing facets keep turning with
 * the wave rather than freezing mid-rotation.
 */
function retarget(field: FacetField) {
  const centre = field.pointer ?? field.anchor
  if (!centre) return

  const present = field.pointer !== null

  if (present) for (const particle of field.particles.values()) particle.live = false

  for (const facet of facetsAround(centre.x, centre.y, { elapsed: field.elapsed })) {
    const key = cellKey(facet)
    const existing = field.particles.get(key)

    if (existing) {
      existing.rest = facet
      if (present) existing.live = true
    } else if (present) {
      field.particles.set(key, {
        rest: facet,
        live: true,
        presence: 0,
        presenceVelocity: 0,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        spin: 0,
        spinVelocity: 0,
      })
    }
  }
}

function integrate(field: FacetField, h: number) {
  const centre = field.pointer ?? field.anchor
  const present = field.pointer !== null
  const vx = field.pointerVelocityX
  const vy = field.pointerVelocityY
  const speed = Math.hypot(vx, vy)

  for (const p of field.particles.values()) {
    const dx = centre ? p.rest.x - centre.x : 0
    const dy = centre ? p.rest.y - centre.y : 0
    const distance = Math.hypot(dx, dy)

    /*
      Inside the front: bloom. Outside it: collapse. On the way in the front
      grows from the pointer, so near cells cross it first; on the way out it
      shrinks toward the anchor, so the rim goes first.
    */
    const target = p.live && distance < field.front ? 1 : 0
    const presenceForce = SCALE_SPRING.stiffness * (target - p.presence) - SCALE_SPRING.damping * p.presenceVelocity
    p.presenceVelocity += presenceForce * h
    p.presence += p.presenceVelocity * h

    // The liquid. Only a present, moving pointer stirs anything.
    const influence = present && speed > 0 ? falloff(distance) : 0
    const ux = distance > 0 ? dx / distance : 0
    const uy = distance > 0 ? dy / distance : 0

    const forceX =
      influence * (DRAG * vx + PUSH * speed * ux) -
      DRIFT_SPRING.stiffness * p.offsetX -
      DRIFT_SPRING.damping * p.velocityX
    const forceY =
      influence * (DRAG * vy + PUSH * speed * uy) -
      DRIFT_SPRING.stiffness * p.offsetY -
      DRIFT_SPRING.damping * p.velocityY
    p.velocityX += forceX * h
    p.velocityY += forceY * h
    p.offsetX += p.velocityX * h
    p.offsetY += p.velocityY * h

    const drift = Math.hypot(p.offsetX, p.offsetY)
    if (drift > MAX_DRIFT) {
      const scale = MAX_DRIFT / drift
      p.offsetX *= scale
      p.offsetY *= scale
      p.velocityX *= scale
      p.velocityY *= scale
    }

    // Which side of the path the facet is on: the 2D cross product of its bearing and the pointer's velocity.
    const torque = influence * SWIRL * (ux * vy - uy * vx)
    const spinForce = torque - SPIN_SPRING.stiffness * p.spin - SPIN_SPRING.damping * p.spinVelocity
    p.spinVelocity += spinForce * h
    p.spin += p.spinVelocity * h
  }
}

/**
 * Advance the field by `dt` seconds of wall time.
 *
 * The caller clamps `dt` — this steps whatever it is given, so a multi-second
 * gap from a backgrounded tab would be simulated in full rather than skipped.
 */
export function stepFacetField(field: FacetField, dt: number) {
  if (field.pointer) field.anchor = { ...field.pointer }

  field.elapsed += dt
  trackPointerVelocity(field, dt)

  // Once per frame, not per step: it allocates ~200 facets, and the targets move with the pointer, not the physics.
  retarget(field)

  field.remainder += dt
  // With a hair of tolerance: summed float frame times land a whisker short of a whole step and would drop it.
  while (field.remainder >= STEP - 1e-9) {
    /*
      The front advances inside the fixed step, not per frame. Per frame, a
      cell crosses it up to one frame late — 17ms at 60Hz, 7ms at 144Hz — and
      against a spring this stiff that was a visible difference in the bloom.
    */
    field.front = field.pointer
      ? Math.min(FACET_RADIUS, field.front + BLOOM_SPEED * STEP)
      : Math.max(0, field.front - COLLAPSE_SPEED * STEP)
    integrate(field, STEP)
    field.remainder -= STEP
  }

  for (const [key, p] of field.particles) {
    /*
      A live cell the front has not reached yet is kept, even at zero: it is
      about to bloom, and dropping it would only recreate it next frame.
    */
    const finished =
      (!p.live || field.front === 0) && Math.abs(p.presence) < SETTLED && Math.abs(p.presenceVelocity) < SETTLED * 10
    if (finished) field.particles.delete(key)
  }
}

/**
 * Nothing left to draw and nothing that will change without new input. The
 * caller's cue to stop requesting frames.
 */
export function isFacetFieldSettled(field: FacetField): boolean {
  return field.pointer === null && field.front === 0 && field.particles.size === 0
}

/** The facets to draw this frame. */
export function facetsOf(field: FacetField): Facet[] {
  const facets: Facet[] = []

  for (const p of field.particles.values()) {
    /*
      Presence MULTIPLIES the rest size and alpha; it is not fed back into the
      distance interpolation. The design's floor of 3.7px / 0.17 alpha is what
      a facet looks like at the EDGE OF THE DISC, not on its way out — folding
      the two together once made every facet shrink to the rim size, hold, and
      then pop out, instead of the "fade back to dots" the note asks for.

      Scale may undershoot below zero on the way out — the spring's bounce in
      the other direction. A negative size would draw an inverted triangle, so
      it is clamped; opacity is clamped at 1 as well, since the overshoot is
      meant to read as size, not as a flash.
    */
    const presence = Math.max(p.presence, 0)
    if (presence < SETTLED) continue

    facets.push({
      x: p.rest.x + p.offsetX,
      y: p.rest.y + p.offsetY,
      size: p.rest.size * presence,
      opacity: p.rest.opacity * Math.min(presence, 1),
      angle: p.rest.angle + p.spin,
    })
  }

  return facets
}

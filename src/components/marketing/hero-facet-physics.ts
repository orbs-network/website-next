import { FACET_RADIUS, FACET_SPACING, facetsAround, type Facet } from '@/components/marketing/hero-facets'

/**
 * The facet field as a set of particles with state: the motion that
 * `facetsAround` cannot express, because it has no memory.
 *
 * `facetsAround` is still the specification. It says what every facet looks
 * like for a cursor that has been sitting still — the measured design — and
 * each particle here eases toward exactly that. Hold the pointer still and
 * the field settles onto it; `hero-facet-physics.test.ts` pins that, so the
 * motion can be retuned freely without drifting off the design.
 *
 * What this adds, all of it in motion and none of it at rest:
 *
 *  - **Bloom.** Facets scale up in a wave from the pointer rather than all at
 *    once.
 *  - **Liquid.** A moving pointer drags nearby facets along its path, pushes
 *    them aside and sets them turning; they drift slowly home when it stops.
 *    Nothing overshoots — see `DRIFT_RETURN_SECONDS`.
 *  - **Collapse.** On leaving, the field shrinks back from the rim inward.
 *
 * Pure and deterministic — no DOM, no clock — so every behaviour above is a
 * node test rather than something checked by eye.
 */

/** A damped spring, as the two coefficients the integrator needs. */
type Spring = { stiffness: number; damping: number }

/**
 * A spring described the way it is tuned: how fast it oscillates and how
 * quickly that dies away. `dampingRatio` below 1 overshoots; 1 is the quickest
 * settle that does not.
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

/**
 * Scale. Critically damped: the quickest settle that does not pop past full
 * size. (It overshot once, as a deliberate "bounce", and was taken out.)
 */
export const SCALE_SPRING = spring(2.4, 1)

/**
 * How long a displaced facet takes to drift home, as the time constant of an
 * exponential: ~63% of the way in 0.35s, all but invisible by ~1.5s.
 *
 * NOT A SPRING, and that is the point. Position and rotation have no inertia
 * here — the pointer moves a facet directly, and when it stops, the facet
 * eases back along the way it came and stops dead in its cell. Springs were
 * tried first, underdamped and then overdamped; both carry velocity, and a
 * facet still moving when the pointer stopped would glide through its cell
 * and come back — read, rightly, as a bounce. A first-order return cannot
 * overshoot, by construction.
 */
export const DRIFT_RETURN_SECONDS = 0.35

/** The same for rotation, handing back to the travelling wave. */
export const SPIN_RETURN_SECONDS = 0.3

/**
 * How strongly the pointer's motion moves the facets within `FINGER_RADIUS`
 * of it. Tuned so a brisk 800px/s sweep drags the facets it passes over about
 * a lattice cell and a half, while the rim of the disc does not move.
 *
 *  - `DRAG`, a fraction of the pointer's velocity: a facet under the pointer
 *    travels with it at this share of its speed. The wake.
 *  - `PUSH`, a fraction of its speed, directed away from the pointer: facets
 *    in the finger's path are shoved aside.
 *  - `SWIRL`, radians per px of sideways pointer travel: facets turn by which
 *    side of the path they are on, so the two flanks of a stroke spin
 *    opposite ways, like eddies.
 */
export const DRAG = 0.5
export const PUSH = 0.6
export const SWIRL = 0.004

/**
 * How much each facet's response to the pointer varies, either side of 1.
 *
 * Without it, neighbours feel almost the same force and move as a block: the
 * field slides, and nothing separates, however strong the drag. Giving each
 * facet its own responsiveness — fixed per cell, so it is the same facet
 * every visit — is what breaks the lattice into individual pieces in motion,
 * like particles of different weight suspended in the same liquid. It only
 * scales the pointer's forces, so at rest it changes nothing.
 */
export const RESPONSE_SPREAD = 0.45

/**
 * A stable pseudo-random 0-1 per lattice cell. The classic shader hash: not
 * a good random number generator, and it does not need to be one — it needs
 * to look unpatterned across a few hundred neighbouring cells, and to give
 * the same answer every frame.
 */
function cellNoise(col: number, row: number): number {
  const n = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453

  return n - Math.floor(n)
}

/** The furthest a facet may drift from its cell, in px — about two cells. A flick should stir the field, not scatter it. */
export const MAX_DRIFT = 44

/**
 * The reach of the pointer's push and drag, in px — about three facet cells.
 *
 * Much smaller than the disc, deliberately. Think of floating balls and a
 * finger drawn through the water: the finger moves the balls it touches, and
 * the ones a hand's width away barely rock. With the whole 162px disc in
 * reach, the rim was stirred nearly as hard as the facets under the pointer
 * and the field read as one sheet sliding about, not as things being pushed.
 */
export const FINGER_RADIUS = 60

/**
 * How hard the finger moves a facet at `distance`: 1 at the pointer, falling
 * smoothly to 0 at `FINGER_RADIUS` and staying there.
 *
 * `(1 - t^2)^2` rather than the size falloff's `1 - t^2`: the square takes
 * the slope to zero at the edge as well, so there is no visible line where
 * facets stop responding, and it drops away faster — at half the radius it is
 * 0.56 against 0.75 — which is what concentrates the disturbance on the
 * facets nearest the pointer.
 */
export function fingerInfluence(distance: number, radius: number = FINGER_RADIUS): number {
  if (!(radius > 0) || distance >= radius) return 0

  const t = distance / radius
  const k = 1 - t * t

  return k * k
}

/**
 * The integration step. The field is stepped at a fixed 120Hz whatever the
 * display runs at, so a 60Hz laptop and a 144Hz monitor animate the same —
 * the old single-line ease was frame-rate dependent, which a decorative fade
 * could live with and a stateful field cannot.
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
  /** Scale, 0-1. Multiplies the rest size and opacity. */
  presence: number
  presenceVelocity: number
  /** Drift from the cell centre, in px. */
  offsetX: number
  offsetY: number
  /** Rotation on top of the travelling wave, in radians. */
  spin: number
  /** Multiplier on the pointer's forces on this facet. See `RESPONSE_SPREAD`. */
  response: number
}

export type FacetField = {
  /** The pointer, in field space, or `null` when it is outside the field. Write it with `moveFacetPointer`, not directly. */
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

/**
 * Report where the pointer is — `null` for outside the field.
 *
 * A function rather than an assignment because LEAVING HAS TO BE RECORDED THE
 * MOMENT IT HAPPENS, not when the next frame gets round to it. Pointer events
 * arrive between frames, and a pointer that leaves and re-enters before the
 * next step — two events inside one 16ms frame, or any number while a
 * background tab has paused the frame loop — would otherwise only ever be
 * seen inside. The step would then measure the jump from where it left to
 * where it came back as one frame of motion: a flick across the hero that
 * never happened.
 */
export function moveFacetPointer(field: FacetField, point: Point | null) {
  field.pointer = point ? { ...point } : null

  if (!point) {
    field.previousPointer = null
    field.pointerVelocityX = 0
    field.pointerVelocityY = 0
  }
}

/** Keyed by lattice cell rather than by position, so float noise in a centre can never split one cell into two particles. */
function cellOf(facet: Facet): { col: number; row: number } {
  return { col: Math.round(facet.x / FACET_SPACING), row: Math.round(facet.y / FACET_SPACING) }
}

function cellKey(facet: Facet): string {
  const { col, row } = cellOf(facet)

  return `${col},${row}`
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
      const { col, row } = cellOf(facet)
      field.particles.set(key, {
        rest: facet,
        live: true,
        presence: 0,
        presenceVelocity: 0,
        offsetX: 0,
        offsetY: 0,
        spin: 0,
        response: 1 + RESPONSE_SPREAD * (2 * cellNoise(col, row) - 1),
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
    const moving = present && speed > 0
    const influence = moving ? fingerInfluence(distance) * p.response : 0
    const ux = distance > 0 ? dx / distance : 0
    const uy = distance > 0 ? dy / distance : 0

    // Moved directly by the pointer, then an exact exponential step home. See `DRIFT_RETURN_SECONDS`.
    const driftDecay = Math.exp(-h / DRIFT_RETURN_SECONDS)
    p.offsetX = p.offsetX * driftDecay + influence * (DRAG * vx + PUSH * speed * ux) * h
    p.offsetY = p.offsetY * driftDecay + influence * (DRAG * vy + PUSH * speed * uy) * h

    const drift = Math.hypot(p.offsetX, p.offsetY)
    if (drift > MAX_DRIFT) {
      p.offsetX *= MAX_DRIFT / drift
      p.offsetY *= MAX_DRIFT / drift
    }

    // Which side of the path the facet is on: the 2D cross product of its bearing and the pointer's velocity.
    const turn = influence * SWIRL * (ux * vy - uy * vx)
    p.spin = p.spin * Math.exp(-h / SPIN_RETURN_SECONDS) + turn * h
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

      Clamped to 0-1 all the same. The scale spring is critically damped and
      does not overshoot a target it is settling on, but a target that flips
      mid-flight — the pointer leaving during the bloom — hands it velocity
      the wrong way, and a size below zero would draw an inverted triangle.
    */
    const presence = Math.min(Math.max(p.presence, 0), 1)
    if (presence < SETTLED) continue

    facets.push({
      x: p.rest.x + p.offsetX,
      y: p.rest.y + p.offsetY,
      size: p.rest.size * presence,
      opacity: p.rest.opacity * presence,
      angle: p.rest.angle + p.spin,
    })
  }

  return facets
}

'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import {
  createFacetField,
  facetsOf,
  isFacetFieldSettled,
  moveFacetPointer,
  stepFacetField,
  tapFacetField,
} from '@/components/marketing/hero-facet-physics'
import { FACET_GRADIENT_STOPS, FACET_RADIUS, FACET_SIZE_MAX, type Facet } from '@/components/marketing/hero-facets'

/**
 * The hero's interactive backdrop: a dot grid that fans out into Orbs facets
 * under the cursor, or in a brief ripple from a tap on a touch screen.
 *
 * The maths lives in `hero-facets.ts` (what the field looks like at rest) and
 * `hero-facet-physics.ts` (the springs that bloom, stir and collapse it), and
 * is tested there. This file is the parts that can only be done in a browser —
 * capability detection, the pointer, the canvas and the frame loop.
 *
 * **The dot grid is a child, not something this draws.** It is passed in and
 * rendered on the server, so the resting state of the hero is correct with no
 * JavaScript at all: the grid is the design, and the facets are an enhancement
 * on top of it. Drawing both here would have made the entire backdrop depend on
 * a canvas.
 *
 * **Canvas rather than 200 elements.** Each pointer move changes the size,
 * alpha and rotation of every facet in the disc. As DOM that is ~200 style
 * recalculations per frame against one `fillRect`-shaped canvas pass.
 */

/** Media queries that decide whether this should run at all, and how. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * How far a touch may wander between down and up and still count as a tap,
 * in CSS px. Past this it is a swipe, and a swipe belongs to the page's
 * scrolling — usually the browser has already taken it with `pointercancel`,
 * but a short drag it did not claim must not ripple either.
 */
const TAP_SLOP = 10

/**
 * - `off`: reduced motion, or the server. The dot grid alone, no canvas.
 * - `tap`: touch-only devices. Taps ripple the field; nothing follows a hover.
 * - `hover`: a fine pointer. The cursor holds the field up, as it always has,
 *   and a touch on a hybrid device's screen ripples it too.
 */
type FieldMode = 'off' | 'tap' | 'hover'

/**
 * How the field should run, as a subscription rather than effect state.
 *
 * `useSyncExternalStore` instead of `useState` in an effect: the answer is
 * read from the environment rather than derived from a render, and setting
 * state in an effect to record it trips `react-hooks/set-state-in-effect` and
 * costs an extra commit on every page that uses this. A string rather than an
 * object, because the snapshot is compared with `Object.is`.
 *
 * The server snapshot is `off`, so the markup sent down is the dot grid
 * alone. That is the correct resting state rather than a placeholder, which is
 * why there is no hydration flash to suppress.
 */
function useFieldMode(): FieldMode {
  const subscribe = useCallback((onChange: () => void) => {
    const queries = [window.matchMedia(FINE_POINTER), window.matchMedia(REDUCED_MOTION)]

    for (const query of queries) query.addEventListener('change', onChange)

    return () => {
      for (const query of queries) query.removeEventListener('change', onChange)
    }
  }, [])

  return useSyncExternalStore(
    subscribe,
    (): FieldMode => {
      if (window.matchMedia(REDUCED_MOTION).matches) return 'off'

      return window.matchMedia(FINE_POINTER).matches ? 'hover' : 'tap'
    },
    (): FieldMode => 'off'
  )
}

/**
 * Trace a rounded equilateral triangle centred on (`facet.x`, `facet.y`) with
 * its apex along `facet.angle`.
 *
 * `facet.size` is the side length, so the circumradius is `size / sqrt(3)`.
 *
 * ROUNDED WITH `arcTo`, AND NOT BY STROKING THE PATH. Stroking with a round
 * line join is the shorter way to round a polygon and it was the first version
 * here, but it requires painting the shape twice — `fill()` then `stroke()` —
 * and these facets are drawn at an alpha between 0.17 and 0.89. Two
 * translucent passes composite over each other wherever they overlap, so every
 * facet got a denser rim than its middle. Measured against the design's own
 * render of the same cluster, that read as roughly 15% too bright overall.
 * One path, one `fill()`, no overlap.
 */
function traceFacet(ctx: CanvasRenderingContext2D, facet: Facet) {
  const circumradius = Math.max(facet.size / Math.sqrt(3), 0.1)
  /*
    11% of the side length. The design's group is called
    `Hover-rounded-facets` and its corners are visibly soft, but they are still
    unmistakably triangles — which matters more than it sounds, because the
    direction each facet points IS the effect. A first pass at 18% rendered
    them as guitar picks: still technically rotating, no longer legibly
    pointing anywhere.
  */
  const round = Math.min(facet.size * 0.11, circumradius * 0.5)

  const points = [0, 1, 2].map((corner) => {
    const angle = facet.angle + (corner * 2 * Math.PI) / 3

    return { x: facet.x + circumradius * Math.cos(angle), y: facet.y + circumradius * Math.sin(angle) }
  })

  ctx.beginPath()
  /*
    Start at the midpoint of an edge rather than at a vertex. `arcTo` needs a
    current point that is not the corner it is rounding, and an edge midpoint
    is always far enough away for any radius up to half the edge — which the
    clamp above guarantees.
  */
  ctx.moveTo((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2)
  ctx.arcTo(points[1].x, points[1].y, points[2].x, points[2].y, round)
  ctx.arcTo(points[2].x, points[2].y, points[0].x, points[0].y, round)
  ctx.arcTo(points[0].x, points[0].y, points[1].x, points[1].y, round)
  ctx.closePath()
}

export function HeroFacetField({ children }: { children?: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mode = useFieldMode()
  const enabled = mode !== 'off'

  useEffect(() => {
    if (mode === 'off') return

    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /*
      All of the per-frame state is held in closure rather than in refs or
      state. None of it should ever cause a render — a field that re-rendered
      React on pointer move would be the whole cost this component exists to
      avoid.
    */
    /*
      The field's clock is its own `elapsed`, advanced only while frames run,
      NOT wall clock — so the rotation picks up where it left off rather than
      jumping to wherever `performance.now()` had got to while nothing was
      being drawn.
    */
    const field = createFacetField()
    let frame = 0
    let width = 0
    let height = 0
    let lastFrameAt = 0

    const resize = () => {
      const rect = root.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const facets = facetsOf(field)
      const centre = field.anchor

      if (centre && facets.length > 0) {
        /*
          ONE gradient across the disc, recreated per frame because the disc
          moves. This is how the design is built: each drawn facet carries a
          gradient whose handles run far past the shape, which is Figma's
          record of a single gradient sampled per shape.
        */
        const gradient = ctx.createLinearGradient(0, centre.y - FACET_RADIUS, 0, centre.y + FACET_RADIUS)
        for (const stop of FACET_GRADIENT_STOPS) gradient.addColorStop(stop.offset, stop.color)

        ctx.fillStyle = gradient

        for (const facet of facets) {
          ctx.globalAlpha = facet.opacity
          traceFacet(ctx, facet)
          ctx.fill()
        }

        ctx.globalAlpha = 1
      }

      /*
        The hole punched in the dot grid underneath, handed over as inherited
        custom properties rather than by reaching for the child's node. The
        grid is a server-rendered child this component does not own, and
        `--hero-facet-*` is the whole contract between them.

        The hole is the bloom front, so the dots give way exactly as far as
        the wave of facets has reached, and come back as it withdraws.
      */
      if (centre) {
        root.style.setProperty('--hero-facet-x', `${centre.x}px`)
        root.style.setProperty('--hero-facet-y', `${centre.y}px`)
      }
      root.style.setProperty('--hero-facet-hole', `${field.front}px`)
    }

    const tick = (now: number) => {
      /*
        Clamped to 100ms. A backgrounded tab or a long task can hand back a gap
        of seconds, and simulating all of it would snap every facet to a new
        orientation the moment the reader came back.
      */
      const delta = lastFrameAt === 0 ? 0 : Math.min((now - lastFrameAt) / 1000, 0.1)
      lastFrameAt = now

      stepFacetField(field, delta)
      draw()

      if (isFacetFieldSettled(field)) {
        // Collapsed and out of view. Stop burning frames until something moves.
        frame = 0
        lastFrameAt = 0
        return
      }

      /*
        Keeps running while the pointer is in the field even if it never moves
        again — the rotation is not settling toward anything, so there is no
        idle state to stop at while the field is up.
      */
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame === 0) {
        lastFrameAt = 0
        frame = requestAnimationFrame(tick)
      }
    }

    /*
      Listening on the window rather than on the section. The section is this
      element's PARENT, and reaching up to it would couple the component to
      wherever it happens to be mounted; testing the pointer against our own
      rect gives the same behaviour and also handles the pointer leaving
      through any edge, including out of the document.
    */
    /*
      The pointer's last VIEWPORT position, kept so it can be re-resolved
      against a moved section. `-1` means "not seen yet", which is different
      from "at the origin".
    */
    let clientX = -1
    let clientY = -1

    /**
     * Resolve the remembered viewport position against the section's current
     * rect.
     *
     * Separate from the event handler because SCROLLING MOVES THE SECTION
     * WITHOUT MOVING THE MOUSE. Hold the cursor still over the hero and use
     * the wheel: no `pointermove` fires, so a handler that only ran on pointer
     * events would keep the old local coordinates while the rect slid out from
     * under them. The field drifts off the cursor, and keeps burning frames
     * after the hero has scrolled away entirely.
     */
    const resolvePointer = () => {
      if (clientX < 0) return

      const rect = root.getBoundingClientRect()
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

      moveFacetPointer(field, inside ? { x: clientX - rect.left, y: clientY - rect.top } : null)

      /*
        Only wake the loop when there is something for it to do — the pointer
        is in the field, or a collapse is still settling.

        This listener is on the WINDOW, so it runs for every mouse move
        anywhere on the page. Calling `start()` unconditionally meant that once
        a reader had touched the hero, moving the mouse over the footer
        scheduled a frame per event for the rest of the visit, each one
        clearing a 2880x1372 canvas and writing three custom properties to
        paint nothing.
      */
      if (!isFacetFieldSettled(field)) start()
    }

    const onPointerMove = (event: PointerEvent) => {
      // Coarse pointers fire this too (a tap is a pointer event), and hover
      // is mouse-only — touch gets the tap below instead. This gates a hybrid
      // device where a touch arrives at a machine that also has a mouse.
      if (event.pointerType !== 'mouse') return

      clientX = event.clientX
      clientY = event.clientY
      resolvePointer()
    }

    const onPointerLeave = (event: Event) => {
      /*
        Not for a lifting finger. A touch pointer "leaves" when it lifts, and
        on a hybrid device that would collapse the tap it had just started.
      */
      if (event instanceof PointerEvent && event.pointerType === 'touch') return

      moveFacetPointer(field, null)
      start()
    }

    /*
      THE TAP. A touch screen has no hover to follow, so a tap ripples the
      field from the finger instead — modelled on galaxy.com's mobile hero,
      which answers a tap with a ring that pushes its dots outward and fades
      within a second.

      DECIDED ON `pointerup`, NOT `pointerdown`. Every vertical swipe starts
      with a pointerdown, and rippling on it would set the field off each time
      the reader scrolled past the hero. A swipe the browser takes for
      scrolling ends in `pointercancel`; one it does not is caught by
      `TAP_SLOP`. Either way, only a touch that stays put is a tap.

      NOTHING HERE CALLS `preventDefault`, and the listeners are passive. The
      page scrolls exactly as it did; this only watches. Listening on the
      window for the same reason as the mouse above — the field itself is
      `pointer-events-none` and must stay that way.
    */
    let touch: { id: number; x: number; y: number } | null = null

    const onTouchDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return

      /*
        Only a touch that lands on the hero itself. The rect alone is not
        enough: the site header and the mobile menu sit OVER the hero, and a
        tap on one of them must not ripple the background underneath. The
        field's parent is the box it backs, so its subtree is the hero.
      */
      const host = root.parentElement
      const rect = root.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      const onHero = host !== null && event.target instanceof Node && host.contains(event.target)

      touch = inside && onHero ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null
    }

    const onTouchUp = (event: PointerEvent) => {
      if (!touch || event.pointerId !== touch.id) return

      const down = touch
      touch = null

      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > TAP_SLOP) return

      /*
        Resolved against the rect NOW rather than at pointerdown: the page can
        have moved between the two (momentum from an earlier fling), and the
        ripple belongs where the finger is on the hero, not where it was.
      */
      const rect = root.getBoundingClientRect()
      tapFacetField(field, { x: event.clientX - rect.left, y: event.clientY - rect.top })
      start()
    }

    const onTouchCancel = (event: PointerEvent) => {
      if (touch && event.pointerId === touch.id) touch = null
    }

    resize()
    draw()

    const observer = new ResizeObserver(() => {
      resize()
      draw()
    })
    observer.observe(root)

    window.addEventListener('pointerdown', onTouchDown, { passive: true })
    window.addEventListener('pointerup', onTouchUp, { passive: true })
    window.addEventListener('pointercancel', onTouchCancel, { passive: true })

    // Hover is for a fine pointer only, exactly as before taps existed.
    const hover = mode === 'hover'
    if (hover) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
      window.addEventListener('blur', onPointerLeave)
      /*
        `capture` so this still fires when the page is scrolled inside a nested
        scroller rather than on the document — scroll does not bubble, but it
        does capture.
      */
      window.addEventListener('scroll', resolvePointer, { passive: true, capture: true })
    }

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointerdown', onTouchDown)
      window.removeEventListener('pointerup', onTouchUp)
      window.removeEventListener('pointercancel', onTouchCancel)
      if (hover) {
        window.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('blur', onPointerLeave)
        window.removeEventListener('scroll', resolvePointer, { capture: true })
      }
      root.style.removeProperty('--hero-facet-x')
      root.style.removeProperty('--hero-facet-y')
      root.style.removeProperty('--hero-facet-hole')
    }
  }, [mode])

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {children}
      {enabled ? (
        <canvas
          ref={canvasRef}
          /*
            Sized in CSS and backed at device resolution in the effect. Width
            and height attributes are deliberately absent: setting them here
            would make React own them and fight the DPR sizing on every render.
          */
          className="absolute inset-0 block h-full w-full"
          style={{ maxWidth: `calc(100% + ${FACET_SIZE_MAX}px)` }}
        />
      ) : null}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import {
  FACET_GRADIENT_STOPS,
  FACET_RADIUS,
  FACET_SIZE_MAX,
  facetsAround,
  type Facet,
} from '@/components/marketing/hero-facets'

/**
 * The hero's interactive backdrop: a dot grid that fans out into Orbs facets
 * under the cursor.
 *
 * The maths lives in `hero-facets.ts` and is tested there. This file is the
 * parts that can only be done in a browser — capability detection, the pointer,
 * the canvas, and the easing that makes it "fade back to dots".
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

/** Media queries that decide whether this should run at all. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Whether the field should run, as a subscription rather than effect state.
 *
 * `useSyncExternalStore` instead of `useState` in an effect: the answer is
 * read from the environment rather than derived from a render, and setting
 * state in an effect to record it trips `react-hooks/set-state-in-effect` and
 * costs an extra commit on every page that uses this.
 *
 * The server snapshot is `false`, so the markup sent down is the dot grid
 * alone. That is the correct resting state rather than a placeholder, which is
 * why there is no hydration flash to suppress.
 */
function useFieldEnabled(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const queries = [window.matchMedia(FINE_POINTER), window.matchMedia(REDUCED_MOTION)]

    for (const query of queries) query.addEventListener('change', onChange)

    return () => {
      for (const query of queries) query.removeEventListener('change', onChange)
    }
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(FINE_POINTER).matches && !window.matchMedia(REDUCED_MOTION).matches,
    () => false
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
  const enabled = useFieldEnabled()

  useEffect(() => {
    if (!enabled) return

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
    let pointerX = 0
    let pointerY = 0
    let intensity = 0
    let target = 0
    let frame = 0
    let width = 0
    let height = 0

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

      if (intensity > 0.002) {
        const facets = facetsAround(pointerX, pointerY, { intensity })

        /*
          ONE gradient across the disc, recreated per frame because the disc
          moves. This is how the design is built: each drawn facet carries a
          gradient whose handles run far past the shape, which is Figma's
          record of a single gradient sampled per shape.
        */
        const gradient = ctx.createLinearGradient(0, pointerY - FACET_RADIUS, 0, pointerY + FACET_RADIUS)
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
      */
      const hole = intensity > 0.002 ? FACET_RADIUS * intensity : 0
      root.style.setProperty('--hero-facet-x', `${pointerX}px`)
      root.style.setProperty('--hero-facet-y', `${pointerY}px`)
      root.style.setProperty('--hero-facet-hole', `${hole}px`)
    }

    const tick = () => {
      // Exponential ease toward the target. Frame-rate dependent, which is
      // acceptable for a decorative fade and keeps this to one line; the
      // visible difference between 60Hz and 120Hz is a fade that settles in
      // ~120ms rather than ~200ms.
      intensity += (target - intensity) * 0.16

      draw()

      if (target === 0 && intensity <= 0.002) {
        // Settled and out of view. Stop burning frames until something moves.
        intensity = 0
        draw()
        frame = 0
        return
      }

      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame === 0) frame = requestAnimationFrame(tick)
    }

    /*
      Listening on the window rather than on the section. The section is this
      element's PARENT, and reaching up to it would couple the component to
      wherever it happens to be mounted; testing the pointer against our own
      rect gives the same behaviour and also handles the pointer leaving
      through any edge, including out of the document.
    */
    const onPointerMove = (event: PointerEvent) => {
      // Coarse pointers fire this too (a tap is a pointer event), and the
      // field is explicitly desktop-only. `enabled` gates mounting; this gates
      // a hybrid device where a touch arrives at a machine that also has a
      // mouse.
      if (event.pointerType !== 'mouse') return

      const rect = root.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom

      target = inside ? 1 : 0

      if (inside) {
        pointerX = event.clientX - rect.left
        pointerY = event.clientY - rect.top
      }

      start()
    }

    const onPointerLeave = () => {
      target = 0
      start()
    }

    resize()
    draw()

    const observer = new ResizeObserver(() => {
      resize()
      draw()
    })
    observer.observe(root)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('blur', onPointerLeave)

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
      root.style.removeProperty('--hero-facet-x')
      root.style.removeProperty('--hero-facet-y')
      root.style.removeProperty('--hero-facet-hole')
    }
  }, [enabled])

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

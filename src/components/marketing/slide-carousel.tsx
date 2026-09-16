'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * A horizontal carousel of screenshots.
 *
 * Built on CSS scroll snapping rather than a carousel library. The legacy page
 * uses Swiper for three static images, which is tens of kilobytes of JavaScript
 * to do what `overflow-x-auto` plus `snap-x` does natively — and does better:
 * it scrolls with a trackpad, a touch swipe, the arrow keys and a scrollbar
 * before any JavaScript has loaded, and it keeps working if the bundle never
 * arrives.
 *
 * The only thing JavaScript adds here is the dot controls and knowing which
 * slide is in view, and both degrade to a plain scrollable strip without it.
 *
 * Structured as a labelled list, not a `role="region"` with `aria-roledescription
 * ="carousel"`. The APG carousel pattern exists for rotating content that
 * demands play/pause and live-region management; this is three static images in
 * a row that a reader can scroll. Announcing it as a carousel would promise
 * interactions it does not have.
 */

export type CarouselSlide = {
  id: string
  caption: string
  /** Language of the caption, from `textLang`. Undefined means the document's. */
  captionLang?: string
  /**
   * The accessible name for this slide's dot control.
   *
   * A resolved string per slide, not a `(index) => string` the caller supplies.
   * This is a client component and its parent is a server one, so a function
   * prop does not survive the boundary: React refuses it with "Functions cannot
   * be passed directly to Client Components". The typechecker has nothing to
   * say about that — it only shows up when the page renders.
   */
  label: string
  image: { src: string; width: number; height: number }
}

export function SlideCarousel({
  slides,
  label,
  className,
}: {
  slides: readonly CarouselSlide[]
  /** Accessible name for the group, e.g. the section heading. */
  label: string
  className?: string
}) {
  const scroller = React.useRef<HTMLUListElement>(null)
  const [current, setCurrent] = React.useState(0)

  /**
   * Which slide is in view, from the scroll position rather than from a timer
   * or a state machine we own. The reader can scroll this directly — by swipe,
   * trackpad, keyboard or the scrollbar — so the scroller is the source of
   * truth and the dots follow it. A component that tracked its own index would
   * disagree with the screen the first time someone swiped.
   */
  React.useEffect(() => {
    const element = scroller.current
    if (!element) return

    function update() {
      const node = scroller.current
      if (!node) return

      const slideWidth = node.scrollWidth / slides.length
      setCurrent(Math.min(slides.length - 1, Math.round(node.scrollLeft / slideWidth)))
    }

    element.addEventListener('scroll', update, { passive: true })
    update()

    return () => element.removeEventListener('scroll', update)
  }, [slides.length])

  function show(index: number) {
    const node = scroller.current
    if (!node) return

    node.scrollTo({ left: (node.scrollWidth / slides.length) * index, behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <ul
        ref={scroller}
        // `tabIndex` because it scrolls: a scroll container that cannot be
        // focused cannot be scrolled with the keyboard, which fails 2.1.1 for
        // anyone not using a mouse.
        tabIndex={0}
        aria-label={label}
        className={cn(
          'flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        {slides.map((slide) => (
          <li key={slide.id} className="w-full shrink-0 snap-center">
            <figure className="flex h-full flex-col">
              <Image
                src={slide.image.src}
                // The caption below says the same thing, so repeating it here
                // would have a screen reader read it twice. Empty alt, captioned
                // figure.
                alt=""
                width={slide.image.width}
                height={slide.image.height}
                sizes="(min-width: 1024px) 896px, 100vw"
                className="h-auto w-full rounded-sm border border-border"
              />
              <figcaption className="mt-4 text-detail text-fg-muted" lang={slide.captionLang}>
                {slide.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => show(index)}
            aria-label={slide.label}
            // Which one you are looking at, exposed rather than only coloured
            // in. `aria-current` is the honest primitive here: these are not
            // tabs and they control no panel.
            aria-current={index === current ? 'true' : undefined}
            className={cn(
              'size-2.5 rounded-full border border-fg-muted transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
              index === current ? 'bg-fg-muted' : 'bg-transparent hover:bg-fg-muted/40'
            )}
          />
        ))}
      </div>
    </div>
  )
}

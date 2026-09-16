'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * A horizontal strip of cards, several visible at once.
 *
 * Sibling to `SlideCarousel` rather than a mode of it. That one shows exactly
 * one full-width slide with dot controls; this shows a partial row with arrow
 * controls and no notion of a "current" item. Merging them would mean a
 * component whose props contradict each other in half its configurations.
 *
 * Same foundation for the same reason: CSS scroll snapping. The strip scrolls
 * with a trackpad, a touch swipe, the arrow keys and a scrollbar before any
 * JavaScript runs. The buttons only add a click target, and they disable
 * themselves at each end rather than wrapping — wrapping a partially-visible
 * row jumps the reader somewhere they were not.
 */

export function CardRail({
  children,
  label,
  previousLabel,
  nextLabel,
  lang,
  className,
}: {
  children: React.ReactNode
  /** Accessible name for the strip, e.g. the section heading. */
  label: string
  previousLabel: string
  nextLabel: string
  /**
   * Language of everything inside, when it differs from the document.
   *
   * The news rail is English in all three locales — Contentful has a single
   * `en-US` locale — so the caller marks the whole rail rather than each title,
   * date and arrow label separately.
   */
  lang?: string
  className?: string
}) {
  const scroller = React.useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = React.useState(true)
  const [atEnd, setAtEnd] = React.useState(false)

  React.useEffect(() => {
    const element = scroller.current
    if (!element) return

    function update() {
      const node = scroller.current
      if (!node) return

      setAtStart(node.scrollLeft <= 1)
      // A pixel of slack: sub-pixel layout means `scrollLeft + clientWidth`
      // rarely lands exactly on `scrollWidth`, and an arrow that never enables
      // at the end is worse than one that enables a pixel early.
      setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1)
    }

    element.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()

    return () => {
      element.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  function nudge(direction: 1 | -1) {
    const node = scroller.current
    if (!node) return

    // Scroll by what is on screen rather than by a fixed card width. The cards
    // are responsive, so a hardcoded step would overshoot on a phone and
    // undershoot on a wide display.
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' })
  }

  const arrow = 'rounded-sm p-2 transition-colors hover:text-accent-primary disabled:opacity-40'

  return (
    <div className={className} lang={lang}>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={atStart}
          aria-label={previousLabel}
          className={cn(arrow, 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
        >
          <Arrow className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={atEnd}
          aria-label={nextLabel}
          className={cn(arrow, 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
        >
          <Arrow />
        </button>
      </div>

      <ul
        ref={scroller}
        // Focusable because it scrolls — a scroll container that cannot take
        // focus cannot be scrolled from the keyboard.
        tabIndex={0}
        aria-label={label}
        className={cn(
          'mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        {children}
      </ul>
    </div>
  )
}

/** Decorative: every caller labels its button. */
function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
      className={cn('size-6', className)}
    >
      <path d="M4 12h16M14 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

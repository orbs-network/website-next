'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from '@/components/icons'

/**
 * How far down the page the button appears, in pixels.
 *
 * Roughly one viewport on a laptop. Below this the header is still on screen or
 * a short scroll away, so the button would be offering to solve a problem the
 * reader does not have.
 */
const REVEAL_AFTER_PX = 600

/**
 * Floating "back to top" control, on every page.
 *
 * A port of the legacy `partials/shared/scroll-top`, which `pages/page.js`
 * rendered on every page — so this is chrome, not a per-page feature. Two
 * things are done differently from the original, both deliberately:
 *
 *  - **It unmounts when hidden.** The legacy button was always in the DOM at
 *    `opacity: 0; pointer-events: none`, which hides it from the mouse but
 *    leaves it in the tab order: keyboard users tabbed onto an invisible
 *    control at the top of every page. Rendering nothing is the honest version.
 *  - **It honours `prefers-reduced-motion`.** A smooth scroll of several
 *    thousand pixels is exactly the kind of large-area motion that triggers
 *    vestibular symptoms, and it is the one animation on the site guaranteed to
 *    be full-viewport.
 *
 * The label arrives as a prop rather than from `useTranslations`. Its namespace
 * would otherwise have to be serialised into the RSC payload of all 456
 * prerendered pages for one string — see the note in `RootShell` about what
 * goes into `NextIntlClientProvider`.
 */
export function ScrollToTop({ label, lang }: { label: string; lang?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Read once on mount as well as on scroll: a reload partway down the page,
    // or a browser restoring scroll position, both land here already scrolled
    // with no scroll event to follow.
    const update = () => setVisible(window.scrollY > REVEAL_AFTER_PX)

    update()
    window.addEventListener('scroll', update, { passive: true })

    return () => window.removeEventListener('scroll', update)
  }, [])

  if (!visible) {
    return null
  }

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      lang={lang}
      className="fixed bottom-6 right-6 z-50 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-fg shadow-md transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {/* Decorative: the button is already named by `aria-label`. */}
      <ArrowUp className="size-5" aria-hidden focusable="false" />
    </button>
  )
}

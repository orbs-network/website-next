'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * A horizontally scrolling band of phrases, with a pause control.
 *
 * **The pause control is required, not a nicety.** WCAG 2.2.2 says moving
 * content that starts automatically and runs for more than five seconds must
 * have a mechanism to pause, stop or hide it. This runs indefinitely.
 *
 * An earlier version of this file claimed `prefers-reduced-motion` satisfied
 * that, and the comment saying so was wrong: a media query is a user-agent
 * preference, not a mechanism in the content, and it does nothing for a reader
 * who wants this particular thing to stop. Both are here now — the media query
 * for people who have asked their OS to calm everything down, and a real
 * control for everyone else.
 *
 * The control is a `<button aria-pressed>`, which is why this is a client
 * component. It was briefly a CSS-only checkbox driving `peer-checked:`, which
 * kept the whole thing zero-JavaScript — but `peer-*` only reaches siblings, so
 * the input had to sit at the top of the band while its label sat at the
 * bottom, and focusing it threw focus to the opposite corner from the visible
 * control. Bending the markup to keep a purity property, at the cost of the
 * accessibility control being where it says it is, is the wrong way round.
 *
 * The motion itself is still one CSS animation on a duplicated track. No scroll
 * listener, no rAF loop.
 *
 * **The duplicate track is `aria-hidden`.** Seamless looping needs the phrases
 * twice so the second copy is in place when the first scrolls out. To a screen
 * reader that would be the same sentence read twice.
 */
export function Marquee({
  phrases,
  pauseLabel,
  resumeLabel,
  locale,
  className,
}: {
  phrases: readonly string[]
  /**
   * Names for the control in each state.
   *
   * Required rather than defaulted: a control with no name is announced as
   * "button", and an English default would put English into a Japanese
   * document without anyone choosing to.
   */
  pauseLabel: string
  resumeLabel: string
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
  className?: string
}) {
  const [paused, setPaused] = React.useState(false)

  const track = (
    <ul className="flex shrink-0 items-center gap-16 px-8">
      {phrases.map((phrase) => (
        /*
          Per phrase. The home marquee is a list of independent slogans, and
          they are translated one at a time — "One API" stays English in the
          Korean catalog while the phrase beside it does not.
        */
        <li key={phrase} className="whitespace-nowrap text-h3 text-fg sm:text-h2" lang={textLang(phrase, locale)}>
          {phrase}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className={cn(
        'relative overflow-hidden py-16',
        'bg-gradient-to-r from-cyan-500/40 via-periwinkle-500/40 to-lilac-500/40',
        className
      )}
    >
      {/*
        `animation-play-state` belongs on the element running the animation.
        On a wrapper it does nothing to the child — which is a way to ship a
        pause button that silently does not pause.
      */}
      <div
        className={cn(
          'flex animate-marquee motion-reduce:[animation-play-state:paused]',
          paused && '[animation-play-state:paused]'
        )}
      >
        {track}
        <div aria-hidden="true" className="flex">
          {track}
        </div>
      </div>

      {/*
        `aria-pressed` rather than swapping the label alone: it states the
        toggle's state rather than leaving a screen reader to infer it from a
        word that changed. The visible text changes too, because a sighted
        reader has no `aria-pressed`.
      */}
      <button
        type="button"
        onClick={() => setPaused((current) => !current)}
        aria-pressed={paused}
        /*
          Follows the label that is actually showing. The two states are
          separate catalog entries and need not share a language — and the
          button's text IS its accessible name, so a stale `lang` here is read
          aloud rather than merely sitting in the markup.
        */
        lang={textLang(paused ? resumeLabel : pauseLabel, locale)}
        className={cn(
          'absolute bottom-4 right-4 rounded-sm border border-fg/30 bg-bg/70 px-3 py-1',
          'text-detail font-medium uppercase tracking-widest text-fg transition-colors hover:border-fg',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        {paused ? resumeLabel : pauseLabel}
      </button>
    </div>
  )
}

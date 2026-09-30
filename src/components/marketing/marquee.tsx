import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * A horizontally scrolling band of phrases.
 *
 * **No pause control, by the client's decision (Sara, 2026-09-30).** This had
 * a visible Pause/Resume button because WCAG 2.2.2 (Level A) asks for a way to
 * pause moving content that runs past five seconds. Keeping it hidden but
 * keyboard-reachable was offered and declined, so the band now stops only for
 * readers who ask their OS for reduced motion. That is a KNOWN 2.2.2 gap, not
 * an oversight — do not reintroduce the button without asking, and do not cite
 * this file as compliant.
 *
 * The motion is one CSS animation on a duplicated track. No scroll listener,
 * no rAF loop, and no client JavaScript.
 *
 * **The duplicate track is `aria-hidden`.** Seamless looping needs the phrases
 * twice so the second copy is in place when the first scrolls out. To a screen
 * reader that would be the same sentence read twice.
 */
export function Marquee({
  phrases,
  locale,
  className,
}: {
  phrases: readonly string[]
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
  className?: string
}) {
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
        On a wrapper it does nothing to the child.
      */}
      <div className="flex animate-marquee motion-reduce:[animation-play-state:paused]">
        {track}
        <div aria-hidden="true" className="flex">
          {track}
        </div>
      </div>
    </div>
  )
}

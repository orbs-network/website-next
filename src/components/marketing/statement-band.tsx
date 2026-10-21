import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * `05 / Statement / Pullout Quote`: one line of display type on a full-width
 * gradient.
 *
 * The gradient is `bg-statement-band` in `tailwind.config.ts`, rebuilt from the
 * design's own layer stack rather than exported — see the note there.
 *
 * **Dark text in both themes.** The band is light whichever theme the page is
 * in, so the text is pinned to `neutral-900` rather than following `text-fg`,
 * which would turn it near-white in dark mode and put it on a pale lavender.
 *
 * **Not a `<blockquote>`.** The design calls it a pullout quote, but nobody is
 * being quoted: it is the page's own tagline. A blockquote would tell a screen
 * reader it came from somewhere else. And no `aria-label` on the section: that
 * would make it a landmark named with the very sentence it contains, read
 * twice on the way in.
 *
 * The message sits in the centre of the full panel, in both views.
 */
export function StatementBand({ text, locale }: { text: string; locale: Locale }) {
  const lang = textLang(text, locale)

  return (
    <section lang={lang} className="flex min-h-[26rem] items-center bg-statement-band py-section lg:min-h-[44.5rem]">
      <div className="container">
        <p
          className={`mx-auto max-w-5xl text-center text-balance text-h3 text-neutral-900 sm:text-h2${locale === 'ko' ? ' whitespace-pre-line' : ''}`}
        >
          {text}
        </p>
      </div>
    </section>
  )
}

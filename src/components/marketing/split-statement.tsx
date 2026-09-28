import { H2 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { Eyebrow } from './section-parts'
import { Prose } from './prose'

/**
 * `04 / Split / Heading + Body`: an eyebrow across the top, then a large
 * heading on the left and its explanation on the right.
 *
 * The body goes through `Prose` because the design's copy is two paragraphs
 * separated by a blank line, and in a bare `<p>` that collapses to one block.
 * `Prose` mutes its paragraphs by default; the design sets these at full
 * foreground, hence the override.
 *
 * The gap between the eyebrow and the columns is most of the section. That is
 * the design, not slack: the frame is 600px around ~180px of content, and
 * closing it up turns a statement into a paragraph.
 *
 * `points` is dSPOT's numbered list under the body. An `<ol>` rather than
 * paragraphs with digits typed in: the numbers are drawn, and a screen reader
 * announces the count.
 */
export function SplitStatement({
  eyebrow,
  heading,
  body,
  points,
  locale,
}: {
  eyebrow: string
  heading: string
  body: string
  points?: readonly string[]
  locale: Locale
}) {
  return (
    <section className="container mx-auto border-t border-border px-5 pt-3 pb-section lg:pb-48">
      <Eyebrow text={eyebrow} locale={locale} />

      <div className="mt-16 grid grid-cols-1 gap-8 lg:mt-44 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32">
        <H2 className="text-balance" lang={textLang(heading, locale)}>
          {heading}
        </H2>
        <div className="max-w-2xl">
          <Prose text={body} locale={locale} className="[&_p]:text-p [&_p]:text-fg" />
          {points && points.length > 0 && (
            <ol className="mt-12 space-y-4">
              {points.map((point, index) => (
                <li key={point} className="flex gap-6 text-p text-fg" lang={textLang(point, locale)}>
                  <span aria-hidden="true" className="w-4 shrink-0 font-semibold">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}

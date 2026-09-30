import { H2 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
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
  className,
}: {
  eyebrow: string
  heading: string
  body: string
  points?: readonly string[]
  locale: Locale
  /** Merged onto the section, e.g. a page whose frame sets the eyebrow further below the divider. */
  className?: string
}) {
  return (
    <section className={cn('container border-t border-border pt-3 pb-section lg:pb-48', className)}>
      <Eyebrow text={eyebrow} locale={locale} />

      <div className="mt-16 grid grid-cols-1 gap-8 lg:mt-44 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32">
        <H2 className="text-balance" lang={textLang(heading, locale)}>
          {heading}
        </H2>
        <div className="max-w-2xl">
          <Prose text={body} locale={locale} className="[&_p]:text-p [&_p]:text-fg" />
          {points && points.length > 0 && (
            <ol className="mt-12 space-y-2.5">
              {points.map((point, index) => (
                <li key={point} className="flex items-start gap-2.5 text-p text-fg" lang={textLang(point, locale)}>
                  <NumberBadge value={index + 1} />
                  {/* `py-px`: a 28px line inside the 30px badge row, so a one-line point centres on it. */}
                  <span className="min-w-0 py-px">{point}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * A list number in the design's 30px outlined octagon.
 *
 * The review notes call it a heptagon or a hexagon; the exported frame's path
 * has eight vertices, so it is drawn from those. Aria-hidden because the
 * `<ol>` already announces the position.
 *
 * `accent-primary` rather than the design's #3346F2 in both themes: that is
 * exactly #3346F2 on light, but on the dark page #3346F2 is 2.9:1, under AA
 * for the numeral and under 3:1 for the outline. Dark takes the periwinkle
 * accent (5.9:1), the same substitution the site makes everywhere (#179).
 */
function NumberBadge({ value }: { value: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-[30px] shrink-0 items-center justify-center text-sm font-semibold text-accent-primary"
    >
      <svg viewBox="0 0 30 30" fill="none" className="absolute inset-0 size-full overflow-visible">
        <path
          d="M4.39 4.39L15 0L25.61 4.39L30 15L25.61 25.61L15 30L4.39 25.61L0 15Z"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative">{value}</span>
    </span>
  )
}

import { H2, H4 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { Eyebrow } from './section-parts'

/**
 * A master-style section for content that fits none of the fixed master
 * shapes: the rule and bracketed eyebrow at the top, then a left-aligned
 * heading with the section's content either beside it (`split`) or under it
 * (`stacked`).
 *
 * Built for the legacy inner pages (#227), whose copy is lists, short
 * statements and feature sets rather than the master's hero-plus-graphic
 * rhythm. `SplitStatement` is the right shape for a heading and a paragraph,
 * but its 176px drop under the eyebrow is sized for one statement per page,
 * and stacked five deep it turns a page into mostly air. This keeps the same
 * column split so the headings line up with it, with a tighter drop.
 *
 * `heading` keeps authored line breaks (`whitespace-pre-line`): some legacy
 * titles are written as two lines on purpose.
 */
export function InnerSection({
  id,
  eyebrow,
  heading,
  intro,
  layout = 'split',
  children,
  locale,
  className,
}: {
  /** An in-page anchor, e.g. for a hero button that scrolls here. */
  id?: string
  eyebrow: string
  heading: string
  /** A lead paragraph under the heading, in the heading's column. */
  intro?: string
  /** `split`: content beside the heading from `lg`. `stacked`: full width beneath it. */
  layout?: 'split' | 'stacked'
  children?: React.ReactNode
  locale: Locale
  /** Merged onto the section, e.g. to drop the bottom padding before a strip that belongs to it. */
  className?: string
}) {
  const head = (
    <div>
      <H2 className="whitespace-pre-line text-balance" lang={textLang(heading, locale)}>
        {heading}
      </H2>
      {intro && (
        <p className="mt-8 max-w-xl text-p text-fg" lang={textLang(intro, locale)}>
          {intro}
        </p>
      )}
    </div>
  )

  return (
    <section id={id} className={cn('container scroll-mt-32 border-t border-border pt-3 pb-section', className)}>
      <Eyebrow text={eyebrow} locale={locale} />

      {layout === 'split' ? (
        // Same 5fr/7fr split and gap as `SplitStatement`, so a page mixing the two keeps one column line.
        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32">
          {head}
          {children && <div className="min-w-0">{children}</div>}
        </div>
      ) : (
        <>
          <div className="mt-12 max-w-4xl lg:mt-24">{head}</div>
          {children && <div className="mt-16 lg:mt-24">{children}</div>}
        </>
      )}
    </section>
  )
}

export type InnerPoint = {
  /** React key. */
  id: string
  /** A small bracketed label above the title — "[PAIN]". */
  label?: string
  title: string
  body?: string
  /** A short list under the body — who an audience is, one line each. */
  list?: readonly string[]
}

/**
 * Parallel points in columns, each opened by a hairline rule rather than boxed
 * in a card. The master draws its sections unbordered, and a grid of eight
 * outlined boxes was most of what made the legacy pages look like a different
 * site. The rule keeps each point's start visible without the box.
 *
 * `headingLevel` is the caller's: under an `InnerSection` these are `h3`, but
 * a row of points with no section heading above them are the section's top
 * level and must be `h2`, or the outline skips a level.
 */
export function PointColumns({
  points,
  columns,
  headingLevel = 'h3',
  ruled = true,
  locale,
  className,
}: {
  points: readonly InnerPoint[]
  /** How many across on a wide viewport. Two below that, one on a phone. */
  columns: 2 | 3 | 4
  headingLevel?: 'h2' | 'h3'
  /** Off when the points sit straight under the section's own rule, which would draw two lines 12px apart. */
  ruled?: boolean
  locale: Locale
  className?: string
}) {
  const Heading = headingLevel

  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2',
        columns === 3 && 'lg:grid-cols-3',
        columns === 4 && 'lg:grid-cols-4',
        className
      )}
    >
      {points.map((point) => (
        <li key={point.id} className={cn(ruled && 'border-t border-border pt-6')}>
          {point.label && <Eyebrow text={point.label} locale={locale} className="mb-6" />}
          <H4 asChild className="text-balance">
            <Heading lang={textLang(point.title, locale)}>{point.title}</Heading>
          </H4>
          {point.body && (
            <p className="mt-4 text-p text-fg-muted" lang={textLang(point.body, locale)}>
              {point.body}
            </p>
          )}
          {point.list && point.list.length > 0 && (
            <ul className="mt-4 space-y-2 text-p text-fg-muted">
              {/* Per item: a partly translated list mixes languages line by line. */}
              {point.list.map((item) => (
                <li key={item} lang={textLang(item, locale)}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

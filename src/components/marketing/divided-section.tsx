import { H2, H3 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { Prose } from './prose'
import { Eyebrow } from './section-parts'

/**
 * A master-template section for pages still carrying legacy content (#227):
 * the full-width rule, the bracketed eyebrow under it, then the heading on the
 * left and its introduction on the right — the `04` split — with whatever the
 * section holds underneath.
 *
 * A wrapper rather than a variant on `FeatureGrid` or `ArchitectureSection`.
 * Those legacy blocks each own their `<section>` and a centred heading; the
 * master sections all open the same way, so the opening lives here once and
 * the legacy content goes in as `children`.
 *
 * `heading` is optional because Liquidity Hub's opening sections continue a
 * thought rather than starting one — their copy has no title to show. The
 * intro then takes the full width instead of leaving the heading column empty.
 */
export function DividedSection({
  id,
  eyebrow,
  heading,
  intro,
  children,
  locale,
}: {
  /** Anchor target, e.g. a hero call to action scrolling down to it. */
  id?: string
  eyebrow: string
  heading?: string
  /** Markdown-lite: blank lines split paragraphs, `**` bolds (see `Prose`). */
  intro?: string
  children?: React.ReactNode
  locale: Locale
}) {
  return (
    <section id={id} className="container scroll-mt-32 border-t border-border pt-3 pb-section">
      <Eyebrow text={eyebrow} locale={locale} />

      {(heading || intro) && (
        <div
          className={cn(
            'mt-16 grid grid-cols-1 gap-8 lg:mt-24',
            heading && intro && 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32'
          )}
        >
          {heading && (
            <H2 className="text-balance" lang={textLang(heading, locale)}>
              {heading}
            </H2>
          )}
          {intro && <Prose text={intro} locale={locale} className="max-w-2xl [&_p]:text-p [&_p]:text-fg" />}
        </div>
      )}

      {children && <div className={cn(heading || intro ? 'mt-16 lg:mt-24' : 'mt-16')}>{children}</div>}
    </section>
  )
}

export type PlainCard = { id: string; title: string; body: string }

/**
 * The master's feature cards: flat `bg-surface` tiles with no border and no
 * radius, replacing `FeatureGrid`'s bordered cards on migrated pages.
 *
 * `headingLevel` follows the section: `h3` under a `DividedSection` heading,
 * `h2` when the section has none, so the outline never skips a level.
 */
export function PlainCards({
  cards,
  columns = 2,
  headingLevel = 'h3',
  locale,
}: {
  cards: readonly PlainCard[]
  columns?: 2 | 3
  headingLevel?: 'h2' | 'h3'
  locale: Locale
}) {
  const Heading = headingLevel

  return (
    <ul className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
      {cards.map((card) => (
        <li key={card.id} className="flex flex-col bg-surface p-6 lg:p-8">
          <H3 asChild weight="medium">
            <Heading lang={textLang(card.title, locale)}>{card.title}</Heading>
          </H3>
          <Prose text={card.body} locale={locale} className="mt-6 [&_p]:text-fg" />
        </li>
      ))}
    </ul>
  )
}

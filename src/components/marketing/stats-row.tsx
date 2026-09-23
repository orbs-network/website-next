import { H2 } from '@/app/components/typography'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type Stat = {
  /** Message key and React key. */
  id: string
  /** The figure itself — "$2.5B+", "30+". */
  value: string
  /** What it counts. */
  label: string
}

/**
 * Headline figures, side by side.
 *
 * A description list, not a grid of divs: each figure is a value and each label
 * is the term it belongs to, and `<dl>` is what says so. A screen reader then
 * announces "Cumulative volume, $2.5B+" rather than two loose strings whose
 * relationship has to be inferred from where they sit on screen.
 *
 * The value is rendered FIRST visually but is the `<dd>`; `flex-col-reverse`
 * keeps the reading order correct in the markup while showing the figure above
 * its label, which is the emphasis the design wants.
 */
export function StatsRow({
  title,
  stats,
  columns = 3,
  locale,
}: {
  /** Optional: the institutional page runs these bare, under the hero. */
  title?: string
  stats: readonly Stat[]
  /** How many across on a wide viewport. Three unless told otherwise. */
  columns?: 3 | 5
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 py-20">
      {title && (
        <H2 className="mb-12 text-balance text-center" lang={textLang(title, locale)}>
          {title}
        </H2>
      )}

      {/*
        Column count is the caller's, because the right answer depends on how
        many figures there are. Three wraps five stats into a 3+2 that reads as
        two unrelated rows; five wraps three into a sparse line. Default stays
        three — every existing caller has three.
      */}
      <dl className={cn('grid gap-10 text-center', columns === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3')}>
        {stats.map((stat) => (
          <div key={stat.id} className="flex flex-col-reverse gap-2">
            {/*
              The label and the value are marked SEPARATELY, and this pair is
              the clearest case on the site for why. "$2.5B+" is Latin in every
              locale, while "누적 거래량" beside it is Korean — one `lang` over
              the row has to be wrong about one of them.
            */}
            <dt
              className="text-detail font-medium uppercase tracking-wide text-fg-muted"
              lang={textLang(stat.label, locale)}
            >
              {stat.label}
            </dt>
            <dd className="text-h2 font-normal text-fg" lang={textLang(stat.value, locale)}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

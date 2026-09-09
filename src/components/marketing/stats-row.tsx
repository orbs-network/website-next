import { H2 } from '@/app/components/typography'

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
  lang,
}: {
  /** Optional: the institutional page runs these bare, under the hero. */
  title?: string
  stats: readonly Stat[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      {title && <H2 className="mb-12 text-balance text-center">{title}</H2>}

      <dl className="grid gap-10 text-center sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.id} className="flex flex-col-reverse gap-2">
            <dt className="text-detail font-medium uppercase tracking-wide text-fg-muted">{stat.label}</dt>
            <dd className="text-h2 font-normal text-fg">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

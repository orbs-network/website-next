import { H2, H3 } from '@/app/components/typography'
import { Prose } from './prose'

export type BenefitColumn = {
  /** Message key and React key. */
  id: string
  title: string
  items: readonly string[]
}

/**
 * Who benefits, and how — one column per audience.
 *
 * Liquidity Hub's "New DEX Standard" section splits its case three ways: what
 * users get, what the DEX gets, what solvers get. That is not a feature grid:
 * the columns are parallel audiences rather than parallel features, and each
 * holds a short LIST rather than a paragraph, so the shape carries meaning that
 * a grid of prose cards would flatten.
 *
 * Rendered as real `<ul>`s so the parallel structure survives for a screen
 * reader, which is the whole point of the layout.
 */
export function BenefitColumns({
  title,
  intro,
  columns,
  lang,
}: {
  title: string
  intro?: string
  columns: readonly BenefitColumn[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <div className="mx-auto max-w-3xl text-center">
        <H2 className="text-balance">{title}</H2>
        {intro && <Prose text={intro} className="mt-6 [&_p]:text-lg" />}
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id}>
            <H3 weight="medium" className="text-center">
              {column.title}
            </H3>
            <ul className="mt-6 space-y-3 text-center text-muted-foreground">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

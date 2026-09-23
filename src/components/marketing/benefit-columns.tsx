import { H2, H3 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
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
  locale,
}: {
  title: string
  intro?: string
  columns: readonly BenefitColumn[]
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <H2 className="text-balance" lang={textLang(title, locale)}>
          {title}
        </H2>
        {intro && <Prose text={intro} locale={locale} className="mt-6 [&_p]:text-lg" />}
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id}>
            <H3 weight="medium" className="text-center" lang={textLang(column.title, locale)}>
              {column.title}
            </H3>
            <ul className="mt-6 space-y-3 text-center text-muted-foreground">
              {/*
                Per ITEM, not per list. These columns are parallel audiences
                and their bullets are translated independently — the Korean
                Liquidity Hub page has Korean benefit lines sitting beside ones
                left in English, which is exactly the mix a single `lang` on
                the `<ul>` would flatten.
              */}
              {column.items.map((item) => (
                <li key={item} lang={textLang(item, locale)}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

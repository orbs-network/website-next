import { H2 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type ChainRow = {
  /** Chain name. Not translated — a proper noun. */
  name: string
  /** EVM chain ID. */
  id: number
}

/**
 * Supported chains and their IDs.
 *
 * A real `<table>`, not a styled grid: name and chain ID are two columns of the
 * same record, and someone reading this is looking a value up rather than
 * browsing. Column headers give a screen reader something to announce each cell
 * against, which a list of "Ethereum 1" pairs cannot.
 *
 * Distinct from `ChainLogos`, which is a brand wall answering "is my chain
 * supported?". This answers "what is its ID?".
 */
export function ChainTable({
  title,
  nameHeader,
  idHeader,
  chains,
  locale,
}: {
  title: string
  nameHeader: string
  idHeader: string
  chains: readonly ChainRow[]
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 py-20">
      <H2 className="text-balance text-center" lang={textLang(title, locale)}>
        {title}
      </H2>

      <div className="mx-auto mt-12 max-w-2xl overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="py-3 text-detail font-semibold uppercase tracking-wide text-fg-muted"
                lang={textLang(nameHeader, locale)}
              >
                {nameHeader}
              </th>
              <th
                scope="col"
                className="py-3 text-detail font-semibold uppercase tracking-wide text-fg-muted"
                lang={textLang(idHeader, locale)}
              >
                {idHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {chains.map((chain) => (
              <tr key={chain.id} className="border-b border-border/50">
                {/*
                  `row` scope so each ID is announced against its chain.

                  The name was hardcoded `lang="en"` — right in effect, since
                  chain names are proper nouns, but a claim rather than a
                  derivation: in an ENGLISH document it emitted a redundant
                  `lang="en"` on every row. `textLang` returns `undefined`
                  there and 'en' inside a Japanese or Korean one, which is the
                  same intent expressed as a rule.
                */}
                <th scope="row" className="py-3 font-medium text-fg" lang={textLang(chain.name, locale)}>
                  {chain.name}
                </th>
                {/*
                  NO `lang` on the ID. It is a number — 8453 has no language
                  to announce, in any document. The compiler made the point
                  for us: `textLang` takes a string and `chain.id` is not one.
                */}
                <td className="py-3 text-muted-foreground">{chain.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

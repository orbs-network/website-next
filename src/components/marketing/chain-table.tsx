import { H2 } from '@/app/components/typography'

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
  lang,
  titleLang,
}: {
  title: string
  nameHeader: string
  idHeader: string
  chains: readonly ChainRow[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
  /** Set when the heading's language differs from the rest of the section. */
  titleLang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <H2 className="text-balance text-center" lang={titleLang}>
        {title}
      </H2>

      <div className="mx-auto mt-12 max-w-2xl overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-3 text-detail font-semibold uppercase tracking-wide text-fg-muted">
                {nameHeader}
              </th>
              <th scope="col" className="py-3 text-detail font-semibold uppercase tracking-wide text-fg-muted">
                {idHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {chains.map((chain) => (
              <tr key={chain.id} className="border-b border-border/50">
                {/* `row` scope so each ID is announced against its chain. */}
                <th scope="row" className="py-3 font-medium text-fg" lang="en">
                  {chain.name}
                </th>
                <td className="py-3 text-muted-foreground">{chain.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

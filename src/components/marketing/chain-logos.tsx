import Image from 'next/image'
import { H2 } from '@/app/components/typography'

export type Chain = {
  /** Chain name. Not translated — a proper noun. */
  name: string
  logo: string
}

/**
 * The chains a protocol runs on, as a row of marks.
 *
 * The logos are DECORATIVE. Each one sits beside the chain's name as visible
 * text, so alt text would have a screen reader announce "Ethereum, Ethereum"
 * for every chain in the list. (An earlier version of this component named the
 * images, on the reasoning that the names appeared nowhere else — they do, in
 * the span right next to them.)
 *
 * The list lives in code rather than in a catalog because chain names are
 * proper nouns: "Ethereum" is "Ethereum" in every locale.
 */
export function ChainLogos({
  title,
  chains,
  lang,
}: {
  title: string
  chains: readonly Chain[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <H2 className="text-balance text-center">{title}</H2>

      <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
        {chains.map((chain) => (
          <li key={chain.name} className="flex items-center gap-3">
            <Image src={chain.logo} alt="" width={32} height={32} className="size-8 rounded-full" />
            <span className="text-detail font-medium uppercase tracking-wide text-fg-muted" lang="en">
              {chain.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

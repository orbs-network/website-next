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
 * Each logo carries its chain's NAME as alt text rather than an empty string.
 * The names appear nowhere else in this section, so an empty alt would leave a
 * screen reader with "eight images" and no way to know which chains are
 * supported — which is the entire content of the section.
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
            <Image src={chain.logo} alt={chain.name} width={32} height={32} className="size-8 rounded-full" />
            <span className="text-detail font-medium uppercase tracking-wide text-fg-muted" lang="en">
              {chain.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

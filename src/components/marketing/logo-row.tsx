import Image from 'next/image'
import { H2 } from '@/app/components/typography'

export type LogoRowItem = {
  /** Brand or chain name. Not translated — a proper noun. */
  name: string
  /**
   * Optional mark. Some rows are names only: the institutional page lists the
   * venues it is integrated by as text, with no logos in the legacy content.
   */
  logo?: string
}

/**
 * A row of names, optionally with their marks.
 *
 * Covers three things that are the same shape: the chains Orbs Agentic runs on,
 * the venues that have integrated the institutional stack, and the signers it
 * works with. Generalised from `ChainLogos` when the second and third appeared
 * rather than growing a near-duplicate beside it.
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
export function LogoRow({
  title,
  sub,
  items,
  lang,
  titleLang,
}: {
  title: string
  /** Optional line under the heading. */
  sub?: string
  items: readonly LogoRowItem[]
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

      {sub && <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{sub}</p>}

      <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            {item.logo && (
              <Image src={item.logo} alt="" width={32} height={32} className="size-8 rounded-full object-contain" />
            )}
            <span className="text-detail font-medium uppercase tracking-wide text-fg-muted" lang="en">
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

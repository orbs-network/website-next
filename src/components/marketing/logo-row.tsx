import Image from 'next/image'
import { H2 } from '@/app/components/typography'
import { cn } from '@/lib/utils'

export type LogoRowItem = {
  /** Brand or chain name. Not translated — a proper noun. */
  name: string
  /**
   * Optional mark, with its INTRINSIC dimensions.
   *
   * The dimensions are required alongside the source because these are not all
   * square. Chain marks are round (250x250); the institutional wordmarks are
   * wide (Fireblocks is 227x35, Blackhole 1249x107). A fixed 32x32 box with
   * `object-contain` squeezed the wide ones to roughly five pixels tall — the
   * mark was technically present and completely illegible.
   *
   * Rendered at a fixed HEIGHT with automatic width, so every mark reads at the
   * same optical weight whatever its proportions.
   */
  logo?: { src: string; width: number; height: number }
  /**
   * Invert the mark in the light theme.
   *
   * The institutional signer wordmarks are monochrome `fill="white"` SVGs —
   * invisible on a light background, which is what they were on until this was
   * caught in review. Inverting turns them black in light mode and leaves them
   * white in dark, which is what a light variant of a monochrome wordmark would
   * be anyway.
   *
   * Opt-in per item, NOT applied to the row: chain logos are full-colour brand
   * marks and inverting those would be actively wrong.
   */
  invertOnLight?: boolean
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
              <Image
                src={item.logo.src}
                alt=""
                width={item.logo.width}
                height={item.logo.height}
                className={cn('h-8 w-auto object-contain', item.invertOnLight && 'invert dark:invert-0')}
              />
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

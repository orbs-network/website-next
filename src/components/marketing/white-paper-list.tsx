import Image from 'next/image'
import Link from 'next/link'
import { H1, H2 } from '@/app/components/typography'

export type WhitePaperCard = {
  slug: string
  href: string
  title: string
  titleLang?: string
  abstract: string
  abstractLang?: string
  date: string
  image: string
}

export type WhitePaperGroup = {
  key: string
  title: string
  titleLang?: string
  papers: readonly WhitePaperCard[]
}

/**
 * The white-paper library: categories, each a list of papers.
 *
 * A list rather than a grid of equal tiles. The abstracts run to a few hundred
 * characters and vary a lot in length, and in a tile grid that either truncates
 * them or leaves ragged holes — the legacy page put the thumbnail beside the
 * text for the same reason.
 *
 * `titleLang` and `abstractLang` are per-STRING, not per-locale. Japanese is a
 * real translation of every paper, but only of the 24 the Japanese site
 * carries; the rest fall back to English inside a `lang="ja"` document, and
 * each needs to say so individually. Deriving one language for the whole page
 * is the mistake #103 tracks.
 */
export function WhitePaperList({ title, groups }: { title: string; groups: readonly WhitePaperGroup[] }) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="mx-auto max-w-4xl">
        <H1 className="mb-12">{title}</H1>

        {groups.map((group) => (
          <div key={group.key} className="mt-16 first:mt-0">
            <H2 className="mb-8" lang={group.titleLang}>
              {group.title}
            </H2>

            <ul className="space-y-10">
              {group.papers.map((paper) => (
                <li key={paper.slug}>
                  <article className="flex flex-col gap-5 sm:flex-row">
                    {/*
                      Fixed intrinsic size: every thumbnail is a page-one render
                      at the same aspect, so the box can be reserved before the
                      file loads rather than reflowing the list as each arrives.
                    */}
                    <Link href={paper.href} className="shrink-0" tabIndex={-1} aria-hidden>
                      <Image
                        src={paper.image}
                        alt=""
                        width={140}
                        height={198}
                        sizes="140px"
                        className="w-28 rounded-sm border border-border sm:w-[140px]"
                      />
                    </Link>

                    <div>
                      <h3 className="text-lg font-semibold">
                        {/*
                          The only focusable link in the card. The thumbnail
                          above points at the same place and is `aria-hidden`
                          with `tabIndex={-1}`, so a keyboard user tabs once per
                          paper and a screen reader hears one link, not two
                          identical ones.
                        */}
                        <Link
                          href={paper.href}
                          lang={paper.titleLang}
                          className="text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {paper.title}
                        </Link>
                      </h3>

                      {paper.date && (
                        <p className="mt-1 text-detail uppercase tracking-widest text-fg-muted">{paper.date}</p>
                      )}

                      <p className="mt-3 leading-relaxed text-fg-muted" lang={paper.abstractLang}>
                        {paper.abstract}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

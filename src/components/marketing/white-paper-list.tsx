import Image from 'next/image'
import Link from 'next/link'
import { H1, H2 } from '@/app/components/typography'
import { MarkdownProse } from './markdown-prose'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

export type WhitePaperCard = {
  slug: string
  href: string
  title: string
  abstract: string
  date: string
  image: string
}

export type WhitePaperGroup = {
  key: string
  title: string
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
 * Language is per STRING, derived from `locale`. Japanese is a real
 * translation of every paper, but only of the 24 the Japanese site carries;
 * the rest fall back to English inside a `lang="ja"` document, and each needs
 * to say so individually. Deriving one language for the whole page is the
 * mistake #103 tracks — this page just had it spread across three props the
 * caller had to compute instead.
 */
export function WhitePaperList({
  title,
  groups,
  locale,
}: {
  title: string
  groups: readonly WhitePaperGroup[]
  /** The document's locale. Each string's own `lang` is derived from it. */
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="mx-auto max-w-4xl">
        <H1 className="mb-12" lang={textLang(title, locale)}>
          {title}
        </H1>

        {groups.map((group) => (
          <div key={group.key} className="mt-16 first:mt-0">
            <H2 className="mb-8" lang={textLang(group.title, locale)}>
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
                          lang={textLang(paper.title, locale)}
                          className="text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {paper.title}
                        </Link>
                      </h3>

                      {paper.date && (
                        <p
                          className="mt-1 text-detail uppercase tracking-widest text-fg-muted"
                          lang={textLang(paper.date, locale)}
                        >
                          {paper.date}
                        </p>
                      )}

                      {/*
                        Through `MarkdownProse`, not a bare `<p>`. Eight of the
                        imported abstracts contain markdown links — `ton-vote`
                        in all three locales, plus several Japanese and Korean
                        research papers — and JSX interpolation escapes them, so
                        a reader saw the literal `[TON.Vote](https://ton.vote/)`
                        instead of a link.

                        NO `lang` ON THIS WRAPPER ANY MORE. It used to carry
                        `abstractLang` because the renderer emits its own
                        `<p>` and there was nowhere else to put it — which is
                        the wrapper-scope pattern #103 exists to remove.
                        `MarkdownProse` marks each block it renders now, so the
                        language lands on the paragraphs themselves.
                      */}
                      <div className="mt-3">
                        <MarkdownProse locale={locale}>{paper.abstract}</MarkdownProse>
                      </div>
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

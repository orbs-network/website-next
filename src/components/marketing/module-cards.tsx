import Link from 'next/link'
import { H2, H3 } from '@/app/components/typography'
import { ButtonArrow } from '@/components/ui/button'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { Eyebrow, type SectionLink } from './section-parts'

/**
 * dSPOT's modules: an eyebrow, a full-width heading and a short body, then one
 * card per product linking down to its own page.
 *
 * The cards are the Figma `Feature Card` component: a coloured product name,
 * the product's name again as a tracked title, a sentence, and a "Discover"
 * link at the foot. The whole card is the hit area — the link's `::after`
 * covers it — because a card-shaped target that only answers on its bottom
 * line is smaller than it looks.
 *
 * The coloured name repeats the title beneath it, so it is `aria-hidden`: a
 * screen reader hearing "dLIMIT, heading level 3, dLIMIT" learns nothing from
 * the second one.
 *
 * The title is plain text with no product glyph (#211, #231). The 09-30 design
 * draws none in these cards, and the glyphs the site had drawn were wrong for
 * two of the four products.
 */
export type ModuleCard = {
  id: string
  /** The product name above the title, in the product's colour. */
  eyebrow: string
  /** `text-*` classes for the eyebrow. Per theme: several brand colours fail contrast on the light surface. */
  accentClassName: string
  /** The card's heading: the product name as the brand writes it. Not uppercased here — that would lose dLIMIT's "d". */
  title: string
  /** Extra classes for the title, e.g. `uppercase` for a name with no lowercase letter to protect. */
  titleClassName?: string
  body: string
  link: SectionLink
}

export function ModuleCards({
  id,
  eyebrow,
  heading,
  body,
  cards,
  locale,
}: {
  /** The anchor the hero's "Discover order types" scrolls to. */
  id?: string
  eyebrow: string
  heading: string
  body: string
  cards: readonly ModuleCard[]
  locale: Locale
}) {
  return (
    /*
      `pt-10`: the design puts the eyebrow's text 43px under the divider; 40px
      of padding plus the eyebrow's own half-leading lands there.
    */
    <section id={id} className="container scroll-mt-32 border-t border-border pt-10 pb-section">
      <Eyebrow text={eyebrow} locale={locale} />

      <H2 className="mt-6 max-w-5xl text-balance" lang={textLang(heading, locale)}>
        {heading}
      </H2>
      <p className="mt-12 max-w-md text-p text-fg" lang={textLang(body, locale)}>
        {body}
      </p>

      <ul className="mt-16 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:mt-44 lg:grid-cols-4">
        {cards.map((card) => (
          /*
            Recessed in light, not lifted: the design fills these #E7E7E7 on
            the #F6F6F6 page, where the home page's `card-fill` is white. Dark
            is the shared `card-fill` (#1E1E20). A literal rather than a token
            because no other light surface uses this grey.
          */
          <li key={card.id} className="relative flex min-h-[21rem] flex-col bg-[#e7e7e7] p-5 dark:bg-card-fill">
            <p
              aria-hidden="true"
              className={cn('text-detail font-medium uppercase tracking-widest', card.accentClassName)}
            >
              {card.eyebrow}
            </p>

            {/*
              18px, regular, tracked like a lockup: measured off the frame,
              where "dLIMIT" is a quarter the width of the card's sentence.
              The `h4` step (22px) set it a size up from the design.
            */}
            <H3
              className={cn('mt-10 text-[1.125rem] leading-7 tracking-[0.12em]', card.titleClassName)}
              lang={textLang(card.title, locale)}
            >
              {card.title}
            </H3>

            <p className="mt-8 text-p text-fg" lang={textLang(card.body, locale)}>
              {card.body}
            </p>

            <Link
              href={localeHref(card.link.href, locale)}
              lang={textLang(card.link.label, locale)}
              className="mt-auto inline-flex items-center gap-2.5 pt-10 text-detail font-medium uppercase tracking-widest transition-colors after:absolute after:inset-0 hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {card.link.label}
              <ButtonArrow />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

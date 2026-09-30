import type { ReactNode } from 'react'
import Link from 'next/link'
import { H2, H3 } from '@/app/components/typography'
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
 * the product's lockup, a sentence, and a "Discover" link at the foot. The
 * whole card is the hit area — the link's `::after` covers it — because a
 * card-shaped target that only answers on its bottom line is smaller than it
 * looks.
 *
 * The coloured name repeats the lockup beneath it, so it is `aria-hidden`: the
 * heading is the lockup, which is real text, and a screen reader hearing
 * "dLIMIT, heading level 3, dLIMIT" learns nothing from the second one.
 */
export type ModuleCard = {
  id: string
  /** The product name above the lockup, in the product's colour. */
  eyebrow: string
  /** `text-*` classes for the eyebrow. Per theme: several brand colours fail contrast on the light surface. */
  accentClassName: string
  /** The product lockup. Must carry the product's name as text; it is the card's heading. */
  mark: ReactNode
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
    <section id={id} className="container scroll-mt-32 border-t border-border pt-3 pb-section">
      <Eyebrow text={eyebrow} locale={locale} />

      <H2 className="mt-6 max-w-5xl text-balance" lang={textLang(heading, locale)}>
        {heading}
      </H2>
      <p className="mt-12 max-w-md text-p text-fg" lang={textLang(body, locale)}>
        {body}
      </p>

      <ul className="mt-16 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-44 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.id} className="relative flex min-h-[21rem] flex-col bg-surface p-5">
            <p
              aria-hidden="true"
              className={cn('text-detail font-medium uppercase tracking-widest', card.accentClassName)}
            >
              {card.eyebrow}
            </p>

            <H3 className="mt-10">{card.mark}</H3>

            <p className="mt-8 text-p text-fg" lang={textLang(card.body, locale)}>
              {card.body}
            </p>

            <Link
              href={localeHref(card.link.href, locale)}
              lang={textLang(card.link.label, locale)}
              className="mt-auto inline-flex items-center gap-2 pt-10 text-detail font-medium uppercase tracking-widest transition-colors after:absolute after:inset-0 hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {card.link.label}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

import { H2, H3 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { CardRail } from './card-rail'
import { Eyebrow, ThemedGraphic, type SectionGraphic } from './section-parts'

export type ProductModuleCard = {
  id: string
  title: string
  body: string
  graphic: SectionGraphic
}

/** The October dSPOT cards are illustrations and copy, with no product links. */
export function ProductModuleCards({
  id,
  eyebrow,
  heading,
  body,
  cards,
  previousLabel,
  nextLabel,
  locale,
}: {
  id: string
  eyebrow: string
  heading: string
  body: string
  cards: readonly ProductModuleCard[]
  previousLabel: string
  nextLabel: string
  locale: Locale
}) {
  return (
    <section id={id} className="container min-w-0 scroll-mt-32 border-t border-border pt-section pb-16">
      <div className="text-center">
        <Eyebrow text={eyebrow} locale={locale} />
        <H2 className="mx-auto mt-6 max-w-5xl text-balance" lang={textLang(heading, locale)}>
          {heading}
        </H2>
        <p className="mx-auto mt-12 max-w-3xl text-p text-fg" lang={textLang(body, locale)}>
          {body}
        </p>
      </div>
      <CardRail
        label={heading}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        locale={locale}
        className="mt-16 min-w-0 lg:mt-40"
      >
        {cards.map((card) => (
          <li
            key={card.id}
            // Reserve space after the gaps for a preview of the next card:
            // 32px on phones, 48px after two cards, 64px after three cards.
            className="w-[calc(100%-3.5rem)] shrink-0 snap-start bg-[#e7e7e7] p-6 sm:w-[calc((100%-6rem)/2)] lg:w-[calc((100%-8.5rem)/3)] dark:bg-[#1e1e20]"
          >
            <div className="aspect-[5/3]">
              <ThemedGraphic
                graphic={card.graphic}
                sizes="(min-width: 640px) 33vw, 80vw"
                className="size-full object-contain"
              />
            </div>
            <H3 asChild className="mt-6 text-h4 font-normal" lang={textLang(card.title, locale)}>
              <h3>{card.title}</h3>
            </H3>
            <p className="mt-4 text-p text-fg-muted" lang={textLang(card.body, locale)}>
              {card.body}
            </p>
          </li>
        ))}
      </CardRail>
    </section>
  )
}

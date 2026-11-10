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
    <section id={id} className="min-w-0 scroll-mt-32 pb-16">
      <div className="container border-t border-border pt-section text-center">
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
        className="container mt-16 min-w-0 lg:mt-40 lg:max-w-[1612px] lg:px-0 lg:[&>div]:px-10"
        trackClassName="lg:scroll-pl-10 lg:gap-4"
      >
        {cards.map((card) => (
          <li
            key={card.id}
            // Reserve space after the gaps for a preview of the next card:
            // Desktop: 40px inset, 16px gaps, three ~500px cards and a 24px preview
            // at Figma's 1612px width. Margins keep the preview visible at smaller desktops.
            className="w-[calc(100%-3.5rem)] shrink-0 snap-start rounded-2xl border border-[#e6e7fd] bg-white p-6 shadow-[0_8px_24px_rgba(116,85,220,0.035)] sm:w-[calc((100%-6rem)/2)] lg:min-h-[440px] lg:w-[calc((100%-7rem)/3)] lg:p-[2.1rem] first:lg:ml-10 last:lg:mr-10 dark:rounded-none dark:border-0 dark:bg-[#1e1e20] dark:shadow-none"
          >
            <div className="aspect-[5/3]">
              <ThemedGraphic
                graphic={card.graphic}
                sizes="(min-width: 640px) 33vw, 80vw"
                className="size-full object-contain"
              />
            </div>
            <H3
              asChild
              className="mt-6 text-h4 font-normal lg:mt-4 lg:text-[27px] lg:leading-9 lg:tracking-[-0.75px]"
              lang={textLang(card.title, locale)}
            >
              <h3>{card.title}</h3>
            </H3>
            <p
              className="mt-4 text-p text-fg-muted lg:text-[15px] lg:tracking-[-0.45px]"
              lang={textLang(card.body, locale)}
            >
              {card.body}
            </p>
          </li>
        ))}
      </CardRail>
    </section>
  )
}

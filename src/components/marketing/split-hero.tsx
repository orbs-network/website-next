import { H1 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { CtaButton, Eyebrow, ThemedGraphic, type SectionGraphic, type SectionLink } from './section-parts'

/**
 * `01 / Hero / Split 50-50`: a graphic on the left, the page's title on the
 * right.
 *
 * Not `ProductHero`. That component is the legacy product pages' header —
 * uppercase black headline, image on the right, repo and Telegram icons — and
 * the 3.4 pages share none of it. Bending one component into both would make
 * every prop a question about which design the caller is on.
 *
 * **The headline is `text-h2`, not `text-h1`.** The design sets page titles and
 * section titles alike at 50px, and h2 (56px at 1440) is the scale step that
 * lands on it. h1 is 72px, which puts "One API and SDK for spot and
 * perpetuals" on four lines in a half-width column.
 *
 * **Text first on a phone.** The graphic is decorative and square; above the
 * headline on a 390px screen it is a screenful of illustration before the page
 * says what it is. `order-first` restores the design's left-hand graphic from
 * `lg` up.
 */
export function SplitHero({
  eyebrow,
  headline,
  intro,
  cta,
  graphic,
  locale,
}: {
  eyebrow: string
  headline: string
  intro: string
  cta: SectionLink
  /**
   * Decorative: the headline says what the page is, and the graphic is brand
   * illustration rather than information. So `alt=""`, and no prop to set one.
   */
  graphic: SectionGraphic
  locale: Locale
}) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-section lg:flex lg:min-h-[810px] lg:items-center lg:py-14">
      <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div>
          <Eyebrow text={eyebrow} locale={locale} />
          <H1 className="mt-3 text-balance text-h2" lang={textLang(headline, locale)}>
            {headline}
          </H1>
          <p className="mt-10 max-w-xl text-p text-fg" lang={textLang(intro, locale)}>
            {intro}
          </p>
          <div className="mt-14">
            <CtaButton link={cta} locale={locale} />
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md lg:order-first lg:max-w-none">
          {/*
            `priority`: on a wide screen this is the largest thing above the
            fold, so it is the LCP candidate and lazy-loading it would delay the
            metric it defines.
          */}
          <ThemedGraphic
            graphic={graphic}
            priority
            sizes="(min-width: 1024px) 50vw, 28rem"
            className="size-full object-contain"
          />
        </div>
      </div>
    </section>
  )
}

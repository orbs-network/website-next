import { H1 } from '@/app/components/typography'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { HeroFacetField } from './hero-facet-field'
import { SectionBackdrop } from './section-backdrop'
import { StatsRow, type Stat } from './stats-row'

/** The November first fold: larger title, actions and stats share the facet field. */
export function HomeHero({
  headline,
  intro,
  stats,
  locale,
  children,
}: {
  headline: string
  intro: string
  stats: readonly Stat[]
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <section className="relative isolate mx-auto overflow-hidden pt-20 pb-12 sm:pt-24 lg:min-h-[max(810px,calc(100svh-6.25rem))] lg:pt-32 lg:pb-20">
      {/* The facets drawn around Figma's cursor are this hover effect, not static artwork. */}
      <HeroFacetField>
        <SectionBackdrop variant="dots" />
      </HeroFacetField>
      <div className="container relative">
        <div className="relative mx-auto max-w-[1100px] text-center">
          <H1
            className="text-balance lg:text-[clamp(3.5rem,1rem+4vw,4.75rem)] lg:leading-[1.158] lg:tracking-[-0.03em]"
            lang={textLang(headline, locale) ?? locale}
          >
            {headline}
          </H1>
          <p
            className="mx-auto mt-7 max-w-[760px] text-lg leading-7 tracking-[-0.56px] text-fg-muted"
            lang={textLang(intro, locale)}
          >
            {intro}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">{children}</div>
        </div>
      </div>
      <StatsRow
        columns={5}
        glow
        className="relative mt-16 max-w-[1280px] py-0 lg:mt-[5.5rem] lg:[&_dd]:text-[2.75rem] lg:[&_dd]:leading-[56px] lg:[&_dd]:tracking-[-2.2387px] lg:[&_dl>div]:gap-3.5 lg:[&_dt]:leading-5"
        stats={stats}
        locale={locale}
      />
    </section>
  )
}

import { getTranslations } from 'next-intl/server'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
import { RiskDisclosure } from '@/components/marketing/risk-disclosure'
import { CtaButton, Eyebrow, ThemedGraphic, type SectionGraphic } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { InlineProductGraphic } from '@/components/marketing/inline-product-graphic'
import { LogoRow } from '@/components/marketing/logo-row'
import { DperpsFeaturesGrid } from '@/components/marketing/dperps-features-grid'
import { H2 } from '@/app/components/typography'
import { DPERPS_FEATURES, DPERPS_GRAPHICS, DPERPS_PARTNERS, DPERPS_LINKS, DPERPS_MARQUEE } from '@/content/pages/dperps'
import { HOME_LINKS } from '@/content/pages/home'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/** English and Korean share the November design. The entire Symmio overview is excluded. */
export async function DperpsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dperps' })
  const closing = await getTranslations({ locale, namespace: 'pages.dspot.closing' })

  return (
    <div className="mx-auto max-w-[1612px] lg:[--font-size-p:15px] lg:[--tracking-tight:-0.04em]">
      <div className="lg:space-y-24">
        <SplitHero
          eyebrow={t('hero.eyebrow')}
          headline={t('hero.headline')}
          intro={t('hero.intro')}
          cta={{ label: t('hero.cta'), href: DPERPS_LINKS.contact.href }}
          graphic={DPERPS_GRAPHICS.hero}
          locale={locale}
          className="lg:max-w-none lg:px-16"
          gridClassName="lg:grid-cols-[minmax(0,696fr)_minmax(0,724fr)] lg:gap-16"
          introClassName="lg:max-w-none lg:tracking-[-0.5px]"
        />
        <section className="product-benefits dperps-benefits py-section lg:pt-[126px] lg:pb-[131px]">
          <div className="container lg:max-w-none lg:px-[37px]">
            <div className="mb-16 text-center lg:mb-10 lg:min-h-[165px]">
              <Eyebrow text={t('features.eyebrow')} locale={locale} />
              <H2
                className="mx-auto mt-6 max-w-[1292px] text-balance lg:mt-[29px] lg:tracking-[-0.04em]"
                lang={textLang(t('features.title'), locale)}
              >
                {t('features.title')}
              </H2>
            </div>
            <DperpsFeaturesGrid
              features={DPERPS_FEATURES.map((id) => ({
                id,
                title: t(`features.items.${id}.title`),
                body: t(`features.items.${id}.body`),
              }))}
              locale={locale}
            />
          </div>
        </section>
        {(['network', 'security'] as const).map((id) => (
          <DperpsDetail
            key={id}
            kind={id}
            eyebrow={t(`${id}.eyebrow`)}
            heading={t(`${id}.title`)}
            body={t(`${id}.body`)}
            graphic={DPERPS_GRAPHICS[id]}
            locale={locale}
          />
        ))}
        <LogoRow
          title={t('partners.title')}
          titleHidden
          items={DPERPS_PARTNERS}
          spread
          locale={locale}
          className="lg:flex lg:min-h-[280px] lg:max-w-none lg:items-center lg:px-[37px] lg:py-0 lg:[&>ul]:mt-0 lg:[&>ul]:w-full"
        />
        <DperpsDetail
          kind="venue"
          eyebrow={t('venue.eyebrow')}
          heading={t('venue.title')}
          body={t('venue.body')}
          graphic={DPERPS_GRAPHICS.venue}
          locale={locale}
        />
        <RiskDisclosure eyebrow={t('risk.eyebrow')} title={t('risk.title')} text={t('disclaimer')} locale={locale} />
      </div>
      <div className="lg:mt-12">
        <ClosingCta
          phrases={DPERPS_MARQUEE.map((id) => t(`marquee.${id}`))}
          locale={locale}
          actions={
            <>
              <ClosingSocialButtons
                follow={closing('follow')}
                community={closing('community')}
                x={HOME_LINKS.x}
                telegram={HOME_LINKS.telegram}
                locale={locale}
              />
              <CtaButton link={{ label: closing('contact'), href: DPERPS_LINKS.contact.href }} locale={locale} />
            </>
          }
        />
      </div>
    </div>
  )
}

/** The frame gives each copy block its own measure beside a 680px artwork column. */
function DperpsDetail({
  kind,
  eyebrow,
  heading,
  body,
  graphic,
  locale,
}: {
  kind: 'network' | 'security' | 'venue'
  eyebrow: string
  heading: string
  body: string
  graphic: SectionGraphic
  locale: Locale
}) {
  return (
    <section className="container py-section lg:max-w-none lg:px-[37px]">
      <div className="grid items-center gap-12 lg:min-h-[34.1875rem] lg:grid-cols-[minmax(0,794fr)_minmax(0,680fr)] lg:gap-16">
        <div className={`flex h-full flex-col ${DETAIL_COPY_WIDTH[kind]}`}>
          <Eyebrow text={eyebrow} locale={locale} className="lg:text-[10px] lg:leading-[18px] lg:tracking-[1px]" />
          <div className="mt-12 lg:mt-[220px]">
            <H2 className="text-balance" lang={textLang(heading, locale)}>
              {heading}
            </H2>
            <p
              className={`mt-10 max-w-[550px] text-p text-fg lg:tracking-[-0.5px] ${kind === 'security' ? 'lg:max-w-[539px]' : ''}`}
              lang={textLang(body, locale)}
            >
              {body}
            </p>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:flex lg:h-[547px] lg:max-w-none lg:items-center">
          {kind === 'venue' ? (
            <InlineProductGraphic artwork="venue" />
          ) : (
            <ThemedGraphic
              graphic={graphic}
              sizes="(min-width: 1024px) 50vw, 28rem"
              className="h-auto w-full object-contain"
            />
          )}
        </div>
      </div>
    </section>
  )
}

const DETAIL_COPY_WIDTH = {
  network: 'lg:max-w-[464px]',
  security: 'lg:max-w-[569px]',
  venue: 'lg:max-w-[625px]',
} as const

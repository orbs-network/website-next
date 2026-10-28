import { getTranslations } from 'next-intl/server'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
import { Disclaimer } from '@/components/marketing/disclaimer'
import { CtaButton, Eyebrow, ThemedGraphic, type SectionGraphic } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { LogoRow } from '@/components/marketing/logo-row'
import { DperpsFeaturesGrid } from '@/components/marketing/dperps-features-grid'
import { H2 } from '@/app/components/typography'
import { DPERPS_FEATURES, DPERPS_GRAPHICS, DPERPS_PARTNERS, DPERPS_LINKS, DPERPS_MARQUEE } from '@/content/pages/dperps'
import { HOME_LINKS } from '@/content/pages/home'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/** English and Korean share the October design. The entire Symmio overview is excluded. */
export async function DperpsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dperps' })
  const closing = await getTranslations({ locale, namespace: 'pages.dspot.closing' })

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: DPERPS_LINKS.contact.href }}
        graphic={DPERPS_GRAPHICS.hero}
        locale={locale}
      />
      <section className="product-benefits py-section">
        <div className="container">
          <div className="mb-16 text-center lg:mb-24">
            <Eyebrow text={t('features.eyebrow')} locale={locale} />
            <H2
              className="mx-auto mt-6 max-w-5xl whitespace-pre-line text-balance"
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
        className="border-b border-border"
      />
      <DperpsDetail
        eyebrow={t('venue.eyebrow')}
        heading={t('venue.title')}
        body={t('venue.body')}
        graphic={DPERPS_GRAPHICS.venue}
        locale={locale}
      />
      <Disclaimer text={t('disclaimer')} locale={locale} className="max-w-5xl pt-16 text-center" />
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
    </>
  )
}

/** The new dPERPS frame centres the copy beside its art in equal-width columns. */
function DperpsDetail({
  eyebrow,
  heading,
  body,
  graphic,
  locale,
}: {
  eyebrow: string
  heading: string
  body: string
  graphic: SectionGraphic
  locale: Locale
}) {
  return (
    <section className="container border-b border-border py-section">
      <Eyebrow text={eyebrow} locale={locale} />
      <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <H2 className="whitespace-pre-line text-balance" lang={textLang(heading, locale)}>
            {heading}
          </H2>
          <p className="mt-10 max-w-xl text-p text-fg" lang={textLang(body, locale)}>
            {body}
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <ThemedGraphic graphic={graphic} sizes="(min-width: 1024px) 50vw, 28rem" className="h-auto w-full" />
        </div>
      </div>
    </section>
  )
}

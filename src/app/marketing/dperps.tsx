import { getTranslations } from 'next-intl/server'
import { Disclaimer } from '@/components/marketing/disclaimer'
import { DividedSection } from '@/components/marketing/divided-section'
import { Prose } from '@/components/marketing/prose'
import { CtaButton, Eyebrow, ThemedGraphic, type SectionGraphic } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { LogoRow } from '@/components/marketing/logo-row'
import { DperpsFeaturesGrid } from '@/components/marketing/dperps-features-grid'
import { H2, H4 } from '@/app/components/typography'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'
import { ProductHero } from '@/components/marketing/product-hero'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import {
  DPERPS_BENEFITS,
  DPERPS_FEATURES,
  DPERPS_GRAPHICS,
  DPERPS_PARTNERS,
  DPERPS_DIAGRAM,
  DPERPS_HERO,
  DPERPS_LINKS,
  DPERPS_PARTNERS_IMAGE,
} from '@/content/pages/dperps'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * dPERPS: shared October layout for English and Korean.
 *
 * No Japanese: `content/jp/perpetual-hub` does not exist in the legacy repo, so
 * `ja` is absent from the availability entry rather than marked `placeholder` —
 * the same treatment dSLTP got in #99, and for the same reason. Korean is a
 * full translation.
 *
 * The architecture diagram is awaiting Sara’s replacement in both locales;
 * preserved Korean catalog values are used wherever their keys match.
 */
export async function DperpsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dperps' })

  if (locale !== 'ja') {
    return (
      <>
        <SplitHero
          eyebrow={t('hero.eyebrow')}
          headline={t('hero.headline')}
          intro={t('hero.intro')}
          cta={{ label: t('hero.cta'), href: DPERPS_LINKS.contact.href }}
          graphic={HERO_GRAPHICS.dperps}
          locale={locale}
        />
        <section className="container border-t border-border py-section text-center">
          <Eyebrow text={t('overview.eyebrow')} locale={locale} />
          <H2 className="mx-auto mt-6 max-w-5xl text-balance" lang={textLang(t('overview.title'), locale)}>
            {t('overview.title')}
          </H2>
          <p className="mx-auto mt-8 max-w-5xl text-p text-fg" lang={textLang(t('overview.body'), locale)}>
            {t('overview.body')}
          </p>
          <p className="mx-auto mt-4 max-w-5xl text-p text-fg" lang={textLang(t('overview.markets'), locale)}>
            {t('overview.markets')}
          </p>
          {/* TODO #318: Add Sara's replacement dPERPS architecture diagram when supplied. */}
        </section>
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
        <Disclaimer text={t('disclaimer')} locale={locale} className="mx-0 max-w-xl" />
      </>
    )
  }

  // Korean sends both the hero button and the one-pager to a Naver article
  // rather than to the English announcement post, so destinations resolve per
  // locale rather than being shared.
  const cta = resolveLocaleLink(DPERPS_HERO.cta, locale)
  const contact = resolveLocaleLink(DPERPS_LINKS.contact, locale)
  const onePager = resolveLocaleLink(DPERPS_LINKS.onePager, locale)

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={cta.href}
        graphic={HERO_GRAPHICS.dperps}
        locale={locale}
      />

      <DividedSection heading={t('benefits.title')} locale={locale}>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {DPERPS_BENEFITS.map((benefit) => (
            <Card key={benefit.id} className="h-full">
              <CardHeader className="pb-10">
                <Image src={benefit.icon} alt="" width={48} height={48} className="mb-4 size-12" />
                <H4 asChild lang={textLang(t(`benefits.items.${benefit.id}.title`), locale)}>
                  <h3>{t(`benefits.items.${benefit.id}.title`)}</h3>
                </H4>
              </CardHeader>
              <CardContent>
                <Prose text={t(`benefits.items.${benefit.id}.body`)} locale={locale} className="[&_p]:text-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DividedSection>

      {[
        { key: 'integrate', image: DPERPS_DIAGRAM },
        { key: 'partners', image: DPERPS_PARTNERS_IMAGE },
      ].map(({ key, image }) => (
        <DividedSection key={key} locale={locale}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div>
              <H2 className="text-balance" lang={textLang(t(`${key}.title`), locale)}>
                {t(`${key}.title`)}
              </H2>
              <Prose text={t(`${key}.body`)} locale={locale} className="mt-6 max-w-xl [&_p]:text-lg" />
            </div>
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt={t(`${key}.alt`)}
              lang={textLang(t(`${key}.alt`), locale)}
              sizes="(min-width: 1440px) 531px, (min-width: 1024px) 40vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </DividedSection>
      ))}

      <DividedSection heading={t('poweredBy.title')} locale={locale}>
        <Prose text={t('poweredBy.body')} locale={locale} className="max-w-xl [&_p]:text-lg" />
        <div className="mt-10 flex flex-wrap gap-4">
          <CtaButton link={{ label: t('poweredBy.contact'), href: contact.href }} locale={locale} variant="secondary" />
          <CtaButton
            link={{ label: t('poweredBy.onePager'), href: onePager.href }}
            locale={locale}
            variant="secondary"
          />
        </div>
      </DividedSection>

      <Disclaimer text={t('disclaimer')} locale={locale} className="mx-0 max-w-xl" />
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

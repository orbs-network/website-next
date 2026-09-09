import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { IntegrationGrid } from '@/components/marketing/integration-grid'
import { IntegrationTabs } from '@/components/marketing/integration-tabs'
import { Walkthrough } from '@/components/marketing/walkthrough'
import {
  DTWAP_BENEFITS,
  DTWAP_HERO,
  DTWAP_INTEGRATIONS,
  DTWAP_LINKS,
  DTWAP_SCHEMA_IMAGE,
  DTWAP_SLIDES,
} from '@/content/pages/dtwap'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { getTranslations } from 'next-intl/server'
import { ProductHero } from '@/components/marketing/product-hero'

/**
 * The dTWAP page body, rendered by all three locale routes.
 *
 * One component, three routes. Structure and layout live here; every string
 * comes from `pages.dtwap` in the message catalogs and every image path and URL
 * from `src/content/pages/dtwap.ts`. Adding a locale therefore means adding
 * catalog entries and one `AVAILABILITY` line — this file does not change.
 *
 * `getTranslations({locale})` takes the locale explicitly for the same reason
 * the header does: there is no `[locale]` segment for next-intl to infer from.
 *
 * `textLang` marks sections whose copy is still English inside a Japanese or
 * Korean document. Japanese is the case that matters today — its legacy page is
 * English throughout — and the marking disappears on its own if real Japanese
 * copy is ever added, because it is decided from the rendered string.
 */
export async function DtwapPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dtwap' })

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={DTWAP_HERO.ctaHref}
        image={DTWAP_HERO.image}
        // The illustration restates the headline visually; the headline is
        // already the page's h1, so describing it again would duplicate it.
        imageAlt=""
        repo={DTWAP_HERO.repo}
        telegram={DTWAP_HERO.telegram}
        lang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        title={t('benefits.title')}
        intro={t('benefits.intro')}
        features={DTWAP_BENEFITS.map((id) => ({
          id,
          title: t(`benefits.items.${id}.title`),
          body: t(`benefits.items.${id}.body`),
        }))}
        lang={textLang(t('benefits.title'), locale)}
      />

      <IntegrationGrid
        // Target of the hero's call to action.
        id="get-started"
        title={t('integrations.title')}
        integrateTitle={t('integrations.integrateTitle')}
        integrateCta={t('integrations.integrateCta')}
        integrateHref={DTWAP_LINKS.integrationGuide}
        integrations={DTWAP_INTEGRATIONS}
        lang={textLang(t('integrations.title'), locale)}
      />

      <Walkthrough
        title={t('explanation.title')}
        steps={DTWAP_SLIDES.map((slide) => ({
          ...slide,
          caption: t(`explanation.slides.${slide.id}`),
        }))}
        lang={textLang(t('explanation.title'), locale)}
      />

      <IntegrationTabs
        title={t('code.title')}
        tabs={[
          { id: 'react', label: t('code.reactTab'), body: t('code.reactBody') },
          { id: 'styles', label: t('code.stylesTab'), body: t('code.stylesBody') },
        ]}
        lang={textLang(t('code.title'), locale)}
      />

      <ArchitectureSection
        title={t('schema.title')}
        body={t('schema.body')}
        image={DTWAP_SCHEMA_IMAGE.src}
        imageWidth={DTWAP_SCHEMA_IMAGE.width}
        imageHeight={DTWAP_SCHEMA_IMAGE.height}
        // Conveys the maker/taker flow that the prose below sets out in full.
        imageAlt=""
        links={[
          { label: t('schema.whitePaper'), href: DTWAP_LINKS.whitePaper },
          { label: t('schema.audit'), href: DTWAP_LINKS.audit },
          { label: t('schema.faq'), href: DTWAP_LINKS.faq },
        ]}
        lang={textLang(t('schema.title'), locale)}
      />
    </>
  )
}

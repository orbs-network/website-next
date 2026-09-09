import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { IntegrationGrid } from '@/components/marketing/integration-grid'
import { IntegrationTabs } from '@/components/marketing/integration-tabs'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  DLIMIT_BENEFITS,
  DLIMIT_HERO,
  DLIMIT_INTEGRATIONS,
  DLIMIT_LINKS,
  DLIMIT_SCHEMA_IMAGE,
} from '@/content/pages/dlimit'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The dLIMIT page body, rendered by all three locale routes.
 *
 * Same shape as `DtwapPage` and built from the same components — which is the
 * point of having built them generically in #72. The differences are real ones
 * from the legacy site, not incidental:
 *
 *  - **No `Walkthrough`.** The legacy dLIMIT page has no explanation slider;
 *    its `index.md` lists header, cards, integrations, code examples and schema
 *    only. Adding one would be inventing a section.
 *  - **No hero image.** See `DLIMIT_HERO` — the asset the legacy page points at
 *    404s in production.
 *  - **Five benefit cards** rather than dTWAP's two.
 *
 * Every string comes from `pages.dlimit` in the catalogs and every path and URL
 * from `src/content/pages/dlimit.ts`, so adding a locale is catalog entries
 * plus one `AVAILABILITY` line and this file does not change.
 */
export async function DlimitPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dlimit' })

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={DLIMIT_HERO.ctaHref}
        repo={DLIMIT_HERO.repo}
        telegram={DLIMIT_HERO.telegram}
        lang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        title={t('benefits.title')}
        intro={t('benefits.intro')}
        features={DLIMIT_BENEFITS.map((id) => ({
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
        integrateHref={DLIMIT_LINKS.integrationGuide}
        integrations={DLIMIT_INTEGRATIONS}
        lang={textLang(t('integrations.title'), locale)}
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
        image={DLIMIT_SCHEMA_IMAGE.src}
        imageWidth={DLIMIT_SCHEMA_IMAGE.width}
        imageHeight={DLIMIT_SCHEMA_IMAGE.height}
        // Conveys the maker/taker flow the prose below sets out in full.
        imageAlt=""
        links={[
          { label: t('schema.whitePaper'), href: DLIMIT_LINKS.whitePaper },
          { label: t('schema.audit'), href: DLIMIT_LINKS.audit },
          { label: t('schema.faq'), href: DLIMIT_LINKS.faq },
        ]}
        lang={textLang(t('schema.title'), locale)}
      />
    </>
  )
}

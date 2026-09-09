import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { DiagramSection } from '@/components/marketing/diagram-section'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  DSLTP_BENEFITS,
  DSLTP_GRAPH_IMAGE,
  DSLTP_HERO,
  DSLTP_LINKS,
  DSLTP_MAP_IMAGE,
} from '@/content/pages/dsltp'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The dSLTP page body, rendered by the English and Korean routes.
 *
 * Two locales, not three: there is no `content/jp/dsltp` in the legacy repo at
 * all. Unlike dTWAP and dLIMIT — whose Japanese directories exist but hold the
 * English copy — this page has never had a Japanese version, so it is absent
 * from `AVAILABILITY` for `ja` rather than marked `placeholder`. The selector
 * will not offer Japanese and `/jp/dsltp/` is not generated.
 *
 * The composition differs from its siblings because the legacy page does. It
 * has no code-examples section, and its integrations are a single map graphic
 * rather than a grid of DEX screenshots, so `IntegrationTabs` and
 * `IntegrationGrid` do not appear. Forcing the sibling layout on it would mean
 * inventing sections.
 */
export async function DsltpPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dsltp' })

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={DSLTP_HERO.ctaHref}
        image={DSLTP_HERO.image}
        // The illustration restates the headline visually, and the headline is
        // already the page's h1.
        imageAlt=""
        lang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        title={t('benefits.title')}
        intro={t('benefits.intro')}
        features={DSLTP_BENEFITS.map((benefit) => ({
          id: benefit.id,
          icon: benefit.icon,
          title: t(`benefits.items.${benefit.id}.title`),
          body: t(`benefits.items.${benefit.id}.body`),
        }))}
        lang={textLang(t('benefits.title'), locale)}
      />

      {/*
        Untitled in the legacy content — `section-2/index.md` carries an empty
        `title:` — so it renders as the diagram alone.
      */}
      <DiagramSection
        image={DSLTP_GRAPH_IMAGE}
        imageAlt={t('graph.alt')}
        lang={textLang(t('graph.alt'), locale)}
      />

      <DiagramSection
        title={t('integrations.title')}
        image={DSLTP_MAP_IMAGE}
        imageAlt={t('integrations.alt')}
        lang={textLang(t('integrations.title'), locale)}
      />

      {/*
        No diagram here: the legacy closing block is a heading, prose and a row
        of links. `ArchitectureSection` takes the image optionally for this.
      */}
      <ArchitectureSection
        title={t('poweredBy.title')}
        body={t('poweredBy.body')}
        links={[
          { label: t('poweredBy.contact'), href: DSLTP_LINKS.contact },
          { label: t('poweredBy.faq'), href: DSLTP_LINKS.faq },
          { label: t('poweredBy.support'), href: DSLTP_LINKS.support },
          { label: t('poweredBy.github'), href: DSLTP_LINKS.github },
          { label: t('poweredBy.audits'), href: DSLTP_LINKS.audits },
        ]}
        lang={textLang(t('poweredBy.title'), locale)}
      />
    </>
  )
}

import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { BenefitColumns } from '@/components/marketing/benefit-columns'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { PartnerShowcase } from '@/components/marketing/partner-showcase'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  LIQUIDITY_HUB_AUDIENCES,
  LIQUIDITY_HUB_BENEFITS,
  LIQUIDITY_HUB_DIAGRAM,
  LIQUIDITY_HUB_LINKS,
  LIQUIDITY_HUB_PARTNERS,
  LIQUIDITY_HUB_SOURCES,
} from '@/content/pages/liquidity-hub'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Liquidity Hub page body, rendered by all three locale routes.
 *
 * The legacy page is six sections, and two of them are shapes no other product
 * page has:
 *
 *  - **"New DEX Standard"** splits its case three ways — users, the DEX,
 *    solvers — each a short list rather than a paragraph. `BenefitColumns`
 *    keeps that parallel structure; a grid of prose cards would flatten it.
 *  - **Launch partners** is two named partners, each with its own pitch, list
 *    and way in. `PartnerShowcase` rather than `IntegrationGrid`, which is a
 *    wall of adopter logos and a different claim.
 *
 * Its opening section is composed rather than bespoke: an intro sentence that
 * runs INTO two boxes (`FeatureGrid` with no title of its own), then a closing
 * paragraph and the diagram (`ArchitectureSection`, likewise untitled). Both
 * take their titles optionally for this page, because here the copy continues a
 * thought rather than opening a section.
 *
 * Japanese is `placeholder` — its legacy content is byte-for-byte the English
 * page — while Korean is a real translation. Same split as dTWAP and dLIMIT.
 */
export async function LiquidityHubPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.liquidityHub' })

  const terms = resolveLocaleLink(LIQUIDITY_HUB_LINKS.terms, locale)

  return (
    <>
      {/* No call to action: the legacy header declares no button. */}
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        lang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        intro={t('sources.intro')}
        features={LIQUIDITY_HUB_SOURCES.map((id) => ({
          id,
          title: t(`sources.items.${id}.title`),
          body: t(`sources.items.${id}.body`),
        }))}
        lang={textLang(t('sources.intro'), locale)}
      />

      <ArchitectureSection
        body={t('fallback.body')}
        image={LIQUIDITY_HUB_DIAGRAM.src}
        imageWidth={LIQUIDITY_HUB_DIAGRAM.width}
        imageHeight={LIQUIDITY_HUB_DIAGRAM.height}
        imageAlt={t('fallback.alt')}
        lang={textLang(t('fallback.body'), locale)}
      />

      <FeatureGrid
        title={t('benefits.title')}
        features={LIQUIDITY_HUB_BENEFITS.map((id) => ({
          id,
          title: t(`benefits.items.${id}.title`),
          body: t(`benefits.items.${id}.body`),
        }))}
        lang={textLang(t('benefits.title'), locale)}
      />

      <BenefitColumns
        title={t('audiences.title')}
        intro={t('audiences.intro')}
        columns={LIQUIDITY_HUB_AUDIENCES.map((id) => ({
          id,
          title: t(`audiences.items.${id}.title`),
          // One string per line, so a translator edits a list rather than
          // counting keys — the items are short labels, not prose.
          items: t(`audiences.items.${id}.list`).split('\n').filter(Boolean),
        }))}
        lang={textLang(t('audiences.title'), locale)}
      />

      <PartnerShowcase
        title={t('partners.title')}
        partners={LIQUIDITY_HUB_PARTNERS.map((partner) => ({
          ...partner,
          subtitle: t(`partners.items.${partner.id}.subtitle`),
          items: t(`partners.items.${partner.id}.list`).split('\n').filter(Boolean),
          cta: t(`partners.items.${partner.id}.cta`),
        }))}
        lang={textLang(t('partners.title'), locale)}
      />

      <ArchitectureSection
        title={t('decentralization.title')}
        body={t('decentralization.body')}
        links={[{ label: t('decentralization.terms'), href: terms.href }]}
        lang={textLang(t('decentralization.body'), locale)}
        titleLang={textLang(t('decentralization.title'), locale)}
      />
    </>
  )
}

import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { Disclaimer } from '@/components/marketing/disclaimer'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  PERPETUAL_HUB_BENEFITS,
  PERPETUAL_HUB_DIAGRAM,
  PERPETUAL_HUB_HERO,
  PERPETUAL_HUB_LINKS,
  PERPETUAL_HUB_PARTNERS_IMAGE,
} from '@/content/pages/perpetual-hub'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Perpetual Hub Ultra page body, rendered by the English and Korean routes.
 *
 * No Japanese: `content/jp/perpetual-hub` does not exist in the legacy repo, so
 * `ja` is absent from the availability entry rather than marked `placeholder` —
 * the same treatment dSLTP got in #99, and for the same reason. Korean is a
 * full translation.
 *
 * Composed entirely from existing components. The only new piece is
 * `Disclaimer`, because the legacy page carries a beta/risk notice that is a
 * legal disclosure rather than marketing copy and should not read like the
 * pitch above it.
 */
export async function PerpetualHubPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.perpetualHub' })

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={PERPETUAL_HUB_HERO.ctaHref}
        image={PERPETUAL_HUB_HERO.image.src}
        // The illustration restates the headline visually, and the headline is
        // already the page's h1.
        imageAlt=""
        lang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        title={t('benefits.title')}
        features={PERPETUAL_HUB_BENEFITS.map((benefit) => ({
          id: benefit.id,
          icon: benefit.icon,
          title: t(`benefits.items.${benefit.id}.title`),
          body: t(`benefits.items.${benefit.id}.body`),
        }))}
        lang={textLang(t('benefits.title'), locale)}
      />

      {/* Heading, prose and a diagram — nothing to click, hence no `links`. */}
      <ArchitectureSection
        title={t('integrate.title')}
        body={t('integrate.body')}
        image={PERPETUAL_HUB_DIAGRAM.src}
        imageAlt={t('integrate.alt')}
        lang={textLang(t('integrate.body'), locale)}
        titleLang={textLang(t('integrate.title'), locale)}
      />

      <ArchitectureSection
        title={t('partners.title')}
        body={t('partners.body')}
        image={PERPETUAL_HUB_PARTNERS_IMAGE.src}
        imageAlt={t('partners.alt')}
        lang={textLang(t('partners.body'), locale)}
        titleLang={textLang(t('partners.title'), locale)}
      />

      <ArchitectureSection
        title={t('poweredBy.title')}
        body={t('poweredBy.body')}
        links={[
          { label: t('poweredBy.contact'), href: PERPETUAL_HUB_LINKS.contact },
          { label: t('poweredBy.onePager'), href: PERPETUAL_HUB_LINKS.onePager },
        ]}
        // Body, not title: "Powered by Orbs Network" stays English in the
        // Korean catalog, so deriving the section language from it would mark
        // the Korean prose English — the bug #99 fixed.
        lang={textLang(t('poweredBy.body'), locale)}
        titleLang={textLang(t('poweredBy.title'), locale)}
      />

      <Disclaimer text={t('disclaimer')} lang={textLang(t('disclaimer'), locale)} />
    </>
  )
}

import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { Disclaimer } from '@/components/marketing/disclaimer'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  DPERPS_BENEFITS,
  DPERPS_DIAGRAM,
  DPERPS_HERO,
  DPERPS_LINKS,
  DPERPS_PARTNERS_IMAGE,
} from '@/content/pages/dperps'
import { resolveLocaleLink } from '@/content/shared/link'
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
export async function DperpsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dperps' })

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
        image={DPERPS_HERO.image.src}
        // The illustration restates the headline visually, and the headline is
        // already the page's h1.
        imageAlt=""
        locale={locale}
      />

      <FeatureGrid
        title={t('benefits.title')}
        features={DPERPS_BENEFITS.map((benefit) => ({
          id: benefit.id,
          icon: benefit.icon,
          title: t(`benefits.items.${benefit.id}.title`),
          body: t(`benefits.items.${benefit.id}.body`),
        }))}
        locale={locale}
      />

      {/* Heading, prose and a diagram — nothing to click, hence no `links`. */}
      <ArchitectureSection
        title={t('integrate.title')}
        body={t('integrate.body')}
        image={DPERPS_DIAGRAM.src}
        imageWidth={DPERPS_DIAGRAM.width}
        imageHeight={DPERPS_DIAGRAM.height}
        imageAlt={t('integrate.alt')}
        locale={locale}
      />

      <ArchitectureSection
        title={t('partners.title')}
        body={t('partners.body')}
        image={DPERPS_PARTNERS_IMAGE.src}
        imageWidth={DPERPS_PARTNERS_IMAGE.width}
        imageHeight={DPERPS_PARTNERS_IMAGE.height}
        imageAlt={t('partners.alt')}
        locale={locale}
      />

      <ArchitectureSection
        title={t('poweredBy.title')}
        body={t('poweredBy.body')}
        links={[
          { label: t('poweredBy.contact'), href: contact.href },
          { label: t('poweredBy.onePager'), href: onePager.href },
        ]}
        // Body, not title: "Powered by Orbs Network" stays English in the
        // Korean catalog, so deriving the section language from it would mark
        // the Korean prose English — the bug #99 fixed.
        locale={locale}
      />

      <Disclaimer text={t('disclaimer')} locale={locale} />
    </>
  )
}

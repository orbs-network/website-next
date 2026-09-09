import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { LogoRow } from '@/components/marketing/logo-row'
import { ProductHero } from '@/components/marketing/product-hero'
import { StatsRow } from '@/components/marketing/stats-row'
import {
  INSTITUTIONAL_LINKS,
  INSTITUTIONAL_PRODUCTS,
  INSTITUTIONAL_SIGNERS,
  INSTITUTIONAL_STATS,
  INSTITUTIONAL_VENUES,
} from '@/content/pages/institutional'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'

/**
 * The Orbs Institutional page.
 *
 * A standalone sales landing page rather than a product page — nine short
 * sections pitched at trading desks, custodians and institutional platforms.
 * English only: the legacy repo has no Japanese or Korean version, so no
 * `textLang` marking is needed anywhere on it.
 *
 * TWO DELIBERATE DEPARTURES FROM THE LEGACY PAGE, both flagged rather than
 * decided here:
 *
 *  - **It uses the site header and footer.** The legacy page ships its own
 *    minimal nav — logo plus a single "Talk to the team" button — replacing the
 *    site chrome entirely. Supporting that means a per-page chrome override in
 *    `RootShell`, which is an architectural change worth making deliberately
 *    rather than as a side effect of one page. See the issue linked from the PR.
 *  - **No gradient headline words or background art.** The legacy hero splits
 *    its headline across four fields so one word can carry a gradient, and lays
 *    mesh and glow images behind several sections. Those are visual treatments
 *    that need a design pass to get right; the copy, structure and links are
 *    faithful without them.
 */
export async function InstitutionalPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.institutional' })

  const contact = resolveLocaleLink(INSTITUTIONAL_LINKS.contact, locale)

  return (
    <>
      <ProductHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={contact.href}
      />

      <StatsRow
        stats={INSTITUTIONAL_STATS.map((id) => ({
          id,
          value: t(`stats.items.${id}.value`),
          label: t(`stats.items.${id}.label`),
        }))}
      />

      <ArchitectureSection
        eyebrow={t('proofOfWork.eyebrow')}
        title={t('proofOfWork.title')}
        body={t('proofOfWork.body')}
      />

      <ArchitectureSection
        eyebrow={t('trackRecord.eyebrow')}
        title={t('trackRecord.title')}
        body={t('trackRecord.body')}
      />

      <LogoRow title={t('venues.title')} items={INSTITUTIONAL_VENUES} />

      <FeatureGrid
        title={t('products.title')}
        intro={t('products.intro')}
        // Every one of these pages now exists, so these links resolve today.
        features={INSTITUTIONAL_PRODUCTS.map((product) => ({
          id: product.id,
          icon: product.icon,
          href: resolveLocaleLink({ href: product.href }, locale).href,
          title: t(`products.items.${product.id}.title`),
          body: t(`products.items.${product.id}.body`),
        }))}
      />

      <ArchitectureSection
        eyebrow={t('selfCustody.eyebrow')}
        title={t('selfCustody.title')}
        body={t('selfCustody.body')}
      />

      <LogoRow title={t('signers.title')} sub={t('signers.sub')} items={INSTITUTIONAL_SIGNERS} />
    </>
  )
}

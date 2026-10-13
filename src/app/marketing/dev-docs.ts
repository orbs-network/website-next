import { getTranslations } from 'next-intl/server'
import type { SectionLink } from '@/components/marketing/section-parts'
import { PRODUCT_DEV_DOCS, type DevDocsProduct } from '@/content/shared/sdk'
import type { Locale } from '@/i18n/locales'

/** Start building in the English refresh; retain labels for held pages and other locales. */
export async function getDevDocsLink(product: DevDocsProduct, locale: Locale): Promise<SectionLink> {
  const t = await getTranslations({ locale, namespace: 'devDocs' })
  const { kind, href } = PRODUCT_DEV_DOCS[product]
  // Keep the paused dSPOT page's current CTA until its design refresh is ready.
  return { label: t(locale === 'en' && product !== 'dspot' ? 'startBuilding' : kind), href }
}

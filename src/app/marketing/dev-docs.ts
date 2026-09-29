import { getTranslations } from 'next-intl/server'
import type { SectionLink } from '@/components/marketing/section-parts'
import { PRODUCT_DEV_DOCS, type DevDocsProduct } from '@/content/shared/sdk'
import type { Locale } from '@/i18n/locales'

/** A product hero's developer link — "SDK", "API" or "Skill" — resolved for `locale`. */
export async function getDevDocsLink(product: DevDocsProduct, locale: Locale): Promise<SectionLink> {
  const t = await getTranslations({ locale, namespace: 'devDocs' })
  const { kind, href } = PRODUCT_DEV_DOCS[product]
  return { label: t(kind), href }
}

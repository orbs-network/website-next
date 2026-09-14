import { getTranslations } from 'next-intl/server'
import { EcosystemDirectory } from '@/components/marketing/ecosystem-directory'
import { ECOSYSTEM_CATEGORIES } from '@/content/pages/ecosystem'
import type { Locale } from '@/i18n/locales'

/**
 * The ecosystem directory page.
 *
 * No per-string `lang` here, unlike the other migrated pages: every value on
 * this page is either a category title from the catalog (in the route's
 * language) or a project name, and project names are proper nouns that do not
 * translate. There is nothing whose language disagrees with its surroundings.
 */
export async function EcosystemPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.ecosystem' })

  const groups = ECOSYSTEM_CATEGORIES.map((category) => ({
    key: category.key,
    title: t(`categories.${category.key}`),
    entries: category.entries,
  }))

  return <EcosystemDirectory title={t('meta.title')} groups={groups} />
}

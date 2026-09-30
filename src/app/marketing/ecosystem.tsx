import { getTranslations } from 'next-intl/server'
import { EcosystemDirectory } from '@/components/marketing/ecosystem-directory'
import { ECOSYSTEM_CATEGORIES } from '@/content/pages/ecosystem'
import type { Locale } from '@/i18n/locales'
import { InnerClosingCta } from './inner-closing'

/**
 * The ecosystem directory page.
 *
 * Category titles carry their own `lang`. The legacy `jp/` and `ko/` ecosystem
 * directories hold the English titles verbatim, so on those routes every
 * heading is English inside a non-English document — the same per-string rule
 * the rest of the migrated pages use (#103).
 *
 * The entries themselves do not: a project name is a proper noun, and tagging
 * "MetaMask" with a language would be claiming something untrue about it.
 */
export async function EcosystemPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.ecosystem' })

  const groups = ECOSYSTEM_CATEGORIES.map((category) => ({
    key: category.key,
    title: t(`categories.${category.key}`),
    entries: category.entries,
  }))

  // The page name is the eyebrow and the existing description is the headline:
  // the master's hero is a label over a statement, and "Ecosystem" twice would
  // be both.
  return (
    <>
      <EcosystemDirectory
        eyebrow={t('hero.eyebrow')}
        headline={t('meta.description')}
        groups={groups}
        locale={locale}
      />
      <InnerClosingCta locale={locale} />
    </>
  )
}

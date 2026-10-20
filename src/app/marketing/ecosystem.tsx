import { textLang } from '@/i18n/script'
import { getTranslations } from 'next-intl/server'
import { H1 } from '@/app/components/typography'
import { EcosystemGrid } from '@/components/marketing/ecosystem-grid'
import { ECOSYSTEM_CARDS } from '@/content/pages/ecosystem-cards'
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

  // English and Korean share the new grid; Japanese retains its legacy directory.
  if (locale !== 'ja') {
    return (
      <section className="container pt-16 pb-section lg:pt-24">
        <H1 lang={textLang(t('hero.headline'), locale)}>{t('hero.headline')}</H1>
        <div className="mt-12 lg:mt-16">
          <EcosystemGrid
            cards={ECOSYSTEM_CARDS}
            labels={{
              filterLabel: t('filterLabel'),
              viewOnX: t('viewOnX'),
              filters: {
                all: t('filters.all'),
                dperps: t('filters.dperps'),
                dspot: t('filters.dspot'),
                dsltp: t('filters.dsltp'),
                solvers: t('filters.solvers'),
                chains: t('filters.chains'),
              },
            }}
          />
        </div>
      </section>
    )
  }

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

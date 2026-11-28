import { H1 } from '@/app/components/typography'
import { EcosystemGrid } from '@/components/marketing/ecosystem-grid'
import { ECOSYSTEM_CARDS } from '@/content/pages/ecosystem-cards'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { getTranslations } from 'next-intl/server'

/** Current ecosystem grid, with locale-specific labels and shared partner data. */
export async function EcosystemPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.ecosystem' })

  // English and Korean share the new grid; Japanese retains its legacy directory.

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

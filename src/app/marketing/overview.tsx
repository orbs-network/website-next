import { ModuleCards } from '@/components/marketing/module-cards'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { StatsRow } from '@/components/marketing/stats-row'
import {
  OVERVIEW_HISTORY,
  OVERVIEW_LINKS,
  overviewProductsForLocale,
  type OverviewProductId,
} from '@/content/pages/overview'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import type { Locale } from '@/i18n/locales'
import { getTranslations } from 'next-intl/server'
import { InnerClosingCta } from './inner-closing'

/**
 * Each protocol's colour, as on dSPOT (see `MODULE_PRESENTATION` there).
 */
const PRODUCT_PRESENTATION: Record<OverviewProductId, { accentClassName: string; titleClassName?: string }> = {
  dspot: { accentClassName: 'text-periwinkle-600 dark:text-periwinkle-400' },
  dperps: { accentClassName: 'text-pink-600 dark:text-pink-400' },
  executionServices: { accentClassName: 'text-cyan-600 dark:text-cyan-400' },
  dtwap: { accentClassName: 'text-periwinkle-600 dark:text-periwinkle-400' },
  dlimit: { accentClassName: 'text-indigo-400 dark:text-indigo-200' },
  liquidityHub: { accentClassName: 'text-cyan-600 dark:text-cyan-400', titleClassName: 'uppercase' },
  perpetualHub: { accentClassName: 'text-pink-600 dark:text-pink-400' },
}

/**
 * The Orbs Overview page — what the network is, rendered by all three locales.
 *
 * On the inner-page MASTER's sections (#227): split hero, a rule and bracketed
 * eyebrow on every section, left-aligned headings, borderless cards, and the
 * shared closing block. English and Korean group the three products; Japanese retains its legacy
 * protocol cards.
 *
 * Every string is tagged individually with `textLang`. Japanese is a PARTIAL
 * translation — `jp/overview/md/why-section.md` is an empty file — so those
 * strings fall back to English inside a `lang="ja"` document and have to say so
 * one by one. Deriving a single language for the page is the mistake #103
 * tracks. The product lockups carry theirs on a wrapper, because the names are
 * English in every catalog.
 */
export async function OverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.overview' })

  // English and Korean share the refreshed structure; Japanese retains its legacy composition.

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: OVERVIEW_LINKS.products }}
        secondaryCta={{ label: t('hero.secondaryCta'), href: OVERVIEW_LINKS.staking }}
        graphic={HERO_GRAPHICS.overview}
        locale={locale}
      />
      <SplitStatement
        eyebrow={t('execution.eyebrow')}
        heading={t('execution.title')}
        body={t('execution.body')}
        locale={locale}
      />
      <SplitStatement
        eyebrow={t('decentralisation.eyebrow')}
        heading={t('decentralisation.title')}
        body={t('decentralisation.body')}
        locale={locale}
      />
      <ModuleCards
        id={OVERVIEW_LINKS.protocols.slice(1)}
        eyebrow={t('tech.eyebrow')}
        heading={t('products.title')}
        body={t('tech.body')}
        columns={3}
        cards={overviewProductsForLocale(locale).map((product) => {
          const name = t(`products.items.${product.id}.title`)
          return {
            id: product.id,
            eyebrow: name,
            title: name,
            ...PRODUCT_PRESENTATION[product.id],
            body: t(`products.items.${product.id}.body`),
            link: { label: t('products.cta', { name }), href: product.href },
          }
        })}
        locale={locale}
      />
      <div className="border-t border-border">
        <StatsRow
          title={t('history.title')}
          stats={OVERVIEW_HISTORY.map((id) => ({
            id,
            value: t(`history.stats.${id}.value`),
            label: t(`history.stats.${id}.label`),
          }))}
          locale={locale}
        />
      </div>
      <InnerClosingCta locale={locale} />
    </>
  )
}

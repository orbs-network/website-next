import { getTranslations } from 'next-intl/server'
import { ChainTable } from '@/components/marketing/chain-table'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { NumberedSteps } from '@/components/marketing/numbered-steps'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  SPOT_ORDERS_CHAINS,
  SPOT_ORDERS_FEATURES,
  SPOT_ORDERS_LINKS,
  SPOT_ORDERS_QUICKSTART,
  SPOT_ORDERS_STEPS,
} from '@/content/pages/ai-skills'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Spot Advanced Swap Orders skill page.
 *
 * Composed entirely from existing components except `ChainTable`, which this
 * page needs because its chain list carries EVM chain IDs. That is tabular data
 * — someone is looking a value up — so it is a real `<table>` with headers,
 * unlike Orbs Agentic's `ChainLogos`, which is a brand wall answering a
 * different question.
 *
 * This is also the destination of Orbs Agentic's two primary calls to action
 * (#104), which pointed at a route that did not exist until now.
 */
export async function SpotOrdersPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.spotOrders' })

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={SPOT_ORDERS_LINKS.skillSpec}
        repo={SPOT_ORDERS_LINKS.repo}
        lang={textLang(t('hero.intro'), locale)}
        headlineLang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        title={t('quickstart.title')}
        intro={t('quickstart.intro')}
        features={SPOT_ORDERS_QUICKSTART.map((id) => ({
          id,
          title: t(`quickstart.items.${id}.title`),
          body: t(`quickstart.items.${id}.body`),
        }))}
        lang={textLang(t('quickstart.intro'), locale)}
        titleLang={textLang(t('quickstart.title'), locale)}
      />

      <FeatureGrid
        title={t('features.title')}
        features={SPOT_ORDERS_FEATURES.map((id) => ({
          id,
          title: t(`features.items.${id}.title`),
          body: t(`features.items.${id}.body`),
        }))}
        lang={textLang(t('features.items.market.body'), locale)}
        titleLang={textLang(t('features.title'), locale)}
      />

      <NumberedSteps
        title={t('howItWorks.title')}
        steps={SPOT_ORDERS_STEPS.map((id) => ({
          title: t(`howItWorks.steps.${id}.title`),
          body: t(`howItWorks.steps.${id}.body`),
        }))}
        lang={textLang(t('howItWorks.steps.intent.body'), locale)}
      />

      <ChainTable
        title={t('chains.title')}
        nameHeader={t('chains.nameHeader')}
        idHeader={t('chains.idHeader')}
        chains={SPOT_ORDERS_CHAINS}
        titleLang={textLang(t('chains.title'), locale)}
      />
    </>
  )
}

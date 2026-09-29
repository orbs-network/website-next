import { getTranslations } from 'next-intl/server'
import { SDK_DOCS_URL } from '@/content/shared/sdk'
import { DLimit, DSltp, DTwap, LiquidityHub } from '@/components/icons'
import { ClosingCta } from '@/components/marketing/closing-cta'
import { GraphicSplit } from '@/components/marketing/graphic-split'
import { ModuleCards } from '@/components/marketing/module-cards'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { StatementBand } from '@/components/marketing/statement-band'
import {
  DSPOT_GRAPHICS,
  DSPOT_LINKS,
  DSPOT_MARQUEE,
  DSPOT_MODULES,
  DSPOT_POINTS,
  type DspotModuleId,
} from '@/content/pages/dspot'
import type { Locale } from '@/i18n/locales'

/**
 * Each product's lockup and colour. Here rather than in `content/pages/dspot`
 * because Tailwind only scans `src/app` and `src/components` for class names.
 *
 * The design's colours are the dark-theme ones. On the light surface the
 * periwinkle, coral and cyan fall under 3:1, so the light theme takes the
 * darker step of each.
 */
const MODULE_PRESENTATION: Record<DspotModuleId, { mark: React.ReactNode; accentClassName: string }> = {
  dlimit: { mark: <DLimit />, accentClassName: 'text-indigo-400' },
  dtwap: { mark: <DTwap />, accentClassName: 'text-periwinkle-600 dark:text-periwinkle-400' },
  dsltp: { mark: <DSltp />, accentClassName: 'text-coral-600 dark:text-[#f17171]' },
  liquidityHub: { mark: <LiquidityHub />, accentClassName: 'text-cyan-600 dark:text-cyan-400' },
}

/**
 * The dSPOT page (#155), from the 3.4 `Desktop / Products / dSPOT` frame.
 *
 * Venues' skeleton with a card grid of the four order-type products after the
 * hero, and a numbered list under the execution statement. English only, like
 * Venues: the copy is new with 3.4.
 */
export async function DspotPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dspot' })
  const sdk = await getTranslations({ locale, namespace: 'sdk' })

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: DSPOT_LINKS.modules }}
        secondaryCta={{ label: sdk('heroLink'), href: SDK_DOCS_URL }}
        graphic={DSPOT_GRAPHICS.hero}
        locale={locale}
      />

      <ModuleCards
        id={DSPOT_LINKS.modules.slice(1)}
        eyebrow={t('modules.eyebrow')}
        heading={t('modules.heading')}
        body={t('modules.body')}
        cards={DSPOT_MODULES.map((module) => ({
          id: module.id,
          eyebrow: t(`modules.${module.id}.name`),
          body: t(`modules.${module.id}.body`),
          link: { label: t(`modules.${module.id}.cta`), href: module.href },
          ...MODULE_PRESENTATION[module.id],
        }))}
        locale={locale}
      />

      <SplitStatement
        eyebrow={t('execution.eyebrow')}
        heading={t('execution.heading')}
        body={t('execution.body')}
        points={DSPOT_POINTS.map((id) => t(`execution.points.${id}`))}
        locale={locale}
      />

      <StatementBand text={t('band')} locale={locale} />

      <GraphicSplit
        eyebrow={t('network.eyebrow')}
        heading={t('network.heading')}
        body={t('network.body')}
        cta={{ label: t('network.cta'), href: DSPOT_LINKS.docs }}
        graphic={DSPOT_GRAPHICS.network}
        locale={locale}
      />

      <ClosingCta
        phrases={DSPOT_MARQUEE.map((id) => t(`marquee.${id}`))}
        pauseLabel={t('marquee.pause')}
        resumeLabel={t('marquee.resume')}
        locale={locale}
        actions={
          <>
            <CtaButton link={{ label: t('closing.follow'), href: DSPOT_LINKS.x }} variant="secondary" locale={locale} />
            <CtaButton
              link={{ label: t('closing.community'), href: DSPOT_LINKS.telegram }}
              variant="secondary"
              locale={locale}
            />
            <CtaButton link={{ label: t('closing.contact'), href: DSPOT_LINKS.contact }} locale={locale} />
          </>
        }
      />
    </>
  )
}

import { getDevDocsLink } from './dev-docs'
import { getTranslations } from 'next-intl/server'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
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
 * Each product's label colour. Here rather than in `content/pages/dspot`
 * because Tailwind only scans `src/app` and `src/components` for class names.
 *
 * The design uses the same four hues in both themes: #3346F2, #7A89E9,
 * #F27272 and #2CEDFC. On the light card (#E7E7E7) only the first clears AA
 * for 11px text; the other three read 2.6, 2.3 and 1.2:1. The palette's 600
 * steps pass but change the colour — coral/600 is brown, periwinkle/600 navy —
 * so each light value is the design hue with only its OKLCH lightness lowered
 * until it reaches 4.5:1 on #E7E7E7: #545FBB 4.55, #B73D42 4.52, #06737B 4.53.
 *
 * Liquidity Hub is the one title set in capitals: the design draws it
 * "LIQUIDITY HUB", and it has no lowercase "d" to protect.
 */
const MODULE_PRESENTATION: Record<DspotModuleId, { accentClassName: string; titleClassName?: string }> = {
  dlimit: { accentClassName: 'text-indigo-400' },
  dtwap: { accentClassName: 'text-[#545fbb] dark:text-periwinkle-400' },
  dsltp: { accentClassName: 'text-[#b73d42] dark:text-[#f27272]' },
  liquidityHub: { accentClassName: 'text-[#06737b] dark:text-cyan-400', titleClassName: 'uppercase' },
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
  const devDocs = await getDevDocsLink('dspot', locale)

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: DSPOT_LINKS.modules }}
        /*
          Not in the design, which draws one hero CTA; kept on purpose. #214
          made every product hero's SDK link an "Explore SDK" CTA, and dSPOT's
          is the only one that lands on the docs' Spot guide chooser.
        */
        secondaryCta={devDocs}
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
          title: t(`modules.${module.id}.name`),
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
        /*
          The dSPOT frame sets this eyebrow 43px under the divider (40 + the
          eyebrow's half-leading); the Venues frame, the other user, keeps it
          tight.
        */
        className="pt-10"
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
        locale={locale}
        actions={
          <>
            <ClosingSocialButtons
              follow={t('closing.follow')}
              community={t('closing.community')}
              x={DSPOT_LINKS.x}
              telegram={DSPOT_LINKS.telegram}
              locale={locale}
            />
            <CtaButton link={{ label: t('closing.contact'), href: DSPOT_LINKS.contact }} locale={locale} />
          </>
        }
      />
    </>
  )
}

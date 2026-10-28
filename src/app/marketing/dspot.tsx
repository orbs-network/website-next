import { getDevDocsLink } from './dev-docs'
import { getTranslations } from 'next-intl/server'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
import { GraphicSplit } from '@/components/marketing/graphic-split'
import { LogoRow } from '@/components/marketing/logo-row'
import { ProductModuleCards } from '@/components/marketing/product-module-cards'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import {
  DSPOT_GRAPHICS,
  DSPOT_LINKS,
  DSPOT_MARQUEE,
  DSPOT_MODULES,
  DSPOT_MODULE_GRAPHICS,
  DSPOT_POINTS,
  DSPOT_SOLVERS,
} from '@/content/pages/dspot'
import type { Locale } from '@/i18n/locales'

/** October 28 layout, retaining the approved headline, solver strip and SDK destination. */
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
        /* Preserve the approved SDK label and destination. */
        secondaryCta={devDocs}
        graphic={DSPOT_GRAPHICS.hero}
        locale={locale}
      />

      <ProductModuleCards
        id={DSPOT_LINKS.modules.slice(1)}
        eyebrow={t('modules.eyebrow')}
        heading={t('modules.heading')}
        body={t('modules.body')}
        previousLabel={t('modules.previous')}
        nextLabel={t('modules.next')}
        cards={DSPOT_MODULES.map((module) => ({
          id: module.id,
          title: t(`modules.${module.id}.name`),
          body: t(`modules.${module.id}.body`),
          graphic: DSPOT_MODULE_GRAPHICS[module.id],
        }))}
        locale={locale}
      />

      <LogoRow
        title={t('solvers.title')}
        titleHidden
        marquee
        items={DSPOT_SOLVERS}
        locale={locale}
        className="pt-0 pb-section [&>div]:mt-0"
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

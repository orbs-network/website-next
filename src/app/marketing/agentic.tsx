import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { ChainLogos } from '@/components/marketing/chain-logos'
import { DiagramSection } from '@/components/marketing/diagram-section'
import { Disclaimer } from '@/components/marketing/disclaimer'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { NumberedSteps } from '@/components/marketing/numbered-steps'
import { ProductHero } from '@/components/marketing/product-hero'
import {
  AGENTIC_BREAKS,
  AGENTIC_CHAINS,
  AGENTIC_DIAGRAM,
  AGENTIC_GET_STARTED,
  AGENTIC_HERO,
  AGENTIC_ORACLE_STEPS,
  AGENTIC_TOOLS,
} from '@/content/pages/agentic'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Orbs Agentic page body, rendered by the English and Korean routes.
 *
 * Eight sections, and it shares less with its siblings than any page so far —
 * it pitches an execution layer for AI agents rather than a swap primitive. Two
 * of its sections needed new components:
 *
 *  - `NumberedSteps` for the verification flow. Those four steps only mean
 *    anything in order, so they are an `<ol>`; a feature grid would present a
 *    process as a set of unrelated facts.
 *  - `ChainLogos` for the supported chains, where each mark carries its chain's
 *    name because the names appear nowhere else in that section.
 *
 * No Japanese: `content/jp/agentic` does not exist. Korean is a real
 * translation.
 */
export async function AgenticPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.agentic' })

  const getStarted = resolveLocaleLink(AGENTIC_HERO.getStarted, locale)

  return (
    <>
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={getStarted.href}
        image={AGENTIC_HERO.image.src}
        // The illustration restates the headline visually.
        imageAlt=""
        repo={AGENTIC_HERO.repo}
        lang={textLang(t('hero.headline'), locale)}
      />

      <FeatureGrid
        intro={t('breaks.intro')}
        features={AGENTIC_BREAKS.map((card) => ({
          id: card.id,
          icon: card.icon,
          title: t(`breaks.items.${card.id}.title`),
          body: t(`breaks.items.${card.id}.body`),
        }))}
        lang={textLang(t('breaks.intro'), locale)}
      />

      <FeatureGrid
        title={t('tools.title')}
        intro={t('tools.intro')}
        features={AGENTIC_TOOLS.map((id) => ({
          id,
          title: t(`tools.items.${id}.title`),
          body: t(`tools.items.${id}.body`),
        }))}
        lang={textLang(t('tools.intro'), locale)}
        titleLang={textLang(t('tools.title'), locale)}
      />

      <ChainLogos
        title={t('chains.title')}
        chains={AGENTIC_CHAINS}
        lang={textLang(t('chains.title'), locale)}
      />

      <NumberedSteps
        title={t('oracle.title')}
        statement={t('oracle.statement')}
        steps={AGENTIC_ORACLE_STEPS.map((id) => t(`oracle.steps.${id}`))}
        lang={textLang(t('oracle.statement'), locale)}
      />

      <DiagramSection
        title={t('architecture.title')}
        image={AGENTIC_DIAGRAM.src}
        width={AGENTIC_DIAGRAM.width}
        height={AGENTIC_DIAGRAM.height}
        imageAlt={t('architecture.alt')}
        lang={textLang(t('architecture.alt'), locale)}
        titleLang={textLang(t('architecture.title'), locale)}
      />

      <ArchitectureSection
        title={t('poweredBy.title')}
        body={t('poweredBy.body')}
        lang={textLang(t('poweredBy.body'), locale)}
        titleLang={textLang(t('poweredBy.title'), locale)}
      />

      <FeatureGrid
        title={t('getStarted.title')}
        // These are calls to action, not descriptions — each card links.
        features={AGENTIC_GET_STARTED.map((card) => ({
          id: card.id,
          href: resolveLocaleLink({ href: card.href }, locale).href,
          title: t(`getStarted.items.${card.id}.title`),
          body: t(`getStarted.items.${card.id}.body`),
        }))}
        lang={textLang(t('getStarted.title'), locale)}
      />

      <Disclaimer text={t('disclaimer')} lang={textLang(t('disclaimer'), locale)} />
    </>
  )
}

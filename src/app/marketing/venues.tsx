import { getTranslations } from 'next-intl/server'
import { ClosingCta } from '@/components/marketing/closing-cta'
import { GraphicSplit } from '@/components/marketing/graphic-split'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { StatementBand } from '@/components/marketing/statement-band'
import { VENUES_GRAPHICS, VENUES_LINKS, VENUES_MARQUEE } from '@/content/pages/venues'
import type { Locale } from '@/i18n/locales'

/**
 * The Venues page (#157), from the 3.4 `Desktop / Solutions / Venues` frame.
 *
 * The SDK page's skeleton with venue-facing copy. English only, for the same
 * reason: the copy is new with 3.4.
 */
export async function VenuesPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.venues' })

  const uiKit = (label: string) => ({ label, href: VENUES_LINKS.uiKit })

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={uiKit(t('hero.cta'))}
        graphic={VENUES_GRAPHICS.hero}
        locale={locale}
      />

      <SplitStatement
        eyebrow={t('capabilities.eyebrow')}
        heading={t('capabilities.heading')}
        body={t('capabilities.body')}
        locale={locale}
      />

      <StatementBand text={t('band')} locale={locale} />

      <GraphicSplit
        eyebrow={t('frontend.eyebrow')}
        heading={t('frontend.heading')}
        body={t('frontend.body')}
        cta={uiKit(t('frontend.cta'))}
        graphic={VENUES_GRAPHICS.frontend}
        locale={locale}
      />

      <ClosingCta
        phrases={VENUES_MARQUEE.map((id) => t(`marquee.${id}`))}
        pauseLabel={t('marquee.pause')}
        resumeLabel={t('marquee.resume')}
        locale={locale}
        actions={
          <>
            <CtaButton link={uiKit(t('closing.uiKit'))} locale={locale} />
            <CtaButton link={{ label: t('closing.contact'), href: VENUES_LINKS.contact }} locale={locale} />
          </>
        }
      />
    </>
  )
}

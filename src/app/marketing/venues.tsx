import { getTranslations } from 'next-intl/server'
import { ClosingCta } from '@/components/marketing/closing-cta'
import { FeaturedIntegrations } from '@/components/marketing/integration-list'
import { CtaButton, Eyebrow } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { StatsRow } from '@/components/marketing/stats-row'
import { VENUES_GRAPHICS, VENUES_LINKS, VENUES_MARQUEE } from '@/content/pages/venues'
import { FEATURED_INTEGRATIONS, SUSHISWAP_SLTP_CHAINS, INTEGRATION_CHAINS } from '@/content/shared/integrations'
import { SDK_DOCS_URL } from '@/content/shared/sdk'
import type { Locale } from '@/i18n/locales'

/** English venue handoff, using the approved inner-page layout and assets. */
export async function VenuesPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.venues' })
  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: VENUES_LINKS.contact }}
        secondaryCta={{ label: t('hero.secondaryCta'), href: SDK_DOCS_URL }}
        graphic={VENUES_GRAPHICS.hero}
        locale={locale}
      />
      <StatsRow
        columns={2}
        stats={(['venues', 'chains'] as const).map((id) => ({
          id,
          value: t(`stats.${id}.value`),
          label: t(`stats.${id}.label`),
        }))}
        locale={locale}
      />
      <section className="container border-t border-border py-section" aria-label={t('partners.title')}>
        <Eyebrow text={t('partners.title')} locale={locale} />
        <div className="mt-12">
          <FeaturedIntegrations partners={FEATURED_INTEGRATIONS} />
        </div>
      </section>
      <SplitStatement
        eyebrow={t('caseStudy.eyebrow')}
        heading={t('caseStudy.title')}
        body={`${t('caseStudy.body')}\n\n${t('caseStudy.rollout', { chains: new Intl.ListFormat('en-GB').format(SUSHISWAP_SLTP_CHAINS.map((id) => INTEGRATION_CHAINS[id].name)) })}`}
        locale={locale}
      />
      <section className="container pb-section" aria-label={t('caseStudy.calloutsLabel')}>
        <ul className="grid gap-8 sm:grid-cols-3">
          {(['execution', 'orders', 'chains'] as const).map((id) => (
            <li key={id} className="border-t border-border pt-6 text-p text-fg">
              {t(`caseStudy.callouts.${id}`)}
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <CtaButton link={{ label: t('caseStudy.cta'), href: VENUES_LINKS.contact }} locale={locale} />
        </div>
      </section>
      <ClosingCta
        phrases={VENUES_MARQUEE.map((id) => t(`marquee.${id}`))}
        locale={locale}
        actions={
          <>
            <CtaButton link={{ label: t('hero.cta'), href: VENUES_LINKS.contact }} locale={locale} />
            <CtaButton
              link={{ label: t('hero.secondaryCta'), href: SDK_DOCS_URL }}
              locale={locale}
              variant="secondary"
            />
          </>
        }
      />
    </>
  )
}

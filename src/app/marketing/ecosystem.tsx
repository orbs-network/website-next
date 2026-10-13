import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { H1 } from '@/app/components/typography'
import { InnerSection, PointColumns } from '@/components/marketing/inner-section'
import { FeaturedIntegrations, IntegrationList } from '@/components/marketing/integration-list'
import { Eyebrow } from '@/components/marketing/section-parts'
import {
  FEATURED_INTEGRATIONS,
  PERPS_INTEGRATIONS,
  SPOT_INTEGRATIONS,
  SLTP_INTEGRATIONS,
  INTEGRATION_CHAINS,
} from '@/content/shared/integrations'
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

  // Full replacement in English; the existing directories stay on localised
  // routes until their separate content refresh.
  if (locale === 'en') {
    const mapping = (
      product: 'dspot' | 'dperps' | 'stopLossTakeProfit',
      label: string,
      partners: typeof SPOT_INTEGRATIONS | typeof PERPS_INTEGRATIONS | typeof SLTP_INTEGRATIONS
    ) => (
      <IntegrationList
        product={product}
        partners={partners}
        label={label}
        partnerHeader={t('partnerHeader')}
        chainHeader={t('chainHeader')}
      />
    )
    return (
      <>
        <section className="container pt-16 pb-section lg:pt-24">
          <Eyebrow text={t('hero.eyebrow')} locale={locale} />
          <H1 className="mt-3 max-w-5xl text-balance">{t('hero.headline')}</H1>
          <p className="mt-10 max-w-3xl text-p text-fg">{t('hero.intro')}</p>
          <nav className="mt-12" aria-label={t('browse')}>
            <ul className="flex flex-wrap gap-x-8 gap-y-4 text-detail font-medium uppercase tracking-wide">
              <li>
                <a className="underline underline-offset-4" href="#featured">
                  {t('featured.title')}
                </a>
              </li>
              <li>
                <a className="underline underline-offset-4" href="#dperps">
                  dPERPS
                </a>
              </li>
              <li>
                <a className="underline underline-offset-4" href="#dspot">
                  dSPOT
                </a>
              </li>
              <li>
                <a className="underline underline-offset-4" href="#chains">
                  {t('chains.title')}
                </a>
              </li>
            </ul>
          </nav>
        </section>
        <InnerSection
          id="featured"
          eyebrow={t('featured.eyebrow')}
          heading={t('featured.title')}
          layout="stacked"
          locale={locale}
        >
          <FeaturedIntegrations partners={FEATURED_INTEGRATIONS} showProducts />
        </InnerSection>
        <InnerSection id="dperps" eyebrow={t('perps.eyebrow')} heading={t('perps.title')} locale={locale}>
          {mapping('dperps', t('perps.title'), PERPS_INTEGRATIONS)}
        </InnerSection>
        <InnerSection
          id="dspot"
          eyebrow={t('spot.eyebrow')}
          heading={t('spot.title')}
          intro={t('spot.intro')}
          locale={locale}
        >
          {mapping('dspot', t('spot.title'), SPOT_INTEGRATIONS)}
        </InnerSection>
        <InnerSection eyebrow={t('sltp.eyebrow')} heading={t('sltp.title')} intro={t('sltp.intro')} locale={locale}>
          {mapping('stopLossTakeProfit', t('sltp.title'), SLTP_INTEGRATIONS)}
        </InnerSection>
        <InnerSection eyebrow={t('status.eyebrow')} heading={t('status.title')} locale={locale}>
          <PointColumns
            columns={2}
            locale={locale}
            points={(['historical', 'upcoming'] as const).map((id) => ({
              id,
              title: t(`status.${id}.title`),
              body: t(`status.${id}.body`),
            }))}
          />
        </InnerSection>
        <InnerSection
          id="chains"
          eyebrow={t('chains.eyebrow')}
          heading={t('chains.title')}
          intro={t('chains.intro')}
          layout="stacked"
          locale={locale}
        >
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(INTEGRATION_CHAINS).map(([id, chain]) => (
              <li key={id} className="flex flex-col items-center gap-4 bg-white p-5 text-center text-neutral-900">
                <Image
                  src={chain.logo.src}
                  width={chain.logo.width}
                  height={chain.logo.height}
                  alt=""
                  sizes="2rem"
                  className="h-8 w-auto max-w-full object-contain"
                />
                <span className="text-detail font-medium">{chain.name}</span>
              </li>
            ))}
          </ul>
        </InnerSection>
        <InnerClosingCta locale={locale} />
      </>
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

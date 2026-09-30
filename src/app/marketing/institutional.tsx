import { getTranslations } from 'next-intl/server'
import { DLimit, DSltp, DTwap, LiquidityHub } from '@/components/icons'
import { ClosingCta } from '@/components/marketing/closing-cta'
import { InnerSection, PointColumns } from '@/components/marketing/inner-section'
import { LogoRow } from '@/components/marketing/logo-row'
import { ModuleCards } from '@/components/marketing/module-cards'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { StatementBand } from '@/components/marketing/statement-band'
import { StatsRow } from '@/components/marketing/stats-row'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import {
  INSTITUTIONAL_FEATURES,
  INSTITUTIONAL_LINKS,
  INSTITUTIONAL_MARQUEE,
  INSTITUTIONAL_PATHS,
  INSTITUTIONAL_PRODUCTS,
  INSTITUTIONAL_SIGNERS,
  INSTITUTIONAL_STATS,
  INSTITUTIONAL_VENUES,
  type InstitutionalProductId,
} from '@/content/pages/institutional'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Each product's lockup and colour, as on dSPOT (see `MODULE_PRESENTATION`
 * there): the design's colours are dark-theme ones, so light takes a darker step.
 */
const PRODUCT_PRESENTATION: Record<InstitutionalProductId, { mark: React.ReactNode; accentClassName: string }> = {
  liquidityHub: { mark: <LiquidityHub />, accentClassName: 'text-cyan-600 dark:text-cyan-400' },
  dtwap: { mark: <DTwap />, accentClassName: 'text-periwinkle-600 dark:text-periwinkle-400' },
  dlimit: { mark: <DLimit />, accentClassName: 'text-indigo-400' },
  dsltp: { mark: <DSltp />, accentClassName: 'text-coral-600 dark:text-[#f17171]' },
}

/**
 * The Orbs Institutional page.
 *
 * A standalone sales landing page rather than a product page, pitched at
 * trading desks, custodians and institutional platforms. English only: the
 * legacy repo has no Japanese or Korean version.
 *
 * On the inner-page MASTER's sections (#227): a rule and bracketed eyebrow on
 * every section, left-aligned headings, no outlined cards, and the shared
 * closing block. That block replaces the old centred "Talk to the team"
 * section; its two buttons are the same two links.
 *
 * It uses the site header and footer, not the legacy page's own minimal nav:
 * a per-page chrome override in `RootShell` is an architectural change worth
 * making deliberately rather than as a side effect of one page.
 */
export async function InstitutionalPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.institutional' })

  const contact = { label: t('hero.cta'), href: INSTITUTIONAL_LINKS.contact.href }

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={contact}
        graphic={HERO_GRAPHICS.institutional}
        locale={locale}
      />

      <StatsRow
        align="start"
        stats={INSTITUTIONAL_STATS.map((id) => ({
          id,
          value: t(`stats.items.${id}.value`),
          label: t(`stats.items.${id}.label`),
        }))}
        locale={locale}
      />

      <SplitStatement
        eyebrow={t('proofOfWork.eyebrow')}
        heading={t('proofOfWork.title')}
        body={t('proofOfWork.body')}
        locale={locale}
      />

      {/*
        The venue strip belongs to "Proven on-chain", so the section gives up
        its bottom padding and the strip carries on under the same rule. The
        strip's own heading is kept for assistive technology only; the visible
        lead-in above it is the same words, hidden from it so they are not read
        twice.
      */}
      <InnerSection
        eyebrow={t('trackRecord.eyebrow')}
        heading={t('trackRecord.title')}
        className="pb-0"
        locale={locale}
      >
        <p className="text-p text-fg" lang={textLang(t('trackRecord.body'), locale)}>
          {t('trackRecord.body')}
        </p>
        <p aria-hidden="true" className="mt-8 text-p text-fg-muted" lang={textLang(t('venues.title'), locale)}>
          {t('venues.title')}
        </p>
      </InnerSection>
      <LogoRow
        title={t('venues.title')}
        titleHidden
        spread
        className="pt-0 pb-section"
        items={INSTITUTIONAL_VENUES}
        locale={locale}
      />

      <ModuleCards
        eyebrow={t('products.eyebrow')}
        heading={t('products.title')}
        body={t('products.intro')}
        cards={INSTITUTIONAL_PRODUCTS.map((product) => ({
          id: product.id,
          eyebrow: t(`products.items.${product.id}.title`),
          body: t(`products.items.${product.id}.body`),
          link: { label: t(`products.items.${product.id}.cta`), href: product.href },
          ...PRODUCT_PRESENTATION[product.id],
        }))}
        locale={locale}
      />

      {/* Same arrangement as the venues: the signer strip continues this section. */}
      <InnerSection
        eyebrow={t('selfCustody.eyebrow')}
        heading={t('selfCustody.title')}
        className="pb-0"
        locale={locale}
      >
        <p className="text-p text-fg" lang={textLang(t('selfCustody.body'), locale)}>
          {t('selfCustody.body')}
        </p>
        <p aria-hidden="true" className="mt-8 text-p text-fg" lang={textLang(t('signers.title'), locale)}>
          {t('signers.title')}
        </p>
        <p className="mt-2 text-p text-fg-muted" lang={textLang(t('signers.sub'), locale)}>
          {t('signers.sub')}
        </p>
      </InnerSection>
      <LogoRow
        title={t('signers.title')}
        titleHidden
        spread
        className="pt-0 pb-section"
        items={INSTITUTIONAL_SIGNERS}
        locale={locale}
      />

      {/*
        The master's large statement band. Title and line are one statement
        here — "…Your signers. Orbs integrates and executes." — so they are
        joined rather than stacked as a heading over a four-word paragraph.
      */}
      <StatementBand text={`${t('policyEngine.title')} ${t('policyEngine.body')}`} locale={locale} />

      <InnerSection eyebrow={t('integrationPaths.eyebrow')} heading={t('integrationPaths.title')} locale={locale}>
        <PointColumns
          columns={2}
          points={INSTITUTIONAL_PATHS.map((id) => ({
            id,
            title: t(`integrationPaths.items.${id}.title`),
            body: t(`integrationPaths.items.${id}.body`),
          }))}
          locale={locale}
        />
      </InnerSection>

      <InnerSection eyebrow={t('features.eyebrow')} heading={t('features.title')} layout="stacked" locale={locale}>
        <PointColumns
          columns={4}
          points={INSTITUTIONAL_FEATURES.map((id) => ({
            id,
            title: t(`features.items.${id}.title`),
            body: t(`features.items.${id}.body`),
          }))}
          locale={locale}
        />
      </InnerSection>

      {/*
        Two audiences, two columns, beside the heading. It was a three-column
        grid with two filled, which left the right third of the page empty.
      */}
      <InnerSection eyebrow={t('whoFor.eyebrow')} heading={t('whoFor.title')} locale={locale}>
        <PointColumns
          columns={2}
          points={INSTITUTIONAL_PATHS.map((id) => ({
            id,
            title: t(`whoFor.items.${id}.title`),
            list: t(`whoFor.items.${id}.list`).split('\n').filter(Boolean),
          }))}
          locale={locale}
        />
      </InnerSection>

      <ClosingCta
        phrases={INSTITUTIONAL_MARQUEE.map((id) => t(`marquee.${id}`))}
        locale={locale}
        actions={
          <>
            <CtaButton link={{ label: t('closing.contact'), href: INSTITUTIONAL_LINKS.contact.href }} locale={locale} />
            <CtaButton link={{ label: t('closing.github'), href: INSTITUTIONAL_LINKS.github.href }} locale={locale} />
          </>
        }
      />
    </>
  )
}

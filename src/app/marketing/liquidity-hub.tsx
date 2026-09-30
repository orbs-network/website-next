import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H3 } from '@/app/components/typography'
import { DividedSection, PlainCards } from '@/components/marketing/divided-section'
import { PartnerShowcase } from '@/components/marketing/partner-showcase'
import { Prose } from '@/components/marketing/prose'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { getDevDocsLink } from './dev-docs'
import { InnerClosingCta } from './inner-closing'
import {
  LIQUIDITY_HUB_AUDIENCES,
  LIQUIDITY_HUB_BENEFITS,
  LIQUIDITY_HUB_DIAGRAM,
  LIQUIDITY_HUB_LINKS,
  LIQUIDITY_HUB_PARTNERS,
  LIQUIDITY_HUB_SOURCES,
} from '@/content/pages/liquidity-hub'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Liquidity Hub page body, rendered by all three locale routes.
 *
 * The legacy page is six sections, and two of them are shapes no other product
 * page has:
 *
 *  - **"New DEX Standard"** splits its case three ways — users, the DEX,
 *    solvers — each a short list rather than a paragraph. `AudienceColumns`
 *    keeps that parallel structure; a grid of prose cards would flatten it.
 *  - **Launch partners** is two named partners, each with its own pitch, list
 *    and way in. `PartnerShowcase` rather than `IntegrationGrid`, which is a
 *    wall of adopter logos and a different claim.
 *
 * Its opening section has no title: an intro sentence runs INTO two boxes,
 * then a closing paragraph and the diagram. They are one section here, under
 * one eyebrow, because the copy is one thought.
 *
 * On the master since #227: a split hero, ruled sections with a bracketed
 * eyebrow and a left-aligned heading, and the shared closing block.
 *
 * Japanese is `placeholder` — its legacy content is byte-for-byte the English
 * page — while Korean is a real translation. Same split as dTWAP and dLIMIT.
 */
export async function LiquidityHubPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.liquidityHub' })
  const devDocs = await getDevDocsLink('liquidityHub', locale)

  return (
    <>
      {/* No primary call to action: the legacy header declares no button. */}
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        secondaryCta={devDocs}
        graphic={HERO_GRAPHICS.liquidityHub}
        locale={locale}
      />

      <DividedSection eyebrow={t('sources.eyebrow')} intro={t('sources.intro')} locale={locale}>
        {/* `h2`: the section has no heading, so the boxes are its top level. */}
        <PlainCards
          headingLevel="h2"
          cards={LIQUIDITY_HUB_SOURCES.map((id) => ({
            id,
            title: t(`sources.items.${id}.title`),
            body: t(`sources.items.${id}.body`),
          }))}
          locale={locale}
        />
        <Prose
          text={t('fallback.body')}
          locale={locale}
          className="mt-16 max-w-3xl lg:mt-24 [&_p]:text-p [&_p]:text-fg"
        />
        <Image
          src={LIQUIDITY_HUB_DIAGRAM.src}
          alt={t('fallback.alt')}
          lang={textLang(t('fallback.alt'), locale)}
          width={LIQUIDITY_HUB_DIAGRAM.width}
          height={LIQUIDITY_HUB_DIAGRAM.height}
          sizes="(min-width: 1024px) 896px, 100vw"
          className="mt-12 h-auto w-full max-w-4xl"
        />
      </DividedSection>

      <DividedSection eyebrow={t('benefits.eyebrow')} heading={t('benefits.title')} locale={locale}>
        <PlainCards
          columns={3}
          cards={LIQUIDITY_HUB_BENEFITS.map((id) => ({
            id,
            title: t(`benefits.items.${id}.title`),
            body: t(`benefits.items.${id}.body`),
          }))}
          locale={locale}
        />
      </DividedSection>

      <DividedSection
        eyebrow={t('audiences.eyebrow')}
        heading={t('audiences.title')}
        intro={t('audiences.intro')}
        locale={locale}
      >
        <AudienceColumns
          columns={LIQUIDITY_HUB_AUDIENCES.map((id) => ({
            id,
            title: t(`audiences.items.${id}.title`),
            // One string per line, so a translator edits a list rather than
            // counting keys — the items are short labels, not prose.
            items: t(`audiences.items.${id}.list`).split('\n').filter(Boolean),
          }))}
          locale={locale}
        />
      </DividedSection>

      <DividedSection eyebrow={t('partners.eyebrow')} heading={t('partners.title')} locale={locale}>
        <PartnerShowcase
          partners={LIQUIDITY_HUB_PARTNERS.map((partner) => ({
            ...partner,
            subtitle: t(`partners.items.${partner.id}.subtitle`),
            items: t(`partners.items.${partner.id}.list`).split('\n').filter(Boolean),
            cta: t(`partners.items.${partner.id}.cta`),
          }))}
          locale={locale}
        />
      </DividedSection>

      <DividedSection
        eyebrow={t('decentralization.eyebrow')}
        heading={t('decentralization.title')}
        intro={t('decentralization.body')}
        locale={locale}
      >
        <CtaButton
          link={{ label: t('decentralization.terms'), href: LIQUIDITY_HUB_LINKS.terms.href }}
          locale={locale}
          variant="secondary"
        />
      </DividedSection>

      <InnerClosingCta locale={locale} />
    </>
  )
}

/**
 * Who benefits, one column per audience, each a short list.
 *
 * Page-local rather than `BenefitColumns`: that component centres everything
 * and is still used by pages on the legacy layout. These are the master's
 * rule-topped columns, start-aligned. Real `<ul>`s, with `lang` per item —
 * the Korean page mixes translated and English lines within one list.
 */
function AudienceColumns({
  columns,
  locale,
}: {
  columns: readonly { id: string; title: string; items: readonly string[] }[]
  locale: Locale
}) {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
      {columns.map((column) => (
        <div key={column.id} className="border-t border-border pt-6">
          <H3 weight="medium" lang={textLang(column.title, locale)}>
            {column.title}
          </H3>
          <ul className="mt-6 space-y-3 text-p text-fg-muted">
            {column.items.map((item) => (
              <li key={item} lang={textLang(item, locale)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { GithubIcon, TelegramIcon } from '@/components/icons'
import { DividedSection, PlainCards } from '@/components/marketing/divided-section'
import { IntegrationGrid } from '@/components/marketing/integration-grid'
import { IntegrationTabs } from '@/components/marketing/integration-tabs'
import { IconLink } from '@/components/marketing/product-hero'
import { CtaButton } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { Walkthrough } from '@/components/marketing/walkthrough'
import { PRODUCT_SNIPPETS } from '@/content/pages/product-snippets'
import {
  DTWAP_BENEFITS,
  DTWAP_HERO,
  DTWAP_INTEGRATIONS,
  DTWAP_LINKS,
  DTWAP_SCHEMA_IMAGE,
  DTWAP_SLIDES,
} from '@/content/pages/dtwap'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import type { Locale } from '@/i18n/locales'
import { getDevDocsLink } from './dev-docs'
import { InnerClosingCta } from './inner-closing'

/**
 * The dTWAP page body, rendered by all three locale routes.
 *
 * One component, three routes. Structure and layout live here; every string
 * comes from `pages.dtwap` in the message catalogs and every image path and URL
 * from `src/content/pages/dtwap.ts`. Adding a locale therefore means adding
 * catalog entries and one `AVAILABILITY` line — this file does not change.
 *
 * `getTranslations({locale})` takes the locale explicitly for the same reason
 * the header does: there is no `[locale]` segment for next-intl to infer from.
 *
 * `textLang` (inside each section component) marks copy that is still English
 * inside a Japanese or Korean document. Japanese is the case that matters
 * today — its legacy page is English throughout — and the marking disappears
 * on its own if real Japanese copy is ever added, because it is decided from
 * the rendered string.
 *
 * On the master since #227: a split hero, then ruled sections with a bracketed
 * eyebrow and a left-aligned heading, and the shared closing block. The legacy
 * blocks (integrations, walkthrough, code tabs) render `bare` inside them.
 */
export async function DtwapPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.dtwap' })
  const devDocs = await getDevDocsLink('dtwap', locale)

  // An empty label means that locale's legacy page has no such link: the
  // Japanese and Korean FAQ entries are blank on purpose.
  const schemaLinks = [
    { label: t('schema.whitePaper'), href: DTWAP_LINKS.whitePaper },
    { label: t('schema.audit'), href: DTWAP_LINKS.audit },
    { label: t('schema.faq'), href: DTWAP_LINKS.faq },
  ].filter((link) => link.label.trim() !== '')

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: DTWAP_HERO.ctaHref }}
        secondaryCta={devDocs}
        actions={
          <>
            <IconLink
              href={DTWAP_HERO.repo}
              label="GitHub repository"
              icon={<GithubIcon className="size-5" aria-hidden focusable="false" />}
            />
            <IconLink
              href={DTWAP_HERO.telegram}
              label="Telegram support group"
              icon={<TelegramIcon className="size-5" aria-hidden focusable="false" />}
            />
          </>
        }
        graphic={HERO_GRAPHICS.dtwap}
        locale={locale}
      />

      <DividedSection
        eyebrow={t('benefits.eyebrow')}
        heading={t('benefits.title')}
        intro={t('benefits.intro')}
        locale={locale}
      >
        <PlainCards
          cards={DTWAP_BENEFITS.map((id) => ({
            id,
            title: t(`benefits.items.${id}.title`),
            body: t(`benefits.items.${id}.body`),
          }))}
          locale={locale}
        />
      </DividedSection>

      {/* Target of the hero's call to action. */}
      <DividedSection
        id={DTWAP_HERO.ctaHref.slice(1)}
        eyebrow={t('integrations.eyebrow')}
        heading={t('integrations.title')}
        locale={locale}
      >
        <IntegrationGrid
          bare
          title={t('integrations.title')}
          integrateTitle={t('integrations.integrateTitle')}
          integrateCta={t('integrations.integrateCta')}
          integrateHref={DTWAP_LINKS.integrationGuide}
          integrations={DTWAP_INTEGRATIONS}
          locale={locale}
        />
      </DividedSection>

      <DividedSection eyebrow={t('explanation.eyebrow')} heading={t('explanation.title')} locale={locale}>
        <Walkthrough
          bare
          title={t('explanation.title')}
          steps={DTWAP_SLIDES.map((slide) => ({
            ...slide,
            caption: t(`explanation.slides.${slide.id}`),
          }))}
          locale={locale}
        />
      </DividedSection>

      <DividedSection eyebrow={t('code.eyebrow')} heading={t('code.title')} locale={locale}>
        <IntegrationTabs
          bare
          title={t('code.title')}
          tabs={[
            {
              id: 'react',
              label: t('code.reactTab'),
              body: t('code.reactBody'),
              code: PRODUCT_SNIPPETS.dtwap.react,
            },
            {
              id: 'styles',
              label: t('code.stylesTab'),
              body: t('code.stylesBody'),
              code: PRODUCT_SNIPPETS.dtwap.styles,
            },
          ]}
          copyLabels={{ copy: t('code.copy'), copied: t('code.copied') }}
          locale={locale}
        />
      </DividedSection>

      <DividedSection
        eyebrow={t('schema.eyebrow')}
        heading={t('schema.title')}
        intro={t('schema.body')}
        locale={locale}
      >
        {/* Decorative: it draws the maker/taker flow the prose above sets out in full. */}
        <Image
          src={DTWAP_SCHEMA_IMAGE.src}
          alt=""
          width={DTWAP_SCHEMA_IMAGE.width}
          height={DTWAP_SCHEMA_IMAGE.height}
          sizes="(min-width: 1024px) 896px, 100vw"
          className="h-auto w-full max-w-4xl"
        />
        <div className="mt-12 flex flex-wrap gap-4">
          {schemaLinks.map((link) => (
            <CtaButton key={link.href} link={link} locale={locale} variant="secondary" />
          ))}
        </div>
      </DividedSection>

      <InnerClosingCta locale={locale} />
    </>
  )
}

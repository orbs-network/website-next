import { getTranslations } from 'next-intl/server'
import { ArchitectureSection } from '@/components/marketing/architecture-section'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { ProductHero } from '@/components/marketing/product-hero'
import { OVERVIEW_BENEFITS, OVERVIEW_PRODUCTS } from '@/content/pages/overview'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Orbs Overview page — what the network is, rendered by all three locales.
 *
 * Seven sections, composed from the existing library rather than new
 * components: the legacy page's bespoke `partials/network/FlexSection*` layouts
 * are a hero, two explanatory blocks, a pain/solution pair, a product grid, a
 * mission statement and three benefits. Every one of those already has a shape
 * here.
 *
 * Every string is tagged individually with `textLang`. Japanese is a PARTIAL
 * translation — `jp/overview/md/why-section.md` is an empty file — so those
 * strings fall back to English inside a `lang="ja"` document and have to say so
 * one by one. Deriving a single language for the page is the mistake #103
 * tracks, and this is the first page where it would visibly bite.
 */
export async function OverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.overview' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      {/*
        `headlineLang` is stated outright rather than left to `textLang`.

        `textLang` returns undefined when a string matches its locale, which is
        right for a page where everything agrees — but `ProductHero` puts `lang`
        on the wrapper from the INTRO, so an in-language headline beside an
        English intro inherits `lang="en"` and is announced with English rules.
        Falling back to `locale` means the h1 always declares its own language
        instead of borrowing its neighbour's.
      */}
      <ProductHero
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        headlineLang={lang('hero.headline') ?? locale}
        lang={lang('hero.intro')}
      />

      <ArchitectureSection
        title={t('what.title')}
        body={t('what.body')}
        titleLang={lang('what.title')}
        lang={lang('what.body')}
      />

      {/*
        Pain and solution as a two-card grid. They are a matched pair in the
        legacy layout — the same shape, side by side — and separating them into
        two prose sections would lose the comparison that is the point of them.
      */}
      <FeatureGrid
        features={[
          {
            id: 'challenge',
            title: t('challenge.title'),
            body: `**${t('challenge.eyebrow')}**\n\n${t('challenge.body')}`,
          },
          {
            id: 'solution',
            title: t('solution.title'),
            body: `**${t('solution.eyebrow')}**\n\n${t('solution.body')}`,
          },
        ]}
        lang={lang('challenge.body')}
      />

      <ArchitectureSection
        eyebrow={t('tech.eyebrow')}
        title={t('tech.title')}
        body={t('tech.body')}
        titleLang={lang('tech.title')}
        lang={lang('tech.body')}
      />

      <FeatureGrid
        title={t('products.title')}
        titleLang={lang('products.title')}
        features={OVERVIEW_PRODUCTS.map((product) => ({
          id: product.id,
          icon: product.icon,
          href: resolveLocaleLink({ href: product.href }, locale).href,
          title: t(`products.items.${product.id}.title`),
          // Product names, English in every locale — so they must say so, or a
          // Korean section announces "dTWAP" with Korean rules.
          titleLang: textLang(t(`products.items.${product.id}.title`), locale),
          body: t(`products.items.${product.id}.body`),
        }))}
        lang={lang('products.items.dtwap.body')}
      />

      <ArchitectureSection
        title={t('why.title')}
        body={t('why.body')}
        titleLang={lang('why.title')}
        lang={lang('why.body')}
      />

      <ArchitectureSection
        title={t('why.howTitle')}
        body={t('why.howBody')}
        titleLang={lang('why.howTitle')}
        lang={lang('why.howBody')}
      />

      {/*
        `title`, not `eyebrow`. Mission is a standalone section, and as an
        eyebrow it rendered as a small <p> label — absent from the heading
        outline, so nothing in the document structure marked where it began.
      */}
      <ArchitectureSection
        title={t('mission.title')}
        body={t('mission.body')}
        titleLang={lang('mission.title')}
        lang={lang('mission.body')}
      />

      <FeatureGrid
        title={t('benefits.title')}
        intro={t('benefits.intro')}
        titleLang={lang('benefits.title')}
        features={OVERVIEW_BENEFITS.map((benefit) => ({
          id: benefit.id,
          icon: benefit.icon,
          title: t(`benefits.items.${benefit.id}.title`),
          body: t(`benefits.items.${benefit.id}.body`),
        }))}
        lang={lang('benefits.items.access.body')}
      />
    </>
  )
}

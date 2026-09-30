import { getTranslations } from 'next-intl/server'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
import { InnerSection, PointColumns } from '@/components/marketing/inner-section'
import { ModuleCards } from '@/components/marketing/module-cards'
import { CtaButton, Eyebrow } from '@/components/marketing/section-parts'
import { SplitHero } from '@/components/marketing/split-hero'
import { SplitStatement } from '@/components/marketing/split-statement'
import { HOME_LINKS } from '@/content/pages/home'
import {
  OVERVIEW_BENEFITS,
  OVERVIEW_LINKS,
  OVERVIEW_MARQUEE,
  OVERVIEW_PRODUCTS,
  type OverviewProductId,
} from '@/content/pages/overview'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import type { Locale } from '@/i18n/locales'

/**
 * Each protocol's colour, as on dSPOT (see `MODULE_PRESENTATION` there).
 */
const PRODUCT_PRESENTATION: Record<OverviewProductId, { accentClassName: string; titleClassName?: string }> = {
  dtwap: { accentClassName: 'text-periwinkle-600 dark:text-periwinkle-400' },
  dlimit: { accentClassName: 'text-indigo-400' },
  liquidityHub: { accentClassName: 'text-cyan-600 dark:text-cyan-400', titleClassName: 'uppercase' },
  perpetualHub: { accentClassName: 'text-pink-600 dark:text-pink-400' },
}

/**
 * The Orbs Overview page — what the network is, rendered by all three locales.
 *
 * On the inner-page MASTER's sections (#227): split hero, a rule and bracketed
 * eyebrow on every section, left-aligned headings, borderless cards, and the
 * shared closing block. The four protocols use dSPOT's card row, so they now
 * link on the same "Discover" pattern as everywhere else.
 *
 * Every string is tagged individually with `textLang`. Japanese is a PARTIAL
 * translation — `jp/overview/md/why-section.md` is an empty file — so those
 * strings fall back to English inside a `lang="ja"` document and have to say so
 * one by one. Deriving a single language for the page is the mistake #103
 * tracks. The product lockups carry theirs on a wrapper, because the names are
 * English in every catalog.
 */
export async function OverviewPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.overview' })

  return (
    <>
      <SplitHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: OVERVIEW_LINKS.protocols }}
        graphic={HERO_GRAPHICS.overview}
        locale={locale}
      />

      <SplitStatement eyebrow={t('what.eyebrow')} heading={t('what.title')} body={t('what.body')} locale={locale} />

      {/*
        Pain and solution side by side: a matched pair, and splitting them into
        two sections would lose the comparison that is the point of them. No
        section heading, so each column's title is the `h2`.
      */}
      <section className="container border-t border-border pt-3 pb-section">
        <PointColumns
          columns={2}
          headingLevel="h2"
          ruled={false}
          points={(['challenge', 'solution'] as const).map((id) => ({
            id,
            label: t(`${id}.eyebrow`),
            title: t(`${id}.title`),
            body: t(`${id}.body`),
          }))}
          locale={locale}
        />
      </section>

      {/*
        The tech explainer introduces the protocols, so it is their card row's
        lead rather than a section of its own. Its heading, "Layer 3 Technology
        Stack", is the solution column's title word for word, so the row keeps
        the products heading instead.
      */}
      <ModuleCards
        id={OVERVIEW_LINKS.protocols.slice(1)}
        eyebrow={t('tech.eyebrow')}
        heading={t('products.title')}
        body={t('tech.body')}
        cards={OVERVIEW_PRODUCTS.map((product) => {
          const name = t(`products.items.${product.id}.title`)
          return {
            id: product.id,
            eyebrow: name,
            title: name,
            ...PRODUCT_PRESENTATION[product.id],
            body: t(`products.items.${product.id}.body`),
            link: { label: t('products.cta', { name }), href: product.href },
          }
        })}
        locale={locale}
      />

      {/* Why, how and mission are three short answers to one question, so one section. */}
      <section className="container border-t border-border pt-3 pb-section">
        <Eyebrow text={t('mission.eyebrow')} locale={locale} />
        <PointColumns
          columns={3}
          headingLevel="h2"
          className="mt-12 lg:mt-24"
          points={[
            { id: 'why', title: t('why.title'), body: t('why.body') },
            { id: 'how', title: t('why.howTitle'), body: t('why.howBody') },
            { id: 'mission', title: t('mission.title'), body: t('mission.body') },
          ]}
          locale={locale}
        />
      </section>

      <InnerSection
        eyebrow={t('benefits.eyebrow')}
        heading={t('benefits.title')}
        intro={t('benefits.intro')}
        layout="stacked"
        locale={locale}
      >
        <PointColumns
          columns={3}
          points={OVERVIEW_BENEFITS.map((id) => ({
            id,
            title: t(`benefits.items.${id}.title`),
            body: t(`benefits.items.${id}.body`),
          }))}
          locale={locale}
        />
      </InnerSection>

      <ClosingCta
        phrases={OVERVIEW_MARQUEE.map((id) => t(`marquee.${id}`))}
        locale={locale}
        actions={
          <>
            <ClosingSocialButtons
              follow={t('closing.follow')}
              community={t('closing.community')}
              x={HOME_LINKS.x}
              telegram={HOME_LINKS.telegram}
              locale={locale}
            />
            <CtaButton link={{ label: t('closing.contact'), href: OVERVIEW_LINKS.contact }} locale={locale} />
          </>
        }
      />
    </>
  )
}

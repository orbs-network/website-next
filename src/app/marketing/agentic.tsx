import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H1, H3 } from '@/app/components/typography'
import { GithubIcon } from '@/components/icons'
import { DividedSection, PlainCards } from '@/components/marketing/divided-section'
import { Prose } from '@/components/marketing/prose'
import { CtaButton, Eyebrow, ThemedGraphic } from '@/components/marketing/section-parts'
import { SplitStatement } from '@/components/marketing/split-statement'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { getDevDocsLink } from './dev-docs'
import { InnerClosingCta } from './inner-closing'
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
 * On the inner-page master (#227): every section opens with a rule and a
 * bracketed eyebrow, headings sit left, cards are flat, and the page closes on
 * the shared closing block. The copy is the legacy page's, unchanged; only the
 * eyebrows are new.
 *
 * The verification flow is `SplitStatement`'s numbered points — the master's
 * `04` — because those four steps only mean anything in order.
 *
 * No Japanese: `content/jp/agentic` does not exist. Korean is a real
 * translation; the eyebrows stay English there, marked per string by
 * `textLang`.
 */
export async function AgenticPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.agentic' })
  const devDocs = await getDevDocsLink('agentic', locale)
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <AgenticHero
        eyebrow={t('eyebrows.hero')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        cta={{ label: t('hero.cta'), href: AGENTIC_HERO.getStarted.href }}
        devDocs={devDocs}
        locale={locale}
      />

      {/* The legacy intro sentence is the section's claim, so it is the heading. */}
      <DividedSection eyebrow={t('eyebrows.breaks')} heading={t('breaks.intro')} locale={locale}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {AGENTIC_BREAKS.map((card) => (
            <li key={card.id} className="flex flex-col bg-surface p-6 lg:p-8">
              {/* Decorative: the heading beneath names the same thing. */}
              <Image src={card.icon} alt="" width={48} height={48} className="size-12" />
              <H3 className="mt-10" weight="medium" lang={lang(`breaks.items.${card.id}.title`)}>
                {t(`breaks.items.${card.id}.title`)}
              </H3>
              <Prose text={t(`breaks.items.${card.id}.body`)} locale={locale} className="mt-6 [&_p]:text-fg" />
            </li>
          ))}
        </ul>
      </DividedSection>

      <DividedSection eyebrow={t('eyebrows.tools')} heading={t('tools.title')} intro={t('tools.intro')} locale={locale}>
        <PlainCards
          cards={AGENTIC_TOOLS.map((id) => ({
            id,
            title: t(`tools.items.${id}.title`),
            body: t(`tools.items.${id}.body`),
          }))}
          locale={locale}
        />
      </DividedSection>

      <DividedSection eyebrow={t('eyebrows.chains')} heading={t('chains.title')} locale={locale}>
        {/*
          Left-aligned like the master's `09` strip, rather than `LogoRow`'s
          centred cluster. Chain names are proper nouns, English in every
          locale, so each carries its own `lang`.
        */}
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-8">
          {AGENTIC_CHAINS.map((chain) => (
            <li key={chain.name} className="flex items-center gap-3">
              {chain.logo && (
                <Image
                  src={chain.logo.src}
                  alt=""
                  width={chain.logo.width}
                  height={chain.logo.height}
                  // Rendered 32px high; without `sizes` next/image fetches the
                  // intrinsic width (up to 1800px) for each mark.
                  sizes="2rem"
                  className="size-8 object-contain"
                />
              )}
              <span
                className="text-detail font-medium uppercase tracking-wide text-fg-muted"
                lang={textLang(chain.name, locale)}
              >
                {chain.name}
              </span>
            </li>
          ))}
        </ul>
      </DividedSection>

      <SplitStatement
        eyebrow={t('eyebrows.oracle')}
        heading={t('oracle.title')}
        body={t('oracle.statement')}
        points={AGENTIC_ORACLE_STEPS.map((id) => t(`oracle.steps.${id}`))}
        locale={locale}
      />

      <DividedSection eyebrow={t('eyebrows.architecture')} heading={t('architecture.title')} locale={locale}>
        {/* The alt IS the content here: the diagram is the section. */}
        <Image
          src={AGENTIC_DIAGRAM.src}
          alt={t('architecture.alt')}
          lang={lang('architecture.alt')}
          width={AGENTIC_DIAGRAM.width}
          height={AGENTIC_DIAGRAM.height}
          sizes="(min-width: 1440px) 1374px, 100vw"
          className="h-auto w-full"
        />
      </DividedSection>

      <DividedSection
        eyebrow={t('eyebrows.poweredBy')}
        heading={t('poweredBy.title')}
        intro={t('poweredBy.body')}
        locale={locale}
      />

      <DividedSection eyebrow={t('eyebrows.getStarted')} heading={t('getStarted.title')} locale={locale}>
        {/*
          Calls to action, not descriptions: each card is a link. The title is
          the anchor, stretched over the card by `after:absolute`, so the whole
          tile is the hit area while the accessible name stays the title alone.
        */}
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {AGENTIC_GET_STARTED.map((card) => {
            const { href, external } = resolveLocaleLink({ href: card.href }, locale)
            const linkClassName =
              'after:absolute after:inset-0 transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            const title = t(`getStarted.items.${card.id}.title`)

            return (
              <li key={card.id} className="relative flex flex-col bg-surface p-6 lg:p-8">
                <H3 weight="medium" lang={textLang(title, locale)}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                      {title}
                    </a>
                  ) : (
                    <Link href={href} className={linkClassName}>
                      {title}
                    </Link>
                  )}
                </H3>
                <Prose text={t(`getStarted.items.${card.id}.body`)} locale={locale} className="mt-6 [&_p]:text-fg" />
                <span aria-hidden="true" className="mt-auto pt-10 text-p">
                  &rarr;
                </span>
              </li>
            )
          })}
        </ul>
      </DividedSection>

      {/* A risk disclosure, so it stays on the page body rather than in the closing block. */}
      <section className="container border-t border-border py-12">
        <Prose text={t('disclaimer')} locale={locale} className="max-w-3xl [&_p]:text-detail [&_p]:italic" />
      </section>

      <InnerClosingCta locale={locale} />
    </>
  )
}

/**
 * The master's `01` hero: graphic left, text right.
 *
 * Page-local rather than `SplitHero` because the intro is three authored
 * paragraphs (a bare `<p>` would run them together) and the legacy hero also
 * carries a GitHub link. Text first on a phone, where a screenful of
 * decorative art before the title helps no one.
 */
function AgenticHero({
  eyebrow,
  headline,
  intro,
  cta,
  devDocs,
  locale,
}: {
  eyebrow: string
  headline: string
  intro: string
  cta: { label: string; href: string }
  devDocs: { label: string; href: string }
  locale: Locale
}) {
  return (
    <section className="container pt-16 pb-section lg:flex lg:min-h-[810px] lg:items-center lg:py-14">
      <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div>
          <Eyebrow text={eyebrow} locale={locale} />
          <H1 className="mt-3 text-balance" lang={textLang(headline, locale)}>
            {headline}
          </H1>
          <Prose text={intro} locale={locale} className="mt-10 max-w-xl [&_p]:text-p [&_p]:text-fg" />
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <CtaButton link={cta} locale={locale} />
            <CtaButton link={devDocs} locale={locale} variant="secondary" />
            <a
              href={AGENTIC_HERO.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              // English in every locale: it names a product.
              lang="en"
              className="inline-flex size-[2.625rem] items-center justify-center border border-border text-fg transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {/* Hidden: the anchor carries the name, and the icon sets its own. */}
              <GithubIcon className="size-5" aria-hidden focusable="false" />
            </a>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md lg:order-first lg:max-w-none">
          {/* `priority`: the largest thing above the fold on a wide screen, so the LCP candidate. */}
          <ThemedGraphic
            graphic={HERO_GRAPHICS.agentic}
            priority
            sizes="(min-width: 1024px) 50vw, 28rem"
            className="size-full object-contain"
          />
        </div>
      </div>
    </section>
  )
}

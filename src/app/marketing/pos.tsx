import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H1, H2 } from '@/app/components/typography'
import { DividedSection } from '@/components/marketing/divided-section'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { Disclosure } from '@/components/marketing/disclosure'
import { Eyebrow } from '@/components/marketing/section-parts'
import { POS_EXPLAINERS, POS_GRID, POS_LINKS, POS_ROLES } from '@/content/pages/pos'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { InnerClosingCta } from './inner-closing'

/**
 * Orbs Proof of Stake — guardians, delegators, and how the network secures
 * itself.
 *
 * On the inner-page master (#227): a left-aligned hero, then ruled sections
 * each opening on a bracketed eyebrow, and the shared closing block. The
 * content is the legacy page's — two role columns, a captioned shape grid and
 * a run of expandable explainers — with only the eyebrows new.
 *
 * Bodies go through `MarkdownProse`, not `Prose`. The role descriptions and the
 * explainers are markdown LISTS with inline links — `Prose` handles paragraphs
 * and bold only, so rendering them through it printed literal "- " bullets run
 * together in a paragraph and raw `[label](url)` where the links should be.
 *
 * Both locales are real translations (9,478 and 7,718 non-Latin characters), so
 * most strings need no `lang`. The link labels and the eyebrows do: they are
 * English in every catalog.
 */
export async function PosPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.pos' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      {/*
        The master's `01` hero without its graphic: this page has no hero
        illustration, and an empty half-width slot reads as one that failed to
        load. So the text column takes the width instead.
      */}
      <section className="container pt-16 pb-section lg:pt-24">
        <Eyebrow text={t('eyebrows.hero')} locale={locale} />
        <H1 className="mt-3 max-w-5xl whitespace-pre-line text-balance" lang={lang('hero.headline')}>
          {t('hero.headline')}
        </H1>
        <p className="mt-10 max-w-2xl text-p text-fg" lang={lang('hero.intro')}>
          {t('hero.intro')}
        </p>
      </section>

      <DividedSection eyebrow={t('eyebrows.roles')} locale={locale}>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-32">
          {POS_ROLES.map((role) => (
            <article key={role.id} lang={lang(`roles.${role.id}.body`)}>
              {/* Decorative: the heading below names the role. */}
              <Image src={role.image} alt="" width={96} height={96} sizes="96px" className="h-24 w-auto" />

              <H2 className="mt-6" lang={lang(`roles.${role.id}.title`)}>
                {t(`roles.${role.id}.title`)}
              </H2>

              <p className="mt-6 text-p text-fg">{t(`roles.${role.id}.subtitle`)}</p>

              <div className="mt-6">
                <MarkdownProse>{t(`roles.${role.id}.body`)}</MarkdownProse>
              </div>

              <a
                href={role.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
              >
                {t(`roles.${role.id}.linkText`)}
              </a>
            </article>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3">
          {POS_LINKS.map((link) => (
            <Link
              key={link.id}
              href={resolveLocaleLink({ href: link.href }, locale).href}
              // English in every catalog: the legacy content never translated
              // these two labels.
              lang={lang(`links.${link.id}`)}
              className="text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
            >
              {t(`links.${link.id}`)}
            </Link>
          ))}
        </div>
      </DividedSection>

      <DividedSection eyebrow={t('eyebrows.v3')} heading={t('items.item9.title')} locale={locale}>
        {/*
          Text left, the shape grid right: the master's `06` text-plus-graphic
          split, with the captioned shapes standing in for the graphic.
        */}
        <div className="grid gap-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-32">
          <div lang={lang('items.item9.body')}>
            <MarkdownProse>{t('items.item9.body')}</MarkdownProse>
          </div>

          <ul className="grid grid-cols-2 gap-6">
            {POS_GRID.map((shape) => (
              <li key={shape.id} className="flex flex-col items-center gap-3 bg-surface p-6 text-center">
                <Image src={shape.image} alt="" width={64} height={64} sizes="64px" className="size-16" />
                <span className="text-detail text-fg-muted" lang={lang(`grid.${shape.id}`)}>
                  {t(`grid.${shape.id}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </DividedSection>

      <DividedSection eyebrow={t('eyebrows.explainers')} locale={locale}>
        {/*
          In the right-hand column of the master's split, so the list lines up
          with the body text of the sections above rather than floating centred.
        */}
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-32">
          <div className="divide-y divide-border border-y border-border lg:col-start-2">
            {POS_EXPLAINERS.map((id) => (
              <Disclosure key={id} summary={t(`items.${id}.title`)} locale={locale}>
                <div lang={lang(`items.${id}.body`)} className="space-y-4">
                  <MarkdownProse>{t(`items.${id}.body`)}</MarkdownProse>
                  {t(`items.${id}.extra`) && <MarkdownProse>{t(`items.${id}.extra`)}</MarkdownProse>}
                </div>
              </Disclosure>
            ))}
          </div>
        </div>
      </DividedSection>

      <InnerClosingCta locale={locale} />
    </>
  )
}

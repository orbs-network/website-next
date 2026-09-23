import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H2, H3 } from '@/app/components/typography'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { ProductHero } from '@/components/marketing/product-hero'
import { Disclosure } from '@/components/marketing/disclosure'
import { POS_EXPLAINERS, POS_GRID, POS_LINKS, POS_ROLES } from '@/content/pages/pos'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Orbs Proof of Stake — guardians, delegators, and how the network secures
 * itself.
 *
 * The legacy page is five bespoke `partials/pos-universe/*` layouts. What it
 * contains is a hero, two role cards, a captioned shape grid and a run of
 * expandable explainers, so the bespoke layouts are not reproduced — the roles
 * and grid are laid out here, and the explainers reuse `Disclosure`, which is
 * the FAQ's `<details>` pattern lifted out for a second caller.
 *
 * Bodies go through `MarkdownProse`, not `Prose`. The role descriptions and the
 * explainers are markdown LISTS with inline links — `Prose` handles paragraphs
 * and bold only, so rendering them through it printed literal "- " bullets run
 * together in a paragraph and raw `[label](url)` where the links should be.
 *
 * Both locales are real translations (9,478 and 7,718 non-Latin characters), so
 * most strings need no `lang`. The link labels do: they are English in every
 * catalog because the legacy content never translated them.
 */
export async function PosPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.pos' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <ProductHero headline={t('hero.headline')} intro={t('hero.intro')} locale={locale} />

      <section className="container mx-auto px-5 py-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
          {POS_ROLES.map((role) => (
            <article key={role.id} lang={lang(`roles.${role.id}.body`)}>
              {/* Decorative: the heading below names the role. */}
              <Image src={role.image} alt="" width={96} height={96} sizes="96px" className="h-24 w-auto" />

              <H2 className="mt-6" lang={lang(`roles.${role.id}.title`)}>
                {t(`roles.${role.id}.title`)}
              </H2>

              <p className="mt-4 leading-relaxed text-fg-muted">{t(`roles.${role.id}.subtitle`)}</p>

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

        <div className="mx-auto mt-16 flex max-w-5xl flex-wrap gap-x-8 gap-y-3">
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
      </section>

      <section className="container mx-auto px-5 py-20" lang={lang('items.item9.body')}>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <H2 lang={lang('items.item9.title')}>{t('items.item9.title')}</H2>
            <div className="mt-6">
              <MarkdownProse>{t('items.item9.body')}</MarkdownProse>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-6">
            {POS_GRID.map((shape) => (
              <li key={shape.id} className="flex flex-col items-center gap-3 text-center">
                <Image src={shape.image} alt="" width={64} height={64} sizes="64px" className="size-16" />
                <span className="text-detail text-fg-muted">{t(`grid.${shape.id}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20">
        <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
          {POS_EXPLAINERS.map((id) => (
            <Disclosure key={id} summary={t(`items.${id}.title`)} locale={locale}>
              <MarkdownProse>{t(`items.${id}.body`)}</MarkdownProse>
              {t(`items.${id}.extra`) && (
                <div className="mt-4">
                  <MarkdownProse>{t(`items.${id}.extra`)}</MarkdownProse>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </section>
    </>
  )
}

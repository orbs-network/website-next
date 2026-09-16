import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H2, H4 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { ProductHero } from '@/components/marketing/product-hero'
import { SnippetSelector } from '@/components/marketing/snippet-selector'
import {
  TON_ACCESS_CARDS,
  TON_ACCESS_EXAMPLE_ID,
  TON_ACCESS_FLAVORS,
  TON_ACCESS_IMAGES,
  TON_ACCESS_LINKS,
  TON_ACCESS_NETWORKS,
  TON_ACCESS_SNIPPETS,
  TON_ACCESS_VOICES,
} from '@/content/pages/ton-access'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * TON Access — the decentralised RPC gateway for TON dapps.
 *
 * Korean is a real translation: 893 non-Latin characters across
 * `content/ko/ton-access`, covering the hero, all six cards, the schema
 * paragraph and both developer quotes. Japanese is NOT — `content/jp/ton-access`
 * has exactly ONE non-ASCII character in the whole directory, and it is the
 * apostrophe in Shahar's quote. So the Japanese catalog mirrors English and the
 * route is `placeholder`.
 *
 * Korean leaves the six card TITLES in English, so `textLang` marks each one
 * rather than the catalog inventing translations for them.
 */
export async function TonAccessPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.tonAccess' })
  const lang = (key: string) => textLang(t(key), locale)

  const networks = TON_ACCESS_NETWORKS.map((id) => ({ id, label: t(`example.${id}`) }))

  return (
    <>
      <ProductHero
        eyebrow="TON Access"
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        // An in-page jump to the code example, matching the legacy button. The
        // whole point of the page is the snippet; the hero should get you to it.
        ctaHref={`#${TON_ACCESS_EXAMPLE_ID}`}
        image={TON_ACCESS_IMAGES.hero}
        imageAlt=""
        headlineLang={lang('hero.headline') ?? locale}
        lang={lang('hero.intro')}
      />

      <section className="container mx-auto px-5 py-20">
        <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TON_ACCESS_CARDS.map((card) => (
            <li key={card.id} className="flex flex-col rounded-sm border border-border p-6">
              {/* Decorative: the heading beneath names the card. */}
              <Image src={card.image} alt="" width={64} height={64} sizes="64px" className="size-16" />

              {/*
                The titles are English even in the Korean catalog, because they
                are English in the legacy Korean content. Marked per string
                rather than translated here — inventing product-adjacent copy is
                how a "translation" stops matching what the team signed off.
              */}
              <H4 className="mt-6" lang={lang(`cards.${card.id}.title`)}>
                {t(`cards.${card.id}.title`)}
              </H4>

              <p className="mt-3 text-body text-fg" lang={lang(`cards.${card.id}.summary`)}>
                {t(`cards.${card.id}.summary`)}
              </p>

              <p className="mt-3 text-detail text-fg-muted" lang={lang(`cards.${card.id}.body`)}>
                {t(`cards.${card.id}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id={TON_ACCESS_EXAMPLE_ID} className="container mx-auto scroll-mt-24 px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <H2 className="text-balance" lang={lang('example.title')}>
            {t('example.title')}
          </H2>

          <SnippetSelector
            className="mt-10"
            flavors={TON_ACCESS_FLAVORS}
            networks={networks}
            snippets={TON_ACCESS_SNIPPETS}
            labels={{
              flavor: t('example.flavor'),
              library: t('example.library'),
              network: t('example.network'),
              copy: t('example.copy'),
              copied: t('example.copied'),
            }}
          />

          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="secondary">
              <a href={TON_ACCESS_LINKS.github} target="_blank" rel="noopener noreferrer">
                {t('example.github')}
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={TON_ACCESS_LINKS.telegram} target="_blank" rel="noopener noreferrer">
                {t('example.telegram')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20" lang={lang('schema.body')}>
        <div className="mx-auto max-w-4xl">
          <H2 className="text-balance text-center" lang={lang('schema.title')}>
            {t('schema.title')}
          </H2>

          <Image
            src={TON_ACCESS_IMAGES.schema.src}
            alt={t('schema.title')}
            /* Measured with sharp after optimisation, not read off the legacy
               markup: 1800x516. The last page to guess this reserved a 2:1 box
               and shifted every paragraph below it when the file loaded. */
            width={TON_ACCESS_IMAGES.schema.width}
            height={TON_ACCESS_IMAGES.schema.height}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="mt-12 h-auto w-full"
          />

          <div className="mx-auto mt-12 max-w-3xl">
            <MarkdownProse>{t('schema.body')}</MarkdownProse>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <H2 className="text-balance text-center" lang={lang('voices.title')}>
            {t('voices.title')}
          </H2>

          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {TON_ACCESS_VOICES.map((voice) => (
              <li key={voice.id} className="flex flex-col rounded-sm border border-border p-6">
                {/*
                  A blockquote, because it is one. The attribution sits outside
                  it in a `figcaption`: who said something is not part of what
                  they said, and putting the name inside the quote is how a
                  screen reader ends up reading the speaker as part of the
                  sentence.
                */}
                <figure className="flex h-full flex-col">
                  <blockquote className="flex-1 text-body text-fg" lang={lang(`voices.${voice.id}.quote`)}>
                    {t(`voices.${voice.id}.quote`)}
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-4">
                    {/* Decorative: the name is right beside it and is the link. */}
                    <Image
                      src={voice.image.src}
                      alt=""
                      width={voice.image.width}
                      height={voice.image.height}
                      sizes="64px"
                      className="size-16 shrink-0 rounded-full object-cover"
                    />

                    <span className="flex min-w-0 flex-col">
                      <a
                        href={voice.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        // A person's name and Telegram handle. English in any
                        // document, including the Korean one.
                        lang="en"
                        className="text-detail font-medium transition-colors hover:text-link"
                      >
                        {voice.name}
                      </a>
                      <span className="text-detail text-fg-muted" lang={lang(`voices.${voice.id}.role`)}>
                        {t(`voices.${voice.id}.role`)}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

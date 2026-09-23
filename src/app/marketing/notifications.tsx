import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H2, H3 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/marketing/code-block'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { ProductHero } from '@/components/marketing/product-hero'
import { NOTIFICATION_APPS, NOTIFICATION_IMAGES, NOTIFICATION_INTEGRATIONS } from '@/content/pages/notifications'
import { NOTIFICATION_SNIPPET } from '@/content/pages/product-snippets'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The Open DeFi Notification Protocol page.
 *
 * Five sections. The legacy content has a sixth — `projects/` — which is not
 * migrated: its three entries are identical placeholders, all titled "AAVE
 * Project" and all reading "Lorem Upsum text here about project", and the
 * published page does not render them. Verified against the live site.
 *
 * Japanese is `content/jp/notifications` with ZERO non-Latin characters, so it
 * falls back per string and is `placeholder`. Korean is translated, though more
 * thinly than the other pages — 510 non-Latin characters against 7,718 for
 * `/pos` — so `textLang` earns its keep here.
 */
export async function NotificationsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.notifications' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <ProductHero
        eyebrow={t('hero.eyebrow')}
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={NOTIFICATION_APPS.github}
        image={NOTIFICATION_IMAGES.hero}
        imageAlt=""
        locale={locale}
      />

      <section className="container mx-auto px-5 py-20" lang={lang('contribute.title')}>
        <div className="mx-auto max-w-3xl text-center">
          <H2 className="text-balance">{t('contribute.title')}</H2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-sm border border-border p-6">
          <div className="flex items-center gap-4">
            {/* Decorative: the heading beside it names the example. */}
            <Image
              src={NOTIFICATION_IMAGES.example}
              alt=""
              width={48}
              height={48}
              sizes="48px"
              className="size-12 shrink-0"
            />
            <H3 lang={lang('contribute.exampleTitle')}>{t('contribute.exampleTitle')}</H3>
          </div>

          <div className="mt-4" lang={lang('contribute.exampleBody')}>
            <MarkdownProse>{t('contribute.exampleBody')}</MarkdownProse>
          </div>

          {/*
            The sample the prose above is describing. The legacy page fetches it
            from `assets/datasets/notification-snippets.json` and highlights it
            client-side, so the port — which read the React partial, saw
            `code=""` and concluded there was none — shipped an "Aave Example"
            with no example in it. See #167.
          */}
          <CodeBlock
            code={NOTIFICATION_SNIPPET}
            labels={{ copy: t('contribute.copy'), copied: t('contribute.copied') }}
            className="mt-6"
          />
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <a href={NOTIFICATION_APPS.github} target="_blank" rel="noopener noreferrer">
              {t('contribute.cta')}
            </a>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20" lang={lang('integrations.title')}>
        <div className="mx-auto max-w-4xl">
          <H2 className="mb-10 text-balance text-center">{t('integrations.title')}</H2>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {NOTIFICATION_INTEGRATIONS.map((integration) => (
              <li key={integration.id}>
                <a
                  href={integration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col items-center justify-center gap-3 rounded-sm border border-border p-5 text-center transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {/* Decorative: the project name below is the link's label. */}
                  <Image
                    src={integration.image}
                    alt=""
                    width={96}
                    height={40}
                    sizes="96px"
                    className="h-10 w-auto max-w-[6rem] object-contain"
                  />
                  <span className="text-detail font-medium">{integration.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20" lang={lang('schema.body')}>
        <div className="mx-auto max-w-4xl">
          <H2 className="text-balance text-center" lang={lang('schema.title')}>
            {t('schema.title')}
          </H2>

          <Image
            src={NOTIFICATION_IMAGES.schema}
            alt={t('schema.title')}
            /* Measured, not assumed: 1800x1129. Guessing 900 reserved a 2:1
               box that expanded by ~114px when the file loaded, shifting every
               paragraph below it. */
            width={1800}
            height={1129}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="mt-12 h-auto w-full"
          />

          <div className="mx-auto mt-12 max-w-3xl">
            <MarkdownProse>{t('schema.body')}</MarkdownProse>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20" lang={lang('apps.body')}>
        <div className="mx-auto max-w-3xl text-center">
          <H2 className="text-balance" lang={lang('apps.title')}>
            {t('apps.title')}
          </H2>

          <div className="mt-6 text-start">
            <MarkdownProse>{t('apps.body')}</MarkdownProse>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/*
              Text links rather than the stores' badge images. The badges are
              trademarked artwork with their own usage rules, and the legacy page
              linked them as plain anchors too.
            */}
            <Button asChild variant="secondary">
              <a href={NOTIFICATION_APPS.apple} target="_blank" rel="noopener noreferrer">
                App Store
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={NOTIFICATION_APPS.google} target="_blank" rel="noopener noreferrer">
                Google Play
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

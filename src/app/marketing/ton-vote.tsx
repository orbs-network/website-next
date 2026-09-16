import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { H2, H4 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { ProductHero } from '@/components/marketing/product-hero'
import { SlideCarousel } from '@/components/marketing/slide-carousel'
import {
  TON_VOTE_IMAGES,
  TON_VOTE_LINKS,
  TON_VOTE_PARTNERS,
  TON_VOTE_SLIDES,
  TON_VOTE_TOOLS,
} from '@/content/pages/ton-vote'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * TON.Vote — the no-code DAO governance tool.
 *
 * Korean is a real translation: 911 non-Latin characters across
 * `content/ko/ton-vote`, covering the hero, all six tool cards, the slider
 * section and the whole verification passage. Japanese is not —
 * `content/jp/ton-vote` has 13 non-ASCII characters, exactly the 13 the English
 * directory has, and they are curly quotes. So the Japanese catalog mirrors
 * English and the route is `placeholder`.
 *
 * The white-paper button goes through `localeHref` to the route that already
 * exists for this slug, rather than the legacy hardcoded
 * `https://www.orbs.com/white-papers/ton-vote/`. One fewer self-referential
 * absolute URL to unpick at the DNS cutover.
 */
export async function TonVotePage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.tonVote' })
  const lang = (key: string) => textLang(t(key), locale)

  return (
    <>
      <ProductHero
        eyebrow="TON.Vote"
        headline={t('hero.headline')}
        intro={t('hero.intro')}
        ctaLabel={t('hero.cta')}
        ctaHref={TON_VOTE_LINKS.app}
        // Through `localeHref` to the white-paper route that already exists for
        // this slug, rather than the legacy hardcoded
        // `https://www.orbs.com/white-papers/ton-vote/`.
        secondaryCtaLabel={t('hero.whitePaper')}
        secondaryCtaHref={localeHref(TON_VOTE_LINKS.whitePaper, locale)}
        repo={TON_VOTE_LINKS.github}
        telegram={TON_VOTE_LINKS.telegram}
        image={TON_VOTE_IMAGES.hero}
        imageAlt=""
        headlineLang={lang('hero.headline') ?? locale}
        lang={lang('hero.intro')}
      />

      <section className="container mx-auto px-5 py-20">
        <H2 className="mx-auto max-w-3xl text-balance text-center" lang={lang('tools.title')}>
          {t('tools.title')}
        </H2>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TON_VOTE_TOOLS.map((tool) => (
            <li key={tool.id} className="flex flex-col rounded-sm border border-border p-6">
              {/* Decorative: the heading beneath names the feature. */}
              <Image src={tool.image} alt="" width={64} height={64} sizes="64px" className="size-16" />

              <H4 className="mt-6 text-balance" lang={lang(`tools.${tool.id}.title`)}>
                {t(`tools.${tool.id}.title`)}
              </H4>

              <p className="mt-3 text-detail text-fg-muted" lang={lang(`tools.${tool.id}.body`)}>
                {t(`tools.${tool.id}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container mx-auto px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <H2 className="text-balance text-center" lang={lang('slider.title')}>
            {t('slider.title')}
          </H2>

          <p className="mx-auto mt-5 max-w-2xl text-center text-body text-fg-muted" lang={lang('slider.intro')}>
            {t('slider.intro')}
          </p>

          <SlideCarousel
            className="mt-12"
            label={t('slider.title')}
            /*
              Every label resolved here, because `SlideCarousel` is a client
              component: a `(index) => string` prop does not cross the boundary
              and React rejects it at render with "Functions cannot be passed
              directly to Client Components". `tsc` had nothing to say.
            */
            slides={TON_VOTE_SLIDES.map((slide, index) => ({
              id: slide.id,
              caption: t(`slider.slides.${slide.id}`),
              captionLang: lang(`slider.slides.${slide.id}`),
              label: t('slider.slideLabel', { number: index + 1 }),
              image: slide.image,
            }))}
          />

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild>
              <a href={TON_VOTE_LINKS.app} target="_blank" rel="noopener noreferrer" lang={lang('slider.cta')}>
                {t('slider.cta')}
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a
                href={TON_VOTE_LINKS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                lang={lang('slider.telegram')}
              >
                {t('slider.telegram')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-5 py-20">
        <H2 className="text-balance text-center" lang={lang('partners.title')}>
          {t('partners.title')}
        </H2>

        <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
          {TON_VOTE_PARTNERS.map((partner) => (
            <li key={partner.name}>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col items-center justify-center gap-3 rounded-sm border border-border p-6 text-center transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {/*
                  Decorative: the project name below is the link's label. The
                  logos are six different aspect ratios — one is 894x726 against
                  five squares — so a fixed box with `object-contain` rather than
                  a size that would distort five of them.
                */}
                <Image
                  src={partner.image.src}
                  alt=""
                  width={partner.image.width}
                  height={partner.image.height}
                  sizes="64px"
                  className="size-16 object-contain"
                />
                {/* Project names. English in any document, including Korean. */}
                <span lang="en" className="text-detail font-medium">
                  {partner.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="container mx-auto px-5 py-20" lang={lang('verification.body')}>
        <div className="mx-auto max-w-3xl">
          <H2 className="text-balance text-center" lang={lang('verification.title')}>
            {t('verification.title')}
          </H2>

          <div className="mt-10">
            <MarkdownProse>{t('verification.body')}</MarkdownProse>
          </div>
        </div>
      </section>
    </>
  )
}

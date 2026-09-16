import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H1, H2, H4 } from '@/app/components/typography'
import { Button } from '@/components/ui/button'
import { CardRail } from '@/components/marketing/card-rail'
import { FeatureTabs } from '@/components/marketing/feature-tabs'
import { LogoRow } from '@/components/marketing/logo-row'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { Marquee } from '@/components/marketing/marquee'
import { SectionBackdrop } from '@/components/marketing/section-backdrop'
import { StatsRow } from '@/components/marketing/stats-row'
import { getAssetUrl, getAuthorInfo, getRecentPosts, type BlogPostFields } from '@/app/lib/api'
import {
  HOME_DISCOVER,
  HOME_FEATURES,
  HOME_IMAGES,
  HOME_LINKS,
  HOME_MARQUEE,
  HOME_NEWS_COUNT,
  HOME_SOLUTIONS,
  HOME_STACK,
  HOME_STATS,
  HOME_VENUES,
  type HomeCard,
} from '@/content/pages/home'
import { postPath } from '@/app/lib/routes'
import { readingMinutes } from '@/lib/reading-time'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The home page, design 3.4.
 *
 * All-new copy — none of it exists in the legacy site in any language — so
 * Japanese and Korean mirror English and both routes stay `placeholder`, which
 * is what they already were. `textLang` marks each string English inside those
 * documents rather than a single `lang` on the page.
 *
 * Several destinations are not built yet (`/dspot`, `/dperps`, `/venues`,
 * `/ai-agents`). They are in `link-integrity.test.ts`'s `PENDING`, so the guard
 * knows and will fail the moment one ships without its line being removed.
 *
 * NOT in this page, deliberately:
 *
 *  - **The newsletter block.** The design places a name and email signup here.
 *    There is no list behind it — the legacy endpoint has returned 404 for
 *    years — and shipping a form with no destination is precisely the bug the
 *    contact form fixed. It lands when #145 is decided.
 *  - **The footer restructure.** Five new columns, shared by every page on the
 *    site. Its own change, not a rider on this one.
 */
export async function HomePage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.home' })
  const lang = (key: string) => textLang(t(key), locale)

  /*
    `slug` is optional in the Contentful model, and a post without one has no
    URL — linking it produces `/undefined/`. Filtered out rather than rendered,
    with a type guard so the card cannot be handed one either way. (The older
    `BlogCard` interpolates the slug straight into a template literal and does
    produce that link; out of scope here, worth fixing separately.)
  */
  const posts = (await getRecentPosts(HOME_NEWS_COUNT)).filter(
    (post): post is BlogPostFields & { slug: string } => typeof post.slug === 'string' && post.slug !== ''
  )

  return (
    <>
      {/*
        `overflow-hidden` is not decoration. The facet cluster is absolutely
        positioned against this section, and an absolutely positioned child that
        extends past its container is exactly how #96 put a 390px viewport into
        401px of horizontal scroll. Clipping here means the graphic can never do
        that, whatever width it is given.
      */}
      <section className="relative mx-auto overflow-hidden px-5 pt-16 pb-section">
        {/*
          The grid the first build shipped without. Behind the hero, faded out
          at the bottom, and `-z-10` so it never sits over the copy.
        */}
        <SectionBackdrop variant="grid" />

        <div className="container relative mx-auto">
          {/*
            Decorative, and positioned behind the words rather than beside
            them: the design floats it off to the right of a centred column,
            which is a layer, not a column. `aria-hidden` and empty `alt` —
            it says nothing the headline does not.

            Hidden below `lg` because at that width it would sit under the
            copy rather than beside it.
          */}
          <Image
            src={HOME_IMAGES.heroFacets}
            alt=""
            aria-hidden="true"
            width={420}
            height={420}
            priority
            className="pointer-events-none absolute right-0 top-20 hidden w-[22rem] max-w-none opacity-60 xl:block"
          />

          <div className="relative mx-auto max-w-4xl text-center">
            <p
              className="text-detail font-medium uppercase tracking-widest text-accent-primary"
              lang={lang('hero.eyebrow')}
            >
              {t('hero.eyebrow')}
            </p>

            <H1 className="mt-6 text-balance" lang={lang('hero.headline') ?? locale}>
              {t('hero.headline')}
            </H1>

            <p className="mx-auto mt-8 max-w-2xl text-body text-fg-muted" lang={lang('hero.intro')}>
              {t('hero.intro')}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href={localeHref(HOME_LINKS.contact, locale)} lang={lang('hero.cta')}>
                  {t('hero.cta')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={HOME_LINKS.docs} target="_blank" rel="noopener noreferrer" lang={lang('hero.docs')}>
                  {t('hero.docs')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/*
        `StatsRow` and `LogoRow` render their own `<section class="container">`,
        so neither is wrapped in one here — nesting them produced a container
        inside a container and doubled the vertical padding.
      */}
      <StatsRow
        columns={5}
        stats={HOME_STATS.map((id) => ({
          id,
          value: t(`stats.${id}.value`),
          label: t(`stats.${id}.label`),
        }))}
        lang={lang('stats.processed.label')}
      />

      <section className="container mx-auto border-t border-border px-5 py-section">
        <p className="text-detail font-medium uppercase tracking-widest text-fg-muted" lang={lang('stack.eyebrow')}>
          {t('stack.eyebrow')}
        </p>

        <div className="mt-14 grid gap-16 lg:grid-cols-2">
          <div>
            <H2 className="text-balance" lang={lang('stack.title')}>
              {t('stack.title')}
            </H2>
            <p className="mt-6 max-w-lg text-detail text-fg-muted" lang={lang('stack.intro')}>
              {t('stack.intro')}
            </p>
          </div>

          <ul className="flex flex-col gap-8">
            {HOME_STACK.map((card) => (
              <HighlightCard
                key={card.id}
                card={card}
                locale={locale}
                eyebrow={t(`stack.${card.id}.eyebrow`)}
                title={t(`stack.${card.id}.title`)}
                body={t(`stack.${card.id}.body`)}
                cta={t('stack.cta')}
                lang={lang(`stack.${card.id}.body`)}
              />
            ))}
          </ul>
        </div>
      </section>

      {/*
        The design draws this as a bare strip of marks between two rules, with
        no visible heading. The heading is kept for assistive technology — the
        marks are `alt=""` wordmarks, so without it the list has no name.
      */}
      <LogoRow title={t('venues.title')} titleHidden items={HOME_VENUES} titleLang={lang('venues.title')} />

      <section className="container mx-auto border-t border-border px-5 py-section">
        <div className="text-center">
          <p
            className="text-detail font-medium uppercase tracking-widest text-fg-muted"
            lang={lang('solutions.eyebrow')}
          >
            {t('solutions.eyebrow')}
          </p>
          <H2 className="mx-auto mt-6 max-w-3xl text-balance" lang={lang('solutions.title')}>
            {t('solutions.title')}
          </H2>
        </div>

        <ul className="mt-16 grid gap-8 md:grid-cols-3">
          {HOME_SOLUTIONS.map((card) => (
            <HighlightCard
              key={card.id}
              card={card}
              locale={locale}
              eyebrow={t(`solutions.${card.id}.eyebrow`)}
              title={t(`solutions.${card.id}.title`)}
              body={t(`solutions.${card.id}.body`)}
              cta={t(`solutions.${card.id}.cta`)}
              lang={lang(`solutions.${card.id}.body`)}
            />
          ))}
        </ul>
      </section>

      <section className="container mx-auto border-t border-border px-5 py-section">
        <p className="text-detail font-medium uppercase tracking-widest text-fg-muted" lang={lang('features.eyebrow')}>
          {t('features.eyebrow')}
        </p>
        <H2 className="mt-6 text-balance" lang={lang('features.title')}>
          {t('features.title')}
        </H2>

        <FeatureTabs
          className="mt-16"
          tabs={HOME_FEATURES.map((id) => ({
            id,
            title: t(`features.${id}.title`),
            panel: t(`features.${id}.panel`),
            titleLang: lang(`features.${id}.title`),
            panelLang: lang(`features.${id}.panel`),
          }))}
        />

        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild variant="secondary">
            <Link href={localeHref(HOME_LINKS.contact, locale)} lang={lang('features.cta')}>
              {t('features.cta')}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <a href={HOME_LINKS.github} target="_blank" rel="noopener noreferrer" lang={lang('features.github')}>
              {t('features.github')}
            </a>
          </Button>
        </div>
      </section>

      <section className="container mx-auto border-t border-border px-5 py-section" lang={lang('network.body')}>
        <p className="text-detail font-medium uppercase tracking-widest text-fg-muted" lang={lang('network.eyebrow')}>
          {t('network.eyebrow')}
        </p>

        <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <H2 className="text-balance" lang={lang('network.title')}>
              {t('network.title')}
            </H2>
            <div className="mt-6 max-w-lg">
              <MarkdownProse>{t('network.body')}</MarkdownProse>
            </div>
          </div>

          {/*
            Decorative: the paragraph beside it says the same thing in words.
            The frame the designer labelled "Place Diagram" is EMPTY — the real
            artwork is a sibling group, and exporting the named one gives a
            blank image. Worth knowing before anyone re-exports it.
          */}
          <Image
            src={HOME_IMAGES.networkDiagram}
            alt=""
            aria-hidden="true"
            width={508}
            height={311}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full rounded-sm"
          />
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container mx-auto border-t border-border px-5 py-section">
          <p className="text-detail font-medium uppercase tracking-widest text-fg-muted" lang={lang('news.eyebrow')}>
            {t('news.eyebrow')}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
            <H2 className="text-balance" lang={lang('news.title')}>
              {t('news.title')}
            </H2>
          </div>

          {/*
            `lang="en"` on the whole rail. Contentful has a single `en-US`
            locale — there is no Japanese or Korean blog, which is why the
            language selector hides on `/blog` — so every title, excerpt and
            date in here is English even inside a `lang="ja"` document. The
            arrow labels come from the catalog, which mirrors English for those
            locales, so they belong inside the same boundary.

            Without it a screen reader reads English article titles with
            Japanese pronunciation, which is the exact defect #103 is about.
          */}
          <CardRail
            className="mt-6"
            lang="en"
            label={t('news.title')}
            previousLabel={t('news.previous')}
            nextLabel={t('news.next')}
          >
            {posts.map((post) => (
              <NewsCard
                key={post.slug}
                post={post}
                readLabel={t('news.readTime', { minutes: readingMinutes(post.content) })}
              />
            ))}
          </CardRail>
        </section>
      )}

      <section className="container mx-auto border-t border-border px-5 py-section">
        <H2 className="text-balance" lang={lang('discover.title')}>
          {t('discover.title')}
        </H2>

        <ul className="mt-16 flex flex-col">
          {HOME_DISCOVER.map((item) => (
            <li key={item.id}>
              <Link
                href={localeHref(item.href, locale)}
                lang={lang(`discover.${item.id}`)}
                className="flex items-center justify-between border-b border-border py-8 text-h3 transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {t(`discover.${item.id}`)}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Marquee
        phrases={HOME_MARQUEE.map((id) => t(`marquee.${id}`))}
        pauseLabel={t('marquee.pause')}
        resumeLabel={t('marquee.resume')}
        lang={lang('marquee.oneApi')}
      />

      {/*
        The design's closing block: three calls to action centred in a glowing
        field, not a bare button row. `CTA Area` is 518px tall around a 174px
        container, so the space around the buttons IS the design.
      */}
      <section className="relative overflow-hidden px-5 py-44">
        <SectionBackdrop variant="glow" />

        <div className="relative flex flex-wrap justify-center gap-4">
          <Button asChild variant="secondary">
            <a href={HOME_LINKS.x} target="_blank" rel="noopener noreferrer" lang={lang('connect.follow')}>
              {t('connect.follow')}
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href={HOME_LINKS.telegram} target="_blank" rel="noopener noreferrer" lang={lang('connect.community')}>
              {t('connect.community')}
            </a>
          </Button>
          <Button asChild>
            <Link href={localeHref(HOME_LINKS.contact, locale)} lang={lang('connect.contact')}>
              {t('connect.contact')}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}

/**
 * A bordered card with an eyebrow, a heading, a body and one link.
 *
 * Shared between the stack and solutions sections, which draw the same shape
 * with different content. Local to this page rather than in the component
 * library: it is composition of primitives that already exist, and a component
 * used twice in one file does not need its own module and story.
 */
function HighlightCard({
  card,
  locale,
  eyebrow,
  title,
  body,
  cta,
  lang,
}: {
  card: HomeCard
  locale: Locale
  eyebrow: string
  title: string
  body: string
  cta: string
  lang?: string
}) {
  return (
    <li className="flex flex-col rounded-sm border border-border p-6" lang={lang}>
      <p className="text-detail font-medium uppercase tracking-widest text-accent-primary">{eyebrow}</p>

      <div className="mt-6 flex items-center gap-3">
        {card.icon && <Image src={card.icon} alt="" width={32} height={32} sizes="32px" className="size-8" />}
        <H4>{title}</H4>
      </div>

      <p className="mt-4 flex-1 text-detail text-fg-muted">{body}</p>

      <Link
        href={localeHref(card.href, locale)}
        className="mt-8 inline-flex items-center gap-2 text-detail font-medium uppercase tracking-widest transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {cta}
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </li>
  )
}

/**
 * One article in the news rail.
 *
 * The design also shows three tag chips per card. Contentful's `blogPost` model
 * has no tags field — title, heroImage, content, date, shortDescription, slug,
 * author — and the three chips in the design all read "INTEGRATION", which is
 * what placeholder looks like. Omitted rather than invented; adding tags is a
 * content-model change, not a template one. See #149.
 *
 * Reading time IS derived, because it is a function of the body rather than a
 * new fact about the post.
 */
function NewsCard({ post, readLabel }: { post: BlogPostFields & { slug: string }; readLabel: string }) {
  const image = getAssetUrl(post.heroImage)
  const author = getAuthorInfo(post.author)

  return (
    <li className="w-[19rem] shrink-0 snap-start sm:w-[22rem]">
      {/*
        `postPath`, not a template literal. `trailingSlash: true` means
        `/Some-Post` answers with a 308 to `/Some-Post/`, so every card click
        would cost a redirect hop.
      */}
      <Link href={postPath(post.slug)} className="group flex h-full flex-col focus-visible:outline-none">
        {/*
          Decorative: the title directly beneath is the link's accessible name,
          so alt text here would have a screen reader read the article twice.
        */}
        <Image
          src={image || '/blog/placeholder.png'}
          alt=""
          width={352}
          height={198}
          sizes="(min-width: 640px) 22rem, 19rem"
          className="aspect-video w-full rounded-sm object-cover"
        />

        <p className="mt-4 flex flex-wrap gap-x-3 text-detail uppercase tracking-widest text-fg-muted">
          {/* A person's name — English in any document. */}
          {author && <span lang="en">{author.name}</span>}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
          <span>{readLabel}</span>
        </p>

        <H4 className="mt-3 text-balance transition-colors group-hover:text-accent-primary group-focus-visible:text-accent-primary">
          {post.title}
        </H4>

        {post.shortDescription && <p className="mt-3 text-detail text-fg-muted">{post.shortDescription}</p>}
      </Link>
    </li>
  )
}

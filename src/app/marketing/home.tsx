import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { H1, H2, H4 } from '@/app/components/typography'
import { Button, type ButtonProps } from '@/components/ui/button'
import { CardRail } from '@/components/marketing/card-rail'
import { FeatureTabs } from '@/components/marketing/feature-tabs'
import { LogoRow } from '@/components/marketing/logo-row'
import { MarkdownProse } from '@/components/marketing/markdown-prose'
import { NewsletterForm } from '@/components/marketing/newsletter-form'
import { HeroFacetField } from '@/components/marketing/hero-facet-field'
import { SectionBackdrop } from '@/components/marketing/section-backdrop'
import { ClosingCta, ClosingSocialButtons } from '@/components/marketing/closing-cta'
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
import { COVER_FRAME, coverImage } from '@/app/components/blog/cover'
import { cn } from '@/lib/utils'
import { SDK_DOCS_URL } from '@/content/shared/sdk'
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
 * One destination is not built yet (`/ai-agents`). It is in
 * `link-integrity.test.ts`'s `PENDING`, so the guard knows and will fail the
 * moment it ships without its line being removed.
 *
 * NOT in this page, deliberately:
 *
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
        `overflow-hidden` is not decoration. The backdrop is absolutely
        positioned against this section, and an absolutely positioned child that
        extends past its container is exactly how #96 put a 390px viewport into
        401px of horizontal scroll. Clipping here means it can never do that,
        whatever width it is given.

        810px, matching `Grid Pattern Top` exactly — the grid layer and the
        section it backs are the same height, so the grid neither stops short
        nor runs past.

        A FLOOR RATHER THAN A FIXED HEIGHT, and the content is top-aligned
        rather than centred, because that is how the design distributes it.
        Measured down the centre column of the 3.4 frame, the copy runs from
        y=230 (eyebrow) to y=570 (buttons) inside a section starting at y=90:
        roughly 140px above it and 330px below. Centring would split that
        evenly and lift the headline ~95px.

        `lg:` only. 810px of hero on a 667px phone is a screenful of nothing
        before the first word, and the 3.4 frame is a 1440 desktop board — the
        mobile frames are drawn separately and do not say this.

        NO STATIC FACET GRAPHIC. A `hero-facets.svg` used to float at the right
        of this section, taken from the cluster drawn in the design frame — but
        that cluster is the designer's ILLUSTRATION OF THE HOVER STATE, drawn
        around a `Cursor` graphic, not a fixed element of the page. It is built
        for real now, so shipping a frozen copy of it as well left the hero
        wearing the same motif twice.
      */}
      <section className="relative isolate mx-auto overflow-hidden pt-36 pb-24 lg:min-h-[810px]">
        {/*
          `Grid Pattern Top`: 2px square dots on a 40.5px lattice.

          This was `variant="grid"` — the 66px LINE grid, which is a different
          layer of the design (`orbs-grid-clean-editable`, used further down the
          page). The two look alike at a glance in a screenshot and are not the
          same thing, so the hero has been wearing the wrong background since
          #178.

          Wrapped in `HeroFacetField`, which adds the cursor interaction on top
          and leaves this exactly as-is when there is no pointer, no JavaScript,
          or a reduced-motion preference.
        */}
        <HeroFacetField>
          <SectionBackdrop variant="dots" />
        </HeroFacetField>

        <div className="container relative">
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
              <Button asChild variant="solid">
                <Link href={localeHref(HOME_LINKS.contact, locale)} lang={lang('hero.cta')}>
                  {t('hero.cta')}
                </Link>
              </Button>
              {/*
                Same destination as the SDK buttons below; the design keeps its
                own wording here. `overlay` because the facet field moves behind
                this one and not the others (#268).
              */}
              <SdkButton label={t('sdk')} locale={locale} variant="overlay" />
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
        glow
        stats={HOME_STATS.map((id) => ({
          id,
          value: t(`stats.${id}.value`),
          label: t(`stats.${id}.label`),
        }))}
        locale={locale}
      />

      <section className="container border-t border-border py-section">
        <p className="text-detail font-medium uppercase tracking-widest text-fg-muted" lang={lang('stack.eyebrow')}>
          {t('stack.eyebrow')}
        </p>

        {/*
          The headline block is centred against the cards rather than
          top-aligned with them, and the cards start close under the eyebrow
          (42px in the design).
        */}
        <div className="mt-10 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            {/*
              One sentence per line (#219). The breaks are `\n` in the catalog,
              not width-dependent wrapping, so they hold at every viewport.
            */}
            <H2 className="whitespace-pre-line" lang={lang('stack.title')}>
              {t('stack.title')}
            </H2>
            <p className="mt-6 max-w-lg text-p text-fg" lang={lang('stack.intro')}>
              {t('stack.intro')}
            </p>
            {/*
              Not in any frame — Sara's review asked for it (#214), in the empty
              column beside the product cards.
            */}
            <SdkButton className="mt-10" label={t('sdk')} locale={locale} />
          </div>

          <ul className="grid auto-rows-fr gap-5">
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
                className="p-5 lg:px-5 lg:py-7"
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
      <LogoRow
        title={t('venues.title')}
        titleHidden
        spread
        className="border-t border-border"
        items={HOME_VENUES}
        locale={locale}
      />

      <section className="container border-t border-border py-section">
        <div className="text-center">
          <p
            className="text-detail font-medium uppercase tracking-widest text-fg-muted"
            lang={lang('solutions.eyebrow')}
          >
            {t('solutions.eyebrow')}
          </p>
          {/*
            No `max-w-3xl`: the design sets this on one line, and the cap was
            what broke it at the hyphen ("on- / chain").
          */}
          <H2 className="mt-6 text-balance" lang={lang('solutions.title')}>
            {t('solutions.title')}
          </H2>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
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
              className="p-6 lg:p-[2.125rem] lg:min-h-[23.4375rem]"
            />
          ))}
        </ul>

        {/* Eran's review, folded into #214: each audience above builds on the SDK. */}
        <div className="mt-12 flex justify-center">
          <SdkButton label={t('sdk')} locale={locale} />
        </div>
      </section>

      {/*
        The white band. `bg-surface` rather than `bg-bg` because the design
        gives this section the brighter of the two light tones — #ffffff
        against the news run's #f6f6f6 — and the pair inverts with the theme.
      */}
      <div className="band-contrast bg-surface">
        {/*
          No bottom padding at `lg`: the list's vertical rule runs to the foot
          of the band, so `FeatureTabs` carries that space inside its columns.
        */}
        <section className="container pt-section pb-section lg:pb-0">
          <p
            className="text-detail font-medium uppercase tracking-widest text-fg-muted"
            lang={lang('features.eyebrow')}
          >
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
            }))}
            locale={locale}
            footer={
              <>
                <Button asChild>
                  <Link href={localeHref(HOME_LINKS.contact, locale)} lang={lang('features.cta')}>
                    {t('features.cta')}
                  </Link>
                </Button>
                <Button asChild>
                  <a href={HOME_LINKS.github} target="_blank" rel="noopener noreferrer" lang={lang('features.github')}>
                    {t('features.github')}
                  </a>
                </Button>
              </>
            }
          />
        </section>
      </div>

      <section className="container border-t border-border py-section" lang={lang('network.body')}>
        <p className="text-detail font-medium uppercase tracking-widest text-fg-muted" lang={lang('network.eyebrow')}>
          {t('network.eyebrow')}
        </p>

        <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <H2 className="text-balance" lang={lang('network.title')}>
              {t('network.title')}
            </H2>
            {/* `space-y-5`: the prose renderer sets no paragraph margin, so the two ran together. */}
            <div className="mt-6 max-w-lg space-y-5">
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

      {/*
        News and Discover share ONE band. The design runs a single #f6f6f6
        field from the news heading to the end of Discover — closing and
        reopening the background between them would draw a seam the design
        does not have.
      */}
      <div className="band-contrast bg-bg">
        {posts.length > 0 && (
          <section className="container py-section">
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
              label={t('news.title')}
              previousLabel={t('news.previous')}
              nextLabel={t('news.next')}
              locale={locale}
            >
              {posts.map((post) => (
                <NewsCard
                  key={post.slug}
                  post={post}
                  readLabel={t('news.readTime', { minutes: readingMinutes(post.content) })}
                  locale={locale}
                />
              ))}
            </CardRail>
          </section>
        )}

        {/*
          Same 1fr / 2fr split as the features list above: the heading on its
          own, the rows in the right column, and "View resources" pinned
          bottom-left level with the last row. In the DOM the button follows
          the list, so a phone and a screen reader get heading, rows, button.
        */}
        <section className="container py-section">
          <H2 className="text-balance" lang={lang('discover.title')}>
            {t('discover.title')}
          </H2>

          <div className="mt-16 grid gap-10 lg:mt-48 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-5">
            <ul className="flex min-w-0 flex-col lg:col-start-2 lg:row-start-1">
              {HOME_DISCOVER.map((item) => (
                <li key={item.id}>
                  <Link
                    href={localeHref(item.href, locale)}
                    lang={lang(`discover.${item.id}`)}
                    className="flex items-center justify-between gap-6 border-b border-border py-8 text-h3 transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {t(`discover.${item.id}`)}
                    <LongArrow />
                  </Link>
                </li>
              ))}
            </ul>

            <Button asChild className="self-end justify-self-start lg:col-start-1 lg:row-start-1">
              <Link href={localeHref(HOME_LINKS.resources, locale)} lang={lang('discover.cta')}>
                {t('discover.cta')}
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/*
        The marquee and the call to action share ONE glowing field.

        In the design they are not separate blocks over separate backgrounds:
        `Orbs Glow Background` is a single 954px layer that runs behind the
        signup, the marquee and the CTA together, so the scrolling phrases sit
        on the tinted upper part of the glow rather than on flat black. Built as
        two independent sections, the marquee lost that entirely — which is why
        the band appeared to start abruptly below it.

        `ClosingCta` owns that field and the two lower blocks, shared with the
        product pages; the signup is passed in and renders at the top of it.
      */}
      <ClosingCta
        phrases={HOME_MARQUEE.map((id) => t(`marquee.${id}`))}
        locale={locale}
        actions={
          <>
            <ClosingSocialButtons
              follow={t('connect.follow')}
              community={t('connect.community')}
              x={HOME_LINKS.x}
              telegram={HOME_LINKS.telegram}
              locale={locale}
            />
            <Button asChild>
              <Link href={localeHref(HOME_LINKS.contact, locale)} lang={lang('connect.contact')}>
                {t('connect.contact')}
              </Link>
            </Button>
          </>
        }
      >
        {/*
          The signup, which the design places at the TOP of this glow field —
          `Signup Area` is 436px inside `Orbs Glow Background`, above the
          marquee and the call to action.
          Two columns: the heading and its line on the left, the fields on the
          right, with a rule beneath the whole thing. Deferred until #145 was
          answered, because a form with no list behind it is the bug the
          contact form was built to fix — the legacy one has been posting to a
          dead Heroku host for years.
        */}
        {/*
          The vertical rule runs the full height of the signup, top of the band
          to the rule beneath, so at `lg` the padding moves off the section and
          onto the two columns. `lg:pe-10` rather than a column gap is what
          leaves "Get updates from" room to sit on one line: at 1440 the
          heading is 50px and needs about 460px, and `gap-16` plus `pr-16` had
          squeezed the column to 405 and orphaned "from" on a third line.
        */}
        <section className="container border-b border-border py-section lg:py-0">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-0">
            <div className="lg:border-r lg:border-border lg:py-section lg:pe-10">
              <H2 className="text-balance text-h3 sm:text-h2" lang={lang('newsletter.heading')}>
                {t('newsletter.heading')}
              </H2>
              <p className="mt-6 text-p text-fg-muted" lang={lang('newsletter.body')}>
                {t('newsletter.body')}
              </p>
            </div>

            <div className="lg:py-section lg:ps-12">
              <NewsletterForm
                labels={{
                  heading: t('newsletter.heading'),
                  body: t('newsletter.body'),
                  name: t('newsletter.name'),
                  email: t('newsletter.email'),
                  submit: t('newsletter.submit'),
                  sending: t('newsletter.sending'),
                  success: t('newsletter.success'),
                  failed: t('newsletter.failed'),
                  invalidEmail: t('newsletter.invalidEmail'),
                }}
                locale={locale}
              />
            </div>
          </div>
        </section>
      </ClosingCta>
    </>
  )
}

/**
 * A link off-site to the SDK docs, outline with the line arrow.
 *
 * "Explore SDK" in the hero, under the stack intro and on the solutions cards
 * (#214). The hero used to say "Read the docs", which read as the network's
 * developer docs rather than the SDK the page is selling (Eran). The product
 * heroes carry the SDK wording through `devDocs.sdk`.
 *
 * `variant` is passed through for the hero, whose copy sits over the facet
 * field; the other two sit on a flat page and keep the default outline.
 */
function SdkButton({
  label,
  locale,
  className,
  variant,
}: {
  label: string
  locale: Locale
  className?: string
  variant?: ButtonProps['variant']
}) {
  return (
    <Button asChild variant={variant} className={className}>
      <a href={SDK_DOCS_URL} target="_blank" rel="noopener noreferrer" lang={textLang(label, locale)}>
        {label}
      </a>
    </Button>
  )
}

const CARD_ACCENT = {
  primary: 'text-accent-primary',
  pink: 'text-accent-pink',
  cyan: 'text-accent-cyan',
} as const satisfies Record<NonNullable<HomeCard['accent']>, string>

/**
 * A filled card with an eyebrow, a heading, a body and one link.
 *
 * Filled, not bordered: the 09-30 design draws both rows as flat panels with
 * no outline. Padding differs between the two rows, so it comes in through
 * `className`.
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
  className,
}: {
  card: HomeCard
  locale: Locale
  eyebrow: string
  title: string
  body: string
  cta: string
  lang?: string
  className?: string
}) {
  return (
    <li className={cn('flex flex-col bg-card-fill', className)} lang={lang}>
      <p className={cn('text-detail font-medium uppercase tracking-widest', CARD_ACCENT[card.accent ?? 'primary'])}>
        {eyebrow}
      </p>

      <div className="mt-9 flex items-center gap-3">
        {card.icon && (
          /*
            Fixed HEIGHT, width follows. `size-8` forced both marks into the
            same square box, and they are different shapes — dSPOT is wider
            than tall, dPERPS taller than wide, so a square squashed one of
            them. `h-8 w-auto` with the real intrinsic dimensions keeps each
            at its own proportions on one optical baseline.
          */
          <Image
            src={card.icon.src}
            alt=""
            aria-hidden="true"
            width={card.icon.width}
            height={card.icon.height}
            className="h-8 w-auto"
          />
        )}
        {/* A product name next to its mark is a lockup: letter-spaced, as drawn. */}
        <H4 className={cn(card.icon && 'tracking-[0.12em]')}>{title}</H4>
      </div>

      <p className="mt-10 flex-1 text-p text-fg">{body}</p>

      <Link
        href={localeHref(card.href, locale)}
        className="mt-10 inline-flex self-start items-center gap-2 text-detail font-medium uppercase tracking-widest transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
function NewsCard({
  post,
  readLabel,
  locale,
}: {
  post: BlogPostFields & { slug: string }
  readLabel: string
  /**
   * The document's locale, so each post field can declare its own language.
   *
   * These fields come from Contentful, which has ONE locale (`en-US`), so on
   * `/ja` and `/ko` they are English text inside a non-English document and
   * must say so. `CardRail` used to carry a rail-level `lang="en"` that
   * covered them; removing it (#103) was right — the rail's own arrow labels
   * are catalog strings and ARE translated — but the cards then inherited the
   * page language instead, which is the same bug pointing the other way.
   */
  locale: Locale
}) {
  const cover = coverImage(getAssetUrl(post.heroImage))
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
          src={cover.src}
          alt=""
          width={352}
          height={176}
          sizes="(min-width: 640px) 22rem, 19rem"
          className={cn('w-full rounded-sm', COVER_FRAME, cover.fit)}
        />

        <p className="mt-4 flex flex-wrap gap-x-3 text-detail uppercase tracking-widest text-fg-muted">
          {/* A person's name — English in any document. */}
          {author && <span lang={textLang(author.name, locale)}>{author.name}</span>}
          {/*
            Formatted `en-GB` unconditionally, so the rendered text is English
            ("23 Sep 2026") whatever the route's language. Marked as such
            rather than derived, because the format string decides it here.
          */}
          <time dateTime={post.date} lang={locale === 'en' ? undefined : 'en'}>
            {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
          {/* This one IS a catalog string, unlike its neighbours. */}
          <span lang={textLang(readLabel, locale)}>{readLabel}</span>
        </p>

        <H4
          className="mt-3 text-balance transition-colors group-hover:text-accent-primary group-focus-visible:text-accent-primary"
          lang={textLang(post.title, locale)}
        >
          {post.title}
        </H4>

        {post.shortDescription && (
          <p className="mt-3 text-p text-fg-muted" lang={textLang(post.shortDescription, locale)}>
            {post.shortDescription}
          </p>
        )}
      </Link>
    </li>
  )
}

/**
 * The Discover rows' arrow: long and hairline, as drawn in the design (about
 * 36px across at 42px type), rather than an `&rarr;` glyph, whose weight and
 * length follow the font and read as a bullet at this size.
 */
function LongArrow() {
  return (
    <svg
      width="36"
      height="24"
      viewBox="0 0 36 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-auto w-7 shrink-0 lg:w-9"
    >
      <path d="M1 12H35M24 1L35 12L24 23" />
    </svg>
  )
}

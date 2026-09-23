import { Button } from '@/components/ui/button'
import { Prose } from './prose'
import { GithubIcon, TelegramIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * Either both or neither.
 *
 * A hero image with no `alt` is an unlabelled image; an `alt` with no image is
 * a caller that thinks it set one. Expressing the pair as a union makes both
 * mistakes a type error rather than something to catch in review.
 */
type HeroImage = { image: string; imageAlt: string } | { image?: undefined; imageAlt?: undefined }

/**
 * Both or neither, like the image.
 *
 * Liquidity Hub's legacy header declares no button at all — it opens straight
 * into the explanation. A label with no destination, or a destination with no
 * label, is a caller half-way through a change.
 */
type HeroCta = { ctaLabel: string; ctaHref: string } | { ctaLabel?: undefined; ctaHref?: undefined }

/**
 * An optional second button beside the first, same both-or-neither rule.
 *
 * Only TON.Vote needs one: its legacy header carries GET STARTED and
 * WHITEPAPER side by side. Rendering the second as a standalone centred section
 * under the hero — which is what this page did before the prop existed — reads
 * as a button that lost its paragraph.
 */
type HeroSecondaryCta =
  | { secondaryCtaLabel: string; secondaryCtaHref: string }
  | { secondaryCtaLabel?: undefined; secondaryCtaHref?: undefined }

/**
 * Opening block of a product page: headline, standfirst, primary call to
 * action, source links, and an optional hero illustration.
 *
 * The headline arrives with the author's line breaks intact (the legacy content
 * wrote it as three separate markdown H1 lines), so it renders
 * `whitespace-pre-line` rather than collapsing them. Those breaks are a
 * typographic decision about how the phrase splits, and they differ per
 * language — Korean breaks it into three quite different lines.
 *
 * The image is optional because not every product has one. dLIMIT's hero asset
 * is referenced by the legacy page but has never existed — `/assets/img/dlimit/
 * hero.svg` is a 404 on production — so that page ships without one rather than
 * borrowing dTWAP's illustration and implying an asset that was never designed.
 * Without an image the text runs to a single centred column instead of leaving
 * a half-width hole where the illustration would be.
 */
export function ProductHero({
  headline,
  intro,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  image,
  imageAlt,
  repo,
  telegram,
  locale,
  eyebrow,
}: HeroImage &
  HeroCta &
  HeroSecondaryCta & {
    headline: string
    intro: string
    repo?: string
    telegram?: string
    /**
     * The document's locale. Each string's own `lang` is derived from it.
     *
     * This replaces a block `lang` plus a `headlineLang` escape hatch. Orbs
     * Agentic's headline is the product name, English in the Korean catalog,
     * while the intro and call to action beneath it are Korean — one language
     * for the whole hero marked all of that Korean copy English. The escape
     * hatch fixed the headline and left everything else sharing one guess.
     */
    locale: Locale
    /** A short bracketed label above the headline — "[ORBS INSTITUTIONAL]". */
    eyebrow?: string
  }) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      {/*
        `mx-auto` is load-bearing, not decoration: `max-w-3xl` alone constrains
        the width but leaves the column pinned to the left of the container,
        which reads as a hero that lost its image rather than one designed
        without it.
      */}
      <div className={cn('grid gap-12', image ? 'lg:grid-cols-[3fr_2fr] lg:items-center' : 'mx-auto max-w-3xl')}>
        <div>
          {eyebrow && (
            <p
              className="mb-4 text-detail font-medium uppercase tracking-widest text-fg-muted"
              lang={textLang(eyebrow, locale)}
            >
              {eyebrow}
            </p>
          )}

          <h1
            lang={textLang(headline, locale)}
            className="whitespace-pre-line text-balance text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          >
            {headline}
          </h1>

          {/*
            Through `Prose`, not a bare `<p>`. Perpetual Hub's intro is two
            authored paragraphs; in a single `<p>` the blank line between them
            collapses to a space and they render as one block. Every other
            product page's intro is a single paragraph, so this changes nothing
            for them.
          */}
          <Prose text={intro} locale={locale} className="mt-6 max-w-xl [&_p]:text-lg" />

          <div className="mt-10 flex flex-wrap items-center gap-4 empty:mt-0">
            {ctaLabel && (
              <Button asChild size="lg">
                <Link href={ctaHref} lang={textLang(ctaLabel, locale)}>
                  {ctaLabel}
                </Link>
              </Button>
            )}

            {secondaryCtaLabel && (
              <Button asChild size="lg" variant="secondary">
                <Link href={secondaryCtaHref} lang={textLang(secondaryCtaLabel, locale)}>
                  {secondaryCtaLabel}
                </Link>
              </Button>
            )}

            {/*
              The icons are hidden because `IconLink` labels the anchor itself.
              Every social icon component sets its own `role="img"` and
              `aria-label`, which would otherwise be a second accessible name
              inside one link.
            */}
            {repo && (
              <IconLink
                href={repo}
                label="GitHub repository"
                icon={<GithubIcon className="size-5" aria-hidden focusable="false" />}
              />
            )}
            {telegram && (
              <IconLink
                href={telegram}
                label="Telegram support group"
                icon={<TelegramIcon className="size-5" aria-hidden focusable="false" />}
              />
            )}
          </div>
        </div>

        {image && (
          <div className="relative aspect-[4/3] w-full">
            {/*
              `priority` because this is the largest element above the fold on
              every product page — it is the LCP candidate, and lazy-loading it
              would delay the metric it defines. With no image the headline
              becomes the LCP element and needs no equivalent hint.
            */}
            <Image
              src={image}
              alt={imageAlt}
              lang={textLang(imageAlt, locale)}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </section>
  )
}

function IconLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      // The label is English in every locale — it names a product, and there is
      // no translated equivalent in the legacy content to draw from.
      lang="en"
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-md border border-border text-fg',
        'transition-colors hover:text-accent-primary hover:border-accent-primary',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
      )}
    >
      {icon}
    </a>
  )
}

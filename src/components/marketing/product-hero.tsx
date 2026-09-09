import { Button } from '@/components/ui/button'
import { Prose } from './prose'
import { GithubIcon, TelegramIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Either both or neither.
 *
 * A hero image with no `alt` is an unlabelled image; an `alt` with no image is
 * a caller that thinks it set one. Expressing the pair as a union makes both
 * mistakes a type error rather than something to catch in review.
 */
type HeroImage = { image: string; imageAlt: string } | { image?: undefined; imageAlt?: undefined }

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
  image,
  imageAlt,
  repo,
  telegram,
  lang,
}: HeroImage & {
  headline: string
  intro: string
  ctaLabel: string
  ctaHref: string
  repo?: string
  telegram?: string
  /** Set when this copy is English inside a non-English document. */
  lang?: string
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
        <div lang={lang}>
          <h1 className="whitespace-pre-line text-balance text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {headline}
          </h1>

          {/*
            Through `Prose`, not a bare `<p>`. Perpetual Hub's intro is two
            authored paragraphs; in a single `<p>` the blank line between them
            collapses to a space and they render as one block. Every other
            product page's intro is a single paragraph, so this changes nothing
            for them.
          */}
          <Prose text={intro} className="mt-6 max-w-xl [&_p]:text-lg" />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>

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

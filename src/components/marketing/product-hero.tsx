import { Button } from '@/components/ui/button'
import { GithubIcon, TelegramIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Opening block of a product page: headline, standfirst, primary call to
 * action, source links, and a hero illustration.
 *
 * The headline arrives with the author's line breaks intact (the legacy content
 * wrote it as three separate markdown H1 lines), so it renders
 * `whitespace-pre-line` rather than collapsing them. Those breaks are a
 * typographic decision about how the phrase splits, and they differ per
 * language — Korean breaks it into three quite different lines.
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
}: {
  headline: string
  intro: string
  ctaLabel: string
  ctaHref: string
  image: string
  imageAlt: string
  repo?: string
  telegram?: string
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
        <div lang={lang}>
          <h1 className="whitespace-pre-line text-balance text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {headline}
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">{intro}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>

            {repo && <IconLink href={repo} label="GitHub repository" icon={<GithubIcon className="size-5" />} />}
            {telegram && (
              <IconLink href={telegram} label="Telegram support group" icon={<TelegramIcon className="size-5" />} />
            )}
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full">
          {/*
            `priority` because this is the largest element above the fold on
            every product page — it is the LCP candidate, and lazy-loading it
            would delay the metric it defines.
          */}
          <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
        </div>
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

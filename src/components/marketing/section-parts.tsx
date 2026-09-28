import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'

/**
 * Pieces shared by the 3.4 section library (`MASTER / Dark Inner Page` in
 * Figma): the bracketed eyebrow every section opens with, and its button.
 *
 * Small enough that a module each would be ceremony; shared enough that
 * inlining them would let five sections drift five ways.
 */

/** A destination. External when it starts with a scheme, internal otherwise. */
export type SectionLink = { label: string; href: string }

/**
 * `[INFRASTRUCTURE]`, `[SDK / API]` — the label above a section.
 *
 * The brackets are part of the copy, not drawn here, matching how
 * `ProductHero` takes its eyebrow. `text-fg`, not muted: the design sets these
 * at full foreground, and at 11px muted would be the faintest text on the page.
 */
export function Eyebrow({ text, locale, className }: { text: string; locale: Locale; className?: string }) {
  return (
    <p
      className={cn('text-detail font-medium uppercase tracking-widest text-fg', className)}
      lang={textLang(text, locale)}
    >
      {text}
    </p>
  )
}

/**
 * The section's call to action.
 *
 * External destinations — the developer docs — open in a new tab with
 * `noopener`; internal ones go through `Link` so they prefetch and stay
 * client-side. Deciding that here rather than per caller is the point: a page
 * that forgets `rel` on one external link is a page with a reverse-tabnabbing
 * hole in it.
 *
 * Internal hrefs are locale-free (`/contact`) and resolved here through
 * `localeHref`, for the same reason: a section rendered on a Korean page must
 * send the reader to `/ko/contact/`, not drop them back into English, and a
 * caller that forgets is invisible on the English page everyone checks.
 *
 * In-page anchors (`#modules`) are neither: a plain same-tab `<a>`, because
 * `localeHref` would turn the fragment into a path.
 */
export function CtaButton({
  link,
  locale,
  variant,
}: {
  link: SectionLink
  locale: Locale
  /** The closing block's social links are secondary beside "Talk to the team". */
  variant?: 'secondary'
}) {
  const lang = textLang(link.label, locale)

  return (
    <Button asChild variant={variant}>
      {isExternal(link.href) ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer" lang={lang}>
          {link.label}
        </a>
      ) : link.href.startsWith('#') ? (
        <a href={link.href} lang={lang}>
          {link.label}
        </a>
      ) : (
        <Link href={localeHref(link.href, locale)} lang={lang}>
          {link.label}
        </Link>
      )}
    </Button>
  )
}

export function isExternal(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href)
}

/**
 * A section's illustration, in both themes.
 *
 * Figma exports these for the dark board, so their dots and guide lines are
 * hard-coded `white` — on the light theme they vanish and leave the gradient
 * strokes floating on nothing. An SVG loaded through `<img>` cannot see the
 * page's `.dark` class, so it cannot switch colour itself; the light variant
 * is a second file with the whites turned to `#121214`, and CSS shows the one
 * that matches.
 *
 * Both are required. A graphic with only the dark file is exactly the bug this
 * exists to prevent, and it looks fine on the board the designer checks.
 */
export type SectionGraphic = {
  /** As exported: for the dark theme. */
  src: string
  /** The same art with its whites darkened, for the light theme. */
  lightSrc: string
  width: number
  height: number
}

export function ThemedGraphic({
  graphic,
  priority = false,
  sizes,
  className,
}: {
  graphic: SectionGraphic
  /**
   * For the hero, where the graphic is the LCP candidate on a wide screen.
   * Both variants are then preloaded — the theme is not known on the server —
   * which costs one extra ~10 KB SVG.
   */
  priority?: boolean
  sizes: string
  className?: string
}) {
  // Decorative everywhere it is used: the copy beside it carries the meaning.
  const common = { width: graphic.width, height: graphic.height, priority, sizes }

  return (
    <>
      <Image src={graphic.src} alt="" {...common} className={cn('hidden dark:block', className)} />
      <Image src={graphic.lightSrc} alt="" {...common} className={cn('dark:hidden', className)} />
    </>
  )
}

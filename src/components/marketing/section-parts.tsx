import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
 */
export function CtaButton({ link, locale }: { link: SectionLink; locale: Locale }) {
  const lang = textLang(link.label, locale)

  return (
    <Button asChild>
      {isExternal(link.href) ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer" lang={lang}>
          {link.label}
        </a>
      ) : (
        <Link href={link.href} lang={lang}>
          {link.label}
        </Link>
      )}
    </Button>
  )
}

export function isExternal(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href)
}

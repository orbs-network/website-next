import { localeHref } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'

/**
 * A destination that may differ per locale.
 *
 * Most links do not: an internal path goes through `localeHref` and picks up
 * its `/jp/` or `/ko/` prefix when that page exists. A few point somewhere
 * genuinely DIFFERENT per locale — the legacy Korean Perpetual Hub page sends
 * both its "learn more" and "one pager" buttons to a Naver article rather than
 * to the English announcement post, exactly as the Korean footer sends "Blog"
 * to a Korean Medium publication instead of `/blog`.
 *
 * `localeHref` cannot express that: it maps a path to its localised URL, and
 * the answer here is a different document on a different site.
 */
export type LocaleLink = {
  /** Internal path (leading `/`, no trailing slash) or an absolute URL. */
  href: string
  /** Destinations that are a different document, not a prefixed one. */
  byLocale?: Partial<Record<Locale, string>>
}

/**
 * Where a link points in this locale, and whether it leaves the site.
 *
 * Order matters, and mirrors `resolveFooterHref`: a per-locale override wins
 * outright, an absolute href passes through, and only an internal path reaches
 * `localeHref`. `external` is derived from the RESOLVED href, so an override
 * that points off-site is external even when the entry it overrides is not.
 *
 * TODO: the footer and the header menu each carry their own copy of this rule.
 * They predate this helper and should adopt it, but that is a refactor of
 * working code rather than part of this page.
 */
export function resolveLocaleLink(link: LocaleLink, locale: Locale): { href: string; external: boolean } {
  const override = link.byLocale?.[locale]

  if (override !== undefined) {
    return { href: override, external: !override.startsWith('/') }
  }

  if (!link.href.startsWith('/')) {
    return { href: link.href, external: true }
  }

  return { href: localeHref(link.href, locale), external: false }
}

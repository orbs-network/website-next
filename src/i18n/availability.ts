import { absoluteUrl } from '@/app/lib/site'
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from './locales'

/**
 * Which locales each page is actually built in.
 *
 * Keys are locale-independent paths (what `splitLocale` returns), values are the
 * locales that have a real page at that path.
 *
 * This is not derived from the legacy content tree on purpose. The legacy site
 * has directories like `jp/dtwap` whose copy is byte-for-byte English — a page
 * that "exists" but is not translated. Deriving availability from directory
 * presence would offer a Japanese link that leads to English text. This map
 * records what we have actually built, so it grows as Phase 3 lands pages.
 *
 * A path absent from this map is English-only, which is the safe default: the
 * selector will not offer a locale we cannot serve.
 */
const AVAILABILITY: Record<string, readonly Locale[]> = {
  '/': ['en', 'ja', 'ko'],
}

/**
 * Paths where the language selector is hidden entirely.
 *
 * The blog and the press archive are English-only and always will be: the
 * legacy site has no Japanese or Korean blog (its Japanese navbar links out to
 * `orbs-japan-community.medium.com`, and the Korean one to `orbskorea.medium.com`),
 * and Contentful has a single `en-US` locale. Offering a language switch that can
 * only take you off the article you are reading is worse than offering none.
 */
const SELECTOR_HIDDEN_PREFIXES = ['/blog', '/news'] as const

export function localesFor(pathname: string): readonly Locale[] {
  return AVAILABILITY[normalize(pathname)] ?? [DEFAULT_LOCALE]
}

/**
 * Blog posts live at the root (`/Some-Post/`), so "is this a post?" cannot be
 * answered from the path shape alone — anything not in the availability map and
 * not a known section could be one. Both cases resolve the same way, though: no
 * locale variants, so no selector.
 */
export function shouldShowSelector(pathname: string): boolean {
  const path = normalize(pathname)

  if (SELECTOR_HIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return false
  }

  return localesFor(path).length > 1
}

/**
 * Where the selector should send you for a given locale.
 *
 * Falls back to the English URL when the page has no variant in that locale,
 * rather than minting a localised URL that serves English. One page, one URL —
 * no duplicate content for search engines to reconcile.
 */
export function localeHref(pathname: string, target: Locale): string {
  const path = normalize(pathname)
  const locale = localesFor(path).includes(target) ? target : DEFAULT_LOCALE

  return localePath(locale, withTrailingSlash(path))
}

/**
 * `alternates` metadata for a page: a self-referential canonical plus hreflang
 * entries for every locale the page genuinely exists in.
 *
 * Only locales in the availability map are listed. Advertising an hreflang for a
 * page that serves English would tell search engines the two URLs are
 * translations of each other when they are the same text.
 */
export function localeAlternates(pathname: string, locale: Locale) {
  const path = withTrailingSlash(normalize(pathname))
  const available = localesFor(path)

  const languages = Object.fromEntries(
    LOCALES.filter((candidate) => available.includes(candidate)).map((candidate) => [
      // The hreflang value is a BCP 47 tag, so Japanese is `ja` even though its
      // URL segment is the legacy `/jp/`.
      candidate,
      absoluteUrl(localePath(candidate, path)),
    ])
  )

  return {
    canonical: absoluteUrl(localePath(locale, path)),
    languages: {
      ...languages,
      // Tells search engines which URL to serve when no listed language matches
      // the user's. Without it they pick one, and it may not be English.
      'x-default': absoluteUrl(localePath(DEFAULT_LOCALE, path)),
    },
  }
}

/**
 * Strips the trailing slash for map lookups and prefix comparisons. The root
 * stays `/`, so it is never reduced to the empty string.
 */
function normalize(pathname: string): string {
  if (pathname === '/') {
    return pathname
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

/**
 * Restores the trailing slash before a path becomes a URL. `trailingSlash: true`
 * is set in next.config.mjs, so the slashless form 308s on every request — a
 * canonical or hreflang pointing at it hands crawlers a redirect.
 */
function withTrailingSlash(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

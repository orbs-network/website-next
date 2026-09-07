import { absoluteUrl } from '@/app/lib/site'
import { DEFAULT_LOCALE, LOCALES, localePath, type Locale } from './locales'

/**
 * Whether a locale's version of a page is a real translation or a stand-in.
 *
 *  - `translated` — the page has genuine copy in that language. Safe to
 *    advertise to search engines as an alternate and to list in the sitemap.
 *  - `placeholder` — the route exists and is reachable, but the body is English
 *    awaiting Phase 3. Reachable, but NOT indexable and NOT an hreflang
 *    alternate.
 *
 * The distinction exists because "the page exists" and "the page is a
 * translation" are different questions, and conflating them produces a specific
 * SEO failure: declaring hreflang between two URLs that serve the same English
 * text tells Google they are translations of each other. Google checks, finds
 * near-duplicates, and responds by ignoring the hreflang set or collapsing one
 * URL into the other — the opposite of what the annotation was for.
 *
 * That failure is easy to walk into here, because the legacy site is full of it:
 * `jp/dtwap` exists as a directory but its copy is byte-for-byte the English
 * page. Directory presence is not evidence of translation, so this map records
 * what we have actually built and in what state.
 */
type LocaleStatus = 'translated' | 'placeholder'

/**
 * Keys are locale-independent paths (what `splitLocale` returns).
 *
 * A path absent from this map is English-only, which is the safe default: the
 * selector will not offer a locale we cannot serve.
 *
 * `/jp/` and `/ko/` are `placeholder` because both currently render the shared
 * English `HomeHero`. Phase 3 (#31, #32) builds the real home pages and flips
 * them to `translated`. Note they are marked noindex until then — that costs
 * nothing today because DNS has not cut over (#39), so the legacy site is still
 * the one being crawled.
 */
const AVAILABILITY: Record<string, Partial<Record<Locale, LocaleStatus>>> = {
  '/': { en: 'translated', ja: 'placeholder', ko: 'placeholder' },
  // Korean is a real translation of every string on the page. Japanese is not:
  // the legacy `jp/dtwap` content is byte-for-byte the English page, so its
  // catalog mirrors English and the route is preserved without claiming to be a
  // translation. Measured, not assumed — see #27 for the coverage table.
  '/dtwap': { en: 'translated', ja: 'placeholder', ko: 'translated' },
  // Same split as dTWAP, and measured the same way: the legacy `ko/dlimit`
  // content is a real translation down to the card bodies and the schema prose,
  // while `jp/dlimit` is byte-for-byte the English page. Its catalog therefore
  // mirrors English and the route is preserved without claiming to be a
  // translation.
  '/dlimit': { en: 'translated', ja: 'placeholder', ko: 'translated' },
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

/** Every locale the page is reachable in, translated or not. Drives the selector. */
export function localesFor(pathname: string): readonly Locale[] {
  const entry = AVAILABILITY[normalize(pathname)]

  if (!entry) {
    return [DEFAULT_LOCALE]
  }

  return LOCALES.filter((locale) => entry[locale] !== undefined)
}

/**
 * Only the locales whose copy is genuinely translated. Drives hreflang and the
 * sitemap — the two places where claiming a translation that is not one is
 * actively harmful.
 */
export function translatedLocalesFor(pathname: string): readonly Locale[] {
  const entry = AVAILABILITY[normalize(pathname)]

  if (!entry) {
    return [DEFAULT_LOCALE]
  }

  return LOCALES.filter((locale) => entry[locale] === 'translated')
}

/** Whether this locale's version of the page is still an English stand-in. */
export function isPlaceholder(pathname: string, locale: Locale): boolean {
  return AVAILABILITY[normalize(pathname)]?.[locale] === 'placeholder'
}

/**
 * `robots` metadata for a localised page.
 *
 * Placeholder pages are `noindex, follow`. Two opposing risks meet here and both
 * are real:
 *
 *  - Indexed as they are, `/jp/` and `/ko/` are English near-duplicates of `/`.
 *    Google collapses them, and any hreflang set naming them is discarded.
 *  - Left `noindex` past the DNS cutover (#39), the migration would actively
 *    deindex two legacy entry-point URLs that have been indexed for years.
 *
 * So `noindex` is right until the pages have real copy and wrong the moment they
 * do. It is derived from the SAME map entry that drives hreflang and the
 * sitemap rather than hand-written on each page: flipping `placeholder` to
 * `translated` in Phase 3 updates all three at once, with no second place to
 * remember.
 *
 * The residual risk is a scheduling one, not a code one — cutting over before
 * Phase 3 finishes. That belongs on the pre-cutover URL audit (#38).
 */
export function placeholderRobots(pathname: string, locale: Locale) {
  if (!isPlaceholder(pathname, locale)) {
    return undefined
  }

  // `follow` so link equity still flows through to whatever the page links to.
  return { index: false, follow: true }
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
 * Uses reachability, not translation status: a placeholder page is still a real
 * page a reader asked for. Falls back to the English URL when the page does not
 * exist in that locale at all, rather than minting a localised URL that serves
 * English. One page, one URL — no duplicate for search engines to reconcile.
 */
export function localeHref(pathname: string, target: Locale): string {
  const path = normalize(pathname)
  const locale = localesFor(path).includes(target) ? target : DEFAULT_LOCALE

  return localePath(locale, withTrailingSlash(path))
}

/**
 * `alternates` metadata for a page: a self-referential canonical, plus hreflang
 * entries for the locales the page is genuinely translated into.
 *
 * When nothing else is translated the `languages` map is omitted rather than
 * emitted with a single self-referential entry, which says nothing and invites
 * the reader to think the relationship was considered and found empty.
 */
export function localeAlternates(pathname: string, locale: Locale) {
  const path = withTrailingSlash(normalize(pathname))
  const translated = translatedLocalesFor(path)
  const canonical = absoluteUrl(localePath(locale, path))

  if (translated.length < 2) {
    return { canonical }
  }

  const languages = Object.fromEntries(
    // The hreflang value is a BCP 47 tag, so Japanese is `ja` even though its
    // URL segment is the legacy `/jp/`.
    translated.map((candidate) => [candidate, absoluteUrl(localePath(candidate, path))])
  )

  return {
    canonical,
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

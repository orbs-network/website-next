/**
 * Locale definitions and URL mapping.
 *
 * The locale is NOT a dynamic `[locale]` segment. `src/app/(en)/[slug]` already
 * owns the root dynamic slot for blog posts, and adding `app/[locale]` next to
 * it makes Next refuse to build:
 *
 *   Error: Ambiguous app routes detected:
 *     - /[locale]
 *     - /[slug]
 *
 * The alternative was moving 456 posts to `/blog/[slug]` behind hardcoded 301s.
 * That was rejected: permanent redirects are cached by browsers indefinitely, so
 * it is a one-way door that puts a hop on every inbound link forever.
 *
 * So the locale lives in LITERAL route segments — `app/(jp)/jp`, `app/(ko)/ko` —
 * and English stays at the root, matching the legacy Cuttlebelle URLs exactly.
 * Nothing needs a redirect and no existing URL moves.
 */

export const LOCALES = ['en', 'ja', 'ko'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/**
 * The URL segment for each locale. English is the empty string — it is served
 * from the root, not from `/en/`, which is how the legacy site works and is what
 * keeps every indexed English URL unchanged.
 *
 * Note the segment for Japanese is `jp`, not the `ja` language code. That is the
 * legacy URL (`/jp/pos`) and it is indexed, so it must not be "corrected".
 */
export const LOCALE_SEGMENTS: Record<Locale, string> = {
  en: '',
  ja: 'jp',
  ko: 'ko',
}

/** BCP 47 tags for the `lang` attribute and `hreflang` annotations. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: 'en',
  ja: 'ja',
  ko: 'ko',
}

/**
 * The language the chrome (nav labels, header CTA) actually renders in.
 *
 * Usually the locale itself. Japanese is the exception: every label in the
 * legacy site's `jp/_shared/navbar/menu-links` is ASCII, so `ja.json` mirrors
 * English rather than inventing copy that site has never shown. The chrome on
 * `/jp/` is therefore English text inside a `lang="ja"` document, and saying so
 * matters — a screen reader told the text is Japanese applies Japanese
 * pronunciation rules to English words.
 *
 * Consumers use this to mark those regions with an explicit `lang`. When Phase 3
 * supplies real Japanese chrome, this becomes `ja` and the markup follows.
 */
export const LOCALE_CHROME_LANG: Record<Locale, Locale> = {
  en: 'en',
  ja: 'en',
  ko: 'ko',
}

/** Labels shown in the language selector. Deliberately not translated. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ja: 'JP',
  ko: 'KO',
}

const SEGMENT_TO_LOCALE = new Map<string, Locale>(
  LOCALES.filter((locale) => LOCALE_SEGMENTS[locale] !== '').map((locale) => [LOCALE_SEGMENTS[locale], locale])
)

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * Which locale a pathname belongs to, and the locale-independent path within it.
 *
 *   /jp/pos/   -> { locale: 'ja', pathname: '/pos/' }
 *   /pos/      -> { locale: 'en', pathname: '/pos/' }
 *   /jp/       -> { locale: 'ja', pathname: '/' }
 *
 * A bare `/jp` with no trailing content is the Japanese home page, so it
 * resolves to `/` rather than an empty string — callers can concatenate the
 * result onto a locale prefix without special-casing the root.
 */
export function splitLocale(pathname: string): { locale: Locale; pathname: string } {
  const [, first = '', ...rest] = pathname.split('/')
  const locale = SEGMENT_TO_LOCALE.get(first)

  if (!locale) {
    return { locale: DEFAULT_LOCALE, pathname }
  }

  const remainder = rest.join('/')
  return { locale, pathname: remainder === '' ? '/' : `/${remainder}` }
}

/**
 * Prefix a locale-independent path with the locale's segment.
 *
 * Trailing slashes are preserved because `trailingSlash: true` is set in
 * next.config.mjs — emitting the slashless form would 308 on every request.
 */
export function localePath(locale: Locale, pathname: string): string {
  const segment = LOCALE_SEGMENTS[locale]

  if (segment === '') {
    return pathname
  }

  return pathname === '/' ? `/${segment}/` : `/${segment}${pathname}`
}

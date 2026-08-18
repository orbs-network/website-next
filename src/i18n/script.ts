import type { Locale } from './locales'

/**
 * Characters that only appear when a string is genuinely written in the locale's
 * script. Latin-only text in a Japanese or Korean page is untranslated copy.
 */
const LOCALE_SCRIPT: Record<Locale, RegExp | null> = {
  // Latin is the default; nothing to distinguish it from.
  en: null,
  // Hiragana, katakana, and CJK ideographs.
  ja: /[぀-ヿ㐀-䶿一-鿿]/,
  // Hangul syllables and jamo.
  ko: /[ᄀ-ᇿ가-힯]/,
}

/**
 * The `lang` a string should carry, or `undefined` when it matches the document.
 *
 * Catalog coverage is partial and uneven, so this is decided per string rather
 * than per locale. Korean chrome is a genuine mix: `블로그`, `미디어` and
 * `문의하기` are translated, while `Products`, `Tetra`, `Documentation` and
 * `GitHub` are still English because the legacy site left them that way.
 * Japanese chrome is English almost throughout. A per-locale flag cannot express
 * either, and marking the whole Korean header `ko` makes a screen reader read
 * "GitHub" with Korean pronunciation rules.
 *
 * Inspecting the rendered string is deliberate: it stays correct on its own as
 * Phase 3 translates catalog entries, with no parallel map to update and no way
 * for the two to drift apart. Strings that are Latin *because they are proper
 * nouns* — "GitHub", "Tetra", "dTWAP" — are marked English, which is what they
 * are.
 */
export function textLang(value: string, locale: Locale): 'en' | undefined {
  const script = LOCALE_SCRIPT[locale]

  if (!script) {
    return undefined
  }

  return script.test(value) ? undefined : 'en'
}

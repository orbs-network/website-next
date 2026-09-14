import { LegalDocument } from '@/components/marketing/legal-document'
import { LEGAL_DOCUMENTS, type LegalPagePath } from '@/content/legal'
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales'

/**
 * One body for all four legal pages.
 *
 * They differ only in which document they render, so they share a component
 * rather than getting four near-identical modules — the pattern the registry
 * already uses to avoid 44 locale variants of the marketing pages.
 *
 * A locale with no translated document falls back to English rather than
 * rendering nothing. `AVAILABILITY` marks those `placeholder`, which is what
 * drives `placeholderRobots` to keep them out of the index, so the fallback is
 * visible to readers without competing with the English page in search.
 */
export function LegalPage({ path, locale }: { path: LegalPagePath; locale: Locale }) {
  const document = LEGAL_DOCUMENTS[path]
  const translated = document.body[locale]
  const markdown = translated ?? document.body[DEFAULT_LOCALE]

  // Unreachable: every entry defines `en`, and the type requires the map to be
  // complete. Narrowing rather than asserting, so a future entry that forgets
  // English fails loudly at the one place that would otherwise render blank.
  if (!markdown) {
    throw new Error(`No legal document body for ${path} in ${locale}, and no English fallback.`)
  }

  /**
   * The document's own language, which is not always the route's.
   *
   * Two separate cases, and both produce a document whose language differs from
   * the page around it:
   *
   *  - A locale with no translation falls back to the English text. Without an
   *    explicit `lang` the article inherits the route's — so `/ko/privacy-policy`
   *    would hand a screen reader English prose tagged Korean and have it
   *    pronounced with Korean rules.
   *  - The accessibility declaration is Hebrew at an English URL, and says so
   *    via its own `lang`, which wins over either of the above.
   */
  const lang = document.lang ?? (translated ? undefined : DEFAULT_LOCALE)

  return <LegalDocument markdown={markdown} lang={lang} dir={document.dir} />
}

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
  const markdown = document.body[locale] ?? document.body[DEFAULT_LOCALE]

  // Unreachable: every entry defines `en`, and the type requires the map to be
  // complete. Narrowing rather than asserting, so a future entry that forgets
  // English fails loudly at the one place that would otherwise render blank.
  if (!markdown) {
    throw new Error(`No legal document body for ${path} in ${locale}, and no English fallback.`)
  }

  return <LegalDocument markdown={markdown} lang={document.lang} dir={document.dir} />
}

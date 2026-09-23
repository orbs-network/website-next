import { getTranslations } from 'next-intl/server'
import { FaqDocument } from '@/components/marketing/faq-document'
import { FAQ_DOCUMENTS, type FaqPagePath } from '@/content/faq'
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales'

/**
 * One body for both FAQ pages, as the legal pages share theirs.
 *
 * A locale with no translated document falls back to English. `AVAILABILITY`
 * marks those `placeholder`, which keeps them out of the index while still
 * serving something to a reader who lands there.
 */
export async function FaqPage({
  path,
  locale,
  namespace,
}: {
  path: FaqPagePath
  locale: Locale
  /** Catalog namespace holding this page's `meta.title`. Passed from the registry. */
  namespace: string
}) {
  const document = FAQ_DOCUMENTS[path]
  const translated = document.body[locale]
  const markdown = translated ?? document.body[DEFAULT_LOCALE]

  // Unreachable: every entry defines `en` and the type requires the map to be
  // complete. Narrowing rather than asserting, so a future entry that forgets
  // English fails loudly instead of rendering an empty page.
  if (!markdown) {
    throw new Error(`No FAQ body for ${path} in ${locale}, and no English fallback.`)
  }

  const t = await getTranslations({ locale, namespace: `${namespace}.meta` })

  /**
   * English text served under a non-English route has to say so, or a screen
   * reader pronounces it with the wrong language's rules — the same defect
   * fixed for `/ko/privacy-policy` in #129.
   */
  const lang = translated ? undefined : DEFAULT_LOCALE

  return <FaqDocument markdown={markdown} title={t('title')} locale={locale} />
}

import { getTranslations } from 'next-intl/server'
import { LegalDocument } from '@/components/marketing/legal-document'
import type { Locale } from '@/i18n/locales'
import { TETRA_ARCHIVE_KOREAN_MARKDOWN, TETRA_ARCHIVE_MARKDOWN } from '@/content/archive/tetra'

/** Reuse the long-form document layout without adding a dated blog entry. */
export async function TetraArchivePage({ locale = 'en' }: { locale?: Locale } = {}) {
  const t = await getTranslations({ locale, namespace: 'pages.tetraArchive.meta' })

  return (
    <LegalDocument
      markdown={locale === 'ko' ? TETRA_ARCHIVE_KOREAN_MARKDOWN : TETRA_ARCHIVE_MARKDOWN}
      title={t('title')}
      locale={locale}
    />
  )
}

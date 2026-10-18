import { getTranslations } from 'next-intl/server'
import { LegalDocument } from '@/components/marketing/legal-document'
import { TETRA_ARCHIVE_MARKDOWN } from '@/content/archive/tetra'

/** Reuse the long-form document layout without adding a dated blog entry. */
export async function TetraArchivePage() {
  const t = await getTranslations({ locale: 'en', namespace: 'pages.tetraArchive.meta' })

  return <LegalDocument markdown={TETRA_ARCHIVE_MARKDOWN} title={t('title')} locale="en" />
}

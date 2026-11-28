import { getTranslations } from 'next-intl/server'
import { WhitePaperList } from '@/components/marketing/white-paper-list'
import { WHITE_PAPER_CATEGORIES } from '@/content/pages/white-papers'
import type { Locale } from '@/i18n/locales'
import { localeHref } from '@/i18n/availability'
import { textLang } from '@/i18n/script'

/** Translated titles and abstracts; downloadable PDFs retain their published language. */
export async function WhitePapersPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.whitePapers' })

  const groups = WHITE_PAPER_CATEGORIES.map((category) => ({
    key: category.key,
    title: t(`categories.${category.key}`),
    papers: category.papers.map((paper) => {
      const title = t(`items.${paper.slug}.title`)
      const abstract = t(`items.${paper.slug}.abstract`)

      return {
        slug: paper.slug,
        href: localeHref(`/white-papers/${paper.slug}`, locale),
        title,
        abstract,
        date: paper.date,
        image: paper.image,
      }
    }),
  }))

  return <WhitePaperList title={t('meta.title')} groups={groups} locale={locale} />
}

import { NewsIndex } from '@/app/(en)/news/news-index'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import { getTranslations } from 'next-intl/server'

export const revalidate = 86400
export async function generateMetadata() {
  const t = await getTranslations({ locale: 'ja', namespace: 'pages.news.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates('/news', 'ja'),
    robots: placeholderRobots('/news', 'ja'),
  }
}

export default function NewsPage() {
  return <NewsIndex currentPage={1} locale="ja" />
}

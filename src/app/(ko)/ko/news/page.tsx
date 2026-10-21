import { NewsIndex } from '@/app/(en)/news/news-index'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'

export const revalidate = 86400
export const metadata = {
  title: '언론 보도',
  description: 'Orbs를 소개하는 언론 보도와 발행물입니다.',
  alternates: localeAlternates('/news', 'ko'),
  robots: placeholderRobots('/news', 'ko'),
}

export default function NewsPage() {
  return <NewsIndex currentPage={1} locale="ko" />
}

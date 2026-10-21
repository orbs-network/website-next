import { localePath, type Locale } from '@/i18n/locales'
import { notFound } from 'next/navigation'
import { H1 } from '@/app/components/typography'
import { Pagination } from '@/app/components/pagination'
import { getMediaMentions, MEDIA_PER_PAGE } from '@/app/lib/api'
import { newsPagePath } from '@/app/lib/routes'
import { MediaCard } from './news-card'

/** Copy lifted from the legacy content/news/hero. */
function Heading({ locale }: { locale: Locale }) {
  return (
    <div lang={locale === 'ko' ? 'ko' : 'en'} className="flex flex-col items-center justify-center pt-10 pb-20">
      <H1 className="inline-block text-center mx-auto">{locale === 'ko' ? '언론 속 Orbs' : 'Orbs in the News'}</H1>
      <p className="text-fg-muted text-center">
        {locale === 'ko'
          ? 'Orbs를 소개하는 최신 기사와 발행물을 확인하세요.'
          : 'Check out the latest articles and publications featuring Orbs.'}
      </p>
    </div>
  )
}

/**
 * Shared body for `/news` and `/news/page/[n]` so the two routes cannot drift.
 * Same shape as BlogIndex deliberately — one pattern, two collections.
 */
export async function NewsIndex({ currentPage, locale = 'en' }: { currentPage: number; locale?: Locale }) {
  const { items, total } = await getMediaMentions({
    skip: (currentPage - 1) * MEDIA_PER_PAGE,
    limit: MEDIA_PER_PAGE,
  })

  const totalPages = Math.max(1, Math.ceil(total / MEDIA_PER_PAGE))

  // A page past the end would otherwise render an empty grid at a crawlable
  // URL. Page 1 is exempt: an empty collection is a valid state.
  if (currentPage > 1 && items.length === 0) {
    notFound()
  }

  if (items.length === 0) {
    return (
      <div className="container py-10">
        <Heading locale={locale} />
        <p className="text-fg-muted">
          {locale === 'ko'
            ? '아직 등록된 기사가 없습니다. 나중에 다시 확인해 주세요.'
            : 'No coverage yet. Check back soon.'}
        </p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Heading locale={locale} />
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((mention) => (
          <MediaCard key={mention.url} mention={mention} />
        ))}
      </div>
      <Pagination
        locale={locale}
        currentPage={currentPage}
        totalPages={totalPages}
        pathFor={(page) => localePath(locale, newsPagePath(page))}
        label={locale === 'ko' ? '언론 보도 페이지 이동' : 'Media coverage pagination'}
      />
    </div>
  )
}

/** Page count, for `generateStaticParams` and out-of-range checks. */
export async function getTotalNewsPages(): Promise<number> {
  // limit: 1 — only `total` is wanted, not the entries.
  const { total } = await getMediaMentions({ skip: 0, limit: 1 })
  return Math.max(1, Math.ceil(total / MEDIA_PER_PAGE))
}

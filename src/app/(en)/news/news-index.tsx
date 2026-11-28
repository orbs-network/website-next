import { Pagination } from '@/app/components/pagination'
import { H1 } from '@/app/components/typography'
import { getMediaMentions, MEDIA_PER_PAGE } from '@/app/lib/api'
import { newsPagePath } from '@/app/lib/routes'
import { localePath, type Locale } from '@/i18n/locales'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MediaCard } from './news-card'

/** Labels come from the locale catalog; the shared markup does not choose wording. */
function Heading({ locale, title, description }: { locale: Locale; title: string; description: string }) {
  return (
    <div lang={locale} className="flex flex-col items-center justify-center pt-10 pb-20">
      <H1 className="inline-block text-center mx-auto">{title}</H1>
      <p className="text-fg-muted text-center">{description}</p>
    </div>
  )
}

/**
 * Shared body for `/news` and `/news/page/[n]` so the two routes cannot drift.
 * Same shape as BlogIndex deliberately — one pattern, two collections.
 */
export async function NewsIndex({ currentPage, locale = 'en' }: { currentPage: number; locale?: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.news' })
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
        <Heading locale={locale} title={t('title')} description={t('description')} />
        <p className="text-fg-muted">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Heading locale={locale} title={t('title')} description={t('description')} />
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((mention) => (
          <MediaCard key={mention.url} mention={mention} locale={locale} />
        ))}
      </div>
      <Pagination
        locale={locale}
        currentPage={currentPage}
        totalPages={totalPages}
        pathFor={(page) => localePath(locale, newsPagePath(page))}
        label={t('paginationLabel')}
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

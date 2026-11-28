import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import en from './messages/en.json'
import ja from './messages/ja.json'
import ko from './messages/ko.json'
import type { Locale } from './locales'
import { Pagination } from '@/app/components/pagination'
import { NewsIndex } from '@/app/(en)/news/news-index'
import { getMediaMentions, MEDIA_PER_PAGE, type MediaMentionFields } from '@/app/lib/api'
import { WhitePaperPage, whitePaperMetadata } from '@/app/marketing/white-paper'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { FaqDocument } from '@/components/marketing/faq-document'
import { FAQ_DOCUMENTS } from '@/content/faq'
import { localeHref } from './availability'

const catalogs = { en, ja, ko }
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({
      locale,
      messages: catalogs[locale] as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))
vi.mock('@/app/lib/api', () => ({ getMediaMentions: vi.fn(), MEDIA_PER_PAGE: 12, getAssetUrl: () => null }))

// Resolve the async server pagination slot before using the synchronous HTML renderer.
async function resolvePagination(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(resolvePagination))
  if (!isValidElement(node)) return node
  if (node.type === Pagination) return Pagination(node.props as Parameters<typeof Pagination>[0])
  const element = node as ReactElement<{ children?: ReactNode }>
  if (element.props.children === undefined) return element
  const children = await Promise.all(Children.toArray(element.props.children).map(resolvePagination))
  return cloneElement(element, { children })
}

beforeEach(() => vi.mocked(getMediaMentions).mockReset())

describe('locale catalog wiring preserves presentation and navigation', () => {
  it.each([
    ['en', 'Previous', 'Next', 'Page 7'],
    ['ko', '이전', '다음', '7페이지'],
    ['ja', '前へ', '次へ', '7ページ'],
  ] as const)(
    'keeps %s pagination URLs, labels and current-page semantics',
    async (locale, previous, next, current) => {
      const html = renderToStaticMarkup(
        await Pagination({
          currentPage: 7,
          totalPages: 27,
          pathFor: (page) => `/news/page/${page}/`,
          locale,
          label: 'Archive',
        })
      )
      expect(html).toContain('aria-label="Archive"')
      expect(html).toContain(previous)
      expect(html).toContain(next)
      expect(html).toContain('href="/news/page/6/"')
      expect(html).toContain('href="/news/page/8/"')
      expect(html).toContain(`aria-label="${current}" aria-current="page"`)
      expect(html.match(/aria-hidden="true"/g)).toHaveLength(2)
    }
  )

  it('keeps the English blog call signature and suppresses single-page pagination', async () => {
    const html = renderToStaticMarkup(
      await Pagination({
        currentPage: 2,
        totalPages: 3,
        pathFor: (page) => `/blog/page/${page}/`,
        label: 'Blog pagination',
      })
    )
    expect(html).toContain('aria-label="Blog pagination"')
    expect(html).toContain('Previous')
    expect(html).toContain('Next')
    expect(html).toContain('aria-label="Page 2"')
    expect(await Pagination({ currentPage: 1, totalPages: 1, pathFor: () => '/blog/' })).toBeNull()
  })

  it.each(['en', 'ko', 'ja'] as const)('keeps %s news chrome localized and CMS cards English', async (locale) => {
    const mention: MediaMentionFields = {
      headline: 'English publisher headline',
      date: '2026-11-22T00:00:00Z',
      url: 'https://example.com/report',
    }
    vi.mocked(getMediaMentions).mockResolvedValue({ items: [mention], total: MEDIA_PER_PAGE * 3 })
    const html = renderToStaticMarkup(await resolvePagination(await NewsIndex({ currentPage: 2, locale })))
    expect(getMediaMentions).toHaveBeenCalledWith({ skip: MEDIA_PER_PAGE, limit: MEDIA_PER_PAGE })
    expect(html).toContain(catalogs[locale].pages.news.title)
    expect(html).toContain(catalogs[locale].pages.news.paginationLabel)
    expect(html).toContain('lang="en" href="https://example.com/report"')
    expect(html).toContain('English publisher headline (opens on the publisher&#x27;s site)')
    const prefix = locale === 'ja' ? '/jp' : locale === 'ko' ? '/ko' : ''
    expect(html).toContain(`href="${prefix}/news/"`)
    expect(html).toContain(`href="${prefix}/news/page/3/"`)
  })

  it.each(['en', 'ko', 'ja'] as const)('keeps %s news empty and out-of-range behavior', async (locale) => {
    vi.mocked(getMediaMentions).mockResolvedValue({ items: [], total: 0 })
    expect(renderToStaticMarkup(await NewsIndex({ currentPage: 1, locale }))).toContain(
      catalogs[locale].pages.news.empty
    )
    await expect(NewsIndex({ currentPage: 2, locale })).rejects.toThrow()
  })

  it.each(['en', 'ko', 'ja'] as const)('keeps %s white-paper labels, files and edition languages', async (locale) => {
    const paper = WHITE_PAPERS.find((item) => item.pdfByLocale?.ja && item.pdfByLocale?.ko)!
    expect(paper).toBeDefined()
    const html = renderToStaticMarkup(await WhitePaperPage({ slug: paper.slug, locale }))
    const ui = catalogs[locale].pages.whitePapers.ui
    expect(html).toContain(`aria-label="${ui.breadcrumb}"`)
    expect(html).toContain(ui.readPdf)
    expect(html).toContain(ui.pdfUnavailable)
    expect(html).toContain(`href="${paper.pdf}"`)
    expect(html).toContain(`href="${paper.pdfByLocale!.ja}"`)
    expect(html).toContain(`href="${paper.pdfByLocale!.ko}"`)
    expect(html).toContain(ui.japaneseEdition)
    expect(html).toContain(ui.koreanEdition)
    expect(html).toContain(`href="${localeHref('/white-papers', locale)}"`)
    expect(await whitePaperMetadata('not-a-paper', locale)).toEqual({ title: ui.notFound })
  })

  it('renders Japanese FAQ links to available Japanese destinations while preserving external URLs', () => {
    const markdown = FAQ_DOCUMENTS['/faq'].body.ja!
    const html = renderToStaticMarkup(FaqDocument({ markdown, title: 'FAQ', locale: 'ja' }))
    for (const path of [
      '/dspot',
      '/dperps',
      '/execution-services',
      '/contact',
      '/agentic',
      '/ecosystem',
      '/pos',
      '/security-and-audits',
    ]) {
      expect(html).toContain(`href="${localeHref(path, 'ja')}"`)
      expect(html).not.toContain(`href="${path}/"`)
    }
    expect(html).toContain('href="https://docs.orbs.com/"')
  })
})

import { renderToReadableStream } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import type { Locale } from '@/i18n/locales'
import { NewsIndex } from './news-index'

vi.mock('@/app/lib/api', () => ({
  MEDIA_PER_PAGE: 12,
  getAssetUrl: () => undefined,
  getMediaMentions: async () => ({
    total: 1,
    items: [{ headline: 'English publisher headline', url: 'https://example.com/news', date: '2026-11-18T12:00:00Z' }],
  }),
}))
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({ locale, namespace, messages: { en, ja, ko }[locale] as AbstractIntlMessages }),
}))

describe('news page date language', () => {
  it.each([
    ['en', 'November 18, 2026'],
    ['ja', '2026年11月18日'],
    ['ko', '2026년 11월 18일'],
  ] as const)('formats dates in %s without translating publisher content', async (locale, date) => {
    const stream = await renderToReadableStream(await NewsIndex({ currentPage: 1, locale }))
    await stream.allReady
    const html = await new Response(stream).text()
    expect(html).toContain(`<time dateTime="2026-11-18T12:00:00Z" lang="${locale}">${date}</time>`)
    expect(html).toContain('<a lang="en"')
    expect(html).toContain('English publisher headline')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

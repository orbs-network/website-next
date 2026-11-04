import { BLOCKS } from '@contentful/rich-text-types'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import type { Locale } from '@/i18n/locales'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { getPostBySlug, type BlogPostFields } from './api'
import { generateMetadata as home } from '@/app/(en)/page'
import { generateMetadata as japaneseHome } from '@/app/(jp)/jp/page'
import { generateMetadata as koreanHome } from '@/app/(ko)/ko/page'
import { metadata as blog } from '@/app/(en)/blog/page'
import { metadata as news } from '@/app/(en)/news/page'
import { metadata as koreanNews } from '@/app/(ko)/ko/news/page'
import { metadata as governance } from '@/app/(en)/governance-blog/page'
import { generateMetadata as blogPage } from '@/app/(en)/blog/page/[n]/page'
import { generateMetadata as newsPage } from '@/app/(en)/news/page/[n]/page'
import { generateMetadata as koreanNewsPage } from '@/app/(ko)/ko/news/page/[n]/page'
import { generateMetadata as article } from '@/app/(en)/[slug]/page'
import { whitePaperMetadata } from '@/app/marketing/white-paper'
import { DEFAULT_SOCIAL_IMAGE } from './social-metadata'

const draft = vi.hoisted(() => ({ enabled: false }))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: draft.enabled }) }))
vi.mock('@/app/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  getPostBySlug: vi.fn(),
}))
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({
      locale,
      namespace,
      messages: { en, ja, ko }[locale] as AbstractIntlMessages,
      onError: (error) => {
        throw error
      },
    }),
}))

beforeEach(() => {
  draft.enabled = false
  vi.mocked(getPostBySlug).mockReset()
})

describe('metadata entry points outside the marketing registry', () => {
  it('covers all three homepages and every archive/index with page-specific sharing text', async () => {
    const metadata = [
      await home(),
      await japaneseHome(),
      await koreanHome(),
      blog,
      news,
      koreanNews,
      governance,
      await blogPage({ params: Promise.resolve({ n: '2' }) }),
      await newsPage({ params: Promise.resolve({ n: '2' }) }),
      await koreanNewsPage({ params: Promise.resolve({ n: '2' }) }),
    ]
    for (const page of metadata) {
      expect(page.openGraph).toMatchObject({
        title: `${page.title} | Orbs`,
        description: page.description,
        url: page.alternates?.canonical,
        images: [{ url: `https://www.orbs.com${DEFAULT_SOCIAL_IMAGE.url}` }],
      })
      expect(page.twitter).toMatchObject({ card: 'summary_large_image', description: page.description })
    }
    expect(metadata.slice(-3).map((page) => page.alternates?.canonical)).toEqual([
      'https://www.orbs.com/blog/page/2/',
      'https://www.orbs.com/news/page/2/',
      'https://www.orbs.com/ko/news/page/2/',
    ])
  })

  it('covers English and Korean white-paper details without changing canonical or robots policy', async () => {
    for (const paper of WHITE_PAPERS)
      for (const locale of ['en', 'ko'] as const) {
        const metadata = await whitePaperMetadata(paper.slug, locale)
        expect(metadata.description).toBeTruthy()
        expect(metadata.openGraph).toMatchObject({
          title: `${metadata.title} | Orbs`,
          description: metadata.description,
          url: metadata.alternates?.canonical,
          images: [{ url: `https://www.orbs.com${DEFAULT_SOCIAL_IMAGE.url}` }],
        })
        expect(metadata.description).not.toMatch(/\[[^\]]+\]\(/)
      }
  })

  it('keeps article metadata on the published/preview source already selected by the route', async () => {
    const post: BlogPostFields = {
      title: 'Preview headline',
      shortDescription: 'Preview introduction',
      date: '2026-11-01T00:00:00Z',
      author: { sys: { type: 'Link', linkType: 'Entry', id: 'author' } },
      content: { nodeType: BLOCKS.DOCUMENT, data: {}, content: [] },
    }
    draft.enabled = true
    vi.mocked(getPostBySlug).mockResolvedValue(post)
    const metadata = await article({ params: Promise.resolve({ slug: 'draft-post' }) })
    expect(getPostBySlug).toHaveBeenCalledWith('draft-post', true)
    expect(metadata.openGraph).toMatchObject({
      title: 'Preview headline | Orbs',
      type: 'article',
      description: 'Preview introduction',
    })
  })
})

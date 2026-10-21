import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import { HomePage } from './home'
import KoreanHome from '@/app/(ko)/ko/page'
import { OverviewPage } from './overview'
import { DperpsPage } from './dperps'
import { ExecutionServicesPage } from './execution-services'
import { EcosystemPage } from './ecosystem'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: 'en' | 'ko'; namespace: string }) =>
    createTranslator({
      locale,
      messages: (locale === 'ko' ? ko : en) as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))
vi.mock('@/app/lib/api', () => ({ getRecentPosts: async () => [], getAssetUrl: () => null, getAuthorInfo: () => null }))
vi.mock('./inner-closing', () => ({ InnerClosingCta: () => null }))

function sectionStructure(html: string) {
  return [...html.matchAll(/<section\b([^>]*)>/g)].map((match) => match[1].match(/class="([^"]*)"/)?.[1] ?? '')
}

describe('Korean refreshed page layout parity', () => {
  it('routes the Korean homepage through the refreshed composition', () => {
    const page = KoreanHome()
    expect(page.type).toBe(HomePage)
    expect(page.props.locale).toBe('ko')
  })
  it.each([
    ['Home', HomePage],
    ['Overview', OverviewPage],
    ['dPERPS', DperpsPage],
    ['Execution Services', ExecutionServicesPage],
    ['Ecosystem', EcosystemPage],
  ] as const)('%s uses the English section layout without missing Korean catalog keys', async (_name, Page) => {
    const english = renderToStaticMarkup(await Page({ locale: 'en' }))
    const korean = renderToStaticMarkup(await Page({ locale: 'ko' }))
    expect(sectionStructure(korean)).toEqual(sectionStructure(english))
    expect(sectionStructure(korean).length).toBeGreaterThan(0)
  })

  it('keeps the Korean homepage Blog external while using the new hero', async () => {
    const html = renderToStaticMarkup(await HomePage({ locale: 'ko' }))
    expect(html).toContain(ko.pages.home.hero.headline)
    expect(html).toContain('href="http://blog.naver.com/orbskorea"')
    expect(html).not.toContain('href="/blog/"')
    expect(html).toContain('id="products"')
  })
})

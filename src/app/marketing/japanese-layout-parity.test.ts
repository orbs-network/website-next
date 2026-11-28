import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import { HomePage } from './home'
import JapaneseHome from '@/app/(jp)/jp/page'
import { OverviewPage } from './overview'
import { DperpsPage } from './dperps'
import { ExecutionServicesPage } from './execution-services'
import { EcosystemPage } from './ecosystem'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: 'en' | 'ja'; namespace: string }) =>
    createTranslator({
      locale,
      messages: (locale === 'ja' ? ja : en) as AbstractIntlMessages,
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

describe('Japanese refreshed page layout parity', () => {
  it('routes the Japanese homepage through the refreshed composition', () => {
    const page = JapaneseHome()
    expect(page.type).toBe(HomePage)
    expect(page.props.locale).toBe('ja')
  })
  it.each([
    ['Home', HomePage],
    ['Overview', OverviewPage],
    ['dPERPS', DperpsPage],
    ['Execution Services', ExecutionServicesPage],
    ['Ecosystem', EcosystemPage],
  ] as const)('%s uses the English section layout without missing Japanese catalog keys', async (_name, Page) => {
    const english = renderToStaticMarkup(await Page({ locale: 'en' }))
    const japanese = renderToStaticMarkup(await Page({ locale: 'ja' }))
    expect(sectionStructure(japanese)).toEqual(sectionStructure(english))
    expect(sectionStructure(japanese).length).toBeGreaterThan(0)
  })

  it('keeps the Japanese homepage Blog external while using the new hero', async () => {
    const html = renderToStaticMarkup(await HomePage({ locale: 'ja' }))
    expect(html).toContain(ja.pages.home.hero.headline)
    expect(html).toContain('href="https://orbs-japan-community.medium.com/"')
    expect(html).not.toContain('href="/blog/"')
    expect(html).toContain('id="products"')
  })
})

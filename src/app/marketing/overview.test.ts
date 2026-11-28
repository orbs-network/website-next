import type { Locale } from '@/i18n/locales'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ExecutionServicesPage } from './execution-services'
import { OverviewPage } from './overview'

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

// The shared closing block is an async server component, rendered separately
// by Next. These tests exercise the two page compositions before that boundary.
vi.mock('./inner-closing', () => ({ InnerClosingCta: () => null }))

describe('English network content refresh', () => {
  it('renders the three products, distinct launch dates and both Overview CTAs', async () => {
    const html = renderToStaticMarkup(await OverviewPage({ locale: 'en' }))
    expect(html).toContain('The L3 powering onchain finance')
    expect(html).toContain('href="/#products"')
    expect(html).toContain('href="/pos/"')
    for (const href of ['/dspot/', '/dperps/', '/execution-services/']) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).toContain('2017')
    expect(html).toContain('2019')
    expect(html).toContain('1.1B')
    expect(html).not.toContain('On-chain Trading Challenges')
  })

  it('renders Lambda/VM models and the network docs, without the legacy graphs', async () => {
    const html = renderToStaticMarkup(await ExecutionServicesPage({ locale: 'en' }))
    expect(html).toContain('Run the logic beyond your smart contracts.')
    expect(html).toContain('/marketing/execution-services/hero.svg')
    expect(html).toContain('/marketing/execution-services/hero-light.svg')
    expect(html).toContain('href="https://docs.orbs.network/v3"')
    expect(html).toContain('Functions that respond to onchain events.')
    expect(html).toContain('Choose your tools. Keep your service running.')
    expect(html).toContain('data-product-graphic="lambda"')
    expect(html).toContain('data-product-graphic="vm"')
    expect(html).not.toContain('Choose the execution model that fits')
    expect(html).not.toContain('/marketing/execution-services/lambda-dark.svg')
    expect(html).not.toContain('/marketing/execution-services/vm-dark.svg')
    expect(html).not.toContain('graph-1.png')
    expect(html).not.toContain('graph-2.png')
  })

  it('uses the shared current layout with Japanese copy and local destinations', async () => {
    const overview = renderToStaticMarkup(await OverviewPage({ locale: 'ja' }))
    for (const path of ['dspot', 'dperps', 'execution-services']) expect(overview).toContain(`href="/jp/${path}/"`)
    expect(overview).toContain('オンチェーン金融を支えるL3')
    expect(overview).not.toContain('href="#protocols"')
    const execution = renderToStaticMarkup(await ExecutionServicesPage({ locale: 'ja' }))
    expect(execution).toContain('/marketing/execution-services/hero.svg')
    expect(execution).toContain('data-product-graphic="lambda"')
    expect(execution).toContain('data-product-graphic="vm"')
    expect(execution).not.toContain('graph-1.png')
    expect(execution).toContain('href="https://docs.orbs.network/v3"')
  })
})

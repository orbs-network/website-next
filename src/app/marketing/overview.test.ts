import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import type { Locale } from '@/i18n/locales'
import { OverviewPage } from './overview'
import { ExecutionServicesPage } from './execution-services'

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
    expect(html).toContain('A function, a trigger and a focused task.')
    expect(html).toContain('A container, a persistent runtime and a custom service.')
    expect(html).toContain('/marketing/execution-services/lambda-illustration.svg')
    expect(html).toContain('/marketing/execution-services/vm-illustration.svg')
    expect(html).not.toContain('/marketing/execution-services/lambda-dark.svg')
    expect(html).not.toContain('/marketing/execution-services/vm-dark.svg')
    expect(html).not.toContain('graph-1.png')
    expect(html).not.toContain('graph-2.png')
  })

  it.each(['ja'] as const)('keeps the existing %s sections and uses only that catalog', async (locale) => {
    const overview = renderToStaticMarkup(await OverviewPage({ locale }))
    expect(overview).toContain('href="#protocols"')
    expect(overview).toContain(`href="/${locale === 'ja' ? 'jp' : locale}/dtwap/"`)
    expect(overview).not.toContain('href="/#products"')
    expect(overview).not.toContain('Built for the long run')

    const execution = renderToStaticMarkup(await ExecutionServicesPage({ locale }))
    expect(execution).not.toContain('/marketing/execution-services/hero')
    expect(execution).toContain('/marketing/execution-services/lambda-dark.svg')
    expect(execution).toContain('/marketing/execution-services/vm-dark.svg')
    expect(execution).not.toContain('-illustration.svg')
    expect(execution).toContain('graph-1.png')
    expect(execution).toContain('graph-2.png')
    expect(execution).not.toContain('Choose the execution model that fits')
    expect(execution).not.toContain('href="https://docs.orbs.network/v3"')
  })
})

import type { Locale } from '@/i18n/locales'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { EcosystemPage } from './ecosystem'
import { VenuesPage } from './venues'

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
vi.mock('./inner-closing', () => ({ InnerClosingCta: () => null }))

describe('venues and ecosystem handoff', () => {
  it('replaces the English sections with one deduplicated, filterable logo grid', async () => {
    const html = renderToStaticMarkup(await EcosystemPage({ locale: 'en' }))
    expect(html).toContain('Filter ecosystem')
    expect((html.match(/role="tab"/g) ?? []).length).toBe(6)
    expect((html.match(/target="_blank"/g) ?? []).length).toBe(39)
    expect(html.indexOf('Carbon')).toBeLessThan(html.indexOf('TrebleSwap'))
    for (const name of [
      'Featured partners',
      'Upcoming',
      'Ocelex',
      'Fantom',
      'Pangolin',
      'BaseSwap',
      'ArbiDex',
      'Chronos',
      'SyncSwap',
      'TON Minter',
      'Bybit',
    ])
      expect(html).not.toContain(name)
    expect(html).not.toContain('<table')
    expect(html).not.toContain('id="dspot"')
    expect(html).toContain('https://x.com/CarbonTerminal')
    expect(html).toContain('https://x.com/BuildOnLumia')
  })
  it.each(['ja'] as const)('uses the refreshed %s grid', async (locale) => {
    const html = renderToStaticMarkup(await EcosystemPage({ locale }))
    expect(html).not.toContain('TON Minter')
    expect(html).not.toContain('Bybit')
    expect(html).not.toContain('id="dperps"')
    expect(html).toContain('カテゴリで絞り込む')
  })
  it('uses the supplied venue CTAs and SushiSwap four-chain rollout', async () => {
    const html = renderToStaticMarkup(await VenuesPage({ locale: 'en' }))
    expect(html).toContain('Your venue. More ways to trade.')
    expect(html).toContain('$14B+')
    expect(html).toContain('Processed')
    expect(html).toContain('href="/contact/"')
    expect(html).toContain('href="https://docs.orbs.com/"')
    expect(html).toContain('Ethereum, Base, Arbitrum and Katana')
    expect(html).toContain('Bring dSPOT to your venue')
    expect(html).not.toContain('Explore the UI kit')
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import type { Locale } from '@/i18n/locales'
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
  it('replaces the English directory and separates current, historical and upcoming data', async () => {
    const html = renderToStaticMarkup(await EcosystemPage({ locale: 'en' }))
    expect(html).toContain('Orbs execution, across the ecosystem.')
    expect(html).toContain('id="dperps"')
    expect(html).toContain('id="dspot"')
    expect(html).toContain('Carbon')
    expect(html.indexOf('Carbon')).toBeLessThan(html.indexOf('TrebleSwap'))
    expect(html).toContain('Upcoming')
    expect(html).toContain('Ocelex is recorded as an upcoming integration.')
    expect(html).toContain('SpookySwap: Fantom')
    for (const name of ['Pangolin', 'BaseSwap', 'ArbiDex', 'Chronos', 'SyncSwap']) expect(html).not.toContain(name)
    expect(html).not.toContain('TON Minter')
    expect(html).not.toContain('Bybit')
  })
  it.each(['ja', 'ko'] as const)('retains the existing %s directory', async (locale) => {
    const html = renderToStaticMarkup(await EcosystemPage({ locale }))
    expect(html).toContain('TON Minter')
    expect(html).toContain('Bybit')
    expect(html).not.toContain('id="dperps"')
    expect(html).not.toContain('Orbs execution, across the ecosystem.')
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

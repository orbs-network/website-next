import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import { DspotPage } from './dspot'
import { InstitutionalPage } from './institutional'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ namespace }: { namespace: string }) =>
    createTranslator({ locale: 'en', messages: en as AbstractIntlMessages, namespace }),
}))

vi.mock('./inner-closing', () => ({ InnerClosingCta: () => null }))

describe('product cards during the inner-page refresh', () => {
  it.each([
    ['dSPOT', DspotPage],
    ['Institutions', InstitutionalPage],
  ] as const)('keeps all four %s product cards as text without links or link arrows', async (_name, Page) => {
    const html = renderToStaticMarkup(await Page({ locale: 'en' }))
    // Scope by the card's own heading, not a size class that changes with the design.
    const cards = (html.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) ?? []).filter((item) =>
      /<h3\b[^>]*>(?:Liquidity Hub|dTWAP|dLIMIT|dSLTP)<\/h3>/.test(item)
    )
    expect(cards).toHaveLength(4)
    for (const name of ['Liquidity Hub', 'dTWAP', 'dLIMIT', 'dSLTP']) expect(cards.join('')).toContain(name)
    for (const card of cards) {
      expect(card).toContain('<h3')
      expect(card).not.toContain('<a ')
      expect(card).not.toContain('<svg')
    }
    expect(html).toContain('href="/contact/"')
  })
})

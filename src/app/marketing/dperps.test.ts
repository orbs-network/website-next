import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import type { Locale } from '@/i18n/locales'
import { DPERPS_FEATURES, DPERPS_PARTNERS } from '@/content/pages/dperps'
import { DperpsPage } from './dperps'
import { DspotPage } from './dspot'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({
      locale,
      messages: (locale === 'ko' ? ko : en) as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))

describe('October product handoff', () => {
  it('renders the complete English stack, trading permissions and contact destination', async () => {
    const html = renderToStaticMarkup(await DperpsPage({ locale: 'en' }))
    expect(html).toContain('Perpetual futures.')
    expect(html).toContain('Under your brand.')
    expect(html).toContain('href="/contact/"')
    expect(html).toContain('built in-house by Orbs')
    expect(html).toContain('deposits and withdrawals take place on the underlying blockchain')
    expect(html).toContain('Trading session keys can authorise trading but cannot withdraw funds')
    expect(html).toContain('Withdrawals require the user’s wallet signature')
    for (const id of DPERPS_FEATURES) expect(html).toContain(en.pages.dperps.features.items[id].title)
    expect((html.match(/<h3\b/g) ?? []).length).toBe(6)
    for (const partner of DPERPS_PARTNERS) expect(html).toContain(partner.name)
    expect(html).toContain(en.pages.dperps.disclaimer.split('\n')[0])
  })

  it('does not publish the pending architecture diagram or obsolete English claims', async () => {
    const html = renderToStaticMarkup(await DperpsPage({ locale: 'en' }))
    for (const old of [
      'Symmio',
      'Symm.io',
      'Ultra',
      '/marketing/perpetual-hub/diagram.png',
      '/marketing/perpetual-hub/partners.png',
      '$100 million',
    ]) {
      expect(html).not.toContain(old)
      expect(html).not.toContain(encodeURIComponent(old))
    }
    expect(html).not.toContain('TODO')
  })

  it('uses the refreshed dPERPS structure in Korean, without the old diagrams', async () => {
    const html = renderToStaticMarkup(await DperpsPage({ locale: 'ko' }))
    expect(html).toContain('product-benefits')
    expect(html).toContain(ko.pages.dperps.hero.headline)
    expect(html).not.toContain(encodeURIComponent('/marketing/perpetual-hub/diagram.png'))
    expect(html).not.toContain(encodeURIComponent('/marketing/perpetual-hub/partners.png'))
  })

  it('uses the selected dSPOT headline in one composition for both themes', async () => {
    const html = renderToStaticMarkup(await DspotPage({ locale: 'en' }))
    expect(html).toContain('Advanced spot trading.')
    expect(html).toContain('Unified execution.')
    expect(html).not.toContain('Advanced order execution.')
    expect(html).toContain('href="#modules"')
    for (const href of ['/dlimit/', '/dtwap/', '/dsltp/', '/liquidity-hub/'])
      expect(html).not.toContain(`href="${href}"`)
  })
})

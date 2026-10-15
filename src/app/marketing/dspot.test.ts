import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import { DspotPage } from './dspot'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ namespace }: { namespace: string }) =>
    createTranslator({
      locale: 'en',
      messages: en as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))

describe('dSPOT solver strip', () => {
  it('puts Sara’s eight approved names between modules and best execution, without the perps venues', async () => {
    const html = renderToStaticMarkup(await DspotPage({ locale: 'en' }))
    const start = html.indexOf('Solvers and liquidity sources')
    const end = html.indexOf('[BEST EXECUTION]')
    expect(start).toBeGreaterThan(html.indexOf('id="modules"'))
    expect(end).toBeGreaterThan(start)
    const strip = html.slice(start, end)
    const names = ['Odos', 'Velora (formerly ParaSwap)', 'OpenOcean', 'KyberSwap', 'Rango', 'DODO', 'Lumia', 'Magpie']
    // The visual loop repeats the list; only the first copy is announced.
    const firstList = strip.slice(strip.indexOf('<ul'), strip.indexOf('</ul>'))
    expect((firstList.match(/<li\b/g) ?? []).length).toBe(8)
    for (let i = 0; i < names.length; i++) {
      expect(firstList).toContain(names[i])
      if (i) expect(firstList.indexOf(names[i])).toBeGreaterThan(firstList.indexOf(names[i - 1]))
    }
    for (const venue of ['TrebleSwap', 'Gryps', 'THENA', 'SpookySwap', 'Atlantis']) expect(strip).not.toContain(venue)
    expect(html).toContain('Advanced spot trading.')
    expect(html).toContain('Unified execution.')
    expect(strip).toContain('animate-marquee-slow')
    expect(strip).toContain('aria-hidden="true" inert=""')
  })
})

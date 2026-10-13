import { describe, expect, it } from 'vitest'
import { homeStackForLocale } from './home'
import { overviewProductsForLocale } from './overview'

describe('English-first product grouping', () => {
  it('presents the same three product destinations on Home and Overview', () => {
    const destinations = ['/dspot', '/dperps', '/execution-services']
    expect(homeStackForLocale('en').map((card) => card.href)).toEqual(destinations)
    expect(overviewProductsForLocale('en').map((card) => card.href)).toEqual(destinations)
  })

  it.each(['ja', 'ko'] as const)('retains the current %s product groupings', (locale) => {
    expect(homeStackForLocale(locale).map((card) => card.href)).toEqual(['/dspot', '/dperps'])
    expect(overviewProductsForLocale(locale).map((card) => card.href)).toEqual([
      '/dtwap',
      '/dlimit',
      '/liquidity-hub',
      '/dperps',
    ])
  })
})

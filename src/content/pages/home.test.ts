import { describe, expect, it } from 'vitest'
import { HOME_DISCOVER, homeStackForLocale } from './home'
import { overviewProductsForLocale } from './overview'

describe('English-first product grouping', () => {
  it('links Discover to current developer docs instead of the white-paper archive', () => {
    expect(HOME_DISCOVER.map(({ id }) => id)).toEqual(['blog', 'developers', 'faq', 'securityAndAudits'])
    expect(HOME_DISCOVER.find(({ id }) => id === 'developers')!.href).toBe('https://docs.orbs.network/v3')
  })

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

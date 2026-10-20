import { describe, expect, it } from 'vitest'
import { HOME_SOLUTIONS, HOME_DISCOVER, homeStackForLocale } from './home'
import { overviewProductsForLocale } from './overview'
import { footerColumnsForLocale } from '@/content/shared/footer'
import { navigationForLocale } from '@/content/shared/navigation'

describe('English-first product grouping', () => {
  it.each(['en', 'ja', 'ko'] as const)(
    'uses Orbs Agentic for the homepage, navigation and footer AI Agents links in %s',
    (locale) => {
      const links = [
        HOME_SOLUTIONS.find(({ id }) => id === 'aiAgents'),
        navigationForLocale(locale)
          .groups.find(({ key }) => key === 'solutions')!
          .links.find(({ key }) => key === 'aiAgents'),
        footerColumnsForLocale(locale)
          .find(({ key }) => key === 'solutions')!
          .links.find(({ key }) => key === 'aiAgents'),
      ]
      for (const link of links) expect(link?.href).toBe('/agentic')
    }
  )
  it('links Discover to current developer docs instead of the white-paper archive', () => {
    expect(HOME_DISCOVER.map(({ id }) => id)).toEqual(['blog', 'developers', 'faq', 'securityAndAudits'])
    expect(HOME_DISCOVER.find(({ id }) => id === 'developers')!.href).toBe('https://docs.orbs.network/v3')
  })

  it('presents the same three product destinations on Home and Overview', () => {
    const destinations = ['/dspot', '/dperps', '/execution-services']
    expect(homeStackForLocale('en').map((card) => card.href)).toEqual(destinations)
    expect(overviewProductsForLocale('en').map((card) => card.href)).toEqual(destinations)
  })

  it.each(['ja'] as const)('retains the current %s product groupings', (locale) => {
    expect(homeStackForLocale(locale).map((card) => card.href)).toEqual(['/dspot', '/dperps'])
    expect(overviewProductsForLocale(locale).map((card) => card.href)).toEqual([
      '/dtwap',
      '/dlimit',
      '/liquidity-hub',
      '/dperps',
    ])
  })
})

it('uses the refreshed three-product grouping for Korean', () => {
  expect(homeStackForLocale('ko')).toEqual(homeStackForLocale('en'))
  expect(overviewProductsForLocale('ko')).toEqual(overviewProductsForLocale('en'))
})

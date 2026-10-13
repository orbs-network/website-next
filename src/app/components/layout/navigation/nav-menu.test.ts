import { describe, expect, it, vi } from 'vitest'
import { resolveNavigation } from './nav-menu'

vi.mock('next-intl/server', () => ({ getTranslations: async () => (key: string) => key }))

describe('English-first navigation', () => {
  it('lists all three products with working internal destinations in English', async () => {
    const { groups } = await resolveNavigation('en')
    const links = groups.find((group) => group.key === 'products')!.links
    expect(
      links.filter((link) => ['dspot', 'dperps', 'executionServices'].includes(link.key)).map((link) => link.href)
    ).toEqual(['/dspot/', '/dperps/', '/execution-services/'])
    expect(links.find((link) => link.key === 'dspot')!.children!.map((link) => link.href)).toEqual([
      '/dtwap/',
      '/dlimit/',
      '/dsltp/',
      '/liquidity-hub/',
    ])
  })

  it.each(['ja', 'ko'] as const)('retains the existing %s Products menu', async (locale) => {
    const { groups } = await resolveNavigation(locale)
    expect(groups.find((group) => group.key === 'products')!.links.map((link) => link.key)).toEqual([
      'sdk',
      'dspot',
      'dperps',
      'agentic',
    ])
  })
})

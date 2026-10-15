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
    expect(links.map((link) => link.key)).toEqual(['dspot', 'dperps', 'executionServices'])
    expect(links.every((link) => !link.children)).toBe(true)
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

describe('October menu destinations', () => {
  it('keeps Tools separate, links Playground to Swap and uses the network docs', async () => {
    const { groups, topLevel } = await resolveNavigation('en')
    expect(groups.map((group) => group.key)).toEqual(['products', 'tools', 'solutions', 'network'])
    const tools = groups.find((group) => group.key === 'tools')!.links
    expect(tools.map((link) => link.key)).toEqual(['sdk', 'playground', 'agentic', 'securityAndAudits'])
    expect(tools.find((link) => link.key === 'playground')).toMatchObject({
      href: 'https://swap.orbs.network/',
      external: true,
    })
    const network = groups.find((group) => group.key === 'network')!.links
    expect(network.map((link) => link.key)).toEqual(['overview', 'pos', 'governance', 'status', 'github', 'developers'])
    expect(network.at(-1)!.href).toBe('https://docs.orbs.network/v3')
    expect(topLevel.map((link) => link.key)).toEqual(['ecosystem', 'blog', 'github'])
  })

  it.each(['ja', 'ko'] as const)('retains %s legacy navigation and nested capability routes', async (locale) => {
    const { groups, topLevel } = await resolveNavigation(locale)
    expect(groups.map((group) => group.key)).toEqual(['products', 'solutions', 'network'])
    expect(topLevel.some((link) => link.key === 'docs')).toBe(true)
    const children = groups[0].links.find((link) => link.key === 'dspot')!.children!
    expect(children.map((link) => link.href)).toEqual(
      locale === 'ja'
        ? ['/jp/dtwap/', '/jp/dlimit/', '/dsltp/', '/jp/liquidity-hub/']
        : ['/ko/dtwap/', '/ko/dlimit/', '/ko/dsltp/', '/ko/liquidity-hub/']
    )
  })
})

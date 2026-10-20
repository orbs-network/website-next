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

  it.each(['ja'] as const)('retains the existing %s Products menu', async (locale) => {
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
  it('keeps Tools separate, links Playground to the developer view and uses the network docs', async () => {
    const { groups, topLevel } = await resolveNavigation('en')
    expect(groups.map((group) => group.key)).toEqual(['products', 'tools', 'solutions', 'network'])
    const tools = groups.find((group) => group.key === 'tools')!.links
    expect(tools.map((link) => link.key)).toEqual(['sdk', 'playground', 'agentic', 'securityAndAudits'])
    expect(tools.find((link) => link.key === 'playground')).toMatchObject({
      href: 'https://swap.orbs.network/dev',
      external: true,
    })
    const network = groups.find((group) => group.key === 'network')!.links
    expect(network.map((link) => link.key)).toEqual(['overview', 'pos', 'governance', 'status', 'github', 'developers'])
    expect(network.at(-1)!.href).toBe('https://docs.orbs.network/v3')
    expect(topLevel.map((link) => link.key)).toEqual(['ecosystem', 'blog', 'github'])
  })

  it.each(['ja'] as const)('retains %s legacy navigation and nested capability routes', async (locale) => {
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

describe('Korean menu synchronization', () => {
  it('matches English group/order/link targets except Governance and the external Korean blog', async () => {
    const english = await resolveNavigation('en')
    const korean = await resolveNavigation('ko')
    expect(korean.groups.map((g) => g.key)).toEqual(english.groups.map((g) => g.key))
    for (const [i, group] of korean.groups.entries()) {
      const expected = english.groups[i].links.filter((link) => link.key !== 'governance')
      expect(group.links.map((link) => link.key)).toEqual(expected.map((link) => link.key))
      for (const [j, link] of group.links.entries()) {
        expect(link.href).toBe(expected[j].external ? expected[j].href : `/ko${expected[j].href}`)
        expect(link.label).toBe(expected[j].label)
      }
    }
    expect(korean.topLevel.find((link) => link.key === 'blog')).toMatchObject({
      href: 'http://blog.naver.com/orbskorea',
      external: true,
    })
  })
})

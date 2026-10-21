import { describe, expect, it } from 'vitest'
import { footerColumnsForLocale, LEGACY_FOOTER_COLUMNS } from './footer'
import { NAV_GROUPS } from './navigation'

describe('October English footer', () => {
  it('matches the header groups and keeps the supporting links without Team', () => {
    const columns = footerColumnsForLocale('en')
    const keys = (group: string) => columns.find((column) => column.key === group)!.links.map((link) => link.key)
    expect(columns.map((column) => column.key)).toEqual(['products', 'tools', 'solutions', 'network', 'company'])
    for (const group of NAV_GROUPS) {
      expect(columns.find((column) => column.key === group.key)!.links.map(({ key, href }) => ({ key, href }))).toEqual(
        group.links.map(({ key, href }) => ({ key, href }))
      )
    }
    expect(keys('products')).toEqual(['dspot', 'dperps', 'executionServices'])
    expect(keys('tools')).toEqual(['sdk', 'playground', 'agentic', 'securityAndAudits'])
    expect(keys('network')).toEqual(['overview', 'pos', 'governance', 'status', 'github', 'developers'])
    expect(keys('company')).toEqual(['contact', 'faq', 'blog', 'ecosystem', 'media', 'brandAssets'])
    expect(columns.flatMap((column) => column.links).some((link) => link.key === 'team')).toBe(false)
  })

  it.each(['ja'] as const)('leaves the %s footer structure and blog destination intact', (locale) => {
    const columns = footerColumnsForLocale(locale)
    expect(columns).toBe(LEGACY_FOOTER_COLUMNS)
    const blog = columns.find((column) => column.key === 'community')!.links.find((link) => link.key === 'blog')!
    expect(blog.localeHref?.[locale]).toContain('medium.com')
  })
})

it('synchronizes Korean footer columns without Governance and retains the Korean blog', () => {
  const english = footerColumnsForLocale('en')
  const korean = footerColumnsForLocale('ko')
  expect(korean.map((column) => column.key)).toEqual(english.map((column) => column.key))
  korean.forEach((column, index) => {
    expect(column.links.map((link) => link.key)).toEqual(
      english[index].links.filter((link) => link.key !== 'governance').map((link) => link.key)
    )
  })
  expect(korean.flatMap((column) => column.links).find((link) => link.key === 'blog')?.href).toBe(
    'http://blog.naver.com/orbskorea'
  )
})

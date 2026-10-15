import { describe, expect, it } from 'vitest'
import { footerColumnsForLocale, LEGACY_FOOTER_COLUMNS } from './footer'

describe('October English footer', () => {
  it('moves Governance to Community, keeps Audits and omits Team', () => {
    const columns = footerColumnsForLocale('en')
    const keys = (group: string) => columns.find((column) => column.key === group)!.links.map((link) => link.key)
    expect(keys('products')).toEqual(['dspot', 'dperps', 'executionServices'])
    expect(keys('network')).toEqual(['overview', 'pos', 'developers', 'status'])
    expect(keys('community')).toEqual(['blog', 'ecosystem', 'media', 'governance', 'brandAssets'])
    expect(keys('company')).toEqual(['contact', 'faq', 'docs', 'github', 'securityAndAudits'])
    expect(columns.flatMap((column) => column.links).some((link) => link.key === 'team')).toBe(false)
  })

  it.each(['ja', 'ko'] as const)('leaves the %s footer structure and blog destination intact', (locale) => {
    const columns = footerColumnsForLocale(locale)
    expect(columns).toBe(LEGACY_FOOTER_COLUMNS)
    const blog = columns.find((column) => column.key === 'community')!.links.find((link) => link.key === 'blog')!
    expect(blog.localeHref?.[locale]).toContain('medium.com')
  })
})

import { describe, expect, it } from 'vitest'
import en from './messages/en.json'
import ko from './messages/ko.json'
import { localesFor, localeHref, isPlaceholder, translatedLocalesFor } from './availability'
import { MARKETING_PAGE_PATHS } from '@/content/pages'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { expandedPrefixRedirects, expandedTemporaryRedirects } from '@/lib/redirects'

describe('Korean localization coverage', () => {
  it('serves every non-blog marketing page under the Korean shell', () => {
    for (const path of MARKETING_PAGE_PATHS) {
      expect(localesFor(path), path).toContain('ko')
      expect(localeHref(path, 'ko'), path).toBe(`/ko${path}/`)
    }
    expect(localesFor('/governance-blog')).not.toContain('ko')
    expect(localesFor('/blog')).not.toContain('ko')
  })

  it('advertises translated pages while retaining the requested legal and CMS placeholders', () => {
    for (const path of ['/news', '/terms-of-use', '/cookies', '/privacy-policy', '/accessibility-declaration']) {
      expect(isPlaceholder(path, 'ko'), path).toBe(true)
      expect(translatedLocalesFor(path), path).not.toContain('ko')
    }
    for (const path of ['/overview', '/dspot', '/venues', '/institutional', '/security-and-audits']) {
      expect(isPlaceholder(path, 'ko')).toBe(false)
      expect(translatedLocalesFor(path)).toContain('ko')
    }
  })

  it('serves every paper detail locally without a locale-stripping redirect', () => {
    for (const paper of WHITE_PAPERS) {
      const path = `/white-papers/${paper.slug}`
      expect(localeHref(path, 'ko')).toBe(`/ko${path}/`)
      expect(isPlaceholder(path, 'ko')).toBe(false)
    }
    expect(expandedPrefixRedirects().some(({ source }) => source.startsWith('/ko/'))).toBe(false)
  })

  it('keeps the translated product and AI pages reachable rather than redirecting them away', () => {
    expect(expandedTemporaryRedirects().some(({ source }) => source.startsWith('/ko/'))).toBe(false)
  })

  it('uses English menu labels while retaining Korean prose', () => {
    expect(ko.nav).toEqual(en.nav)
    expect(ko.footer.links).toEqual(en.footer.links)
    expect(ko.footer.columns).toEqual(en.footer.columns)
    expect(ko.pages.localizedHome.intro).toMatch(/[가-힣]/)
    expect(ko.pages.institutional.hero.intro).toMatch(/[가-힣]/)
    expect(ko.pages.dspot.hero.intro).toMatch(/[가-힣]/)
  })
})

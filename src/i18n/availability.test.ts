import { describe, expect, it } from 'vitest'
import { localeHref, localesFor, isPlaceholder, translatedLocalesFor } from './availability'
import en from './messages/en.json'
import ja from './messages/ja.json'

describe('localeHref with fragments and queries', () => {
  it('keeps the homepage product anchor intact in every locale', () => {
    expect(localeHref('/#products', 'en')).toBe('/#products')
    expect(localeHref('/#products', 'ja')).toBe('/jp/#products')
    expect(localeHref('/#products', 'ko')).toBe('/ko/#products')
  })

  it('uses the page availability before appending the suffix', () => {
    expect(localeHref('/pos#guardians', 'ko')).toBe('/ko/pos/#guardians')
    expect(localeHref('/institutional#products', 'ja')).toBe('/institutional/#products')
    expect(localeHref('/overview/?ref=home#protocols', 'ko')).toBe('/ko/overview/?ref=home#protocols')
  })

  it('preserves ordinary destinations', () => {
    expect(localeHref('/', 'ja')).toBe('/jp/')
    expect(localeHref('/pos', 'ko')).toBe('/ko/pos/')
  })
})

describe('legacy Japanese AI URLs', () => {
  it('has complete English placeholder copy for both Japanese page renderers', () => {
    expect(ja.pages.aiSkills).toEqual(en.pages.aiSkills)
    expect(ja.pages.spotOrders).toEqual(en.pages.spotOrders)
  })
  it.each(['/ai/skills', '/ai/skills/spot-advanced-swap-orders'])(
    'preserves %s without a false translation claim',
    (path) => {
      expect(localesFor(path)).toContain('ja')
      expect(isPlaceholder(path, 'ja')).toBe(true)
      expect(translatedLocalesFor(path)).not.toContain('ja')
      expect(localeHref(path, 'ja')).toBe(`/jp${path}/`)
    }
  )
})

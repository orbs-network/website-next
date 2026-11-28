import { describe, expect, it } from 'vitest'
import { isPlaceholder, localeHref, localesFor, translatedLocalesFor } from './availability'
import ja from './messages/ja.json'

describe('localeHref with fragments and queries', () => {
  it('keeps the homepage product anchor intact in every locale', () => {
    expect(localeHref('/#products', 'en')).toBe('/#products')
    expect(localeHref('/#products', 'ja')).toBe('/jp/#products')
    expect(localeHref('/#products', 'ko')).toBe('/ko/#products')
  })

  it('uses the page availability before appending the suffix', () => {
    expect(localeHref('/pos#guardians', 'ko')).toBe('/ko/pos/#guardians')
    expect(localeHref('/institutional#products', 'ja')).toBe('/jp/institutional/#products')
    expect(localeHref('/overview/?ref=home#protocols', 'ko')).toBe('/ko/overview/?ref=home#protocols')
  })

  it('preserves ordinary destinations', () => {
    expect(localeHref('/', 'ja')).toBe('/jp/')
    expect(localeHref('/pos', 'ko')).toBe('/ko/pos/')
  })
})

describe('Japanese AI routes', () => {
  it('serves translated skill documentation while preserving the consolidated index', () => {
    const path = '/ai/skills/spot-advanced-swap-orders'
    expect(ja.pages.spotOrders.hero.intro).toContain('導入')
    expect(isPlaceholder(path, 'ja')).toBe(false)
    expect(translatedLocalesFor(path)).toContain('ja')
    expect(localeHref(path, 'ja')).toBe(`/jp${path}/`)
    expect(localesFor('/ai/skills')).toContain('ja')
  })
})

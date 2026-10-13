import { describe, expect, it } from 'vitest'
import { localeHref } from './availability'

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

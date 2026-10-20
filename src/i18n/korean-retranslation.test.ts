import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import en from './messages/en.json'
import ko from './messages/ko.json'
import { FAQ_DOCUMENTS } from '@/content/faq'
import { parseFaq } from '@/components/marketing/faq-document'
import { LEGAL_DOCUMENTS } from '@/content/legal'
import { translatedLocalesFor, isPlaceholder } from './availability'

function leaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  return Object.assign(
    {},
    ...Object.entries(value as Record<string, unknown>).map(([key, entry]) =>
      leaves(entry, prefix ? `${prefix}.${key}` : key)
    )
  )
}

describe('English-source Korean retranslation', () => {
  it('preserves English menus, excluded legal metadata, links and interpolation contracts', () => {
    expect(ko.nav).toEqual(en.nav)
    expect(ko.footer.links).toEqual(en.footer.links)
    expect(ko.footer.columns).toEqual(en.footer.columns)
    for (const name of ['termsOfUse', 'cookies', 'privacyPolicy', 'accessibilityDeclaration'] as const) {
      expect(ko.pages[name]).toEqual(en.pages[name])
    }
    const english = leaves(en)
    const korean = leaves(ko)
    for (const [key, value] of Object.entries(english)) {
      expect(korean[key], key).toBeDefined()
      expect(korean[key], key).not.toContain('오브스')
      expect(korean[key]?.match(/\{\w+\}|<\/?\w+>/g) ?? [], key).toEqual(value.match(/\{\w+\}|<\/?\w+>/g) ?? [])
      const urls = (text: string) => (text.match(/https?:\/\/[^\s)]+/g) ?? []).map((url) => url.replace(/[.,]+$/, ''))
      expect(urls(korean[key]), key).toEqual(urls(value))
    }
  })

  it('replaces both FAQ documents with the current English question set and preserves destinations', () => {
    for (const path of ['/faq', '/dtwap-and-dlimit-faq'] as const) {
      const doc = FAQ_DOCUMENTS[path]
      const english = parseFaq(doc.body.en!)
      const korean = parseFaq(doc.body.ko!)
      expect(korean.map((section) => section.questions.length)).toEqual(
        english.map((section) => section.questions.length)
      )
      const urls = (text: string) => [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]).sort()
      expect(urls(doc.body.ko!)).toEqual(urls(doc.body.en!))
      expect(doc.body.ko).not.toContain('오브스')
    }
    expect(FAQ_DOCUMENTS['/faq'].body.ko).toContain('실제 체결은 시장 상황과 가용 유동성에 따라 달라집니다.')
  })

  it('only keeps the four excluded legal documents untranslated', () => {
    for (const path of ['/terms-of-use', '/cookies', '/privacy-policy', '/accessibility-declaration'] as const) {
      expect(LEGAL_DOCUMENTS[path].body.ko).toBeUndefined()
      expect(isPlaceholder(path, 'ko')).toBe(true)
    }
    for (const path of [
      '/liquidity-hub-terms-of-use',
      '/dtwap-dlimit-disclaimer',
      '/orbs-ecosystem-grant-program-terms-and-conditions',
      '/ORBS-NFT-CONTEST-OFFICIAL-RULES',
      '/challenge',
    ] as const) {
      expect(LEGAL_DOCUMENTS[path].body.ko).toMatch(/[가-힣]/)
      expect(translatedLocalesFor(path)).toContain('ko')
    }
    expect(readFileSync('src/content/archive/tetra.ko.md', 'utf8')).toContain(
      '직접 보낸 토큰은 스테이킹되지 않으며 복구할 수 없습니다.'
    )
  })
})

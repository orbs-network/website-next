import { describe, expect, it } from 'vitest'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import en from './messages/en.json'
import ja from './messages/ja.json'
import { isPlaceholder, localeHref, translatedLocalesFor } from './availability'
import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { FAQ_DOCUMENTS } from '@/content/faq'

const active = [
  'home',
  'dspot',
  'dperps',
  'agentic',
  'institutional',
  'venues',
  'overview',
  'executionServices',
  'ecosystem',
  'securityAndAudits',
  'whitePapers',
  'contact',
  'brandAssets',
  'spotOrders',
  'news',
] as const
function leaves(value: Record<string, unknown>, prefix = ''): [string, string][] {
  return Object.entries(value).flatMap(([key, entry]) =>
    typeof entry === 'string' ? [[prefix + key, entry]] : leaves(entry as Record<string, unknown>, `${prefix}${key}.`)
  )
}
describe('Japanese public localization', () => {
  it.each(active)('%s has all current English keys and preserves interpolation variables', (page) => {
    const translations = new Map(leaves(ja.pages[page]))
    const t = createTranslator({
      locale: 'ja',
      messages: ja.pages[page] as AbstractIntlMessages,
      onError: (error) => {
        throw error
      },
    }) as (key: string, values: Record<string, string | number>) => string
    for (const [key, value] of leaves(en.pages[page])) {
      expect(translations.has(key), key).toBe(true)
      const vars = [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
      expect([...translations.get(key)!.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort(), key).toEqual(vars)
      if (!value.includes('<'))
        t(key, Object.fromEntries(vars.map((name) => [name, name === 'minutes' ? 5 : 'Example'])))
    }
  })
  it('offers translated destinations without reopening archives or pretending CMS news is translated', () => {
    for (const path of ['/dspot', '/dperps', '/agentic', '/institutional', '/venues', '/faq', '/security-and-audits']) {
      expect(translatedLocalesFor(path)).toContain('ja')
      expect(localeHref(path, 'ja')).toBe(`/jp${path}/`)
    }
    expect(isPlaceholder('/news', 'ja')).toBe(true)
    expect(translatedLocalesFor('/tetra-orbs-staking-wallet-tutorial')).not.toContain('ja')
    for (const { slug } of WHITE_PAPERS) expect(translatedLocalesFor(`/white-papers/${slug}`)).toContain('ja')
  })
  it('keeps FAQ question counts and link destinations aligned with English', () => {
    for (const document of Object.values(FAQ_DOCUMENTS)) {
      expect(document.body.ja!.match(/^### /gm)?.length).toBe(document.body.en!.match(/^### /gm)?.length)
      const urls = (body: string) => [...body.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]).sort()
      expect(urls(document.body.ja!)).toEqual(
        urls(document.body.en!)
          .map((url) => (url.startsWith('/') ? localeHref(url, 'ja') : url))
          .sort()
      )
    }
  })
})

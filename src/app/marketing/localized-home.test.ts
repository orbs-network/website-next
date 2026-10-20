import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import { localeAlternates, placeholderRobots, translatedLocalesFor } from '@/i18n/availability'
import { LocalizedHomePage } from './localized-home'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: 'ja' | 'ko'; namespace: string }) =>
    createTranslator({
      locale,
      messages: (locale === 'ja' ? ja : ko) as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))

describe('localized home entry points', () => {
  it.each(['ja', 'ko'] as const)('renders the approved legacy %s copy with working locale links', async (locale) => {
    const messages = (locale === 'ja' ? ja : ko).pages.localizedHome
    const html = renderToStaticMarkup(await LocalizedHomePage({ locale }))
    expect(html).toContain(messages.headline)
    expect(html).toContain(messages.intro)
    expect(html).toContain(locale === 'ja' ? 'href="/jp/overview/"' : 'href="/ko/overview/"')
    expect(html).not.toContain('One execution stack for onchain finance')
    if (locale === 'ko') expect(html).toContain('href="mailto:hello@orbs.com"')
  })

  it('advertises Japanese and the refreshed Korean translation', () => {
    expect(translatedLocalesFor('/')).toEqual(['en', 'ja', 'ko'])
    for (const locale of ['ja'] as const) {
      expect(placeholderRobots('/', locale)).toBeUndefined()
      expect(localeAlternates('/', locale).languages).toEqual({
        en: 'https://www.orbs.com/',
        ja: 'https://www.orbs.com/jp/',
        ko: 'https://www.orbs.com/ko/',
        'x-default': 'https://www.orbs.com/',
      })
    }
  })
})

import { renderToReadableStream } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import ja from '@/i18n/messages/ja.json'
import type { Locale } from '@/i18n/locales'
import { NETWORK_DOCS_URL } from '@/content/shared/sdk'
import { ExecutionServicesPage } from './execution-services'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({
      locale,
      namespace,
      messages: { en, ko, ja }[locale] as AbstractIntlMessages,
      onError: (error) => {
        throw error
      },
    }),
}))

async function renderPage(locale: Locale) {
  const stream = await renderToReadableStream(await ExecutionServicesPage({ locale }))
  await stream.allReady
  return new Response(stream).text()
}

describe('Execution Services Templates refinement', () => {
  it.each(['en', 'ko', 'ja'] as const)('renders the shorter flow and both interface themes in %s', async (locale) => {
    const messages = { en, ko, ja }[locale].pages.executionServices
    const html = await renderPage(locale)
    expect(html).toContain(messages.hero.headline)
    expect(html).toContain(messages.lambdaProduct.body.split('\n\n')[0])
    expect(html).toContain(messages.vm.tagline)
    for (const artwork of ['lambda', 'vm']) expect(html).toContain(`data-product-graphic="${artwork}"`)
    expect(html).not.toMatch(/<img[^>]+(?:lambda|vm)-interface/)
    expect(html).toContain(`href="${NETWORK_DOCS_URL}"`)
    expect(html).not.toContain(messages.comparison.title)
    expect(html).not.toContain('graph-1.png')
    expect(html).toContain(
      `href="${locale === 'en' ? '/contact/' : locale === 'ja' ? '/jp/contact/' : '/ko/contact/'}"`
    )
  })

  it('renders the translated Japanese service descriptions in the current layout', async () => {
    const html = await renderPage('ja')
    expect(html).toContain(ja.pages.executionServices.lambdaProduct.body)
    expect(html).toContain(ja.pages.executionServices.vm.body)
    expect(html).not.toContain(en.pages.executionServices.lambdaProduct.body)
    expect(html).not.toContain(en.pages.executionServices.vm.body)
    expect(html).not.toContain('クラウドコンピューティングの選択肢')
    expect(html).not.toContain('graph-1.png')
  })
})

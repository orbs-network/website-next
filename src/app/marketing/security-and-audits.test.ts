import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import type { Locale } from '@/i18n/locales'
import { isReservedRootSlug } from '@/app/lib/routes'
import { localeHref, translatedLocalesFor } from '@/i18n/availability'
import { EARLIER_SPOT_AUDITS, SPOT_AUDITS } from '@/content/pages/security-and-audits'
import { SecurityAndAuditsPage } from './security-and-audits'
import { FaqPage } from './faq'
import { findLocaleMarketingPage } from './registry'
import { marketingMetadata } from './metadata'

const catalogs = { en, ja, ko }
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({
      locale,
      messages: catalogs[locale] as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))

describe('FAQ and scoped security resources', () => {
  it('renders fourteen complete English answers with product-specific custody and useful destinations', async () => {
    const html = renderToStaticMarkup(await FaqPage({ path: '/faq', locale: 'en', namespace: 'pages.faq' }))
    expect(html.match(/<details\b/g)).toHaveLength(14)
    expect(html).toContain('Execution depends on market conditions and available liquidity.')
    expect(html).toContain('funds remain there until execution')
    expect(html).toContain('collateral handled by the relevant contracts')
    for (const href of ['/security-and-audits/', '/ecosystem/', '/agentic/', '/contact/', 'https://docs.orbs.com/']) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).not.toContain('TON Minter')
    expect(html).not.toContain('fixed 10% APR')
  })

  it('separates the current dSPOT reports from the earlier spot-contract reports', async () => {
    const html = renderToStaticMarkup(await SecurityAndAuditsPage({ locale: 'en' }))
    const current = html.match(/<section id="spotAudits"[\s\S]*?<\/section>/)![0]
    const earlier = html.match(/<section id="earlierAudits"[\s\S]*?<\/section>/)![0]
    for (const report of SPOT_AUDITS) {
      expect(current).toContain(`href="${report.href}"`)
      expect(earlier).not.toContain(report.href)
    }
    for (const report of EARLIER_SPOT_AUDITS) {
      expect(earlier).toContain(`href="${report.href}"`)
      expect(current).not.toContain(report.href)
    }
    expect(html).toContain('Each audit applies to the code and version described in its report.')
    expect(html).toContain('dPERPS uses a different collateral and settlement model.')
    expect(html).toContain('1.1B ORBS')
  })

  it('reserves and advertises only the English security route', async () => {
    expect(isReservedRootSlug('security-and-audits')).toBe(true)
    expect(translatedLocalesFor('/security-and-audits')).toEqual(['en'])
    expect(findLocaleMarketingPage('/security-and-audits', 'en')).toBeDefined()
    for (const locale of ['ja', 'ko'] as const) {
      expect(findLocaleMarketingPage('/security-and-audits', locale)).toBeUndefined()
      expect(await marketingMetadata('/security-and-audits', locale)).toEqual({})
      expect(localeHref('/security-and-audits', locale)).toBe('/security-and-audits/')
    }
    const metadata = await marketingMetadata('/security-and-audits', 'en')
    expect(metadata.title).toBe('Security & Audits')
    expect(String(metadata.alternates?.canonical)).toContain('/security-and-audits/')
    expect(metadata.alternates?.languages).toBeUndefined()
  })

  it('retains the Korean FAQ and marks Japanese English fallback text correctly', async () => {
    const korean = renderToStaticMarkup(await FaqPage({ path: '/faq', locale: 'ko', namespace: 'pages.faq' }))
    expect(korean.match(/<details\b/g)).toHaveLength(33)
    expect(korean).not.toContain('Where do I start?')
    const japanese = renderToStaticMarkup(await FaqPage({ path: '/faq', locale: 'ja', namespace: 'pages.faq' }))
    expect(japanese.match(/<details\b/g)).toHaveLength(14)
    expect(japanese).toMatch(/<summary lang="en"[^>]*>What is Orbs\?/)
  })
})

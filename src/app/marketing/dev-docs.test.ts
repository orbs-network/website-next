import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import { getDevDocsLink } from './dev-docs'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale }: { locale: 'en' | 'ko' }) => {
    const labels = locale === 'en' ? en.devDocs : ko.devDocs
    return (key: keyof typeof labels) => labels[key]
  },
}))

describe('developer CTA refresh', () => {
  it('renames the English CTA while preserving the product-specific guide', async () => {
    expect(await getDevDocsLink('dtwap', 'en')).toEqual({
      label: 'Start building',
      href: 'https://docs.orbs.com/advanced-orders/shared',
    })
  })

  it('uses Start building for the refreshed English dSPOT CTA', async () => {
    expect(await getDevDocsLink('dspot', 'en')).toEqual({
      label: 'Start building',
      href: 'https://docs.orbs.com/#spot-guides',
    })
  })

  it('retains the Korean label', async () => {
    expect((await getDevDocsLink('dtwap', 'ko')).label).toBe(ko.devDocs.sdk)
  })
})

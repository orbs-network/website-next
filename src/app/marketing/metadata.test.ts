import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
import { MARKETING_PAGE_PATHS } from '@/content/pages'
import { localeAlternates, localesFor, placeholderRobots } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { DEFAULT_SOCIAL_IMAGE } from '@/app/lib/social-metadata'
import { marketingMetadata } from './metadata'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale, namespace }: { locale: Locale; namespace: string }) =>
    createTranslator({
      locale,
      namespace,
      messages: { en, ja, ko }[locale] as AbstractIntlMessages,
      onError: (error) => {
        throw error
      },
    }),
}))

const routes = MARKETING_PAGE_PATHS.flatMap((path) => localesFor(path).map((locale) => ({ path, locale })))

describe('marketing social metadata coverage', () => {
  it.each(routes)(
    '$locale $path retains its SEO policy and emits its own sharing metadata',
    async ({ path, locale }) => {
      const metadata = await marketingMetadata(path, locale)
      expect(metadata.title).toBeTruthy()
      expect(metadata.description).toBeTruthy()
      expect(metadata.alternates).toEqual(localeAlternates(path, locale))
      expect(metadata.robots).toEqual(placeholderRobots(path, locale))
      expect(metadata.openGraph).toMatchObject({
        title: `${metadata.title} | Orbs`,
        description: metadata.description,
        url: metadata.alternates?.canonical,
        siteName: 'Orbs',
        type: 'website',
      })
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: `${metadata.title} | Orbs`,
        description: metadata.description,
      })
    }
  )

  it('uses Orbs artwork for a page without a hero and the new dPERPS hero where present', async () => {
    expect((await marketingMetadata('/contact', 'en')).openGraph).toMatchObject({
      images: [{ url: `https://www.orbs.com${DEFAULT_SOCIAL_IMAGE.url}` }],
    })
    expect((await marketingMetadata('/dperps', 'ko')).openGraph).toMatchObject({
      images: [{ url: 'https://www.orbs.com/social/dperps.png' }],
    })
  })
})

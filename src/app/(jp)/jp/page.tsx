import type { Metadata } from 'next'
import { LocalizedHomePage } from '@/app/marketing/localized-home'
import { getTranslations } from 'next-intl/server'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: 'ja', namespace: 'pages.localizedHome.meta' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(HOME_PATH, 'ja'),
    // Derived from the availability map, so flipping this page to
    // `translated` removes the noindex automatically. See placeholderRobots.
    robots: placeholderRobots(HOME_PATH, 'ja'),
  }
}

/** Preserve the legacy Japanese landing copy while the English refresh is localized. */
export default function LocaleHome() {
  return <LocalizedHomePage locale="ja" />
}

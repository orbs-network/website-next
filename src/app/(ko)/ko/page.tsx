import type { Metadata } from 'next'
import { HomePage } from '@/app/marketing/home'
import { getTranslations } from 'next-intl/server'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: 'ko', namespace: 'pages.home.meta' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(HOME_PATH, 'ko'),
    // Derived from the availability map, so flipping this page to
    // `translated` removes the noindex automatically. See placeholderRobots.
    robots: placeholderRobots(HOME_PATH, 'ko'),
  }
}

/** Use the current English page composition with freshly translated Korean copy. */
export default function LocaleHome() {
  return <HomePage locale="ko" />
}

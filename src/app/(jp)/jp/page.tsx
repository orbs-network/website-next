import { withSocialMetadata } from '@/app/lib/social-metadata'
import type { Metadata } from 'next'
import { HomePage } from '@/app/marketing/home'
import { getTranslations } from 'next-intl/server'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: 'ja', namespace: 'pages.home.meta' })

  return withSocialMetadata(
    {
      title: t('title'),
      description: t('description'),
      alternates: localeAlternates(HOME_PATH, 'ja'),
      // Derived from the availability map, so flipping this page to
      // `translated` removes the noindex automatically. See placeholderRobots.
      robots: placeholderRobots(HOME_PATH, 'ja'),
    },
    { locale: 'ja' }
  )
}

/** Use the current shared home composition with the Japanese catalog. */
export default function LocaleHome() {
  return <HomePage locale="ja" />
}

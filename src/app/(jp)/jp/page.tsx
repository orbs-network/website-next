import type { Metadata } from 'next'
import { HomePage } from '@/app/marketing/home'
import { getTranslations } from 'next-intl/server'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: 'ja', namespace: 'pages.home.meta' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(HOME_PATH, 'ja'),
    // Derived from the availability map, so flipping this page to
    // `translated` removes the noindex automatically. See placeholderRobots.
    robots: placeholderRobots(HOME_PATH, 'ja'),
  }
}

/**
 * The design 3.4 home page, in a document tagged `ja`.
 *
 * Its copy is entirely new and English-only — none of it exists in the legacy
 * site in any language — so the catalog mirrors English, `textLang` marks each
 * string, and the route stays `placeholder`. That is what it already was.
 */
export default function LocaleHome() {
  return <HomePage locale="ja" />
}

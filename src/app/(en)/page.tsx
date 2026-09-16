import type { Metadata } from 'next'
import { HomePage } from '@/app/marketing/home'
import { getTranslations } from 'next-intl/server'
import { localeAlternates } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

/**
 * Time-based fallback. On-demand invalidation via the Contentful webhook (#19)
 * is the primary path; this bounds staleness if a webhook is missed. It matters
 * more than it did: the page now carries a news rail fed by Contentful.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: 'en', namespace: 'pages.home.meta' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(HOME_PATH, 'en'),
  }
}

export default function Home() {
  return <HomePage locale="en" />
}

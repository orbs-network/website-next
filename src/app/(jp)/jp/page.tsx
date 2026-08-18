import type { Metadata } from 'next'
import { HomeHero } from '@/app/components/home-hero'
import { localeAlternates } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const metadata: Metadata = {
  alternates: localeAlternates(HOME_PATH, 'ja'),
}

/**
 * Japanese home page.
 *
 * No recent-posts section, unlike the English home page: there is no Japanese
 * blog. The legacy site's Japanese navbar links out to
 * `orbs-japan-community.medium.com` rather than to its own archive, and
 * Contentful has a single `en-US` locale.
 *
 * The body is the shared placeholder hero. Phase 3 (#31, #32) builds the real
 * page — see docs/migration-plan.md for what the legacy Japanese home contains.
 */
export default function JapaneseHome() {
  return (
    <div className="container mx-auto px-5 py-16">
      <HomeHero />
    </div>
  )
}

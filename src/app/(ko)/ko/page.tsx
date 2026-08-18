import type { Metadata } from 'next'
import { HomeHero } from '@/app/components/home-hero'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const metadata: Metadata = {
  alternates: localeAlternates(HOME_PATH, 'ko'),
  // Derived from the availability map, so Phase 3 flipping this page to
  // `translated` removes the noindex automatically. See placeholderRobots.
  robots: placeholderRobots(HOME_PATH, 'ko'),
}

/**
 * Korean home page. No recent-posts section — see the Japanese page for why;
 * the legacy Korean navbar links out to `orbskorea.medium.com`.
 */
export default function KoreanHome() {
  return (
    <div className="container mx-auto px-5 py-16">
      <HomeHero />
    </div>
  )
}

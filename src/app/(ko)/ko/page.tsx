import type { Metadata } from 'next'
import { HomeHero } from '@/app/components/home-hero'
import { localeAlternates } from '@/i18n/availability'
import { HOME_PATH } from '@/app/lib/routes'

export const metadata: Metadata = {
  alternates: localeAlternates(HOME_PATH, 'ko'),
  // Not indexable while the body is the shared English placeholder. Declaring
  // this an alternate of `/` would tell Google two near-identical English pages
  // are translations of each other, which gets the whole hreflang set ignored.
  // Phase 3 gives it real copy and removes this. Costs nothing meanwhile: DNS
  // has not cut over (#39), so the legacy site is still the one being crawled.
  robots: { index: false, follow: true },
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

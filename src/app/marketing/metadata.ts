import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'
import type { Locale } from '@/i18n/locales'
import { findMarketingPage } from './registry'

/**
 * Metadata for a marketing page, in one locale.
 *
 * Shared by the English route and both locale catch-alls deliberately. When
 * they built their own metadata objects, the English route set a title and
 * description while the catch-alls returned only `alternates` and `robots` — so
 * `/jp/dtwap/` and `/ko/dtwap/` fell back to the root layout's generic `Orbs`
 * title and site-level description.
 *
 * That is a bad failure to leave to convention: it is invisible in the source,
 * only shows up in built HTML or a search result, and gets worse with every
 * page Phase 3 adds. One function means the three routes cannot drift.
 *
 * Title and description come from the catalog rather than the route, so a
 * translated page describes itself in its own language — and adding a locale
 * stays a catalog-only change.
 */
export async function marketingMetadata(path: string, locale: Locale): Promise<Metadata> {
  const entry = findMarketingPage(path)

  // Not a marketing path — the catch-all is about to render a 404, which
  // supplies its own title.
  if (!entry) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: `${entry.namespace}.meta` })

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(path, locale),
    robots: placeholderRobots(path, locale),
  }
}

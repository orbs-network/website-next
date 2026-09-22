import { describe, expect, it } from 'vitest'
import { isArchived, placeholderRobots, localesFor } from './availability'
import { MARKETING_PAGE_PATHS } from '@/content/pages'
import { LOCALES } from './locales'

/**
 * Archiving is "keep the URL, stop advertising it".
 *
 * The NFT contest ran in 2021 and is over, so nothing should steer a reader
 * towards it — but deleting the rules of a contest you actually ran is only
 * ever noticed on the day somebody disputes it. #38 found it live with no route
 * here, so it would have 404ed at cutover.
 *
 * The failure mode worth guarding is the half-done version: noindex on the page
 * while the sitemap still lists it, which asks crawlers to ignore a URL we are
 * simultaneously advertising. Neither half is visible from the other file.
 */

describe('archived pages', () => {
  it('are still routes, because the URLs are live', () => {
    // The whole point. An archived page that stopped building would 404 at
    // cutover, which is the outcome archiving exists to avoid.
    expect(MARKETING_PAGE_PATHS).toContain('/ORBS-NFT-CONTEST-OFFICIAL-RULES')
  })

  it('are noindex in EVERY locale', () => {
    // Not a placeholder locale, which is about a missing translation. This is
    // about a page whose subject has expired, in every language.
    for (const locale of LOCALES) {
      expect(placeholderRobots('/ORBS-NFT-CONTEST-OFFICIAL-RULES', locale), locale).toEqual({
        index: false,
        follow: true,
      })
    }
  })

  it('still follow, so the links inside are not stranded', () => {
    expect(placeholderRobots('/ORBS-NFT-CONTEST-OFFICIAL-RULES', 'en')?.follow).toBe(true)
  })

  it('are excluded from the sitemap', () => {
    // The sitemap filters on `isArchived`. This asserts the filter has
    // something to remove — a filter over a list containing no archived path
    // passes while doing nothing, which is how this silently stops working.
    const archived = MARKETING_PAGE_PATHS.filter((path) => isArchived(path))

    expect(archived).toEqual(['/ORBS-NFT-CONTEST-OFFICIAL-RULES'])
  })

  it('does not archive the pages that are still operative', () => {
    // The disclaimer covers products we currently ship and the grant terms a
    // live programme. Both must stay indexable; archiving one by accident
    // would quietly remove a legal document from search.
    for (const path of ['/dtwap-dlimit-disclaimer', '/orbs-ecosystem-grant-program-terms-and-conditions']) {
      expect(isArchived(path), path).toBe(false)
      expect(placeholderRobots(path, 'en'), path).toBeUndefined()
    }
  })

  it('normalises a trailing slash, since callers pass both forms', () => {
    expect(isArchived('/ORBS-NFT-CONTEST-OFFICIAL-RULES/')).toBe(true)
    expect(isArchived('/ORBS-NFT-CONTEST-OFFICIAL-RULES')).toBe(true)
  })
})

describe('the carried-over legal pages', () => {
  it('offer the locales the legacy site served, and no more', () => {
    // Legacy has a `ko/dtwap-dlimit-disclaimer` and a
    // `jp/ORBS-NFT-CONTEST-OFFICIAL-RULES`, both holding the English text — so
    // those URLs must resolve, and must not claim to be translations.
    expect([...localesFor('/dtwap-dlimit-disclaimer')].sort()).toEqual(['en', 'ko'])
    expect([...localesFor('/ORBS-NFT-CONTEST-OFFICIAL-RULES')].sort()).toEqual(['en', 'ja'])
    // No locale directory at all on legacy, so English-only.
    expect([...localesFor('/orbs-ecosystem-grant-program-terms-and-conditions')]).toEqual(['en'])
  })

  it('marks the copied-English locales as placeholder, not translated', () => {
    // `ko/dtwap-dlimit-disclaimer` holds 2 non-Latin characters against 281
    // words. Declaring it a translation would tell Google two near-identical
    // documents are language alternates of each other.
    expect(placeholderRobots('/dtwap-dlimit-disclaimer', 'ko')).toEqual({ index: false, follow: true })
    expect(placeholderRobots('/ORBS-NFT-CONTEST-OFFICIAL-RULES', 'ja')).toEqual({ index: false, follow: true })
  })
})

/**
 * URLs that have moved, and where they went.
 *
 * Every entry is a promise made to the internet more or less permanently. A
 * permanent redirect is cached by browsers indefinitely — no expiry, no recall
 * — so an entry here is close to irreversible for anyone who has followed it.
 *
 * Which is why the timing matters: the legacy site still serves orbs.com and
 * the DNS cutover has not happened (#39), so nothing has yet cached a redirect
 * from this deployment. A rename made NOW costs one line. The same rename after
 * cutover costs a permanent redirect in every visitor's browser.
 *
 * THIS IS NOT THE FULL CUTOVER MAP. #38 is the audit that diffs every live
 * orbs.com URL against the routes this repo produces — legacy blog slugs,
 * `/governance-blog`, trailing-slash behaviour. This file holds moves we make
 * ourselves, and it is the machinery that audit will fill.
 *
 * Deliberately free of app imports. `next.config.ts` reads this, and the config
 * is transpiled before the `@/*` path alias exists — so pulling in
 * `@/i18n/availability` here would work in the test and fail at build. The
 * locale list is therefore declared per entry and checked against the
 * availability map by `redirects.test.ts`, which CAN resolve the alias.
 */

import type { Locale } from '@/i18n/locales'

export type Redirect = {
  /** The old path, locale-independent, no trailing slash. */
  from: string
  /** The new path, locale-independent, no trailing slash. */
  to: string
  /**
   * The locales the DESTINATION is reachable in.
   *
   * Not every page exists in every locale, and a redirect into one that does
   * not is a redirect to a 404 — which is worse than leaving the old URL to
   * 404 on its own, because search engines read it as a move to a soft-404
   * rather than as a page that is gone.
   *
   * Found by running it: `/jp/perpetual-hub/` was 308ing to `/jp/dperps/`,
   * which is a 404, because there has never been a Japanese Perpetual Hub —
   * `content/jp/perpetual-hub` does not exist in the legacy repo. Both URLs
   * 404, so nothing regressed, but the redirect was still a lie.
   *
   * `redirects.test.ts` asserts this matches `localesFor(to)` exactly, so it
   * cannot drift from the availability map that decides which routes are built.
   */
  locales: readonly Locale[]
  /** Why it moved. Read by whoever wonders in a year. */
  reason: string
}

export const REDIRECTS: readonly Redirect[] = [
  {
    from: '/perpetual-hub',
    to: '/dperps',
    // English and Korean only. There is no Japanese Perpetual Hub page and
    // never was; see the note on `locales`.
    locales: ['en', 'ko'],
    reason: 'Renamed to dPERPS in design 3.4. Same product, same page — see #149.',
  },
]

/** The URL segment for each locale. Mirrors `LOCALE_SEGMENTS`; see the note above. */
const SEGMENTS: Record<Locale, string> = {
  en: '',
  ja: '/jp',
  ko: '/ko',
}

/**
 * Every source/destination pair, expanded across the locales the destination
 * actually exists in, in the trailing-slash form `trailingSlash: true` serves.
 *
 * Next matches `source` against the path as requested. The canonical form
 * carries the slash — the slashless request is separately 308'd to it first —
 * so matching the slashed form is what keeps this to one hop.
 */
export function expandedRedirects(): { source: string; destination: string; permanent: true }[] {
  return REDIRECTS.flatMap(({ from, to, locales }) =>
    locales.map((locale) => ({
      source: `${SEGMENTS[locale]}${from}/`,
      destination: `${SEGMENTS[locale]}${to}/`,
      permanent: true as const,
    }))
  )
}

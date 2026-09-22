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

/**
 * A section whose CHILD pages exist only in English, where the legacy site
 * served localised ones.
 *
 * Distinct from `Redirect`, which moves a path and keeps the reader in their
 * locale. This does the opposite: it folds `/jp/<prefix>/<child>/` and
 * `/ko/<prefix>/<child>/` onto the canonical English URL, because there is one
 * document and it exists in one place.
 *
 * Expressed as a pattern rather than one entry per child, which is worth
 * justifying: the white-paper case is 50 live URLs across two locales, and a
 * hand-written list of 50 would have to be kept in step with a set of legacy
 * directories this repo does not contain. The pattern cannot drift from data it
 * does not depend on.
 *
 * The cost is that a child which never existed also redirects — `/ko/white-
 * papers/nonsense/` now reaches `/white-papers/nonsense/` and 404s there rather
 * than 404ing a hop earlier. Nothing links to it and nothing indexes it, so
 * that is a trade worth making for covering every real URL without a census.
 */
export type PrefixRedirect = {
  /** The section path, locale-independent, no trailing slash. */
  prefix: string
  /**
   * The locales whose prefixed children fold onto English.
   *
   * The section INDEX at `/jp/<prefix>/` is untouched — it is a real page in
   * these locales. Only children match, which is what the `:child` parameter
   * buys: it requires a non-empty segment, so the index cannot be shadowed.
   * `redirects.test.ts` asserts that, because a rule that swallowed the index
   * would make a live translated page unreachable with nothing to show for it.
   */
  locales: readonly Locale[]
  /**
   * Children whose slug in a locale is not the canonical English one.
   *
   * The pattern passes the child through unchanged, which is right for every
   * URL where the locales agree — and they nearly always do, because the legacy
   * directories were copied per locale. Where they disagree the pattern would
   * send a live page to a permanent 404, so those get an explicit rule instead.
   *
   * There is exactly one today, and it is a good advertisement for checking
   * rather than assuming: the Japanese edition of the second call for grants
   * lives at `Orbs-Grant-Program-Second-Call-for-Grants`, while English and
   * Korean carry a typo, `orbs-grant-grogram-second-call-for-grants`. Different
   * case AND different spelling, so matching case-insensitively would not have
   * rescued it either.
   *
   * Keyed by locale, then legacy child, mapping to the canonical English child.
   * `redirects.test.ts` checks every destination against `WHITE_PAPERS`, which
   * this module cannot import — `next.config.ts` transpiles it before the `@/*`
   * alias exists.
   */
  rename?: Partial<Record<Locale, Readonly<Record<string, string>>>>
  reason: string
}

export const PREFIX_REDIRECTS: readonly PrefixRedirect[] = [
  {
    prefix: '/white-papers',
    locales: ['ja', 'ko'],
    rename: {
      ja: {
        // Live at 200 today; the `grogram` spelling 404s in Japanese. Verified
        // against production, not inferred from the directory listing.
        'Orbs-Grant-Program-Second-Call-for-Grants': 'orbs-grant-grogram-second-call-for-grants',
      },
    },
    reason:
      'Paper pages are English-only: each wraps one PDF, and a localised route ' +
      'would serve the same document under another language tag. The legacy ' +
      'site published 23 Japanese and 27 Korean paper URLs that are live and ' +
      'indexed today, so they are folded onto the canonical page rather than ' +
      'left to 404 at cutover. See #131.',
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
 * ON THE TRAILING SLASH, because it looks like a missed optimisation and is
 * not. A slashless request takes TWO hops: Next's own `trailingSlash` rule
 * normalises `/perpetual-hub` to `/perpetual-hub/` before any custom redirect
 * is evaluated, and only then does this one fire.
 *
 * Writing the source without the slash does NOT collapse that. Measured both
 * ways against a production build — the numbers are identical, because Next
 * normalises the request before matching either form:
 *
 *   source `/perpetual-hub/`   /perpetual-hub -> 2 hops   /perpetual-hub/ -> 1
 *   source `/perpetual-hub`    /perpetual-hub -> 2 hops   /perpetual-hub/ -> 1
 *
 * The only way to collapse it is `skipTrailingSlashRedirect`, which would hand
 * us slash normalisation for every URL on the site — far more risk than one
 * hop is worth.
 *
 * And the hop costs nothing anyway: the LIVE legacy site already 301s
 * `/perpetual-hub` to `/perpetual-hub/`, so the canonical, indexed, linked form
 * is the slashed one and it reaches the new URL in a single hop. A slashless
 * inbound link pays exactly what it pays today.
 *
 * The slashed form is kept here because it is the canonical one, not because it
 * is faster.
 */
export function expandedRedirects(): { source: string; destination: string; permanent: true }[] {
  return [
    ...REDIRECTS.flatMap(({ from, to, locales }) =>
      locales.map((locale) => ({
        source: `${SEGMENTS[locale]}${from}/`,
        destination: `${SEGMENTS[locale]}${to}/`,
        permanent: true as const,
      }))
    ),
    ...expandedPrefixRedirects(),
  ]
}

/**
 * The locale-stripping rules, as one pattern per section per locale.
 *
 * `:child` is a path parameter, which matches exactly one non-empty segment.
 * That is load-bearing twice over: it leaves the section index alone, and it
 * declines to match a deeper path like `/ko/white-papers/a/b/`, which was never
 * a URL on either site.
 */
export function expandedPrefixRedirects(): { source: string; destination: string; permanent: true }[] {
  // Renames first. Next evaluates `redirects()` in order and takes the first
  // match, so a generic `:child` rule placed above them would swallow the exact
  // paths they exist to correct — and the result would be a permanent redirect
  // to a 404, which is the failure this whole entry is built to avoid.
  const renames = PREFIX_REDIRECTS.flatMap(({ prefix, locales, rename }) =>
    locales.flatMap((locale) =>
      Object.entries(rename?.[locale] ?? {}).map(([from, to]) => ({
        source: `${SEGMENTS[locale]}${prefix}/${from}/`,
        destination: `${prefix}/${to}/`,
        permanent: true as const,
      }))
    )
  )

  const patterns = PREFIX_REDIRECTS.flatMap(({ prefix, locales }) =>
    locales.map((locale) => ({
      source: `${SEGMENTS[locale]}${prefix}/:child/`,
      destination: `${prefix}/:child/`,
      permanent: true as const,
    }))
  )

  return [...renames, ...patterns]
}

import { readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { PREFIX_REDIRECTS, REDIRECTS, expandedPrefixRedirects, expandedRedirects } from './redirects'
import { localesFor } from '@/i18n/availability'
import { LOCALE_SEGMENTS } from '@/i18n/locales'
import { WHITE_PAPERS } from '@/content/pages/white-papers'

/**
 * A redirect map is a set of promises to the internet, and both ways of getting
 * one wrong are silent.
 *
 *  - A destination that does not resolve turns a soft 404 into a confident
 *    wrong answer: the reader gets a redirect, follows it, and lands on a 404
 *    that search engines read as a soft-404 rather than a move. Nothing throws.
 *  - A source that is ALSO a live route shadows that page entirely. The file
 *    still sits in `src/app`, the route still builds, and it is unreachable.
 *
 * Neither is a type error and neither fails a build, so they are checked here.
 * Route discovery is the same filesystem walk `link-integrity.test.ts` uses,
 * and for the same reason: the registry is one of the things that can be wrong,
 * so validating against it would let a mistake agree with itself.
 */

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const APP = join(REPO, 'src/app')

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

/** Locale-independent routes, with `(en)`/`(jp)`/`(ko)` groups stripped. */
async function staticRoutes(): Promise<Set<string>> {
  const routes = new Set<string>()

  for await (const file of walk(APP)) {
    if (!file.endsWith('/page.tsx')) continue

    const segments = relative(APP, file)
      .replace(/\/page\.tsx$/, '')
      .split('/')
      .filter((segment) => segment !== '' && !segment.startsWith('('))

    if (segments.some((segment) => segment.startsWith('['))) continue

    routes.add(`/${segments.join('/')}`.replace(/\/$/, '') || '/')
  }

  return routes
}

describe('the redirect map', () => {
  let routes: Set<string>

  beforeAll(async () => {
    routes = await staticRoutes()
  }, 30_000)

  it('sends every redirect to a route that exists', () => {
    const broken = REDIRECTS.filter(({ to }) => !routes.has(to)).map(({ from, to }) => `${from} -> ${to}`)

    expect(broken, `\nRedirects pointing at a route that does not exist:\n  ${broken.join('\n  ')}\n`).toEqual([])
  })

  it('never redirects away from a page that still exists', () => {
    const shadowed = REDIRECTS.filter(({ from }) => routes.has(from)).map(({ from }) => from)

    expect(
      shadowed,
      `\nThese are live routes AND redirect sources, so the page is unreachable:\n  ${shadowed.join('\n  ')}\n`
    ).toEqual([])
  })

  it('has no redirect that points at another redirect', () => {
    // A chain costs the reader two round trips and search engines discount
    // them. Collapse it to one hop instead of relying on nobody noticing.
    const sources = new Set(REDIRECTS.map(({ from }) => from))
    const chained = REDIRECTS.filter(({ to }) => sources.has(to)).map(({ from, to }) => `${from} -> ${to} -> ...`)

    expect(chained, `\nRedirect chains:\n  ${chained.join('\n  ')}\n`).toEqual([])
  })

  it('has no duplicate sources', () => {
    const seen = new Set<string>()
    const duplicated = REDIRECTS.map(({ from }) => from).filter((from) => !seen.add(from))

    expect(duplicated).toEqual([])
  })

  it('writes paths in the map without trailing slashes', () => {
    // `expandedRedirects` adds the slash. A path carrying one here would
    // produce `//`, which matches nothing and fails silently.
    // The home page is the one exception: it has no slashless spelling, and
    // `expandedRedirects` handles it rather than concatenating a second slash.
    const wrong = REDIRECTS.flatMap(({ from, to }) => [from, to]).filter(
      (path) => path !== '/' && (path.endsWith('/') || !path.startsWith('/'))
    )

    expect(wrong).toEqual([])
  })
})

describe('expandedRedirects', () => {
  /**
   * THE important one, and the reason `locales` is declared per entry.
   *
   * `redirects.ts` cannot import the availability map — `next.config.ts` reads
   * it and is transpiled before the `@/*` alias exists — so the two could drift
   * silently. This is what stops that.
   *
   * Found by running the build rather than by reading it: `/jp/perpetual-hub/`
   * was 308ing to `/jp/dperps/`, a 404, because there has never been a Japanese
   * Perpetual Hub page.
   */
  it('declares exactly the locales the destination is reachable in', () => {
    for (const { to, locales } of REDIRECTS) {
      expect([...locales].sort(), `${to} locales`).toEqual([...localesFor(to)].sort())
    }
  })

  it('builds locale prefixes from the same map the routes use', () => {
    for (const { from, to, locales } of REDIRECTS) {
      for (const locale of locales) {
        const segment = LOCALE_SEGMENTS[locale] === '' ? '' : `/${LOCALE_SEGMENTS[locale]}`

        expect(expandedRedirects()).toContainEqual({
          source: `${segment}${from}/`,
          // The home page is already a slash, so it is not given another.
          destination: to === '/' ? `${segment}/` : `${segment}${to}/`,
          permanent: true,
        })
      }
    }
  })

  it('sends a redirect to the home page to the right place in each locale', () => {
    // Named rather than left to the loop above, because the root is the one
    // destination the naive `${to}/` concatenation gets wrong — it produced
    // `//` and `/jp//`, which match nothing, so the redirect silently did
    // nothing at all.
    const destinations = expandedRedirects()
      .filter(({ source }) => source.endsWith('/powered-by/'))
      .map(({ source, destination }) => `${source} -> ${destination}`)

    expect(destinations.sort()).toEqual(['/jp/powered-by/ -> /jp/', '/ko/powered-by/ -> /ko/', '/powered-by/ -> /'])
  })

  it('emits one rule per locale the destination exists in, and no more', () => {
    const expected =
      REDIRECTS.reduce((total, { locales }) => total + locales.length, 0) +
      // One pattern per locale, plus one explicit rule per renamed child.
      PREFIX_REDIRECTS.reduce(
        (total, { locales, rename }) =>
          total +
          locales.length +
          locales.reduce((count, locale) => count + Object.keys(rename?.[locale] ?? {}).length, 0),
        0
      )

    expect(expandedRedirects()).toHaveLength(expected)
  })

  it('emits the trailing-slash form, which is what trailingSlash: true serves', () => {
    for (const { source, destination } of expandedRedirects()) {
      expect(source.endsWith('/'), source).toBe(true)
      expect(destination.endsWith('/'), destination).toBe(true)
      expect(source.includes('//'), source).toBe(false)
    }
  })

  it('is permanent, because these are renames rather than experiments', () => {
    for (const rule of expandedRedirects()) {
      expect(rule.permanent).toBe(true)
    }
  })

  it('actually covers the Perpetual Hub rename', () => {
    // Named explicitly rather than left to the generic rules. A map that
    // silently emptied would pass every test above — a check that inspects
    // nothing passes everything.
    const sources = expandedRedirects().map(({ source }) => source)

    expect(sources).toContain('/perpetual-hub/')
    expect(sources).toContain('/ko/perpetual-hub/')
    // NOT Japanese. There is no `/jp/dperps/`, so a rule pointing at it would
    // be a redirect to a 404 — see the note on `Redirect.locales`.
    expect(sources).not.toContain('/jp/perpetual-hub/')

    expect(expandedRedirects().find(({ source }) => source === '/perpetual-hub/')?.destination).toBe('/dperps/')
  })
})

describe('expandedPrefixRedirects', () => {
  let routes: Set<string>

  beforeAll(async () => {
    routes = await staticRoutes()
  }, 30_000)

  it('folds the localised children onto the canonical English path', () => {
    const rules = expandedPrefixRedirects()

    expect(rules).toContainEqual({
      source: '/jp/white-papers/:child/',
      destination: '/white-papers/:child/',
      permanent: true,
    })
    expect(rules).toContainEqual({
      source: '/ko/white-papers/:child/',
      destination: '/white-papers/:child/',
      permanent: true,
    })
  })

  /**
   * THE one that matters here.
   *
   * `/jp/white-papers/` and `/ko/white-papers/` are live translated pages, and
   * a rule whose source also matched the section index would take them out.
   *
   * Measured rather than imagined: building with `:child*` in place of `:child`
   * — the obvious "be more permissive" edit — makes both indexes return **500**,
   * because the destination interpolates to `/white-papers//`. Not a redirect,
   * not a 404; a server error on two live pages, and only on the two locales,
   * so an English smoke test sees nothing wrong.
   *
   * `:child` requires a non-empty segment, which is a property of
   * path-to-regexp rather than of anything in this repo. Hence asserted.
   */
  it('never matches the section index itself', () => {
    // Only the patterns. A rename is an exact path and trivially matches
    // itself — running it through this check would compare a rule against its
    // own source and always fail, which says nothing about the index.
    const patterns = expandedPrefixRedirects().filter(({ source }) => source.includes(':child'))

    expect(patterns.length).toBeGreaterThan(0)

    for (const { source } of patterns) {
      const index = source.replace(':child/', '')

      expect(matches(source, index), `${source} must not match its own index ${index}`).toBe(false)
    }
  })

  it('matches a child, and only one level of it', () => {
    const source = '/ko/white-papers/:child/'

    expect(matches(source, '/ko/white-papers/orbs-position-paper/')).toBe(true)
    // Never a URL on either site. Matching it would redirect an arbitrarily
    // deep path to a destination that cannot exist.
    expect(matches(source, '/ko/white-papers/a/b/')).toBe(false)
    expect(matches(source, '/ko/white-papers/')).toBe(false)
  })

  it('points every pattern at a section that is a real route', () => {
    // The destination is `/white-papers/:child/`, whose parent must exist for
    // the redirect to land anywhere. The child itself is a dynamic route, so
    // the filesystem walk cannot confirm it — `link-integrity.test.ts` covers
    // paper slugs, and `generateStaticParams` is the source of truth there.
    for (const { prefix } of PREFIX_REDIRECTS) {
      expect(routes.has(prefix), `${prefix} is not a route`).toBe(true)
    }
  })

  /**
   * Caught in review, and it would have been permanent.
   *
   * `/jp/white-papers/Orbs-Grant-Program-Second-Call-for-Grants/` is live at
   * 200. English and Korean spell the same paper
   * `orbs-grant-grogram-second-call-for-grants` — a typo, carried forward
   * because it is the indexed URL. The pattern passes the child through
   * unchanged, so without an exception that live page would have 308ed to a
   * slug that does not exist, and browsers would have cached it forever.
   */
  it('sends every renamed child to a paper that exists', () => {
    const slugs = new Set(WHITE_PAPERS.map(({ slug }) => slug))

    for (const { rename } of PREFIX_REDIRECTS) {
      for (const [locale, entries] of Object.entries(rename ?? {})) {
        for (const [from, to] of Object.entries(entries)) {
          expect(slugs.has(to), `${locale}: ${from} -> ${to} is not a paper slug`).toBe(true)
          // A rename to itself is the pattern's job and would be dead weight
          // here — worse, it would read as though something had been handled.
          expect(from, `${locale}: ${from} renames to itself`).not.toBe(to)
        }
      }
    }
  })

  it('orders renames before the pattern that would swallow them', () => {
    // Next takes the FIRST matching rule. `/jp/white-papers/:child/` matches the
    // renamed path too, so order is the only thing making the exception
    // effective — and nothing about the output would look wrong if it were
    // reversed.
    const rules = expandedPrefixRedirects()
    const rename = rules.findIndex(({ source }) => source.includes('Orbs-Grant-Program-Second-Call-for-Grants'))
    const pattern = rules.findIndex(({ source }) => source === '/jp/white-papers/:child/')

    expect(rename).toBeGreaterThanOrEqual(0)
    expect(pattern).toBeGreaterThanOrEqual(0)
    expect(rename).toBeLessThan(pattern)
  })

  it('declares only locales that actually have the section', () => {
    // A locale-stripping rule for a locale that never served the section would
    // be a redirect from a URL nobody can request — harmless, but it would mean
    // the map is describing a site that does not exist.
    for (const { prefix, locales } of PREFIX_REDIRECTS) {
      for (const locale of locales) {
        expect([...localesFor(prefix)], `${prefix} in ${locale}`).toContain(locale)
      }
    }
  })
})

/**
 * Whether a Next redirect `source` pattern matches a concrete path.
 *
 * A miniature of path-to-regexp covering the one construct these patterns use,
 * `:param`, which matches exactly one non-empty segment containing no slash.
 * Reimplemented rather than imported so the assertion describes the behaviour
 * being relied on; if Next ever changed it, this test would keep passing and
 * the build check in the PR is what would catch it.
 */
function matches(source: string, path: string): boolean {
  const pattern = source
    .split('/')
    .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/')

  return new RegExp(`^${pattern}$`).test(path)
}

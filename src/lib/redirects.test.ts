import { WHITE_PAPERS } from '@/content/pages/white-papers'
import { localesFor } from '@/i18n/availability'
import { LOCALE_SEGMENTS } from '@/i18n/locales'
import { readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  BLOG_REDIRECTS,
  PREFIX_REDIRECTS,
  REDIRECTS,
  TEMPORARY_REDIRECTS,
  expandedPrefixRedirects,
  expandedRedirects,
  expandedTemporaryRedirects,
} from './redirects'

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

describe('temporary inner-page consolidation', () => {
  it('sends all four product URLs and their locale variants straight to dSPOT with reversible redirects', () => {
    for (const prefix of ['', '/jp', '/ko']) {
      for (const product of ['liquidity-hub', 'dtwap', 'dlimit', 'dsltp']) {
        expect(expandedTemporaryRedirects()).toContainEqual({
          source: `${prefix}/${product}/`,
          destination: `${prefix}/dspot/`,
          permanent: false,
        })
      }
    }
  })

  it('consolidates AI Skills into Agentic, retaining Korean and falling back to English for Japanese', () => {
    const rules = expandedTemporaryRedirects()
    for (const [prefix, destination] of [
      ['', '/agentic/'],
      ['/jp', '/jp/agentic/'],
      ['/ko', '/ko/agentic/'],
    ]) {
      expect(rules).toContainEqual({ source: `${prefix}/ai/skills/`, destination, permanent: false })
    }
    // Agentic still links to the actual skill guide. Only its redundant index moves.
    expect(rules.some(({ source }) => source.includes('spot-advanced-swap-orders'))).toBe(false)
  })

  it('has real destination locales, unique sources and no chains through permanent or temporary moves', () => {
    for (const { to, locales } of TEMPORARY_REDIRECTS) {
      expect([...locales].sort()).toEqual([...localesFor(to)].sort())
    }
    const rules = [...expandedRedirects(), ...expandedTemporaryRedirects()]
    const sources = rules.map(({ source }) => source)
    expect(new Set(sources).size).toBe(sources.length)
    for (const { destination } of rules) expect(sources).not.toContain(destination)
  })
})

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
    const shadowed = [...REDIRECTS, ...BLOG_REDIRECTS].filter(({ from }) => routes.has(from)).map(({ from }) => from)

    expect(
      shadowed,
      `\nThese are live routes AND redirect sources, so the page is unreachable:\n  ${shadowed.join('\n  ')}\n`
    ).toEqual([])
  })

  it('has no redirect that points at another redirect', () => {
    // A chain costs the reader two round trips and search engines discount
    // them. Collapse it to one hop instead of relying on nobody noticing.
    const all = [...REDIRECTS, ...BLOG_REDIRECTS]
    const sources = new Set(all.map(({ from }) => from))
    const chained = all.filter(({ to }) => sources.has(to)).map(({ from, to }) => `${from} -> ${to} -> ...`)

    expect(chained, `\nRedirect chains:\n  ${chained.join('\n  ')}\n`).toEqual([])
  })

  it('has no duplicate sources', () => {
    const seen = new Set<string>()
    const duplicated = [...REDIRECTS, ...BLOG_REDIRECTS].map(({ from }) => from).filter((from) => !seen.add(from))

    expect(duplicated).toEqual([])
  })

  it('writes paths in the map without trailing slashes', () => {
    // `expandedRedirects` adds the slash. A path carrying one here would
    // produce `//`, which matches nothing and fails silently.
    // The home page is the one exception: it has no slashless spelling, and
    // `expandedRedirects` handles it rather than concatenating a second slash.
    const wrong = [...REDIRECTS, ...BLOG_REDIRECTS]
      .flatMap(({ from, to }) => [from, to])
      .filter((path) => path !== '/' && (path.endsWith('/') || !path.startsWith('/')))

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
      BLOG_REDIRECTS.length +
      1 + // Preserved Japanese paper spelling alias.
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
    // Japanese now has a translated dPERPS destination.
    expect(sources).toContain('/jp/perpetual-hub/')

    expect(expandedRedirects().find(({ source }) => source === '/perpetual-hub/')?.destination).toBe('/dperps/')
  })
})

describe('legacy duplicate article URLs', () => {
  it('moves both known copies to the content-equivalent, published article', () => {
    expect(BLOG_REDIRECTS).toEqual([
      { from: '/Meta-Swap-Decentralized-AMM-Optimizer', to: '/how-to-use-the-orbs-pool-on-alpaca-finance' },
      {
        from: '/single-sided-farming',
        to: '/single-sided-farming-on-any-dex-via-orbs-liquidity-nexus-part-1',
      },
    ])
    for (const { from, to } of BLOG_REDIRECTS) {
      expect(expandedRedirects()).toContainEqual({ source: `${from}/`, destination: `${to}/`, permanent: true })
    }
  })
})

describe('translated paper detail routes', () => {
  it('does not fold Japanese or Korean paper details into English', () => {
    expect(expandedPrefixRedirects().some(({ source }) => source.includes(':child'))).toBe(false)
    for (const prefix of ['/jp', '/ko']) {
      expect(expandedPrefixRedirects().some(({ source }) => source === `${prefix}/white-papers/`)).toBe(false)
    }
  })
  it('preserves the historical Japanese paper spelling as a same-locale alias', () => {
    const slug = 'orbs-grant-grogram-second-call-for-grants'
    expect(WHITE_PAPERS.some((paper) => paper.slug === slug)).toBe(true)
    expect(expandedPrefixRedirects()).toContainEqual({
      source: '/jp/white-papers/Orbs-Grant-Program-Second-Call-for-Grants/',
      destination: `/jp/white-papers/${slug}/`,
      permanent: true,
    })
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

import { readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { REDIRECTS, expandedRedirects } from './redirects'
import { localesFor } from '@/i18n/availability'
import { LOCALE_SEGMENTS } from '@/i18n/locales'

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
    const wrong = REDIRECTS.flatMap(({ from, to }) => [from, to]).filter(
      (path) => path.endsWith('/') || !path.startsWith('/')
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
          destination: `${segment}${to}/`,
          permanent: true,
        })
      }
    }
  })

  it('emits one rule per locale the destination exists in, and no more', () => {
    const expected = REDIRECTS.reduce((total, { locales }) => total + locales.length, 0)

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

import { existsSync, statSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Every internal link in `src/content/` must point at a route that exists.
 *
 * This is the guard for a class of bug that had been accumulating unnoticed:
 * seventeen paths were linked from shipped pages — the footer, the Liquidity
 * Hub page, dTWAP and dLIMIT — while no such route existed. They were found by
 * running a script by hand, months after the first one landed. Nothing in CI
 * knew, because nothing was looking.
 *
 * The rule is deliberately one-directional. A link to a route that does not
 * exist fails, unless it is named in `PENDING` below. `PENDING` may only ever
 * shrink: the test also fails if an entry there HAS been built, so a page
 * landing forces its own line to be deleted in the same diff. The debt is
 * counted down in the repository rather than in someone's memory.
 *
 * Links are read from the modules' exported VALUES rather than by grepping the
 * source, so a path mentioned in a comment or a docstring is not mistaken for a
 * link. Several of these files explain their routing decisions at length and
 * quote paths while doing it.
 */

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const APP = join(REPO, 'src/app')
const CONTENT = join(REPO, 'src/content')

/**
 * Paths that are linked but not yet built, each pending a Phase 3 slice (#32).
 *
 * DELETE THE LINE when the page ships. The test enforces that: an entry here
 * that resolves is a failure, not a pass.
 */
const PENDING: readonly string[] = [
  '/brand-assets',
  '/contact',
  '/ecosystem',
  '/execution-services',
  '/notifications',
  '/overview',
  '/pos',
  '/ton-access',
  '/ton-vote',
]

/**
 * Blog posts referenced from marketing copy, by slug.
 *
 * These resolve through `app/(en)/[slug]`, whose set of valid values lives in
 * Contentful and cannot be enumerated here — a test that makes a network call
 * is a test that fails when the network does, and this suite has to keep
 * working while the space is blocked (#115).
 *
 * So they are listed explicitly. That is the point: `[slug]` matches ANY
 * single-segment path, so treating it as a wildcard would make `/contact`
 * "resolve" while still rendering a 404 for every reader. Each entry below is
 * a real published post, verified against the live site.
 */
const KNOWN_POST_SLUGS: readonly string[] = [
  '/Introducing-Orbs-Agentic',
  '/Introducing-dSLTP-The-First-Stop-Loss-Take-Profit-Solution-for-DeFi',
  '/Perpetual-Hub-by-Orbs',
]

/**
 * A path pointing at a real file under `public/` is an asset, not a route.
 *
 * Checked by existence rather than against a list of known prefixes. The list
 * version silently broke the first time a new asset directory appeared — the
 * white-paper PDFs and thumbnails under `/white-papers/` were reported as
 * missing routes — and it fails in the more dangerous direction too: a prefix
 * left in the list after its directory is deleted would hide a genuinely broken
 * link forever.
 */
function isAsset(path: string): boolean {
  if (path.startsWith('/_next/')) return true

  const candidate = join(REPO, 'public', path)

  // A FILE, not merely something that exists. `public/blog` is a directory of
  // post imagery and `/blog` is also a route — treating directory existence as
  // proof of an asset would have excluded the blog index from checking
  // entirely, which is the failure this whole test exists to prevent.
  return existsSync(candidate) && statSync(candidate).isFile()
}

/**
 * Dynamic routes whose valid values are enumerable without a network call.
 *
 * `staticRoutes` deliberately ignores dynamic segments, because `[slug]`
 * matches any single-segment path and treating it as a wildcard would make
 * every unbuilt page "resolve". But `[paper]` under `/white-papers` is
 * different: its `generateStaticParams` reads a committed list, so the exact
 * set of valid URLs is known here too.
 *
 * Read from the same module the route reads, so a paper removed there stops
 * validating here in the same commit.
 */
async function enumerableDynamicRoutes(): Promise<string[]> {
  const { WHITE_PAPERS } = await import('@/content/pages/white-papers')

  return WHITE_PAPERS.map(({ slug }) => `/white-papers/${slug}`)
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

/**
 * The routes the app actually serves, derived from the filesystem.
 *
 * Read from `page.tsx` files rather than from `MARKETING_PAGE_PATHS`, because
 * the registry is one of the things that can be wrong. A page listed there but
 * never routed would validate against itself.
 *
 * Route groups — `(en)`, `(jp)`, `(ko)` — are organisational and contribute no
 * URL segment, so they are stripped. Dynamic segments are excluded entirely
 * rather than treated as wildcards, for the reason given on
 * `KNOWN_POST_SLUGS`.
 */
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

/** Every string in a module's exports, however deeply nested. */
function strings(value: unknown, seen = new Set<unknown>()): string[] {
  if (typeof value === 'string') return [value]
  if (value === null || typeof value !== 'object') return []
  if (seen.has(value)) return []
  seen.add(value)

  return Object.values(value as Record<string, unknown>).flatMap((nested) => strings(nested, seen))
}

async function linkedPaths(): Promise<Map<string, string[]>> {
  const found = new Map<string, string[]>()

  for await (const file of walk(CONTENT)) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue

    // Not named `module` — `@next/next/no-assign-module-variable` forbids it,
    // since shadowing it breaks webpack's CommonJS interop.
    const exports: Record<string, unknown> = await import(/* @vite-ignore */ file)
    const source = relative(REPO, file)

    for (const value of strings(exports)) {
      if (!value.startsWith('/')) continue
      if (isAsset(value)) continue

      // Written without a trailing slash by convention; `localeHref` adds one.
      const path = value.replace(/\/$/, '') || '/'
      found.set(path, [...(found.get(path) ?? []), source])
    }
  }

  return found
}

describe('internal links', () => {
  let routes: Set<string>
  let linked: Map<string, string[]>

  /**
   * Scanned once for all three assertions.
   *
   * Not per-test. Each one needed one or both halves, so doing it in the tests
   * walked the tree and imported every content module four times over — enough
   * to blow Vitest's 5s default when `npm test` runs this project alongside the
   * Storybook one and the two compete for a cold start. The generous timeout
   * here is for that contention, not for the work, which takes ~90ms alone.
   */
  beforeAll(async () => {
    const [discovered, enumerable, found] = await Promise.all([
      staticRoutes(),
      enumerableDynamicRoutes(),
      linkedPaths(),
    ])

    routes = new Set([...discovered, ...enumerable])
    linked = found
  }, 60_000)

  it('all resolve to a route that exists, or are listed as pending', () => {
    const known = new Set([...routes, ...KNOWN_POST_SLUGS, ...PENDING])

    const broken = [...linked]
      .filter(([path]) => !known.has(path))
      .map(([path, sources]) => `${path}  (linked from ${[...new Set(sources)].join(', ')})`)

    expect(broken, `\nInternal links with no route:\n  ${broken.join('\n  ')}\n`).toEqual([])
  })

  it('has no stale PENDING entries — a page that ships must delete its line', () => {
    const shipped = PENDING.filter((path) => routes.has(path))

    expect(
      shipped,
      `\nThese are built and must be removed from PENDING in src/content/link-integrity.test.ts:\n  ${shipped.join('\n  ')}\n`
    ).toEqual([])
  })

  it('has no unused PENDING entries — an unlinked page does not belong here', () => {
    const orphaned = PENDING.filter((path) => !linked.has(path))

    expect(
      orphaned,
      `\nThese are in PENDING but nothing links to them, so they are not deferred debt:\n  ${orphaned.join('\n  ')}\n`
    ).toEqual([])
  })
})

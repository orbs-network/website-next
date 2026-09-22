import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * #71: the canonical origin must not depend on the environment a build ran in.
 *
 * Page canonicals and hreflang come from `generateMetadata`, which runs at
 * BUILD time for prerendered routes. When the origin was read from `SITE_URL`,
 * whatever the build saw was frozen into the HTML — and promoting an artifact
 * between environments, which is what Vercel's "Promote to Production" does,
 * left every canonical naming the wrong domain.
 *
 * The failure is invisible in the obvious places: the build succeeds, the pages
 * render, the links work. Only the `<link rel="canonical">` is wrong, and only
 * on the deployment that was promoted rather than rebuilt.
 *
 * These load the module fresh with the environment altered, because the origin
 * is a module-level constant — evaluated once, on first import. Asserting on an
 * already-imported copy would prove nothing about what a different process
 * would compute.
 */

const ORIGIN = 'https://www.orbs.com'

/**
 * Run `body` with `env` applied and `site.ts` freshly imported.
 *
 * The callback shape is not incidental. The two values under test are read at
 * different MOMENTS, which is the whole subject of #71:
 *
 *  - the origin is a module-level constant, fixed when the module first loads
 *  - `shouldAllowIndexing()` reads `process.env` each time it is called
 *
 * A helper that restored the environment as soon as the import finished would
 * test the first correctly and silently test nothing for the second — the
 * variables would already be back to their real values by the time the function
 * ran. It did, and three assertions failed for that reason rather than for a
 * defect in the code.
 */
async function withEnv<T>(
  env: Record<string, string | undefined>,
  body: (site: typeof import('./site')) => T | Promise<T>
): Promise<T> {
  vi.resetModules()

  const previous: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(env)) {
    previous[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }

  try {
    return await body(await import('./site'))
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

afterEach(() => {
  vi.resetModules()
})

describe('the canonical origin', () => {
  it('ignores SITE_URL entirely', async () => {
    // THE regression. This variable used to decide the origin; a build that saw
    // it produced HTML naming that host forever.
    await withEnv({ SITE_URL: 'https://staging.example.com' }, (site) => {
      expect(site.CANONICAL_ORIGIN).toBe(ORIGIN)
      expect(site.siteUrl).toBe(ORIGIN)
      expect(site.absoluteUrl('/blog/')).toBe(`${ORIGIN}/blog/`)
    })
  })

  it('ignores the Vercel deployment host', async () => {
    // The other way the wrong origin can arrive: a per-deployment URL that is
    // different on every single build.
    await withEnv(
      {
        VERCEL_URL: 'orbs-website-v2-abc123-orbs.vercel.app',
        VERCEL_BRANCH_URL: 'orbs-website-v2-git-feature-orbs.vercel.app',
        VERCEL_ENV: 'preview',
      },
      (site) => {
        expect(site.absoluteUrl('/white-papers/')).toBe(`${ORIGIN}/white-papers/`)
      }
    )
  })

  it('is the same with the environment stripped bare', async () => {
    // A container with no Vercel variables at all must still emit the right
    // canonical rather than falling back to something host-derived.
    await withEnv({ SITE_URL: undefined, VERCEL_URL: undefined, VERCEL_ENV: undefined }, (site) => {
      expect(site.absoluteUrl('/')).toBe(`${ORIGIN}/`)
    })
  })

  it('derives the host from the same constant', async () => {
    // `robots.txt` emits `Host:`. If it could disagree with the canonicals, the
    // two SEO surfaces would name different preferred domains.
    await withEnv({ SITE_URL: 'https://staging.example.com' }, (site) => {
      expect(site.siteHost).toBe('www.orbs.com')
    })
  })

  it('carries no trailing slash, so joined paths do not double up', async () => {
    await withEnv({}, (site) => {
      expect(site.CANONICAL_ORIGIN.endsWith('/')).toBe(false)
      expect(site.absoluteUrl('/blog/')).not.toContain('//blog')
    })
  })

  it('adds the leading slash when a path omits it', async () => {
    await withEnv({}, (site) => {
      expect(site.absoluteUrl('blog/')).toBe(`${ORIGIN}/blog/`)
    })
  })
})

describe('shouldAllowIndexing', () => {
  /**
   * Indexing stays environment-dependent, and that is the deliberate half of
   * the split: it is a property of the DEPLOYMENT, not of the content. These
   * assert the distinction actually holds, so a future tidy-up that made the
   * origin and the indexing decision work the same way would fail here.
   */
  it('blocks a Vercel preview', async () => {
    await withEnv({ VERCEL_ENV: 'preview', ALLOW_INDEXING: undefined }, (site) => {
      expect(site.shouldAllowIndexing()).toBe(false)
    })
  })

  it('allows Vercel production', async () => {
    await withEnv({ VERCEL_ENV: 'production', ALLOW_INDEXING: undefined }, (site) => {
      expect(site.shouldAllowIndexing()).toBe(true)
    })
  })

  it('honours an explicit override either way', async () => {
    await withEnv({ ALLOW_INDEXING: 'false', VERCEL_ENV: 'production' }, (site) => {
      expect(site.shouldAllowIndexing()).toBe(false)
    })
    await withEnv({ ALLOW_INDEXING: 'true', VERCEL_ENV: 'preview' }, (site) => {
      expect(site.shouldAllowIndexing()).toBe(true)
    })
  })

  it('falls back to NODE_ENV off Vercel, rather than blocking silently', async () => {
    // The comment in `site.ts` is emphatic about this: defaulting to "block"
    // when VERCEL_ENV is absent would make a self-hosted production build
    // permanently unindexed, and nobody notices until traffic does not arrive.
    await withEnv({ VERCEL_ENV: undefined, ALLOW_INDEXING: undefined, NODE_ENV: 'production' }, (site) => {
      expect(site.shouldAllowIndexing()).toBe(true)
    })
  })
})

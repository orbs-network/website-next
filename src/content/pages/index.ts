/**
 * Every marketing page path, locale-independent and without a trailing slash.
 *
 * Deliberately data only — no component imports. `src/app/lib/routes.ts` reads
 * this to reserve root segments, and routes.ts is imported by `lib/api.ts` and
 * most pages. If this file pulled in page components, that chain would close
 * into a cycle (routes -> registry -> page -> routes).
 *
 * The component for each path lives in `src/app/marketing/registry.ts`, which
 * imports this list and is checked against it at build time so the two cannot
 * drift.
 *
 * Marketing pages are served from the site root alongside blog slugs, so every
 * entry here is also a slug that a post must not use — see
 * `RESERVED_ROOT_SEGMENTS`.
 */
export const MARKETING_PAGE_PATHS = ['/dtwap', '/dlimit', '/dsltp', '/perpetual-hub', '/liquidity-hub'] as const

export type MarketingPagePath = (typeof MARKETING_PAGE_PATHS)[number]

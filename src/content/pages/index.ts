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
export const MARKETING_PAGE_PATHS = [
  '/dtwap',
  '/dlimit',
  '/dsltp',
  '/perpetual-hub',
  '/liquidity-hub',
  '/agentic',
  '/ai/skills',
  '/ai/skills/spot-advanced-swap-orders',
  '/institutional',
  // Legal. Rendered from markdown rather than catalog copy — see
  // `src/content/legal/index.ts` for why long-form documents are stored
  // differently from UI strings.
  '/privacy-policy',
  '/terms-of-use',
  '/accessibility-declaration',
  '/liquidity-hub-terms-of-use',
  // FAQ. Same markdown-document treatment as the legal pages; `##` is a
  // section and `###` a question.
  '/faq',
  '/dtwap-and-dlimit-faq',
  // The white-paper index. Individual papers live at /white-papers/<slug> as a
  // separate English-only route, not through this registry — each is a wrapper
  // around one PDF that exists in a single language.
  '/white-papers',
  // The Orbs network overview. Composed from the shared marketing library.
  '/overview',
  // The ecosystem directory, from the dataset #37 tracks.
  '/ecosystem',
  // Network section: the Lambda/VM compute layer.
  '/execution-services',
  // Network section: proof of stake, guardians and delegators.
  '/pos',
  // The Open DeFi Notification Protocol.
  '/notifications',
  // Brand asset downloads.
  '/brand-assets',
  // The contact form, posting to `/api/contact`. The only marketing page with a
  // server-side dependency beyond the catalog.
  '/contact',
  // The TON Access RPC gateway, with the code-example selector.
  '/ton-access',
  // The TON.Vote DAO governance tool.
  '/ton-vote',
] as const

export type MarketingPagePath = (typeof MARKETING_PAGE_PATHS)[number]

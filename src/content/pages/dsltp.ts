/**
 * Structural data for the dSLTP page — image paths, external URLs, ordering.
 * Copy lives under `pages.dsltp` in the message catalogs, for the reasons set
 * out at the top of `dtwap.ts`.
 *
 * The page's SHAPE differs from its siblings, and deliberately so: the legacy
 * `content/dsltp/index.md` lists header + four numbered sections rather than
 * the cards / integrations / code / schema structure dTWAP and dLIMIT share.
 * There is no code-examples section and no per-DEX integration grid — the
 * integrations are a single map graphic — so this page composes the same
 * library differently rather than forcing the sibling layout onto it.
 */

export const DSLTP_HERO = {
  image: '/marketing/dsltp/hero.png',
  /**
   * The hero's call to action is a link to the announcement post, not an
   * in-page anchor as dTWAP and dLIMIT use. That post is real and already
   * prerendered from Contentful, so this is an internal route rather than an
   * external link.
   */
  ctaHref: '/Introducing-dSLTP-The-First-Stop-Loss-Take-Profit-Solution-for-DeFi',
} as const

/** The three benefit cards, in legacy order. Copy is `pages.dsltp.benefits.items.<id>`. */
export const DSLTP_BENEFITS = [
  { id: 'stopLoss', icon: '/marketing/dsltp/card-1.svg' },
  { id: 'takeProfit', icon: '/marketing/dsltp/card-2.svg' },
  { id: 'onchain', icon: '/marketing/dsltp/card-3.svg' },
] as const

/** Section 2: a diagram with no heading — the legacy `title:` field is empty. */
export const DSLTP_GRAPH_IMAGE = '/marketing/dsltp/graph.png'

/** Section 3: "Recent and Ongoing Integrations", a map rather than a logo grid. */
export const DSLTP_MAP_IMAGE = '/marketing/dsltp/map.png'

/**
 * The closing "Powered by Orbs Network" links, in legacy order.
 *
 * `/contact` and the FAQ do not exist yet and 404 until Phase 3 lands them
 * (#32) — the same deliberate call as the footer in #83, gated by #38's
 * pre-cutover URL audit.
 */
export const DSLTP_LINKS = {
  contact: '/contact/',
  faq: '/dtwap-and-dlimit-faq/',
  support: 'https://t.me/OrbsNetwork',
  github: 'https://github.com/orbs-network/',
  audits: 'https://github.com/orbs-network/twap/blob/master/Audit-Report-PeckShield.pdf',
} as const

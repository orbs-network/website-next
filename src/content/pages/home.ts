import type { LogoRowItem } from '@/components/marketing/logo-row'

/**
 * The home page, design 3.4.
 *
 * Data only — every string lives in the message catalogs under `pages.home`.
 *
 * Several destinations here do not exist yet: `/dspot`, `/sdk`, `/venues` and
 * `/ai-agents` are all being written. They are listed in
 * `link-integrity.test.ts`'s `PENDING`, which means the guard knows about them
 * and will fail the moment one ships without its line being deleted. That is
 * deliberate debt with a deadline rather than a broken link nobody is counting.
 */

/** The five figures under the hero. */
export const HOME_STATS = ['processed', 'liveSince', 'venues', 'chains', 'staked'] as const

export type HomeCard = {
  /** Message key under its section's namespace. */
  id: string
  href: string
  /**
   * Product mark, where the card has one.
   *
   * The dSPOT and dPERPS marks are NOT here yet. Figma's image endpoint started
   * returning 429 partway through exporting this page's assets, and a path to a
   * file that does not exist is worse than no path — `next/image` throws at
   * build rather than degrading. They land in a follow-up; the cards read
   * correctly without them because the heading names the product.
   */
  icon?: string
}

/**
 * [THE STACK] — the two product cards.
 *
 * `dSPOT` groups dTWAP, dLIMIT, dSLTP and Liquidity Hub in the navigation, but
 * it is its own page rather than a replacement for theirs: those four keep
 * their URLs and `/dspot` links down to them. Grouping in a menu and moving an
 * indexed URL are separate decisions, and only the first was asked for.
 *
 * `dPERPS` is the rename of Perpetual Hub. `/perpetual-hub` now permanently
 * redirects here — see `src/lib/redirects.ts`.
 */
export const HOME_STACK: readonly HomeCard[] = [
  { id: 'dspot', href: '/dspot' },
  { id: 'dperps', href: '/dperps' },
]

/** [SOLUTIONS] — three audience cards. */
export const HOME_SOLUTIONS: readonly HomeCard[] = [
  { id: 'venues', href: '/venues' },
  // The one that already exists.
  { id: 'institutions', href: '/institutional' },
  { id: 'aiAgents', href: '/ai-agents' },
]

/**
 * [KEY FEATURES & BENEFITS] — the tab list.
 *
 * Eight tabs. The design draws ONE panel state ("No custody handoff. No
 * counterparty risk on Orbs.") and leaves the other seven undrawn, so seven
 * panels have no copy yet. Rather than invent seven marketing claims, those
 * catalog entries currently restate the tab, which is true and obviously
 * provisional. See #149.
 */
export const HOME_FEATURES = [
  'nonCustodial',
  'gasless',
  'mev',
  'permissionless',
  'robust',
  'whiteLabel',
  'reporting',
  'audited',
] as const

/**
 * Venues using the stack, in the design's order.
 *
 * Exported from the design file as SVG. SushiSwap came back as a 214 KB SVG
 * that was only a wrapper around one embedded raster — `next/image` cannot
 * optimise those, so it reaches the reader at full size. `unwrap-raster-svgs`
 * turned it into a 4 KB PNG. The other five are real vectors.
 *
 * Dimensions measured, not read off the design: they are six different shapes
 * and a single declared box would distort five of them.
 */
export const HOME_VENUES: readonly LogoRowItem[] = [
  {
    name: 'PancakeSwap',
    logo: { src: '/marketing/home/venues/pancakeswap.svg', width: 151, height: 24 },
    wordmark: true,
  },
  { name: 'SushiSwap', logo: { src: '/marketing/home/venues/sushiswap.png', width: 240, height: 56 }, wordmark: true },
  { name: 'QuickSwap', logo: { src: '/marketing/home/venues/quickswap.svg', width: 153, height: 36 }, wordmark: true },
  { name: 'THENA', logo: { src: '/marketing/home/venues/thena.svg', width: 129, height: 30 }, wordmark: true },
  {
    name: 'SpookySwap',
    logo: { src: '/marketing/home/venues/spookyswap.svg', width: 167, height: 40 },
    wordmark: true,
  },
  { name: 'DefiZoo', logo: { src: '/marketing/home/venues/defizoo.svg', width: 117, height: 24 }, wordmark: true },
]

/** "Discover." — three large links out to the reading material. */
export const HOME_DISCOVER = [
  { id: 'blog', href: '/blog' },
  { id: 'whitePapers', href: '/white-papers' },
  { id: 'faq', href: '/faq' },
] as const

/**
 * The marquee's three phrases.
 *
 * Kept as separate strings rather than one pre-joined line: the separator is a
 * presentational decision the component makes, and a joined string would be
 * three claims a translator could only move as a block.
 */
export const HOME_MARQUEE = ['oneApi', 'everyOrderType', 'institutionalGrade'] as const

export const HOME_IMAGES = {
  /**
   * The hero's facet cluster. A real vector, so it stays SVG — `next/image`
   * does not optimise SVG, but there is nothing to optimise: it scales.
   */
  heroFacets: '/marketing/home/hero-facets.svg',
  /**
   * The network diagram. Also SVG, 23 KB, and the reason worth naming: the
   * frame the designer labelled "Place Diagram" is EMPTY — the real artwork is
   * a sibling group. Exporting the named one gives a blank image.
   */
  networkDiagram: '/marketing/home/network-diagram.svg',
} as const

export const HOME_LINKS = {
  docs: 'https://docs.orbs.network/',
  github: 'https://github.com/orbs-network',
  x: 'https://twitter.com/orbs_network',
  telegram: 'https://t.me/OrbsNetwork',
  contact: '/contact',
} as const

/** How many posts the "In the news" rail asks Contentful for. */
export const HOME_NEWS_COUNT = 6

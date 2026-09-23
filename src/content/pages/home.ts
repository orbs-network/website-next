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
   * CARRIES ITS OWN DIMENSIONS rather than being a bare path, because the marks
   * are not square and not the same shape as each other — dSPOT is 47.7x45.4
   * and dPERPS 41.7x50.2. The card renders them at a fixed HEIGHT with the
   * width left to follow, so a wider mark stays wider. Sizing both to a square
   * box, which is what a path alone invites, squashes dPERPS by 17%.
   *
   * Decorative in every case: the heading next to it names the product, so the
   * mark repeats rather than adds, and it is rendered `alt=""`.
   */
  icon?: { src: string; width: number; height: number }
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
/*
  The marks are the mark ONLY, not the lockup.

  #152 named two node ids to export, and both turn out to be the full lockup —
  `dSPOT/Variant2` and `dPERPS/Variant3` each pair the mark with a live TEXT
  node carrying the wordmark. Exporting those would have put a picture of the
  word "dSPOT" next to a heading that already reads dSPOT, as an image, at
  32px, in a font the page does not otherwise use. The mark groups inside them
  (`2141:133216` and `2141:133227`) are what this wants.

  Dimensions are the marks' own, from Figma. See `HomeCard['icon']`.
*/
export const HOME_STACK: readonly HomeCard[] = [
  { id: 'dspot', href: '/dspot', icon: { src: '/marketing/home/icons/dspot.svg', width: 48, height: 46 } },
  { id: 'dperps', href: '/dperps', icon: { src: '/marketing/home/icons/dperps.svg', width: 42, height: 51 } },
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

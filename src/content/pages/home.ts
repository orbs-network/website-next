import type { LogoRowItem } from '@/components/marketing/logo-row'

/**
 * The home page, design 3.4.
 *
 * Data only — every string lives in the message catalogs under `pages.home`.
 *
 * One destination here does not exist yet: `/ai-agents`. It is listed in
 * `link-integrity.test.ts`'s `PENDING`, which means the guard knows about it
 * and will fail the moment it ships without its line being deleted. That is
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
  /**
   * The eyebrow's colour (#192). The design colour-codes cards by audience and
   * product rather than using one accent: dSPOT and institutions periwinkle,
   * dPERPS and AI agents pink, venues cyan. Defaults to `primary`.
   */
  accent?: 'primary' | 'pink' | 'cyan'
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
  {
    id: 'dperps',
    href: '/dperps',
    icon: { src: '/marketing/home/icons/dperps.svg', width: 42, height: 51 },
    accent: 'pink',
  },
]

/** [SOLUTIONS] — three audience cards. */
export const HOME_SOLUTIONS: readonly HomeCard[] = [
  { id: 'venues', href: '/venues', accent: 'cyan' },
  // The one that already exists.
  { id: 'institutions', href: '/institutional' },
  { id: 'aiAgents', href: '/ai/skills', accent: 'pink' },
]

/**
 * [KEY FEATURES & BENEFITS] — the tab list.
 *
 * Eight tabs. The design draws only one panel, so each panel carries the same
 * one-line summary as the matching card on /institutional (#221, Sara's call).
 * The two are separate catalog entries because the Japanese and Korean
 * catalogs have no institutional page, and `home-features.test.ts` fails if
 * they drift apart.
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
 *
 * Each has an `-on-light` twin: the 09-30 export draws every venue in #121214
 * as well as white, and the white files alone vanished on the light theme
 * (#220). Cut from the same component set at the same crop. DefiZoo's white
 * file was re-cut from that export too — the earlier one was framed tighter,
 * and a pair that differs in shape would reflow the row on a theme switch.
 *
 * Carbon, TradingView and SwapX (#274) follow, in the order of the design's
 * "Additional Partner Logos Area" (2144:137567). Each is cut from its component
 * set in the same 09-30 export — carbon-logo-white 2 (2141:133413), TradingView
 * (2144:137725), Swap X Logo (2112:81991) — the dark-ink variant for
 * `-on-light`, the white one for dark. All three are pure vectors with no
 * embedded raster. The old text-only `SwapXLogo` placeholder icon is not the
 * brand mark and is not used here.
 */
export const HOME_VENUES: readonly LogoRowItem[] = [
  { name: 'PancakeSwap', logo: venue('pancakeswap', 151, 24), wordmark: true },
  { name: 'SushiSwap', logo: venue('sushiswap', 240, 56, 'png'), wordmark: true },
  { name: 'QuickSwap', logo: venue('quickswap', 153, 36), wordmark: true },
  { name: 'THENA', logo: venue('thena', 129, 30), wordmark: true },
  { name: 'SpookySwap', logo: venue('spookyswap', 167, 40), wordmark: true },
  { name: 'DefiZoo', logo: venue('defizoo', 148, 37), wordmark: true },
  { name: 'Carbon', logo: venue('carbon', 149, 32), wordmark: true },
  { name: 'TradingView', logo: venue('tradingview', 166, 24), wordmark: true },
  { name: 'SwapX', logo: venue('swapx', 128, 30), wordmark: true },
]

/** A venue mark and its `-on-light` twin, which share a crop and so dimensions. */
function venue(slug: string, width: number, height: number, ext: 'svg' | 'png' = 'svg') {
  const base = `/marketing/home/venues/${slug}`
  return { src: `${base}.${ext}`, onLight: `${base}-on-light.${ext}`, width, height }
}

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
  github: 'https://github.com/orbs-network',
  x: 'https://twitter.com/orbs_network',
  telegram: 'https://t.me/OrbsNetwork',
  contact: '/contact',
  /**
   * Discover's "View resources". There is no resources index; the blog is the
   * nearest thing to one, and it is also the first row above the button.
   */
  resources: '/blog',
} as const

/** How many posts the "In the news" rail asks Contentful for. */
export const HOME_NEWS_COUNT = 6

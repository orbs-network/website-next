import type { LogoRowItem } from '@/components/marketing/logo-row'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'

/**
 * Structural data for dPERPS — image paths, external
 * URLs, ordering. Copy lives under `pages.dperps` in the message
 * catalogs, for the reasons set out at the top of `dtwap.ts`.
 *
 * The legacy Korean shape follows its existing page: header, cards, an "Integrate" diagram, a
 * partners diagram, a closing "Powered by Orbs Network" block, and a legal
 * disclaimer. Two of those sections are a heading, prose and a picture with
 * nothing to click. The page composes these in the shared divided layout.
 */

export const DPERPS_HERO = {
  /**
   * Links to the announcement post rather than an in-page anchor, as dSLTP's
   * does. The post is real and already prerendered from Contentful.
   *
   * Korean goes somewhere else entirely: the legacy Korean page points this
   * button at a Naver article, not at a translation of the English post — the
   * same situation as the Korean footer's "Blog" link, which goes to a Korean
   * Medium publication rather than to `/blog`.
   */
  cta: {
    href: '/Perpetual-Hub-by-Orbs',
    byLocale: { ko: 'https://blog.naver.com/orbskorea/223514811254' },
  },
} as const

/** The three modular-stack cards, in legacy order. */
export const DPERPS_BENEFITS = [
  { id: 'tradingUi', icon: '/marketing/perpetual-hub/card-1.svg' },
  { id: 'hedger', icon: '/marketing/perpetual-hub/card-2.svg' },
  { id: 'oracles', icon: '/marketing/perpetual-hub/card-3.svg' },
] as const

/** "Integrate": the trading-stack diagram. */
export const DPERPS_DIAGRAM = {
  src: '/marketing/perpetual-hub/diagram.png',
  width: 1800,
  height: 945,
} as const

/** "Partners & Integrations": a logo board rather than a per-DEX grid. */
export const DPERPS_PARTNERS_IMAGE = {
  src: '/marketing/perpetual-hub/partners.png',
  width: 1340,
  height: 679,
} as const

/**
 * The closing links.
 *
 * The legacy contact button points at the absolute `https://www.orbs.com/contact`
 * while every other page uses the relative `/contact`. Normalised to the
 * relative form: after cutover the absolute URL resolves to this same app, so
 * keeping it would leave a self-referential absolute link to clean up — the same
 * reasoning applied to the dLIMIT white-paper link in #89.
 */
export const DPERPS_LINKS = {
  /**
   * Internal, so it resolves through `localeHref` and will become
   * `/ko/contact/` the moment #32 builds `/contact` and registers it in the
   * availability map. The legacy Korean page hardcodes
   * `https://www.orbs.com/ko/contact`; deriving it means one fewer absolute URL
   * to unpick after cutover, and it cannot drift from where the page actually
   * lives.
   */
  contact: { href: '/contact' },
  /** Korean points at the Naver article, as the hero button does. */
  onePager: {
    href: '/Perpetual-Hub-by-Orbs',
    byLocale: { ko: 'https://blog.naver.com/orbskorea/223514811254' },
  },
} as const

/** English October 15 product handoff; the legacy Korean composition stays intact. */
export const DPERPS_FEATURES = ['pricing', 'execution', 'positions', 'hedging', 'liquidation', 'settlement'] as const
export type DperpsFeatureId = (typeof DPERPS_FEATURES)[number]

export const DPERPS_GRAPHICS = {
  network: HERO_GRAPHICS.overview,
  security: HERO_GRAPHICS.dlimit,
  venue: HERO_GRAPHICS.venues,
} as const

/** The six wordmarks in Sara's supplied dPERPS PDF, in that order. */
export const DPERPS_PARTNERS: readonly LogoRowItem[] = [
  {
    name: 'TrebleSwap',
    logo: { src: '/marketing/dperps/trebleswap.svg', width: 136, height: 32 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'Gryps',
    logo: { src: '/marketing/dperps/gryps.svg', width: 145, height: 37 },
    invertOnLight: true,
    wordmark: true,
  },
  {
    name: 'QuickSwap',
    logo: {
      src: '/marketing/home/venues/quickswap.svg',
      onLight: '/marketing/home/venues/quickswap-on-light.svg',
      width: 153,
      height: 36,
    },
    wordmark: true,
  },
  {
    name: 'THENA',
    logo: {
      src: '/marketing/home/venues/thena.svg',
      onLight: '/marketing/home/venues/thena-on-light.svg',
      width: 129,
      height: 30,
    },
    wordmark: true,
  },
  {
    name: 'SpookySwap',
    logo: {
      src: '/marketing/home/venues/spookyswap.svg',
      onLight: '/marketing/home/venues/spookyswap-on-light.svg',
      width: 167,
      height: 40,
    },
    wordmark: true,
  },
  {
    name: 'Atlantis',
    logo: { src: '/marketing/dperps/atlantis.png', width: 238, height: 40 },
    invertOnLight: true,
    wordmark: true,
  },
]

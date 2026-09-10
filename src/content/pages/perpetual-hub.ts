/**
 * Structural data for the Perpetual Hub Ultra page — image paths, external
 * URLs, ordering. Copy lives under `pages.perpetualHub` in the message
 * catalogs, for the reasons set out at the top of `dtwap.ts`.
 *
 * Shape follows the legacy page: header, cards, an "Integrate" diagram, a
 * partners diagram, a closing "Powered by Orbs Network" block, and a legal
 * disclaimer. Two of those sections are a heading, prose and a picture with
 * nothing to click, which is why `ArchitectureSection` takes its links
 * optionally.
 */

export const PERPETUAL_HUB_HERO = {
  image: { src: '/marketing/perpetual-hub/hero.png', width: 1000, height: 1006 },
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
export const PERPETUAL_HUB_BENEFITS = [
  { id: 'tradingUi', icon: '/marketing/perpetual-hub/card-1.svg' },
  { id: 'hedger', icon: '/marketing/perpetual-hub/card-2.svg' },
  { id: 'oracles', icon: '/marketing/perpetual-hub/card-3.svg' },
] as const

/** "Integrate": the trading-stack diagram. */
export const PERPETUAL_HUB_DIAGRAM = {
  src: '/marketing/perpetual-hub/diagram.png',
  width: 1800,
  height: 945,
} as const

/** "Partners & Integrations": a logo board rather than a per-DEX grid. */
export const PERPETUAL_HUB_PARTNERS_IMAGE = {
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
export const PERPETUAL_HUB_LINKS = {
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

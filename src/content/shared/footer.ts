import type { Locale } from '@/i18n/locales'

/**
 * The footer's link structure: the 3.4 `Footer` component in Figma, which
 * replaced the port of the legacy `content/_shared/footer/` tree.
 *
 * Data only, and deliberately so: the labels live in the message catalogs under
 * `footer.*`, keyed by the `key` fields here. The legacy site expressed the same
 * split — one markdown file per link, per locale — and it is what lets the
 * Korean column carry real translations while the Japanese one stays English
 * without either needing a branch in the component.
 *
 * Internal `href`s are locale-INDEPENDENT and carry no trailing slash. Both
 * matter: the component passes them through `localeHref`, which resolves the
 * locale prefix from the availability map and appends the slash that
 * `trailingSlash: true` requires. Writing `/jp/pos` here would defeat that and
 * hardcode a prefix the map is supposed to own.
 */
export type FooterLinkSpec = {
  /** Message key under the `footer.links` namespace. */
  key: string
  /**
   * A locale-independent internal path (leading `/`, no trailing slash), or an
   * absolute external URL. The `startsWith('/')` test decides which, matching
   * `ArchitectureSection`.
   */
  href: string
  /**
   * Per-locale destination overrides, for links that go somewhere genuinely
   * different rather than to a prefixed version of the same page.
   *
   * Only the blog needs this today, and it is not a translation detail: there is
   * no Japanese or Korean blog on this site, so the legacy JP and KO footers
   * link out to the community Medium publications instead. `localeHref` cannot
   * express that — it maps a path to its localised URL, and the answer here is a
   * different site.
   */
  localeHref?: Partial<Record<Locale, string>>
}

export type FooterColumnSpec = {
  /** Message key under the `footer.columns` namespace. */
  key: string
  links: readonly FooterLinkSpec[]
}

/**
 * The five navigation columns, in the 3.4 design's order.
 *
 * The design draws Company apart from the other four, across a vertical rule
 * and above the social row. That is a layout decision made in `Footer`; here it
 * is simply the last column, so the reading order and the data agree.
 *
 * Links in the design that are NOT here, because nothing exists behind them:
 * AI AGENTS (#158), GOVERNANCE, TEAM and AUDITS. Same rule as the nav — ship
 * the page, then the link — rather than four more `PENDING` entries in the
 * chrome of every page. Each is a one-line addition when its page lands.
 *
 * The legacy footer also carried Tetra, Staking Calculator, DeFi.org,
 * Developers and White Papers. 3.4 dropped them, and that was confirmed as
 * deliberate (#154) rather than lost in a redraw.
 */
export const FOOTER_COLUMNS: readonly FooterColumnSpec[] = [
  {
    key: 'products',
    links: [
      { key: 'sdk', href: '/sdk' },
      { key: 'dspot', href: '/dspot' },
      { key: 'dperps', href: '/dperps' },
      { key: 'agentic', href: '/agentic' },
    ],
  },
  {
    key: 'solutions',
    links: [
      { key: 'venues', href: '/venues' },
      { key: 'institutions', href: '/institutional' },
    ],
  },
  {
    key: 'network',
    links: [
      { key: 'overview', href: '/overview' },
      { key: 'pos', href: '/pos' },
      { key: 'executionServices', href: '/execution-services' },
      { key: 'status', href: 'https://status.orbs.network/' },
    ],
  },
  {
    key: 'community',
    links: [
      {
        key: 'blog',
        href: '/blog',
        localeHref: {
          ja: 'https://orbs-japan-community.medium.com/',
          ko: 'https://orbskorea.medium.com/',
        },
      },
      { key: 'ecosystem', href: '/ecosystem' },
      // `/news` is the legacy URL for press coverage and is labelled "Media".
      // The light variant of the Figma component omits it; the dark one, and
      // every page instance, keeps it.
      { key: 'media', href: '/news' },
      { key: 'notifications', href: '/notifications' },
      { key: 'tonAccess', href: '/ton-access' },
      { key: 'tonVote', href: '/ton-vote' },
      { key: 'brandAssets', href: '/brand-assets' },
    ],
  },
  {
    key: 'company',
    links: [
      { key: 'contact', href: '/contact' },
      { key: 'faq', href: '/faq' },
      { key: 'docs', href: 'https://docs.orbs.network/' },
      { key: 'github', href: 'https://github.com/orbs-network' },
    ],
  },
]

/**
 * The bottom bar's policy links, in legacy order.
 *
 * Separate from the columns because they are a different kind of link — legal
 * boilerplate rather than navigation — and the legacy footer renders them in a
 * different place with different styling (`FooterLink2`, underlined on hover).
 */
export const FOOTER_POLICY_LINKS: readonly FooterLinkSpec[] = [
  { key: 'termsOfUse', href: '/terms-of-use' },
  // 3.4 adds COOKIES here, between terms and privacy, and now there is a page
  // behind it — the design asked for the link before one existed.
  { key: 'cookies', href: '/cookies' },
  { key: 'privacyPolicy', href: '/privacy-policy' },
  /*
    ACCESSIBILITY stays, and 3.4 drops it. Kept deliberately: it is a published
    compliance artefact, and removing one because a Figma frame omitted it is
    not a trade worth making. Sarbloc's call — see #149.
  */
  { key: 'accessibility', href: '/accessibility-declaration' },
]

/**
 * Social accounts, in the 3.4 order (X first; the legacy footer led with GitHub).
 *
 * `icon` names a component rather than an image path: the icons are already
 * typed React components under `src/components/icons/socials/`, and they use
 * `currentColor`, so they follow the footer's text colour into dark mode. The
 * legacy site shipped six fixed grey SVGs that could not.
 */
export type FooterSocialSpec = {
  /** Message key under `footer.socials`, used for the accessible label. */
  key: string
  icon: 'github' | 'x' | 'telegram' | 'discord' | 'youtube' | 'snapshot'
  href: string
}

export const FOOTER_SOCIALS: readonly FooterSocialSpec[] = [
  { key: 'x', icon: 'x', href: 'https://twitter.com/orbs_network' },
  { key: 'github', icon: 'github', href: 'https://github.com/orbs-network/' },
  { key: 'telegram', icon: 'telegram', href: 'https://t.me/OrbsNetwork' },
  { key: 'discord', icon: 'discord', href: 'https://discord.gg/sswGDYGBt5' },
  { key: 'youtube', icon: 'youtube', href: 'https://www.youtube.com/channel/UCfpV4z-MGxeiabFkht1LNPQ/featured' },
  { key: 'snapshot', icon: 'snapshot', href: 'https://snapshot.org/#/orbs-network.eth' },
]

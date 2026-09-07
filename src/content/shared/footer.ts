import type { Locale } from '@/i18n/locales'

/**
 * The footer's link structure, ported from the legacy `content/_shared/footer/`
 * tree (four `navigation/<column>/index.md` files plus one file per link).
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
 * The four navigation columns, in the legacy order.
 *
 * Most of these paths do not exist yet — only `/dtwap`, `/blog` and `/news` are
 * built, so the rest 404 until Phase 3 lands them (#31, #32). That is deliberate
 * and was decided explicitly: the footer ships at full legacy parity rather than
 * hiding links behind a "is it built yet" check, because the alternative is a
 * near-empty footer for the length of Phase 3 and a component API that has to be
 * unpicked afterwards. Nothing is user-visible in the meantime — DNS still
 * points at the legacy site (#39) — and the pre-cutover URL audit (#38) is the
 * gate that catches any that are still dead.
 */
export const FOOTER_COLUMNS: readonly FooterColumnSpec[] = [
  {
    key: 'overview',
    links: [
      { key: 'whatIsOrbs', href: '/overview' },
      { key: 'proofOfStake', href: '/pos' },
      { key: 'executionServices', href: '/execution-services' },
      { key: 'whitePapers', href: '/white-papers' },
      { key: 'faq', href: '/faq' },
    ],
  },
  {
    key: 'poweredBy',
    links: [
      { key: 'liquidityHub', href: '/liquidity-hub' },
      { key: 'perpetualHub', href: '/perpetual-hub' },
      { key: 'dtwap', href: '/dtwap' },
      { key: 'dlimit', href: '/dlimit' },
      { key: 'dsltp', href: '/dsltp' },
      { key: 'notifications', href: '/notifications' },
      { key: 'tonAccess', href: '/ton-access' },
      { key: 'tonVote', href: '/ton-vote' },
    ],
  },
  {
    key: 'resources',
    links: [
      { key: 'tetra', href: 'https://staking.orbs.network/' },
      { key: 'stakingCalculator', href: 'https://www.stakingrewards.com/earn/orbs' },
      // Legacy links this over plain HTTP. The host serves HTTPS (verified), and
      // an insecure link in the chrome of every page is a mixed-content warning
      // waiting to happen, so it is upgraded rather than copied faithfully.
      { key: 'networkStatus', href: 'https://status.orbs.network/' },
      { key: 'defiOrg', href: 'https://defi.org' },
      { key: 'developers', href: 'https://docs.orbs.network/' },
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
      { key: 'media', href: '/news' },
      { key: 'brandAssets', href: '/brand-assets' },
      { key: 'contact', href: '/contact' },
    ],
  },
  // The legacy Community column also carried a Governance link to
  // `/governance-blog`. Omitted on purpose: the governance blog is being deleted
  // in the migration (plan §2.6, #30), so porting the link would mean shipping a
  // pointer to something we are actively removing.
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
  { key: 'privacyPolicy', href: '/privacy-policy' },
  { key: 'accessibility', href: '/accessibility-declaration' },
]

/**
 * Social accounts, in the legacy order.
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
  { key: 'github', icon: 'github', href: 'https://github.com/orbs-network/' },
  { key: 'x', icon: 'x', href: 'https://twitter.com/orbs_network' },
  { key: 'telegram', icon: 'telegram', href: 'https://t.me/OrbsNetwork' },
  { key: 'discord', icon: 'discord', href: 'https://discord.gg/sswGDYGBt5' },
  { key: 'youtube', icon: 'youtube', href: 'https://www.youtube.com/channel/UCfpV4z-MGxeiabFkht1LNPQ/featured' },
  { key: 'snapshot', icon: 'snapshot', href: 'https://snapshot.org/#/orbs-network.eth' },
]

/** The contact address in the logo section. */
export const FOOTER_EMAIL = 'hello@orbs.com'

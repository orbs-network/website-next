/**
 * The header menu's structure, from the dropdown designs.
 *
 * Deliberately NOT the legacy navbar. That menu has three groups — Overview,
 * Resources, Community — carrying ~29 links including several the migration is
 * retiring. The designs replace it with Products / Resources / Developers and a
 * much shorter list per group, so this follows the designs and the legacy menu
 * is not ported wholesale.
 *
 * Same split as `footer.ts`: structure here, labels in the message catalogs
 * under `nav.*`, keyed by the `key` fields. Internal `href`s are
 * locale-independent and carry no trailing slash — the component runs them
 * through `localeHref`, which resolves the locale prefix and adds the slash
 * `trailingSlash: true` requires.
 */
export type NavLinkSpec = {
  /** Message key under `nav.links`. */
  key: string
  /**
   * A locale-independent internal path (leading `/`, no trailing slash), or an
   * absolute external URL. The `startsWith('/')` test decides which, matching
   * `ArchitectureSection` and the footer.
   */
  href: string
  /**
   * Which product glyph precedes the label, if any.
   *
   * Only the Products group has designed icons. Resources and Developers show
   * placeholder squares in the mockups, so their rows ship without one rather
   * than inventing marks — an invented icon is harder to remove later than a
   * missing one is to add.
   */
  icon?: 'liquidityHub' | 'perpetualHub' | 'dlimit' | 'dtwap' | 'dsltp'
}

/**
 * A labelled run of links inside a group.
 *
 * `key` is optional because the designs show both forms: Products has two
 * labelled runs (`[INFRASTRUCTURE]`, `[ADVANCED TRADING TOOLS]`), while
 * Resources and Developers open with an unlabelled run before `[TOOLS]`. A
 * section with no key renders its links with no heading, and the divider
 * between sections carries the grouping on its own.
 */
export type NavSectionSpec = {
  /** Message key under `nav.sections`, or absent for an unlabelled run. */
  key?: string
  links: readonly NavLinkSpec[]
}

export type NavGroupSpec = {
  /** Message key under `nav.groups`. Also the dropdown's accessible name. */
  key: string
  sections: readonly NavSectionSpec[]
}

/**
 * The three dropdowns, in the order the designs show them.
 *
 * Most of these paths do not exist yet — only `/dtwap`, `/dlimit`, `/blog` and
 * `/news` are built, so the rest 404 until Phase 3 lands them (#31, #32). Same
 * deliberate call as the footer in #83: full parity now beats a menu that fills
 * in over months, nothing is user-visible while DNS still points at the legacy
 * site (#39), and #38's pre-cutover URL audit is the gate.
 */
export const NAV_GROUPS: readonly NavGroupSpec[] = [
  {
    key: 'products',
    sections: [
      {
        key: 'infrastructure',
        links: [
          { key: 'liquidityHub', href: '/liquidity-hub', icon: 'liquidityHub' },
          { key: 'perpetualHub', href: '/perpetual-hub', icon: 'perpetualHub' },
        ],
      },
      {
        key: 'advancedTrading',
        links: [
          { key: 'dlimit', href: '/dlimit', icon: 'dlimit' },
          { key: 'dtwap', href: '/dtwap', icon: 'dtwap' },
          { key: 'dsltp', href: '/dsltp', icon: 'dsltp' },
        ],
      },
    ],
  },
  {
    key: 'resources',
    sections: [
      {
        links: [
          { key: 'blog', href: '/blog' },
          { key: 'whitePapers', href: '/white-papers' },
          { key: 'faq', href: '/faq' },
        ],
      },
      {
        key: 'tools',
        links: [
          { key: 'tetraWallet', href: 'https://staking.orbs.network/' },
          { key: 'stakingCalculator', href: 'https://www.stakingrewards.com/earn/orbs' },
        ],
      },
    ],
  },
  {
    key: 'developers',
    sections: [
      {
        links: [
          { key: 'developerDocs', href: 'https://docs.orbs.network/' },
          { key: 'notifications', href: '/notifications' },
          { key: 'tonVote', href: '/ton-vote' },
          { key: 'tonAccess', href: '/ton-access' },
        ],
      },
    ],
  },
]

/**
 * Top-level links that sit beside the dropdowns rather than inside one.
 *
 * `/news` is the legacy URL for press coverage and is labelled "Media" — it
 * must not move.
 */
export const NAV_TOP_LEVEL_LINKS: readonly NavLinkSpec[] = [{ key: 'media', href: '/news' }]

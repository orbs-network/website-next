import { SDK_DOCS_URL } from './sdk'

/**
 * The header menu's structure, from the 3.4 designs (`Main Menu / Product`,
 * `/ Solutions`, `/ Network`, and the header bar on `3.4 Home`, #153).
 *
 * Products / Solutions / Network dropdowns, then plain links. This replaced the
 * Products / Resources / Developers menu; resources that no longer have a place
 * in the header (white papers, FAQ, the TON tools) are still in the footer.
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
   * Which product mark precedes the label, if any.
   *
   * Only the Products panel has designed icons (#210). Solutions and Network
   * repeat one placeholder mark on every row in the mockups, so they ship
   * without, rather than inventing marks — an invented icon is harder to
   * remove later than a missing one is to add.
   */
  icon?: 'sdk' | 'dspot' | 'dperps' | 'agentic'
  /**
   * Links nested under this one. dSPOT is a product AND the family of order
   * types it bundles, so the design lists those beneath it, indented and
   * muted, with no icons of their own.
   */
  children?: readonly NavLinkSpec[]
  /**
   * Shown in the desktop bar only. The mobile menu design drops Docs and
   * GitHub from its top level because the Network list already carries both;
   * the desktop bar repeats them because a dropdown hides them.
   */
  desktopOnly?: true
}

export type NavGroupSpec = {
  /** Message key under `nav.groups`. Also the dropdown's accessible name. */
  key: string
  links: readonly NavLinkSpec[]
}

/**
 * The three dropdowns, in design order.
 *
 * Omitted until it has a destination, rather than linked to a 404: Governance
 * (Network, #213). The link-integrity test fails on a menu link to a route
 * that does not exist.
 *
 * The Network design also opens with "What is Orbs L3", overlapping the next
 * row in the frame; read as a leftover, not a row.
 */
export const NAV_GROUPS: readonly NavGroupSpec[] = [
  {
    key: 'products',
    links: [
      // No SDK page on this site — see `SDK_DOCS_URL`.
      { key: 'sdk', href: SDK_DOCS_URL, icon: 'sdk' },
      {
        key: 'dspot',
        href: '/dspot',
        icon: 'dspot',
        children: [
          { key: 'dtwap', href: '/dtwap' },
          { key: 'dlimit', href: '/dlimit' },
          { key: 'dsltp', href: '/dsltp' },
          { key: 'liquidityHub', href: '/liquidity-hub' },
        ],
      },
      { key: 'dperps', href: '/dperps', icon: 'dperps' },
      { key: 'agentic', href: '/agentic', icon: 'agentic' },
    ],
  },
  {
    key: 'solutions',
    links: [
      { key: 'venues', href: '/venues' },
      { key: 'institutions', href: '/institutional' },
      // No dedicated AI-agents page: the skills index is where an agent
      // builder starts (#212, Sara). #158 proposed a page; this supersedes it.
      { key: 'aiAgents', href: '/ai/skills' },
    ],
  },
  {
    key: 'network',
    links: [
      { key: 'pos', href: '/pos' },
      { key: 'executionServices', href: '/execution-services' },
      { key: 'status', href: 'https://status.orbs.network/' },
      { key: 'github', href: 'https://github.com/orbs-network' },
      { key: 'docs', href: 'https://docs.orbs.network/' },
    ],
  },
]

/** The plain links after the dropdowns, in design order. */
export const NAV_TOP_LEVEL_LINKS: readonly NavLinkSpec[] = [
  { key: 'ecosystem', href: '/ecosystem' },
  { key: 'blog', href: '/blog' },
  { key: 'docs', href: 'https://docs.orbs.network/', desktopOnly: true },
  { key: 'github', href: 'https://github.com/orbs-network', desktopOnly: true },
]

import type { Locale } from '@/i18n/locales'
import { NETWORK_DOCS_URL, SDK_DOCS_URL } from './sdk'

/**
 * English navigation follows Sara's October 15 menu PDFs. Japanese/Korean
 * retain the previous menu until their content refresh. Structure is data;
 * labels live under nav.* in each message catalog. Existing routes do not move.
 */
export type NavLinkSpec = {
  /** Message key under `nav.links`. */
  key: string
  /** English content refresh; other locales follow separately. */
  locales?: readonly Locale[]
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
  icon?: 'sdk' | 'dspot' | 'dperps' | 'agentic' | 'executionServices'
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
export const LEGACY_NAV_GROUPS: readonly NavGroupSpec[] = [
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
      { key: 'executionServices', href: '/execution-services', locales: ['en'] },
      { key: 'agentic', href: '/agentic', icon: 'agentic' },
    ],
  },
  {
    key: 'solutions',
    links: [
      { key: 'venues', href: '/venues' },
      { key: 'institutions', href: '/institutional' },
      // All AI Agents entry points lead directly to Orbs Agentic.
      { key: 'aiAgents', href: '/agentic' },
    ],
  },
  {
    key: 'network',
    links: [
      { key: 'pos', href: '/pos' },
      { key: 'executionServices', href: '/execution-services' },
      // Third, as the design has it (#213).
      { key: 'governance', href: '/governance-blog' },
      { key: 'status', href: 'https://status.orbs.network/' },
      { key: 'securityAndAudits', href: '/security-and-audits', locales: ['en'] },
      { key: 'github', href: 'https://github.com/orbs-network' },
      // The design labels this "Docs". It is the network's docs, and the bar's
      // own "Docs" now opens the SDK's, so two "Docs" would open two sites.
      { key: 'developers', href: NETWORK_DOCS_URL },
    ],
  },
]

/** The plain links after the dropdowns, in design order. */
export const LEGACY_NAV_TOP_LEVEL_LINKS: readonly NavLinkSpec[] = [
  { key: 'ecosystem', href: '/ecosystem' },
  { key: 'blog', href: '/blog' },
  { key: 'docs', href: SDK_DOCS_URL, desktopOnly: true },
  { key: 'github', href: 'https://github.com/orbs-network', desktopOnly: true },
]

/** English menu from Sara's October 15 PDFs; existing routes are retained. */
export const NAV_GROUPS: readonly NavGroupSpec[] = [
  {
    key: 'products',
    links: [
      { key: 'dspot', href: '/dspot', icon: 'dspot' },
      { key: 'dperps', href: '/dperps', icon: 'dperps' },
      { key: 'executionServices', href: '/execution-services', icon: 'executionServices' },
    ],
  },
  {
    key: 'tools',
    links: [
      { key: 'sdk', href: SDK_DOCS_URL },
      { key: 'playground', href: 'https://swap.orbs.network/' },
      { key: 'agentic', href: '/agentic' },
      { key: 'securityAndAudits', href: '/security-and-audits' },
    ],
  },
  {
    key: 'solutions',
    links: [
      { key: 'venues', href: '/venues' },
      { key: 'institutions', href: '/institutional' },
      { key: 'aiAgents', href: '/agentic' },
    ],
  },
  {
    key: 'network',
    links: [
      { key: 'overview', href: '/overview' },
      { key: 'pos', href: '/pos' },
      { key: 'governance', href: '/governance-blog' },
      { key: 'status', href: 'https://status.orbs.network/' },
      { key: 'github', href: 'https://github.com/orbs-network' },
      { key: 'developers', href: NETWORK_DOCS_URL },
    ],
  },
]

export const NAV_TOP_LEVEL_LINKS: readonly NavLinkSpec[] = [
  { key: 'ecosystem', href: '/ecosystem' },
  { key: 'blog', href: '/blog' },
  { key: 'github', href: 'https://github.com/orbs-network', desktopOnly: true },
]

export function navigationForLocale(locale: Locale) {
  return locale === 'en'
    ? { groups: NAV_GROUPS, topLevel: NAV_TOP_LEVEL_LINKS }
    : { groups: LEGACY_NAV_GROUPS, topLevel: LEGACY_NAV_TOP_LEVEL_LINKS }
}

import type { LogoRowItem } from '@/components/marketing/logo-row'

/**
 * Structural data for the Orbs Agentic page. Copy lives under `pages.agentic`.
 *
 * The legacy page is eight sections and shares little with the trading-protocol
 * pages: it pitches an execution layer for AI agents rather than a swap
 * primitive, so its shape is a hero, a problem statement, a tool list, the
 * chains it runs on, a verification flow, an architecture diagram, a
 * track-record note and a getting-started block.
 */

export const AGENTIC_HERO = {
  image: { src: '/marketing/agentic/hero.png', width: 964, height: 468 },
  /** Announcement post — real, and already prerendered from Contentful. */
  announcement: { href: '/Introducing-Orbs-Agentic' },
  getStarted: { href: '/ai/skills/spot-advanced-swap-orders' },
  repo: 'https://github.com/orbs-network/spot',
} as const

/**
 * The three things holding back autonomous DeFi, in legacy order.
 *
 * `reliability` reuses the safety mark: the legacy content points both at
 * `icon-safety.svg`, and there is no third icon in the asset set. Copied as
 * declared rather than dropping icons from the grid or inventing one.
 */
export const AGENTIC_BREAKS = [
  { id: 'safety', icon: '/marketing/agentic/card-safety.svg' },
  { id: 'quality', icon: '/marketing/agentic/card-quality.svg' },
  { id: 'reliability', icon: '/marketing/agentic/card-safety.svg' },
] as const

/** The four execution tools, in legacy order. */
export const AGENTIC_TOOLS = ['autoswap', 'autolimit', 'secureswap', 'twap'] as const

/**
 * Chains the execution layer runs on.
 *
 * Hardcoded in the legacy `Chains` partial rather than in content, and kept in
 * code here for the same reason: chain names are proper nouns that do not
 * translate.
 */
export const AGENTIC_CHAINS: readonly LogoRowItem[] = [
  { name: 'Ethereum', logo: { src: '/marketing/agentic/chains/ethereum.png', width: 250, height: 250 } },
  { name: 'BSC', logo: { src: '/marketing/agentic/chains/bnb.png', width: 1800, height: 1800 } },
  { name: 'Polygon', logo: { src: '/marketing/agentic/chains/polygon.png', width: 250, height: 241 } },
  { name: 'Avalanche', logo: { src: '/marketing/agentic/chains/avalanche.png', width: 250, height: 250 } },
  { name: 'Arbitrum', logo: { src: '/marketing/agentic/chains/arbitrum.jpg', width: 250, height: 250 } },
  { name: 'Base', logo: { src: '/marketing/agentic/chains/base.png', width: 200, height: 200 } },
  { name: 'Linea', logo: { src: '/marketing/agentic/chains/linea.png', width: 250, height: 250 } },
  { name: 'Sonic', logo: { src: '/marketing/agentic/chains/sonic.png', width: 250, height: 250 } },
]

/** The four verification steps. Order is the content — see `NumberedSteps`. */
export const AGENTIC_ORACLE_STEPS = ['decide', 'submit', 'price', 'cosign'] as const

export const AGENTIC_DIAGRAM = {
  src: '/marketing/agentic/diagram.png',
  width: 2680,
  height: 1508,
} as const

/** The three ways in, in legacy order. */
export const AGENTIC_GET_STARTED = [
  { id: 'docs', href: 'https://orbs-network.github.io/spot/' },
  { id: 'api', href: 'https://github.com/orbs-network/spot' },
  { id: 'call', href: '/ai/skills/spot-advanced-swap-orders' },
] as const

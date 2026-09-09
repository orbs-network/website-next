import type { Chain } from '@/components/marketing/chain-logos'

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
export const AGENTIC_CHAINS: readonly Chain[] = [
  { name: 'Ethereum', logo: '/marketing/agentic/chains/ethereum.png' },
  { name: 'BSC', logo: '/marketing/agentic/chains/bnb.png' },
  { name: 'Polygon', logo: '/marketing/agentic/chains/polygon.png' },
  { name: 'Avalanche', logo: '/marketing/agentic/chains/avalanche.png' },
  { name: 'Arbitrum', logo: '/marketing/agentic/chains/arbitrum.jpg' },
  { name: 'Base', logo: '/marketing/agentic/chains/base.png' },
  { name: 'Linea', logo: '/marketing/agentic/chains/linea.png' },
  { name: 'Sonic', logo: '/marketing/agentic/chains/sonic.png' },
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

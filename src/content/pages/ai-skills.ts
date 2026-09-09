import type { ChainRow } from '@/components/marketing/chain-table'
import type { SkillEntry } from '@/components/marketing/skill-list'

/**
 * Structural data for the AI skills section. Copy lives under `pages.aiSkills`
 * and `pages.spotOrders`.
 *
 * `/ai` is NOT a page. #31 lists it as a product page, but the legacy site
 * returns 404 for `/ai/` — what exists is an index at `/ai/skills/` and one
 * skill at `/ai/skills/spot-advanced-swap-orders/`. Both are built here, which
 * also gives the Orbs Agentic page's two primary calls to action a real
 * destination (#104).
 */

export const AI_SKILLS_INDEX_PATH = '/ai/skills'
export const SPOT_ORDERS_PATH = '/ai/skills/spot-advanced-swap-orders'

/**
 * The skills index.
 *
 * One entry today. Kept as a list so the second skill needs catalog entries and
 * a route rather than a layout.
 */
export const AI_SKILLS: readonly SkillEntry[] = [
  {
    id: 'spotOrders',
    name: 'Spot Advanced Swap Orders',
    href: SPOT_ORDERS_PATH,
    chains: ['Ethereum', 'BNB Chain', 'Polygon', 'Arbitrum', 'Base', 'Linea', 'Avalanche', 'Sonic'],
    orderTypes: ['TWAP', 'Limit', 'Take-Profit', 'Stop-Loss'],
  },
]

export const SPOT_ORDERS_LINKS = {
  /** The machine-readable skill spec an agent is pointed at. */
  skillSpec: 'https://orbs-network.github.io/spot/skill/SKILL.md',
  repo: 'https://github.com/orbs-network/spot',
} as const

/** The two ways in: paste a prompt, or point an agent at the spec. */
export const SPOT_ORDERS_QUICKSTART = ['human', 'agent'] as const

/** Order types, in legacy order. */
export const SPOT_ORDERS_FEATURES = ['market', 'limit', 'stopLoss', 'takeProfit', 'twap'] as const

/** The execution flow. Order is the content — see `NumberedSteps`. */
export const SPOT_ORDERS_STEPS = ['intent', 'approve', 'prepare', 'sign', 'execute'] as const

/**
 * Supported chains and their EVM IDs.
 *
 * In code rather than a catalog: chain names are proper nouns and the IDs are
 * numbers, so there is nothing here for a translator to change.
 */
export const SPOT_ORDERS_CHAINS: readonly ChainRow[] = [
  { name: 'Ethereum', id: 1 },
  { name: 'BNB Chain', id: 56 },
  { name: 'Polygon', id: 137 },
  { name: 'Arbitrum', id: 42161 },
  { name: 'Base', id: 8453 },
  { name: 'Linea', id: 59144 },
  { name: 'Avalanche', id: 43114 },
  { name: 'Sonic', id: 146 },
]

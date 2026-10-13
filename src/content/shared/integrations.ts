/** Sara's approved 13 October 2026 handoff. Configuration presence alone is
 * not publication approval; historical and upcoming entries remain separate. */
export type IntegrationLogo = { src: string; width: number; height: number }

export const INTEGRATION_CHAINS = {
  ethereum: { name: 'Ethereum', logo: { src: '/marketing/agentic/chains/ethereum-mono.svg', width: 24, height: 24 } },
  bnb: { name: 'BNB Chain', logo: { src: '/marketing/agentic/chains/bnb-mono.svg', width: 24, height: 24 } },
  polygon: { name: 'Polygon PoS', logo: { src: '/marketing/agentic/chains/polygon-mono.svg', width: 20, height: 18 } },
  base: { name: 'Base', logo: { src: '/marketing/agentic/chains/base-mono.svg', width: 111, height: 111 } },
  arbitrum: {
    name: 'Arbitrum',
    logo: { src: '/marketing/agentic/chains/arbitrum-mono.svg', width: 1080, height: 1218.5 },
  },
  linea: { name: 'Linea', logo: { src: '/marketing/agentic/chains/linea-mono.svg', width: 37, height: 38 } },
  sonic: { name: 'Sonic', logo: { src: '/marketing/agentic/chains/sonic-mono.svg', width: 60, height: 57 } },
  avalanche: {
    name: 'Avalanche',
    logo: { src: '/marketing/agentic/chains/avalanche-mono.svg', width: 257, height: 227 },
  },
  berachain: { name: 'Berachain', logo: { src: '/marketing/ecosystem/chains/berachain.png', width: 192, height: 192 } },
  sei: { name: 'Sei', logo: { src: '/marketing/ecosystem/chains/sei.svg', width: 24, height: 24 } },
  flare: { name: 'Flare', logo: { src: '/marketing/ecosystem/chains/flare.svg', width: 29, height: 30 } },
  katana: { name: 'Katana', logo: { src: '/marketing/ecosystem/chains/katana.svg', width: 27, height: 32 } },
  monad: { name: 'Monad', logo: { src: '/marketing/ecosystem/chains/monad.svg', width: 24, height: 24 } },
} as const
export type IntegrationChainId = keyof typeof INTEGRATION_CHAINS
export type IntegrationPartner = {
  name: string
  logo?: IntegrationLogo
  dspot?: readonly IntegrationChainId[]
  dperps?: readonly IntegrationChainId[]
  stopLossTakeProfit?: readonly IntegrationChainId[]
}

/** Reuse the approved Figma wordmarks' dark-ink variants on white in both themes. */
const venueLogo = (slug: string, width: number, height: number, extension = 'svg'): IntegrationLogo => ({
  src: `/marketing/home/venues/${slug}-on-light.${extension}`,
  width,
  height,
})
export const INTEGRATION_PARTNERS = {
  pancakeswap: {
    name: 'PancakeSwap',
    logo: venueLogo('pancakeswap', 151, 24),
    dspot: ['bnb', 'base', 'linea', 'arbitrum'],
  },
  sushiswap: {
    name: 'SushiSwap',
    logo: venueLogo('sushiswap', 240, 56, 'png'),
    dspot: ['ethereum', 'base', 'arbitrum', 'katana'],
    stopLossTakeProfit: ['ethereum', 'base', 'arbitrum', 'katana'],
  },
  thena: {
    name: 'THENA',
    logo: venueLogo('thena', 129, 30),
    dspot: ['bnb'],
    dperps: ['bnb'],
    stopLossTakeProfit: ['bnb'],
  },
  quickswap: {
    name: 'QuickSwap',
    logo: venueLogo('quickswap', 153, 36),
    dspot: ['polygon', 'base'],
    dperps: ['polygon', 'base'],
  },
  spookyswap: {
    name: 'SpookySwap',
    logo: venueLogo('spookyswap', 167, 40),
    dspot: ['sonic'],
    dperps: ['sonic'],
    stopLossTakeProfit: ['sonic'],
  },
  swapx: { name: 'SwapX', logo: venueLogo('swapx', 128, 30), dspot: ['sonic'] },
  carbon: { name: 'Carbon', dperps: ['base'] },
  trebleswap: { name: 'TrebleSwap', dspot: ['base'], dperps: ['base'] },
  gryps: { name: 'Gryps', dperps: ['sei'] },
  atlantis: { name: 'Atlantis', dperps: ['monad'] },
  lynex: { name: 'Lynex', dspot: ['linea'] },
  ramses: { name: 'Ramses', dspot: ['arbitrum'] },
  kodiak: { name: 'Kodiak', dspot: ['berachain'], stopLossTakeProfit: ['berachain'] },
  dragonswap: { name: 'DragonSwap', dspot: ['sei'] },
  sparkdex: { name: 'SparkDEX', dspot: ['flare'] },
  shadow: { name: 'Shadow', dspot: ['sonic'] },
  blackhole: { name: 'Blackhole', dspot: ['avalanche'] },
  ring: { name: 'Ring', dspot: ['ethereum', 'bnb'] },
} as const satisfies Record<string, IntegrationPartner>
export type IntegrationPartnerId = keyof typeof INTEGRATION_PARTNERS
export function integrationPartner(id: IntegrationPartnerId): IntegrationPartner {
  return INTEGRATION_PARTNERS[id]
}

export const FEATURED_INTEGRATIONS = [
  'pancakeswap',
  'sushiswap',
  'thena',
  'quickswap',
  'spookyswap',
  'swapx',
] as const satisfies readonly IntegrationPartnerId[]
export const PERPS_INTEGRATIONS = [
  'carbon',
  'thena',
  'quickswap',
  'trebleswap',
  'spookyswap',
  'gryps',
  'atlantis',
] as const satisfies readonly IntegrationPartnerId[]
export const SPOT_INTEGRATIONS = [
  'sushiswap',
  'thena',
  'pancakeswap',
  'quickswap',
  'spookyswap',
  'swapx',
  'lynex',
  'ramses',
  'kodiak',
  'dragonswap',
  'sparkdex',
  'trebleswap',
  'shadow',
  'blackhole',
  'ring',
] as const satisfies readonly IntegrationPartnerId[]
export const SLTP_INTEGRATIONS = [
  'thena',
  'spookyswap',
  'kodiak',
  'sushiswap',
] as const satisfies readonly IntegrationPartnerId[]
export const SUSHISWAP_CHAINS = INTEGRATION_PARTNERS.sushiswap.dspot

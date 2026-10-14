import {
  INTEGRATION_CHAINS,
  INTEGRATION_PARTNERS,
  PERPS_INTEGRATIONS,
  SPOT_INTEGRATIONS,
  SLTP_INTEGRATIONS,
  type IntegrationLogo,
  type IntegrationPartnerId,
  type IntegrationChainId,
} from '@/content/shared/integrations'

export type EcosystemFilter = 'all' | 'dperps' | 'dspot' | 'dsltp' | 'solvers' | 'chains'
export type EcosystemCategory = Exclude<EcosystemFilter, 'all'>
export type EcosystemCard = {
  id: string
  name: string
  xUrl: string
  logo: IntegrationLogo & { onDark?: string; invertOnDark?: boolean }
  categories: readonly EcosystemCategory[]
}

/** Publication inventory stays in integrations.ts; this adds presentation and social destinations. */
const PARTNER_BRANDING: Record<IntegrationPartnerId, { logo: EcosystemCard['logo']; xUrl: string }> = {
  pancakeswap: {
    logo: { src: '/marketing/ecosystem/cards/pancakeswap-colour.png', width: 256, height: 256 },
    xUrl: 'https://x.com/pancakeswap',
  },
  sushiswap: {
    logo: { src: '/marketing/ecosystem/cards/sushiswap-colour.png', width: 180, height: 180 },
    xUrl: 'https://x.com/SushiSwap',
  },
  thena: {
    logo: { src: '/marketing/ecosystem/cards/thena-colour.png', width: 180, height: 180 },
    xUrl: 'https://x.com/ThenaFi',
  },
  quickswap: {
    logo: { src: '/marketing/ecosystem/cards/quickswap-colour.png', width: 60, height: 60 },
    xUrl: 'https://x.com/QuickswapDEX',
  },
  spookyswap: {
    logo: { src: '/marketing/ecosystem/cards/spookyswap-colour.svg', width: 31, height: 31 },
    xUrl: 'https://x.com/Spookyswap',
  },
  swapx: {
    logo: { src: '/marketing/ecosystem/cards/swapx-colour.svg', width: 16, height: 16 },
    xUrl: 'https://x.com/SwapXfi',
  },
  carbon: {
    logo: {
      src: '/marketing/home/venues/carbon-on-light.svg',
      onDark: '/marketing/home/venues/carbon.svg',
      width: 149,
      height: 32,
    },
    xUrl: 'https://x.com/IntentX_',
  },
  trebleswap: {
    logo: { src: '/marketing/ecosystem/cards/trebleswap.webp', width: 250, height: 250 },
    xUrl: 'https://x.com/TrebleSwap',
  },
  gryps: {
    logo: { src: '/marketing/ecosystem/cards/gryps.svg', invertOnDark: true, width: 145, height: 37 },
    xUrl: 'https://x.com/gryps_finance',
  },
  atlantis: {
    logo: { src: '/marketing/ecosystem/cards/atlantis.png', width: 192, height: 192 },
    xUrl: 'https://x.com/atlantisdex_xyz',
  },
  lynex: {
    logo: { src: '/marketing/ecosystem/cards/lynex.png', width: 32, height: 32 },
    xUrl: 'https://x.com/LynexFi',
  },
  ramses: {
    logo: { src: '/marketing/ecosystem/cards/ramses.png', width: 167, height: 192 },
    xUrl: 'https://x.com/RamsesExchange',
  },
  kodiak: {
    logo: { src: '/marketing/ecosystem/cards/kodiak.svg', width: 47, height: 30 },
    xUrl: 'https://x.com/KodiakFi',
  },
  dragonswap: {
    logo: { src: '/marketing/ecosystem/cards/dragonswap.png', width: 48, height: 48 },
    xUrl: 'https://x.com/saphyre_xyz',
  },
  sparkdex: {
    logo: { src: '/marketing/ecosystem/cards/sparkdex.svg', width: 28, height: 28 },
    xUrl: 'https://x.com/SparkDexAI',
  },
  shadow: {
    logo: { src: '/marketing/ecosystem/cards/shadow.svg', width: 215, height: 232 },
    xUrl: 'https://x.com/ShadowOnSonic',
  },
  blackhole: {
    logo: { src: '/marketing/ecosystem/cards/blackhole.png', width: 256, height: 256 },
    xUrl: 'https://x.com/BlackHoleDEX',
  },
  ring: {
    logo: { src: '/marketing/ecosystem/cards/ring.png', width: 192, height: 192 },
    xUrl: 'https://x.com/ProtocolRing',
  },
}
const PRODUCT_GROUPS: readonly { category: EcosystemCategory; ids: readonly IntegrationPartnerId[] }[] = [
  { category: 'dperps', ids: PERPS_INTEGRATIONS },
  { category: 'dspot', ids: SPOT_INTEGRATIONS },
  { category: 'dsltp', ids: SLTP_INTEGRATIONS },
]
const PARTNER_CARDS: EcosystemCard[] = [...new Set(PRODUCT_GROUPS.flatMap((group) => group.ids))].map((id) => ({
  id: `partner:${id}`,
  name: INTEGRATION_PARTNERS[id].name,
  ...PARTNER_BRANDING[id],
  categories: PRODUCT_GROUPS.filter((group) => group.ids.includes(id)).map((group) => group.category),
}))

/** Eight solver/liquidity-source names explicitly approved for publication on 14 October 2026. */
const SOLVER_CARDS: EcosystemCard[] = [
  {
    id: 'solver:odos',
    name: 'Odos',
    xUrl: 'https://x.com/odosprotocol',
    logo: {
      src: '/marketing/ecosystem/cards/odos.jpg',
      width: 48,
      height: 48,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:velora',
    name: 'Velora',
    xUrl: 'https://x.com/VeloraDex',
    logo: {
      src: '/marketing/ecosystem/cards/velora.svg',
      width: 64,
      height: 64,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:openocean',
    name: 'OpenOcean',
    xUrl: 'https://x.com/de1_ai',
    logo: {
      src: '/marketing/ecosystem/cards/openocean.svg',
      invertOnDark: true,
      width: 140,
      height: 28,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:kyberswap',
    name: 'KyberSwap',
    xUrl: 'https://x.com/KyberNetwork',
    logo: {
      src: '/marketing/ecosystem/cards/kyberswap.png',
      width: 256,
      height: 256,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:rango',
    name: 'Rango',
    xUrl: 'https://x.com/RangoExchange',
    logo: {
      src: '/marketing/ecosystem/cards/rango.png',
      width: 256,
      height: 256,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:dodo',
    name: 'DODO',
    xUrl: 'https://x.com/DodoResearch',
    logo: {
      src: '/marketing/ecosystem/cards/dodo.png',
      width: 192,
      height: 192,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:lumia',
    name: 'Lumia',
    xUrl: 'https://x.com/BuildOnLumia',
    logo: {
      src: '/marketing/ecosystem/cards/lumia.svg',
      width: 33,
      height: 33,
    },
    categories: ['solvers'],
  },
  {
    id: 'solver:magpie',
    name: 'Magpie',
    xUrl: 'https://x.com/magpieprotocol',
    logo: {
      src: '/marketing/ecosystem/cards/magpie.png',
      width: 256,
      height: 256,
    },
    categories: ['solvers'],
  },
]
const CHAIN_PROFILES: Record<IntegrationChainId, string> = {
  ethereum: 'ethereum',
  bnb: 'BNBChain',
  polygon: '0xPolygon',
  base: 'base',
  arbitrum: 'arbitrum',
  linea: 'LineaBuild',
  sonic: 'SonicLabs',
  avalanche: 'avax',
  berachain: 'berachain',
  sei: 'SeiNetwork',
  flare: 'FlareNetworks',
  katana: 'katana',
  monad: 'monad',
}
/** Original brand colours; inherent monochrome marks retain their theme treatment. */
const CHAIN_LOGOS: Record<IntegrationChainId, EcosystemCard['logo']> = {
  ethereum: { src: '/marketing/ecosystem/cards/ethereum-colour.png', width: 250, height: 250 },
  bnb: { src: '/marketing/ecosystem/cards/bnb-colour.png', width: 256, height: 256 },
  polygon: { src: '/marketing/ecosystem/cards/polygon-colour.png', width: 250, height: 241 },
  base: { src: '/marketing/ecosystem/cards/base-colour.png', width: 200, height: 200 },
  arbitrum: { src: '/marketing/ecosystem/cards/arbitrum-colour.jpg', width: 250, height: 250 },
  linea: { src: '/marketing/ecosystem/cards/linea-colour.png', width: 250, height: 250 },
  avalanche: { src: '/marketing/ecosystem/cards/avalanche-colour.png', width: 250, height: 250 },
  sei: {
    src: '/marketing/ecosystem/cards/sei-colour-on-light.svg',
    onDark: '/marketing/ecosystem/cards/sei-colour.svg',
    width: 178,
    height: 24,
  },
  flare: { src: '/marketing/ecosystem/cards/flare-colour.svg', width: 29, height: 30 },
  katana: {
    src: '/marketing/ecosystem/chains/katana.svg',
    onDark: '/marketing/ecosystem/cards/katana-colour.svg',
    width: 27,
    height: 32,
  },
  sonic: { ...INTEGRATION_CHAINS.sonic.logo, invertOnDark: true },
  berachain: INTEGRATION_CHAINS.berachain.logo,
  monad: INTEGRATION_CHAINS.monad.logo,
}
const CHAIN_CARDS: EcosystemCard[] = (
  Object.entries(INTEGRATION_CHAINS) as [IntegrationChainId, (typeof INTEGRATION_CHAINS)[IntegrationChainId]][]
).map(([id, chain]) => ({
  id: `chain:${id}`,
  ...chain,
  logo: CHAIN_LOGOS[id],
  xUrl: `https://x.com/${CHAIN_PROFILES[id]}`,
  categories: ['chains'],
}))

export const ECOSYSTEM_CARDS: readonly EcosystemCard[] = [...PARTNER_CARDS, ...SOLVER_CARDS, ...CHAIN_CARDS]

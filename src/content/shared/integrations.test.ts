import { describe, expect, it } from 'vitest'
import {
  FEATURED_INTEGRATIONS,
  PERPS_INTEGRATIONS,
  SPOT_INTEGRATIONS,
  SLTP_INTEGRATIONS,
  INTEGRATION_CHAINS,
  INTEGRATION_PARTNERS,
  SUSHISWAP_SLTP_CHAINS,
  integrationPartner,
} from './integrations'

describe('approved integration inventory', () => {
  it('has unique partners and explicit mappings for each published product list', () => {
    for (const [ids, product] of [
      [SPOT_INTEGRATIONS, 'dspot'],
      [PERPS_INTEGRATIONS, 'dperps'],
      [SLTP_INTEGRATIONS, 'stopLossTakeProfit'],
    ] as const) {
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) {
        const chains = integrationPartner(id)[product]!
        expect(chains.length).toBeGreaterThan(0)
        expect(new Set(chains).size).toBe(chains.length)
        for (const chain of chains) expect(INTEGRATION_CHAINS[chain]).toBeDefined()
      }
    }
  })

  it('does not infer stop loss / take profit on every spot integration', () => {
    expect(SLTP_INTEGRATIONS).toHaveLength(4)
    expect(integrationPartner('pancakeswap').stopLossTakeProfit).toBeUndefined()
    for (const id of SLTP_INTEGRATIONS) {
      const partner = integrationPartner(id)
      for (const chain of partner.stopLossTakeProfit!) expect(partner.dspot).toContain(chain)
    }
  })

  it('sources the SushiSwap rollout from its stop loss / take profit chains', () => {
    // These lists currently contain the same chains; identity catches a general-spot source regression.
    expect(SUSHISWAP_SLTP_CHAINS).toBe(INTEGRATION_PARTNERS.sushiswap.stopLossTakeProfit)
  })

  it('keeps historical and upcoming entries out of the production chain lists', () => {
    const names = SPOT_INTEGRATIONS.map((id) => integrationPartner(id).name)
    for (const name of [
      'Omni',
      'Pangolin',
      'Tea-Fi',
      'BaseSwap',
      'ArbiDex',
      'SpiritSwap',
      'Chronos',
      'Fenix Finance',
      'IntentX',
      'SyncSwap',
      'New Era',
      'Ocelex',
    ]) {
      expect(names).not.toContain(name)
    }
    expect(Object.values(INTEGRATION_CHAINS).map((chain) => chain.name)).not.toContain('Fantom')
    expect(integrationPartner('spookyswap').dspot).toEqual(['sonic'])
  })

  it('puts Carbon first and gives every featured partner an approved logo', () => {
    expect(PERPS_INTEGRATIONS[0]).toBe('carbon')
    expect(integrationPartner('carbon').dperps).toEqual(['base'])
    expect(FEATURED_INTEGRATIONS).toHaveLength(6)
    for (const id of FEATURED_INTEGRATIONS) expect(integrationPartner(id).logo).toBeDefined()
    expect(Object.keys(INTEGRATION_CHAINS)).toHaveLength(13)
  })
})

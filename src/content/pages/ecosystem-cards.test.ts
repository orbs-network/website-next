import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import {
  INTEGRATION_CHAINS,
  PERPS_INTEGRATIONS,
  SPOT_INTEGRATIONS,
  SLTP_INTEGRATIONS,
} from '@/content/shared/integrations'
import { ECOSYSTEM_CARDS, type EcosystemCategory } from './ecosystem-cards'

describe('published ecosystem cards', () => {
  it('deduplicates multi-product venues without changing the approved product membership', () => {
    expect(ECOSYSTEM_CARDS).toHaveLength(39)
    expect(new Set(ECOSYSTEM_CARDS.map((card) => card.id)).size).toBe(39)
    for (const [category, ids] of Object.entries({
      dperps: PERPS_INTEGRATIONS,
      dspot: SPOT_INTEGRATIONS,
      dsltp: SLTP_INTEGRATIONS,
    })) {
      const actual = ECOSYSTEM_CARDS.filter((card) => card.categories.includes(category as EcosystemCategory)).map(
        (card) => card.id.replace('partner:', '')
      )
      expect(actual.toSorted()).toEqual([...ids].sort())
    }
    expect(ECOSYSTEM_CARDS.filter((card) => card.categories.includes('dperps'))[0].name).toBe('Carbon')
    expect(ECOSYSTEM_CARDS.filter((card) => card.categories.includes('chains')).map((card) => card.name)).toEqual(
      Object.values(INTEGRATION_CHAINS).map((chain) => chain.name)
    )
    expect(ECOSYSTEM_CARDS.filter((card) => card.categories.includes('solvers')).map((card) => card.name)).toEqual([
      'Odos',
      'Velora',
      'OpenOcean',
      'KyberSwap',
      'Rango',
      'DODO',
      'Lumia',
      'Magpie',
    ])
  })

  it('links directly to project profiles, with the Carbon/IntentX identity kept distinct', () => {
    for (const card of ECOSYSTEM_CARDS) expect(card.xUrl).toMatch(/^https:\/\/x\.com\/[A-Za-z0-9_]+$/)
    expect(ECOSYSTEM_CARDS.find((card) => card.name === 'Carbon')?.xUrl).toBe('https://x.com/IntentX_')
  })

  it('ships real assets with visible ink on white cards', async () => {
    for (const card of ECOSYSTEM_CARDS) {
      const image = sharp(join(process.cwd(), 'public', card.logo.src))
      const meta = await image.metadata()
      expect(meta.width, card.name).toBe(card.logo.width)
      expect(meta.height, card.name).toBe(Math.round(card.logo.height))
      const { data } = await image
        .resize({ width: 96, height: 96, fit: 'inside' })
        .flatten({ background: '#ffffff' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      let ink = 0
      for (let i = 0; i < data.length; i += 3) if (Math.min(data[i], data[i + 1], data[i + 2]) < 200) ink++
      expect(ink, card.name).toBeGreaterThan(20)
    }
  })
  it('keeps recognisable logo pixels above 3:1 contrast on the off-black surface', async () => {
    const luminance = (rgb: number[]) =>
      rgb
        .map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
    const background = [41, 41, 43]
    const bgLuminance = luminance(background)
    for (const card of ECOSYSTEM_CARDS) {
      const logo = card.logo
      expect(Boolean(logo.onDark && logo.invertOnDark), card.name).toBe(false)
      const image = sharp(join(process.cwd(), 'public', logo.onDark ?? logo.src))
      const meta = await image.metadata()
      expect(meta.width, card.name).toBe(logo.width)
      expect(meta.height, card.name).toBe(Math.round(logo.height))
      const { data } = await image
        .resize({ width: 96, height: 96, fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      let visible = 0
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3] / 255
        const rgb = background.map(
          (channel, j) => (logo.invertOnDark ? 255 : data[i + j]) * alpha + channel * (1 - alpha)
        )
        if ((luminance(rgb) + 0.05) / (bgLuminance + 0.05) >= 3) visible++
      }
      expect(visible, card.name).toBeGreaterThan(20)
    }
  })
  it('preserves coloured artwork instead of applying monochrome filters', async () => {
    const expectedColour = [
      'partner:pancakeswap',
      'partner:sushiswap',
      'partner:quickswap',
      'partner:spookyswap',
      'partner:thena',
      'partner:swapx',
      'chain:ethereum',
      'chain:bnb',
      'chain:polygon',
      'chain:base',
      'chain:arbitrum',
      'chain:linea',
      'chain:avalanche',
      'chain:sei',
      'chain:flare',
      'chain:katana',
    ]
    for (const id of expectedColour) {
      const card = ECOSYSTEM_CARDS.find((card) => card.id === id)!
      expect(card.logo.invertOnDark, id).not.toBe(true)
      const { data } = await sharp(join(process.cwd(), 'public', card.logo.onDark ?? card.logo.src))
        .resize({ width: 96, height: 96, fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      let coloured = 0
      for (let i = 0; i < data.length; i += 4) {
        if (
          data[i + 3] >= 128 &&
          Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 40
        )
          coloured++
      }
      expect(coloured, id).toBeGreaterThan(20)
    }
  })
})

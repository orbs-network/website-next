import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import sources from './social-images.json'
import { MARKETING_PAGE_PATHS } from './pages'
import { HERO_GRAPHICS } from './shared/hero-graphics'
import { DSPOT_GRAPHICS } from './pages/dspot'
import { DPERPS_GRAPHICS } from './pages/dperps'
import { TON_ACCESS_IMAGES } from './pages/ton-access'
import { TON_VOTE_IMAGES } from './pages/ton-vote'
import { NOTIFICATION_IMAGES } from './pages/notifications'

describe('shareable hero artwork', () => {
  it('tracks the artwork actually used by page heroes, including the refreshed products', () => {
    const expected = {
      '/dtwap': HERO_GRAPHICS.dtwap.src,
      '/dlimit': HERO_GRAPHICS.dlimit.src,
      '/dsltp': HERO_GRAPHICS.dsltp.src,
      '/dperps': DPERPS_GRAPHICS.hero.src,
      '/dspot': DSPOT_GRAPHICS.hero.src,
      '/liquidity-hub': HERO_GRAPHICS.liquidityHub.src,
      '/agentic': HERO_GRAPHICS.agentic.src,
      '/ai/skills': HERO_GRAPHICS.aiSkills.src,
      '/institutional': HERO_GRAPHICS.institutional.src,
      '/overview': HERO_GRAPHICS.overview.src,
      '/execution-services': HERO_GRAPHICS.executionServices.src,
      '/venues': HERO_GRAPHICS.venues.src,
      '/notifications': NOTIFICATION_IMAGES.hero,
      '/ton-access': TON_ACCESS_IMAGES.hero,
      '/ton-vote': TON_VOTE_IMAGES.hero,
      '/tetra-orbs-staking-wallet-tutorial': '/archives/tetra/bg.jpeg',
    }
    expect(Object.fromEntries(Object.entries(sources).map(([path, image]) => [path, image.source]))).toEqual(expected)
  })

  it.each(Object.entries(sources))('ships a nonblank crawler-compatible PNG for %s', async (path, image) => {
    expect(MARKETING_PAGE_PATHS).toContain(path)
    await readFile(resolve(process.cwd(), `public${image.source}`))
    const buffer = await readFile(resolve(process.cwd(), `public/social${path}.png`))
    expect(buffer.length).toBeLessThan(5_000_000)
    const png = sharp(buffer)
    const metadata = await png.metadata()
    expect([metadata.format, metadata.width, metadata.height]).toEqual(['png', 1200, 630])
    const stats = await png.stats()
    expect(stats.isOpaque).toBe(true)
    expect(stats.channels.some((channel) => channel.stdev > 5)).toBe(true)
  })
})

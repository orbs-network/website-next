import { describe, expect, it, vi } from 'vitest'
import { sitemapEntries } from './sitemap-entries'

vi.mock('./api', () => ({
  getAllPostRefs: async () => [],
  getMediaSummary: async () => ({ total: 0, lastModified: null }),
  POSTS_PER_PAGE: 20,
  MEDIA_PER_PAGE: 20,
}))

describe('marketing sitemap entries', () => {
  it('advertises the consolidated destinations instead of temporarily redirected product and AI Skills pages', async () => {
    const paths = (await sitemapEntries()).map(({ url }) => new URL(url).pathname)
    expect(paths).toEqual(expect.arrayContaining(['/dspot/', '/agentic/', '/ko/agentic/']))
    for (const prefix of ['', '/jp', '/ko']) {
      for (const path of ['/liquidity-hub/', '/dtwap/', '/dlimit/', '/dsltp/', '/ai/skills/']) {
        expect(paths).not.toContain(prefix + path)
      }
    }
  })
  it('lists translated homepage entry points, including the refreshed Korean translation', async () => {
    const entries = await sitemapEntries()
    expect(entries.filter(({ priority }) => priority === 1 || priority === 0.9).map(({ url }) => url)).toEqual(
      expect.arrayContaining(['https://www.orbs.com/', 'https://www.orbs.com/jp/', 'https://www.orbs.com/ko/'])
    )
  })
  it('includes both translated audit pages', async () => {
    const entries = await sitemapEntries()
    const urls = entries
      .filter(({ url }) => url.includes('/security-and-audits/'))
      .map(({ url }) => new URL(url).pathname)
    expect(urls).toEqual(['/security-and-audits/', '/ko/security-and-audits/'])
  })
})

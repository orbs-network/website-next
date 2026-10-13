import { describe, expect, it, vi } from 'vitest'
import { sitemapEntries } from './sitemap-entries'

vi.mock('./api', () => ({
  getAllPostRefs: async () => [],
  getMediaSummary: async () => ({ total: 0, lastModified: null }),
  POSTS_PER_PAGE: 20,
  MEDIA_PER_PAGE: 20,
}))

describe('marketing sitemap entries', () => {
  it('includes the English audit page without advertising unavailable translations', async () => {
    const entries = await sitemapEntries()
    const urls = entries
      .filter(({ url }) => url.includes('/security-and-audits/'))
      .map(({ url }) => new URL(url).pathname)
    expect(urls).toEqual(['/security-and-audits/'])
  })
})

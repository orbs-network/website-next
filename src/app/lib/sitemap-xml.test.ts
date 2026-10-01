import { describe, expect, it } from 'vitest'
import { renderSitemapXml } from './sitemap-xml'

describe('renderSitemapXml', () => {
  it('renders a urlset with each entry and its fields', () => {
    const xml = renderSitemapXml([
      {
        url: 'https://www.orbs.com/',
        lastModified: new Date('2026-09-30T12:00:00Z'),
        changeFrequency: 'weekly',
        priority: 1,
      },
    ])

    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<loc>https://www.orbs.com/</loc>')
    expect(xml).toContain('<lastmod>2026-09-30T12:00:00.000Z</lastmod>')
    expect(xml).toContain('<changefreq>weekly</changefreq>')
    expect(xml).toContain('<priority>1</priority>')
  })

  it('escapes URLs, since post slugs are author-written', () => {
    const xml = renderSitemapXml([{ url: 'https://www.orbs.com/a&b/' }])

    expect(xml).toContain('<loc>https://www.orbs.com/a&amp;b/</loc>')
    expect(xml).not.toContain('a&b')
  })

  it('omits fields an entry does not set rather than printing undefined', () => {
    const xml = renderSitemapXml([{ url: 'https://www.orbs.com/' }])

    expect(xml).not.toMatch(/lastmod|changefreq|priority|undefined/)
  })
})

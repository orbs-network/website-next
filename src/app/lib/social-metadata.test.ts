import { describe, expect, it } from 'vitest'
import { DEFAULT_SOCIAL_IMAGE, marketingSocialImage, socialMetadata, withSocialMetadata } from './social-metadata'

describe('page sharing metadata', () => {
  it('supplies the generic Orbs cover and complete OG/X cards without inventing a layout URL', () => {
    const metadata = socialMetadata({ title: 'Orbs', description: 'Site description' })
    expect(metadata.openGraph).toMatchObject({
      title: 'Orbs',
      siteName: 'Orbs',
      description: 'Site description',
      type: 'website',
      locale: 'en_US',
      images: [{ ...DEFAULT_SOCIAL_IMAGE, url: 'https://www.orbs.com/blog/placeholder.png' }],
    })
    expect(metadata.openGraph).not.toHaveProperty('url')
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', site: '@orbs_network', title: 'Orbs' })
  })

  it('keeps canonical/hreflang and robots intact while giving a Korean page its own metadata', () => {
    const original = {
      title: '제목',
      description: '설명',
      alternates: { canonical: 'https://www.orbs.com/ko/contact/', languages: { en: 'https://www.orbs.com/contact/' } },
      robots: { index: false, follow: true },
    }
    const metadata = withSocialMetadata(original, {
      locale: 'ko',
      image: { url: '/social/dspot.png', width: 1200, height: 630 },
    })
    expect(metadata.alternates).toEqual(original.alternates)
    expect(metadata.robots).toEqual(original.robots)
    expect(metadata.title).toBe(original.title)
    expect(metadata.openGraph).toMatchObject({
      title: '제목 | Orbs',
      description: '설명',
      locale: 'ko_KR',
      url: original.alternates.canonical,
      images: [{ url: 'https://www.orbs.com/social/dspot.png', width: 1200, height: 630, alt: '제목' }],
    })
    expect(metadata.twitter).toMatchObject({
      title: '제목 | Orbs',
      description: '설명',
      images: [{ url: 'https://www.orbs.com/social/dspot.png', alt: '제목' }],
    })
  })

  it('only uses hero artwork where that locale actually displays a hero', () => {
    expect(marketingSocialImage('/execution-services', 'en')?.url).toBe('/social/execution-services.png')
    expect(marketingSocialImage('/execution-services', 'ja')).toBeUndefined()
    expect(marketingSocialImage('/contact', 'en')).toBeUndefined()
  })
})

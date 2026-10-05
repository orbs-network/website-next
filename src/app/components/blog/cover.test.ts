import type { Asset } from 'contentful'
import { describe, expect, it } from 'vitest'
import { getAssetImage } from '@/app/lib/api'
import { COVER_IMAGE, COVER_PLACEHOLDER, coverImage } from './cover'

function asset(file: Record<string, unknown> | undefined): Asset {
  return { sys: { id: 'a', type: 'Asset' }, fields: { file } } as unknown as Asset
}

describe('coverImage', () => {
  it('contains a real cover, so a banner is never cropped', () => {
    expect(coverImage('https://images.ctfassets.net/x/cover.png')).toEqual({
      src: 'https://images.ctfassets.net/x/cover.png',
      fit: COVER_IMAGE,
    })
    expect(COVER_IMAGE).toBe('object-contain')
  })

  it('fills the frame with the placeholder when a post has no cover', () => {
    expect(coverImage(null)).toEqual({ src: COVER_PLACEHOLDER, fit: 'object-cover' })
  })
})

describe('getAssetImage', () => {
  it('returns the URL with the pixel size Contentful reports', () => {
    const a = asset({ url: '//images.ctfassets.net/x/c.png', details: { image: { width: 1280, height: 508 } } })
    expect(getAssetImage(a)).toEqual({ url: 'https://images.ctfassets.net/x/c.png', width: 1280, height: 508 })
  })

  it('is null for an unresolved link, a missing file, or a file with no size', () => {
    expect(getAssetImage(undefined)).toBeNull()
    expect(getAssetImage({ sys: { type: 'Link', linkType: 'Asset', id: 'a' } })).toBeNull()
    expect(getAssetImage(asset(undefined))).toBeNull()
    expect(getAssetImage(asset({ url: '//images.ctfassets.net/x/c.svg', details: {} }))).toBeNull()
  })
})

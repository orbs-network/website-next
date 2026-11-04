import { BLOCKS } from '@contentful/rich-text-types'
import type { Asset } from 'contentful'
import { describe, expect, it } from 'vitest'
import type { BlogPostFields } from './api'
import { postMetadata } from './post-metadata'

function post(overrides: Partial<BlogPostFields> = {}): BlogPostFields {
  return {
    title: 'A real article',
    date: '2026-10-30T10:00:00Z',
    author: { sys: { type: 'Link', linkType: 'Entry', id: 'author' } },
    content: {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [{ nodeType: 'text', value: 'The article introduction.', marks: [], data: {} }],
        },
      ],
    },
    ...overrides,
  }
}

function hero(dimensions = true): Asset<undefined> {
  return {
    fields: {
      title: 'Cover',
      file: {
        url: '//images.ctfassets.net/space/asset/cover.png',
        details: dimensions ? { image: { width: 1600, height: 900 } } : {},
      },
    },
  } as Asset<undefined>
}

describe('article sharing metadata', () => {
  it('uses the Contentful hero and the same canonical path as the article', () => {
    const metadata = postMetadata(
      post({ heroImage: hero(), shortDescription: 'Editorial description' }),
      'news & updates'
    )
    expect(metadata.description).toBe('Editorial description')
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-10-30T10:00:00Z',
      url: 'https://www.orbs.com/news%20%26%20updates/',
      images: [{ url: 'https://images.ctfassets.net/space/asset/cover.png', width: 1600, height: 900 }],
    })
    expect(metadata.twitter).toMatchObject({ images: [{ url: 'https://images.ctfassets.net/space/asset/cover.png' }] })
  })

  it('keeps a hero without dimensions and uses the branded fallback for an unresolved asset', () => {
    expect(postMetadata(post({ heroImage: hero(false) }), 'post').openGraph).toMatchObject({
      images: [{ url: 'https://images.ctfassets.net/space/asset/cover.png' }],
    })
    expect(
      postMetadata(post({ heroImage: { sys: { type: 'Link', linkType: 'Asset', id: 'unpublished' } } }), 'post')
        .openGraph
    ).toMatchObject({ images: [{ url: 'https://www.orbs.com/blog/placeholder.png' }] })
  })

  it('derives an absent description from the article body without replacing an editorial description', () => {
    expect(postMetadata(post(), 'post').description).toBe('The article introduction.')
    const editorial = 'A detailed editorial summary. '.repeat(12)
    expect(postMetadata(post({ shortDescription: editorial }), 'post').description).toBe(editorial.trim())
  })
})

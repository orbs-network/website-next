import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, type AbstractIntlMessages } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import en from '@/i18n/messages/en.json'
import { TETRA_ARCHIVE_MARKDOWN } from '@/content/archive/tetra'
import { MARKETING_PAGE_PATHS } from '@/content/pages'
import { isArchived, localesFor } from '@/i18n/availability'
import { marketingMetadata } from './metadata'
import { TetraArchivePage } from './tetra-archive'

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ namespace }: { namespace: string }) =>
    createTranslator({
      locale: 'en',
      messages: en as AbstractIntlMessages,
      namespace,
      onError: (error) => {
        throw error
      },
    }),
}))

const PATH = '/tetra-orbs-staking-wallet-tutorial'

describe('undated Tetra tutorial archive', () => {
  it('preserves the title, author, tutorial and images without fabricating a date', async () => {
    const html = renderToStaticMarkup(await TetraArchivePage())
    expect(html).toContain(en.pages.tetraArchive.meta.title)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('Archived tutorial.')
    expect(html).toContain('original publication date is unavailable')
    expect(html).toContain('Nate Simantov')
    expect(html).not.toMatch(/<time\b|datePublished|<iframe\b/)
    expect(html).toContain('https://www.youtube.com/watch?v=k-COUXu1cHc')
    expect(html).toContain('Never transfer tokens directly to the staking contract address.')
    expect(html.match(/<img\b/g)).toHaveLength(12)
    expect(html).toContain('href="/pos/"')
    expect(html).not.toContain('href="staking.orbs.network')
  })

  it('ships every tutorial image locally so DNS cutover cannot break the screenshots', () => {
    const images = [...TETRA_ARCHIVE_MARKDOWN.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1])
    expect(new Set(images).size).toBe(12)
    for (const src of images) {
      expect(src).toMatch(/^\/archives\/tetra\//)
      expect(existsSync(join(process.cwd(), 'public', src)), src).toBe(true)
    }
    expect(TETRA_ARCHIVE_MARKDOWN).not.toContain('/assets/img/blog/')
  })

  it('reserves the original English URL with a self canonical and archive robots policy', async () => {
    expect(MARKETING_PAGE_PATHS).toContain(PATH)
    expect(localesFor(PATH)).toEqual(['en'])
    expect(isArchived(PATH)).toBe(true)
    const metadata = await marketingMetadata(PATH, 'en')
    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.alternates?.canonical).toBe('https://www.orbs.com/tetra-orbs-staking-wallet-tutorial/')
  })
})

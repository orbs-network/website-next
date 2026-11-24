import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getEntries = vi.fn()

vi.mock('contentful', () => ({
  createClient: () => ({ getEntries }),
}))

/** The SDK's error for a space blocked on quota: status only inside `message`. */
const blocked = () => Object.assign(new Error('{"status": 402, "statusText": "Payment Required"}'), {})
const unauthorised = () => Object.assign(new Error('Unauthorized'), { status: 401 })

/** `api.ts` reads NEXT_PHASE at import, so each case imports a fresh copy. */
async function importApi(phase?: string) {
  vi.resetModules()
  vi.stubEnv('CONTENTFUL_SPACE_ID', 'space')
  vi.stubEnv('CONTENTFUL_ACCESS_TOKEN', 'token')
  vi.stubEnv('CONTENTFUL_PREVIEW_ACCESS_TOKEN', 'preview-token')
  vi.stubEnv('NEXT_PHASE', phase ?? '')
  return import('./api')
}

beforeEach(() => {
  getEntries.mockReset()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('the committed snapshot', () => {
  it('resolves to the shape a live query returns', async () => {
    const { loadSnapshot } = await import('./contentful-snapshot')
    const { posts, mentions } = loadSnapshot()

    expect(posts.length).toBeGreaterThan(400)
    expect(mentions.length).toBeGreaterThan(300)

    // Links resolved by the SDK's resolver, not left as `{ sys: { type: 'Link' } }`.
    const withAuthor = posts.find((post) => post.fields.author)
    expect(withAuthor?.fields.author).toHaveProperty('fields.name')
    const withCover = posts.find((post) => post.fields.heroImage)
    expect(withCover?.fields.heroImage).toHaveProperty('fields.file.url')
  })

  it('is newest first, as POST_ORDER returns it', async () => {
    const { loadSnapshot } = await import('./contentful-snapshot')
    const dates = loadSnapshot().posts.map((post) => post.fields.date)

    expect(dates).toEqual([...dates].sort().reverse())
  })
})

describe('Contentful unavailable during a build', () => {
  it('answers every query from the snapshot', async () => {
    getEntries.mockRejectedValue(blocked())
    const api = await importApi('phase-production-build')
    const { loadSnapshot } = await import('./contentful-snapshot')
    const { posts, mentions } = loadSnapshot()

    const page = await api.getPosts({ skip: 12, limit: 12 })
    expect(page.total).toBe(posts.length)
    expect(page.items.map((post) => post.slug)).toEqual(posts.slice(12, 24).map((post) => post.fields.slug))

    expect(await api.getRecentPosts(3)).toHaveLength(3)

    const slug = posts[5].fields.slug ?? ''
    expect(slug).not.toBe('')
    expect((await api.getPostBySlug(slug, false))?.slug).toBe(slug)
    expect(await api.getPostBySlug('no-such-post', false)).toBeNull()
    expect((await api.getPostsBySlugs([slug])).map((post) => post.slug)).toEqual([slug])

    expect((await api.getAllPostRefs()).length).toBe(posts.length)

    const media = await api.getMediaMentions({ skip: 0, limit: 12 })
    expect(media.total).toBe(mentions.length)
    expect(media.items).toHaveLength(12)

    const summary = await api.getMediaSummary()
    expect(summary.total).toBe(mentions.length)
    expect(summary.lastModified).toBeInstanceOf(Date)
  })

  it('stops asking Contentful once it has refused', async () => {
    getEntries.mockRejectedValue(blocked())
    const api = await importApi('phase-production-build')

    await api.getPosts()
    await api.getRecentPosts(3)
    await api.getAllPostRefs()

    expect(getEntries).toHaveBeenCalledTimes(1)
  })

  it('still fails the build on a credentials error', async () => {
    getEntries.mockRejectedValue(unauthorised())
    const api = await importApi('phase-production-build')

    await expect(api.getPosts()).rejects.toThrow('Unauthorized')
  })

  it('never serves the snapshot for a draft', async () => {
    getEntries.mockRejectedValue(blocked())
    const api = await importApi('phase-production-build')

    await expect(api.getPostBySlug('anything', true)).rejects.toThrow('402')
  })
})

describe('Contentful unavailable at request time', () => {
  it('throws, so ISR keeps serving the last good render', async () => {
    getEntries.mockRejectedValue(blocked())
    const api = await importApi()

    await expect(api.getPosts()).rejects.toThrow('402')
    await expect(api.getMediaMentions()).rejects.toThrow('402')
  })

  it('serves a post the snapshot has, so unprerendered posts survive a new deployment', async () => {
    getEntries.mockRejectedValue(blocked())
    const api = await importApi()
    const { loadSnapshot } = await import('./contentful-snapshot')
    const oldest = loadSnapshot().posts.at(-1)?.fields.slug ?? ''

    expect((await api.getPostBySlug(oldest, false))?.slug).toBe(oldest)
  })

  it('throws for a post the snapshot lacks, rather than caching a 404', async () => {
    getEntries.mockRejectedValue(blocked())
    const api = await importApi()

    await expect(api.getPostBySlug('published-after-the-snapshot', false)).rejects.toThrow('402')
  })

  it('still throws on a credentials error', async () => {
    getEntries.mockRejectedValue(unauthorised())
    const api = await importApi()
    const { loadSnapshot } = await import('./contentful-snapshot')

    await expect(api.getPostBySlug(loadSnapshot().posts[0].fields.slug ?? '', false)).rejects.toThrow('Unauthorized')
  })
})

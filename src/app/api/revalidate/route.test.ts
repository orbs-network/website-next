import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag: vi.fn() }))

const SECRET = 'test-secret'

function publish(body: unknown): NextRequest {
  return new NextRequest('https://example.com/api/revalidate/', {
    method: 'POST',
    headers: {
      'x-contentful-webhook-secret': SECRET,
      'x-contentful-topic': 'ContentManagement.Entry.publish',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('CONTENTFUL_REVALIDATE_SECRET', SECRET)
    revalidatePath.mockClear()
  })
  afterEach(() => vi.unstubAllEnvs())

  /*
   * With the time-based window at a day, the webhook is what keeps pages
   * current. `/jp/` and `/ko/` render the same recent-posts rail as `/` but are
   * separate routes, so revalidating `/` alone left them a day behind.
   */
  it('refreshes every locale home page when a post is published', async () => {
    const { POST } = await import('./route')

    const response = await POST(
      publish({ sys: { id: 'e1', contentType: { sys: { id: 'blogPost' } } }, fields: { slug: { 'en-US': 'a-post' } } })
    )

    expect(response.status).toBe(200)
    const paths = revalidatePath.mock.calls.map(([path]) => path)
    expect(paths).toEqual(expect.arrayContaining(['/', '/jp/', '/ko/', '/blog/']))
  })
  it('refreshes English and Korean news listings when a media mention is published', async () => {
    const { POST } = await import('./route')
    const response = await POST(publish({ sys: { id: 'news1', contentType: { sys: { id: 'mediaMention' } } } }))
    expect(response.status).toBe(200)
    expect(revalidatePath.mock.calls).toEqual([
      ['/news/'],
      ['/news/page/[n]', 'page'],
      ['/ko/news/'],
      ['/ko/news/page/[n]', 'page'],
    ])
    expect((await response.json()).revalidated).toEqual(['/news/', '/news/page/[n]', '/ko/news/', '/ko/news/page/[n]'])
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { readNetworkStatus } from './read-network-status'

/**
 * The decision this encodes: the indicator is live, and it disappears when the
 * feed cannot be read.
 *
 * A hardcoded green dot is a claim about production that cannot be false, on a
 * page that would keep making it during an outage. Every one of these cases
 * returns `null` — which renders nothing — rather than falling back to "good",
 * because "we could not tell" and "it is fine" are different things and only
 * one of them is honest.
 */

function respond(body: unknown, init: ResponseInit = {}) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200, ...init }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('readNetworkStatus', () => {
  it('reports good when the root check is Green', async () => {
    vi.stubGlobal('fetch', respond({ Statuses: { 'Root Node Health': { Status: 'Green' } } }))

    expect(await readNetworkStatus()).toBe('good')
  })

  it('reports degraded for any other recognised state', async () => {
    vi.stubGlobal('fetch', respond({ Statuses: { 'Root Node Health': { Status: 'Red' } } }))

    expect(await readNetworkStatus()).toBe('degraded')
  })

  it('says nothing when the check is missing', async () => {
    // THE one that matters. A renamed or removed check must not read as
    // healthy — that is how an indicator ends up green through an outage.
    vi.stubGlobal('fetch', respond({ Statuses: { 'Some Other Check': { Status: 'Green' } } }))

    expect(await readNetworkStatus()).toBeNull()
  })

  it('says nothing when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

    expect(await readNetworkStatus()).toBeNull()
  })

  it('says nothing when the body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>down for maintenance</html>')))

    expect(await readNetworkStatus()).toBeNull()
  })

  it('says nothing when the request throws', async () => {
    // Offline, DNS failure, or the 4 second timeout elapsing.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ETIMEDOUT')))

    expect(await readNetworkStatus()).toBeNull()
  })

  it('says nothing when Statuses is absent entirely', async () => {
    vi.stubGlobal('fetch', respond({ TimeSeconds: 1790070217 }))

    expect(await readNetworkStatus()).toBeNull()
  })

  it('asks for the reading to be cached rather than fetched per render', async () => {
    // The footer is on every page. Without a revalidate window this would hit
    // someone else's 500 KB endpoint on every request.
    const fetcher = respond({ Statuses: { 'Root Node Health': { Status: 'Green' } } })
    vi.stubGlobal('fetch', fetcher)

    await readNetworkStatus()

    expect(fetcher.mock.calls[0][1]).toMatchObject({ next: { revalidate: expect.any(Number) } })
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetRateLimit } from '@/lib/rate-limit'

/**
 * The route's job is to never claim a subscription that did not happen.
 *
 * That is not a general principle here, it is the specific bug this replaces:
 * the legacy newsletter posted to a Heroku host that has returned 404 for
 * years, behind a form that said thank you every time. Nobody noticed.
 *
 * The first version of this route reproduced it. It answered 200 on ANY Resend
 * error, reasoning that the realistic case was an address already on the list —
 * which also covered a revoked key, a wrong segment id and an outage.
 */

// Exercise the installed SDK as well as the handler. Stub only the HTTP
// transport so a legacy audience request cannot pass as a segment signup.
const fetchResend = vi.fn()

/** A same-origin JSON POST, which is what the guards expect to see. */
function post(body: unknown) {
  return new Request('https://www.orbs.com/api/subscribe/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
    body: JSON.stringify(body),
  })
}

async function handle(body: unknown) {
  const { POST } = await import('./route')
  return POST(post(body))
}

beforeEach(() => {
  vi.resetModules()
  resetRateLimit()
  fetchResend.mockReset()
  vi.stubGlobal('fetch', fetchResend)
  vi.stubEnv('RESEND_API_KEY', 'test-key')
  vi.stubEnv('RESEND_SEGMENT_ID', '  test-segment  ')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('POST /api/subscribe', () => {
  it('creates a contact in the configured segment through the current API', async () => {
    fetchResend.mockResolvedValue(Response.json({ id: 'c_1', object: 'contact' }))

    const response = await handle({ name: 'Ada Lovelace', email: 'ada@example.com' })

    expect(response.status).toBe(200)
    expect(fetchResend).toHaveBeenCalledTimes(1)
    const [url, options] = fetchResend.mock.calls[0]
    expect(url).toBe('https://api.resend.com/contacts')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({
      segments: [{ id: 'test-segment' }],
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      unsubscribed: false,
    })
  })

  it('does NOT claim success when Resend reports an error', async () => {
    // THE regression. The SDK returns failures as an `error` result rather
    // than throwing, so this branch covers a revoked key, a wrong segment id
    // and an outage — not just a duplicate.
    fetchResend.mockResolvedValue(Response.json({ name: 'validation_error', message: 'nope' }, { status: 422 }))

    expect((await handle({ email: 'ada@example.com' })).status).toBe(502)
  })

  it('does not claim success when the SDK throws', async () => {
    fetchResend.mockRejectedValue(new Error('ECONNRESET'))

    expect((await handle({ email: 'ada@example.com' })).status).toBe(502)
  })

  it('fails loudly when the segment is not configured, even if a legacy audience is set', async () => {
    // Unset, rather than wrong. A form that looks like it works while every
    // address is dropped is the state being replaced.
    vi.stubEnv('RESEND_SEGMENT_ID', '   ')
    vi.stubEnv('RESEND_AUDIENCE_ID', 'legacy-audience')

    expect((await handle({ email: 'ada@example.com' })).status).toBe(500)
    expect(fetchResend).not.toHaveBeenCalled()
  })

  it('does not contact Resend when the API key is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect((await handle({ email: 'ada@example.com' })).status).toBe(500)
    expect(fetchResend).not.toHaveBeenCalled()
  })

  it('refuses a cross-origin request before doing anything else', async () => {
    const { POST } = await import('./route')
    const response = await POST(
      new Request('https://www.orbs.com/api/subscribe/', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
        body: JSON.stringify({ email: 'ada@example.com' }),
      })
    )

    expect(response.status).toBe(403)
    expect(fetchResend).not.toHaveBeenCalled()
  })

  it('drops a filled honeypot without telling the caller', async () => {
    // 200 so a bot learns nothing, and no contact created.
    const response = await handle({ email: 'ada@example.com', company: 'Acme' })

    expect(response.status).toBe(200)
    expect(fetchResend).not.toHaveBeenCalled()
  })

  it('accepts an invalid address without creating anything', async () => {
    // The browser already validated, so a real subscriber never gets here.
    // Answering 200 keeps the endpoint from confirming which addresses parse.
    const response = await handle({ email: 'not-an-email' })

    expect(response.status).toBe(200)
    expect(fetchResend).not.toHaveBeenCalled()
  })

  it('stops after the rate limit and creates nothing more', async () => {
    fetchResend.mockImplementation(() => Promise.resolve(Response.json({ id: 'c_1', object: 'contact' })))

    for (let i = 0; i < 5; i += 1) await handle({ email: `a${i}@example.com` })
    const blocked = await handle({ email: 'six@example.com' })

    expect(blocked.status).toBe(200)
    expect(fetchResend).toHaveBeenCalledTimes(5)
  })
})

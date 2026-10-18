import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONTACT_TYPES } from '@/lib/contact-message'

const transport = vi.fn()
const enquiry = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '',
  message: 'Please help with an integration.',
  locale: 'en',
}

async function handle(body: unknown) {
  const { POST } = await import('./route')
  return POST(
    new Request('https://www.orbs.com/api/contact/', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify(body),
    })
  )
}

beforeEach(() => {
  vi.resetModules()
  transport.mockReset()
  transport.mockResolvedValue(Response.json({ id: 'test-email' }))
  // Exercise the installed SDK but intercept its HTTP transport: no emails.
  vi.stubGlobal('fetch', transport)
  vi.stubEnv('RESEND_API_KEY', 'test-key')
  vi.stubEnv('CONTACT_FROM_EMAIL', 'website@example.com')
  vi.stubEnv('CONTACT_TO_EMAIL', 'hello@orbs.com')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('contact enquiry category', () => {
  it.each(CONTACT_TYPES)('includes the selected %s category in the Resend email', async (contactType) => {
    expect((await handle({ ...enquiry, contactType })).status).toBe(200)
    expect(transport).toHaveBeenCalledTimes(1)
    const [url, options] = transport.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    const email = JSON.parse(options.body)
    expect(email.to).toEqual(['hello@orbs.com'])
    expect(email.reply_to).toBe('ada@example.com')
    expect(email.text).toContain(`Type:    ${contactType}`)
    expect(email.text).toContain(enquiry.message)
  })

  it('still forwards a general enquiry without a category', async () => {
    expect((await handle(enquiry)).status).toBe(200)
    expect(transport).toHaveBeenCalledTimes(1)
    expect(JSON.parse(transport.mock.calls[0][1].body).text).not.toContain('Type:')
  })

  it('does not send an email for an unrecognized category', async () => {
    await handle({ ...enquiry, contactType: 'venue\nInjected' })
    expect(transport).not.toHaveBeenCalled()
  })
})

import { describe, expect, it } from 'vitest'
import { isSameOrigin } from './same-origin'

const HOST = 'www.orbs.com'

function headers(values: Record<string, string>): Headers {
  return new Headers({ host: HOST, ...values })
}

describe('isSameOrigin', () => {
  it('accepts a request from one of our own pages', () => {
    expect(isSameOrigin(headers({ 'sec-fetch-site': 'same-origin', origin: `https://${HOST}` }))).toBe(true)
  })

  /**
   * The attack. A hostile page makes its visitors POST here from their own
   * browsers; each brings a fresh address, so the rate limit does not see a
   * flood. Refusing it is the only thing that stops the sends.
   */
  it('refuses a request driven by another site', () => {
    expect(isSameOrigin(headers({ 'sec-fetch-site': 'cross-site', origin: 'https://evil.example' }))).toBe(false)
  })

  it('refuses a subdomain, which same-site would have allowed', () => {
    expect(isSameOrigin(headers({ 'sec-fetch-site': 'same-site', origin: 'https://docs.orbs.com' }))).toBe(false)
  })

  it('refuses a direct navigation', () => {
    expect(isSameOrigin(headers({ 'sec-fetch-site': 'none' }))).toBe(false)
  })

  /**
   * `Sec-Fetch-Site` wins wherever both are present. It is set by the browser
   * and unreachable from script, while `Origin` on its own is only as good as
   * the client being honest.
   */
  it('trusts Sec-Fetch-Site over a matching Origin', () => {
    expect(isSameOrigin(headers({ 'sec-fetch-site': 'cross-site', origin: `https://${HOST}` }))).toBe(false)
  })

  describe('without Sec-Fetch-Site', () => {
    it('accepts an Origin matching the request host', () => {
      expect(isSameOrigin(headers({ origin: `https://${HOST}` }))).toBe(true)
    })

    it('refuses an Origin that does not', () => {
      expect(isSameOrigin(headers({ origin: 'https://evil.example' }))).toBe(false)
      expect(isSameOrigin(headers({ origin: 'https://www.orbs.com.evil.example' }))).toBe(false)
    })

    it('refuses the literal null a sandboxed iframe sends', () => {
      expect(isSameOrigin(headers({ origin: 'null' }))).toBe(false)
    })

    /**
     * Vercel puts the public hostname here and the internal one in `Host`, so
     * comparing against `Host` alone would 403 every preview deployment.
     */
    it('prefers x-forwarded-host, so preview URLs still work', () => {
      const preview = 'website-next-abc123.vercel.app'

      expect(
        isSameOrigin(
          new Headers({ host: 'internal.vercel', 'x-forwarded-host': preview, origin: `https://${preview}` })
        )
      ).toBe(true)
    })

    it('matches on host, so the port has to agree too', () => {
      expect(isSameOrigin(new Headers({ host: 'localhost:3000', origin: 'http://localhost:3000' }))).toBe(true)
      expect(isSameOrigin(new Headers({ host: 'localhost:3000', origin: 'http://localhost:4000' }))).toBe(false)
    })
  })

  /**
   * Neither header means it did not come from a browser, so it is not the
   * attack this guards against — a script can set any header it likes, and
   * refusing here would only stop honest non-browser callers. The rate limit is
   * what covers those.
   */
  it('allows a non-browser caller that sends neither header', () => {
    expect(isSameOrigin(new Headers({ host: HOST }))).toBe(true)
  })
})

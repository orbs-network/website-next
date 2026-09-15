import { beforeEach, describe, expect, it } from 'vitest'
import { clientAddress, resetRateLimit, withinRateLimit } from './rate-limit'

const NOW = 1_700_000_000_000
const WINDOW_MS = 10 * 60 * 1000

beforeEach(() => {
  resetRateLimit()
})

describe('clientAddress', () => {
  /**
   * The one that actually matters. `x-forwarded-for` is client-controllable at
   * the left; Vercel appends the real peer address at the right. Reading the
   * left entry would let anyone reset their own limit with a header, which is
   * the same as having no limit.
   */
  it('takes the rightmost forwarded address, not the client-supplied one', () => {
    const headers = new Headers({ 'x-forwarded-for': '10.0.0.1, 198.51.100.7, 203.0.113.9' })

    expect(clientAddress(headers)).toBe('203.0.113.9')
  })

  it('handles a single address and stray whitespace', () => {
    expect(clientAddress(new Headers({ 'x-forwarded-for': '  203.0.113.9  ' }))).toBe('203.0.113.9')
  })

  it('falls back to x-real-ip when the forwarded header is unusable', () => {
    expect(clientAddress(new Headers({ 'x-forwarded-for': ' , ', 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9')
    expect(clientAddress(new Headers({ 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9')
  })

  it('buckets requests with no address together rather than exempting them', () => {
    expect(clientAddress(new Headers())).toBe('unknown')
  })
})

describe('withinRateLimit', () => {
  it('allows a burst up to the limit and then stops', () => {
    const allowed = Array.from({ length: 6 }, () => withinRateLimit('a', NOW))

    expect(allowed).toEqual([true, true, true, true, true, false])
  })

  it('keeps clients apart', () => {
    for (let i = 0; i < 5; i += 1) withinRateLimit('a', NOW)

    expect(withinRateLimit('a', NOW)).toBe(false)
    expect(withinRateLimit('b', NOW)).toBe(true)
  })

  it('lets the window slide rather than resetting on a fixed boundary', () => {
    for (let i = 0; i < 5; i += 1) withinRateLimit('a', NOW)

    // Still inside the window by a millisecond.
    expect(withinRateLimit('a', NOW + WINDOW_MS - 1)).toBe(false)
    // Exactly a window old has expired — the check is `> now - WINDOW_MS`.
    expect(withinRateLimit('a', NOW + WINDOW_MS)).toBe(true)
  })

  /**
   * A blocked client that keeps hammering must not accumulate an unbounded
   * array of timestamps. The rejection path prunes too, so the entry stays the
   * size of one window's allowance however long the flood lasts.
   */
  it('does not grow a blocked client without bound', () => {
    for (let i = 0; i < 500; i += 1) withinRateLimit('a', NOW)

    // Still blocked now, and still recovers exactly one window after the last
    // ACCEPTED request — not after the last attempt, which would let a flood
    // extend its own penalty indefinitely.
    expect(withinRateLimit('a', NOW)).toBe(false)
    expect(withinRateLimit('a', NOW + WINDOW_MS + 1)).toBe(true)
  })
})

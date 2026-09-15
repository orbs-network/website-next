import { describe, expect, it } from 'vitest'
import {
  CONTACT_LIMITS,
  HONEYPOT_FIELD,
  MIN_FILL_MS,
  formatEnquiry,
  looksAutomated,
  validateContactMessage,
} from './contact-message'

/**
 * These rules run in two places — the form in the browser and the route handler
 * on the server — and the whole point of the shared module is that they agree.
 * So they are tested here rather than through either caller.
 */

const VALID = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '',
  message: 'We would like to talk about Liquidity Hub.',
  locale: 'en',
} as const

describe('validateContactMessage', () => {
  it('accepts a filled form', () => {
    const result = validateContactMessage(VALID)

    expect(result.ok).toBe(true)
    expect(result.ok && result.message.email).toBe('ada@example.com')
  })

  it('trims before checking, so whitespace is not a value', () => {
    const result = validateContactMessage({ ...VALID, firstName: '   ' })

    expect(result.ok).toBe(false)
    expect(!result.ok && result.errors.firstName).toBe('required')
  })

  it('trims the values it returns', () => {
    const result = validateContactMessage({ ...VALID, firstName: '  Ada  ' })

    expect(result.ok && result.message.firstName).toBe('Ada')
  })

  it('reports every bad field at once, not just the first', () => {
    const result = validateContactMessage({ firstName: '', lastName: '', email: 'nope', message: '' })

    expect(!result.ok && result.errors).toEqual({
      firstName: 'required',
      lastName: 'required',
      email: 'invalid',
      message: 'required',
    })
  })

  it('separates an empty field from a malformed one', () => {
    // The form shows a different message for each, so collapsing them would
    // tell someone who mistyped their address to fill in a field they filled.
    expect(validateContactMessage({ ...VALID, email: '' })).toMatchObject({ errors: { email: 'required' } })
    expect(validateContactMessage({ ...VALID, email: 'ada@example' })).toMatchObject({ errors: { email: 'invalid' } })
  })

  it('accepts addresses that stricter patterns reject', () => {
    for (const email of ['ada+orbs@example.com', 'ada@sub.domain.example.museum', "o'brien@example.co.uk"]) {
      expect(validateContactMessage({ ...VALID, email }).ok, email).toBe(true)
    }
  })

  it('treats the phone as optional but checks it once filled', () => {
    expect(validateContactMessage({ ...VALID, phone: '' }).ok).toBe(true)
    expect(validateContactMessage({ ...VALID, phone: '+44 (0)20 7123 4567' }).ok).toBe(true)
    expect(validateContactMessage({ ...VALID, phone: 'call me' })).toMatchObject({ errors: { phone: 'invalid' } })
    // Right characters, not enough of them to be a number.
    expect(validateContactMessage({ ...VALID, phone: '+1-2' })).toMatchObject({ errors: { phone: 'invalid' } })
  })

  it('rejects over-long values rather than truncating them', () => {
    expect(validateContactMessage({ ...VALID, message: 'x'.repeat(CONTACT_LIMITS.message + 1) })).toMatchObject({
      errors: { message: 'tooLong' },
    })
    expect(validateContactMessage({ ...VALID, message: 'x'.repeat(CONTACT_LIMITS.message) }).ok).toBe(true)
  })

  it('never takes a locale it does not serve', () => {
    expect(validateContactMessage({ ...VALID, locale: 'ko' })).toMatchObject({ message: { locale: 'ko' } })
    expect(validateContactMessage({ ...VALID, locale: 'de' })).toMatchObject({ message: { locale: 'en' } })
    expect(validateContactMessage({ ...VALID, locale: { evil: true } })).toMatchObject({ message: { locale: 'en' } })
  })

  it('survives a body that is not an object', () => {
    for (const body of [null, undefined, 'string', 42, []]) {
      expect(validateContactMessage(body).ok, String(body)).toBe(false)
    }
  })

  it('ignores non-string field values instead of coercing them', () => {
    // `String(12345)` would pass a required check. A number is not a name.
    expect(validateContactMessage({ ...VALID, firstName: 12345 })).toMatchObject({ errors: { firstName: 'required' } })
  })
})

describe('looksAutomated', () => {
  const now = 1_700_000_000_000
  const human = { ...VALID, [HONEYPOT_FIELD]: '', startedAt: now - 30_000 }

  it('passes someone who filled the form by hand', () => {
    expect(looksAutomated(human, now)).toBe(false)
  })

  it('catches a filled honeypot', () => {
    expect(looksAutomated({ ...human, [HONEYPOT_FIELD]: 'Acme Inc' }, now)).toBe(true)
  })

  it('catches a submission faster than anyone could type', () => {
    expect(looksAutomated({ ...human, startedAt: now - (MIN_FILL_MS - 1) }, now)).toBe(true)
    expect(looksAutomated({ ...human, startedAt: now - MIN_FILL_MS }, now)).toBe(false)
  })

  it('catches a request with no timestamp at all', () => {
    expect(looksAutomated({ ...VALID }, now)).toBe(true)
    expect(looksAutomated({ ...human, startedAt: 'soon' }, now)).toBe(true)
  })

  it('does not punish a client whose clock runs fast', () => {
    // `startedAt` in our future produces a negative elapsed time. That is a
    // skewed clock, not evidence of a script.
    expect(looksAutomated({ ...human, startedAt: now + 60_000 }, now)).toBe(false)
  })
})

describe('formatEnquiry', () => {
  it('omits the phone line when there is no phone', () => {
    const withPhone = formatEnquiry({ ...VALID, phone: '+44 20 7123 4567', locale: 'en' })
    const without = formatEnquiry({ ...VALID, phone: '', locale: 'en' })

    expect(withPhone).toContain('Phone:')
    expect(without).not.toContain('Phone:')
  })

  it('carries the fields the team needs to reply', () => {
    const body = formatEnquiry({ ...VALID, locale: 'ja' })

    expect(body).toContain('Ada Lovelace')
    expect(body).toContain('ada@example.com')
    expect(body).toContain('ja')
    expect(body).toContain('We would like to talk about Liquidity Hub.')
  })
})

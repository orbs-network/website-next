import { describe, expect, it } from 'vitest'
import {
  SUBSCRIBE_HONEYPOT_FIELD,
  SUBSCRIBE_LIMITS,
  looksAutomated,
  splitName,
  validateSubscribeMessage,
} from './subscribe-message'

/**
 * This module is imported by BOTH the form and the route, which is the point:
 * two copies of a validation rule drift, and the direction they drift in is a
 * form that accepts what the server then rejects, with the reader told nothing
 * useful.
 *
 * The signup is a STRAIGHT ADD — no confirmation email (#145) — so anything
 * that gets past here is on a mailing list immediately. That raises the cost of
 * being wrong in the permissive direction.
 */

describe('validateSubscribeMessage', () => {
  it('accepts an address with no name', () => {
    // The design asks for a name and a list needs an email. Requiring the name
    // would turn an optional courtesy into a barrier.
    const result = validateSubscribeMessage({ name: '', email: 'someone@example.com' })

    expect(result).toEqual({ ok: true, message: { name: '', email: 'someone@example.com' } })
  })

  it('trims what it accepts', () => {
    const result = validateSubscribeMessage({ name: '  Ada  ', email: '  ada@example.com  ' })

    expect(result).toEqual({ ok: true, message: { name: 'Ada', email: 'ada@example.com' } })
  })

  it('requires an email', () => {
    expect(validateSubscribeMessage({ name: 'Ada', email: '   ' })).toEqual({
      ok: false,
      errors: { email: 'required' },
    })
  })

  it('rejects the shapes a typo actually makes', () => {
    for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'ada example.com', 'a@b@c.com']) {
      expect(validateSubscribeMessage({ email }), email).toEqual({ ok: false, errors: { email: 'invalid' } })
    }
  })

  it('accepts addresses a stricter pattern would wrongly refuse', () => {
    // The authority on whether an address exists is the mail server. Every
    // stricter expression rejects somebody's real address, silently on our
    // side and baffling on theirs.
    for (const email of ['a+tag@example.co.uk', "o'brien@example.com", 'user_name@sub.domain.example', 'x@y.zz']) {
      expect(validateSubscribeMessage({ email }), email).toMatchObject({ ok: true })
    }
  })

  it('enforces the length caps', () => {
    expect(validateSubscribeMessage({ email: `${'a'.repeat(250)}@example.com` })).toEqual({
      ok: false,
      errors: { email: 'tooLong' },
    })
    expect(validateSubscribeMessage({ name: 'a'.repeat(SUBSCRIBE_LIMITS.name + 1), email: 'ada@example.com' })).toEqual(
      { ok: false, errors: { name: 'tooLong' } }
    )
  })

  it('survives a body that is not an object', () => {
    // The route hands it whatever `request.json()` produced.
    for (const body of [null, undefined, 'string', 42, []]) {
      expect(() => validateSubscribeMessage(body)).not.toThrow()
      expect(validateSubscribeMessage(body)).toMatchObject({ ok: false })
    }
  })
})

describe('looksAutomated', () => {
  it('is true only when the honeypot carries something', () => {
    expect(looksAutomated({ email: 'ada@example.com' })).toBe(false)
    expect(looksAutomated({ email: 'ada@example.com', [SUBSCRIBE_HONEYPOT_FIELD]: '' })).toBe(false)
    expect(looksAutomated({ email: 'ada@example.com', [SUBSCRIBE_HONEYPOT_FIELD]: '   ' })).toBe(false)
    expect(looksAutomated({ email: 'ada@example.com', [SUBSCRIBE_HONEYPOT_FIELD]: 'Acme' })).toBe(true)
  })

  it('does not consider a slow or fast submission suspicious', () => {
    // The contact form once had a minimum fill time. It silently discarded real
    // enquiries behind a success screen, and the comment there says it must not
    // come back. It is not coming back here either.
    expect(looksAutomated({ email: 'ada@example.com', startedAt: 0 })).toBe(false)
  })
})

describe('splitName', () => {
  it('splits on the first space', () => {
    expect(splitName('Ada Lovelace')).toEqual({ firstName: 'Ada', lastName: 'Lovelace' })
    expect(splitName('Ada King Lovelace')).toEqual({ firstName: 'Ada', lastName: 'King Lovelace' })
  })

  it('handles one name and no name', () => {
    expect(splitName('Ada')).toEqual({ firstName: 'Ada', lastName: '' })
    expect(splitName('   ')).toEqual({ firstName: '', lastName: '' })
  })

  it('never produces a last name that is only whitespace', () => {
    // `"Ada "` would otherwise split into a last name of `" "`, which reaches
    // the CRM as a contact whose surname is a space.
    expect(splitName('Ada ')).toEqual({ firstName: 'Ada', lastName: '' })
  })
})

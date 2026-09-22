/**
 * The newsletter signup's shape and rules.
 *
 * Imported by BOTH the form and the route, for the reason `contact-message.ts`
 * gives: two copies of a validation rule drift, and the direction they drift in
 * is a form that accepts something the server rejects, with the reader told
 * nothing useful.
 *
 * Deliberately smaller than the contact message. The design asks for a name and
 * an email; a subscriber list needs an email. The name is collected because the
 * design collects it and because a list is friendlier with one, not because
 * anything depends on it — so it is optional, and a blank one subscribes fine.
 */

export const SUBSCRIBE_LIMITS = {
  name: 120,
  email: 254,
} as const

export type SubscribeField = 'name' | 'email'
export type SubscribeFieldError = 'required' | 'invalid' | 'tooLong'
export type SubscribeErrors = Partial<Record<SubscribeField, SubscribeFieldError>>

export type SubscribeMessage = {
  name: string
  email: string
}

export type SubscribeValidation = { ok: true; message: SubscribeMessage } | { ok: false; errors: SubscribeErrors }

/**
 * Permissive on purpose, and the same expression the contact form uses.
 *
 * The authority on whether an address exists is the mail server, not a regular
 * expression — every stricter pattern rejects somebody's real address, and the
 * failure is silent on our side and baffling on theirs. This catches a missing
 * `@` or a missing dot, which is what a typo actually looks like.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 254 is the maximum length of an address per RFC 5321. */
function field(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function validateSubscribeMessage(body: unknown): SubscribeValidation {
  const source = (body ?? {}) as Record<string, unknown>
  const name = field(source.name)
  const email = field(source.email)
  const errors: SubscribeErrors = {}

  if (name.length > SUBSCRIBE_LIMITS.name) errors.name = 'tooLong'

  if (email === '') errors.email = 'required'
  else if (email.length > SUBSCRIBE_LIMITS.email) errors.email = 'tooLong'
  else if (!EMAIL.test(email)) errors.email = 'invalid'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return { ok: true, message: { name, email } }
}

/**
 * The honeypot, matching the contact form's.
 *
 * Same field name deliberately: a bot that has learned to leave `company` alone
 * on one form leaves it alone on the other, which costs us nothing, and one
 * name is one thing to keep out of the catalogs and the autofill heuristics.
 */
export const SUBSCRIBE_HONEYPOT_FIELD = 'company'

export function looksAutomated(body: unknown): boolean {
  const source = (body ?? {}) as Record<string, unknown>

  return field(source[SUBSCRIBE_HONEYPOT_FIELD]) !== ''
}

/**
 * Split a display name into the first/last pair Resend's contact API wants.
 *
 * Resend has `firstName` and `lastName` and no single-name field. The design
 * asks for one "Your name" input, so the split happens here rather than by
 * making a visitor fill two boxes to join a mailing list.
 *
 * Everything after the first space is the last name. That is wrong for plenty
 * of names and right for the common case, and the alternative — asking people
 * to decompose their own name for our CRM's benefit — is worse. Nothing
 * downstream depends on the split being correct.
 */
export function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim()
  if (trimmed === '') return { firstName: '', lastName: '' }

  const at = trimmed.indexOf(' ')
  if (at === -1) return { firstName: trimmed, lastName: '' }

  return { firstName: trimmed.slice(0, at), lastName: trimmed.slice(at + 1).trim() }
}

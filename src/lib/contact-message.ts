import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/locales'

/**
 * Validation for the contact form.
 *
 * Shared by `/api/contact` and the form component on purpose. A form that
 * disagrees with its handler about what counts as valid produces the worst
 * possible failure mode — the browser says the address is fine, the server
 * silently discards it, and the reader is told their message was sent. One
 * module means the two cannot drift.
 *
 * Hand-rolled rather than reaching for a schema library. Five fields with
 * obvious rules do not justify a runtime dependency on the one code path in
 * this app that accepts input from the public internet, and this way the rules
 * also ship to the browser without dragging a validator bundle with them.
 */

/**
 * Length caps, so a submission cannot be used to post a novel through the form.
 *
 * Also set as `maxLength` on the inputs, which is what makes `tooLong`
 * unreachable from the UI — it only fires for a request that did not come from
 * our form, and those get no explanatory message.
 */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254, // RFC 5321 maximum for a forward path
  phone: 40,
  message: 5000,
} as const

export type ContactField = 'firstName' | 'lastName' | 'email' | 'phone' | 'message'

/** Why a field was rejected. Maps to a catalog string in the form. */
export type ContactFieldError = 'required' | 'invalid' | 'tooLong'

export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>

export type ContactMessage = {
  firstName: string
  lastName: string
  email: string
  /** Optional on the legacy form, and kept optional. */
  phone: string
  message: string
  /** Which locale the form was submitted from, so the team can reply in kind. */
  locale: Locale
}

export type ContactValidation = { ok: true; message: ContactMessage } | { ok: false; errors: ContactErrors }

/**
 * Deliberately permissive: one `@`, something either side, a dot in the domain,
 * no whitespace.
 *
 * Stricter patterns reject valid addresses — plus-addressing, new TLDs, quoted
 * local parts — and the only thing that actually proves an address works is
 * sending to it. This filters typos and obvious junk; it is not an oracle.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Phone numbers are checked for shape, not for validity.
 *
 * Only the characters people actually type, and at least six digits so a single
 * stray character is caught. No country-code or length rules: numbering plans
 * differ per country, the field is optional, and rejecting a real number that
 * someone chose to give us is a worse outcome than accepting a malformed one we
 * were never going to dial automatically.
 */
const PHONE_SHAPE = /^[0-9+().\-\s/]+$/

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function checkRequired(value: string, limit: number): ContactFieldError | undefined {
  if (value === '') return 'required'
  if (value.length > limit) return 'tooLong'
  return undefined
}

export function validateContactMessage(body: unknown): ContactValidation {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, errors: { message: 'required' } }
  }

  const raw = body as Record<string, unknown>

  const firstName = text(raw.firstName)
  const lastName = text(raw.lastName)
  const email = text(raw.email)
  const phone = text(raw.phone)
  const message = text(raw.message)

  const errors: ContactErrors = {}

  const firstNameError = checkRequired(firstName, CONTACT_LIMITS.name)
  if (firstNameError) errors.firstName = firstNameError

  const lastNameError = checkRequired(lastName, CONTACT_LIMITS.name)
  if (lastNameError) errors.lastName = lastNameError

  const emailError = checkRequired(email, CONTACT_LIMITS.email)
  if (emailError) errors.email = emailError
  else if (!EMAIL.test(email)) errors.email = 'invalid'

  // Optional, so an empty value is not an error — but a filled one still has to
  // look like a phone number.
  if (phone !== '') {
    if (phone.length > CONTACT_LIMITS.phone) errors.phone = 'tooLong'
    else if (!PHONE_SHAPE.test(phone) || (phone.match(/\d/g)?.length ?? 0) < 6) errors.phone = 'invalid'
  }

  const messageError = checkRequired(message, CONTACT_LIMITS.message)
  if (messageError) errors.message = messageError

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    message: {
      firstName,
      lastName,
      email,
      phone,
      // Never trusted from the client beyond being one of the three we serve.
      locale: typeof raw.locale === 'string' && isLocale(raw.locale) ? raw.locale : DEFAULT_LOCALE,
      message,
    },
  }
}

/** The name of the honeypot input. Hidden in the form; bots fill it. */
export const HONEYPOT_FIELD = 'company'

/** How fast a submission has to arrive to be treated as scripted. */
export const MIN_FILL_MS = 3000

/**
 * Whether a submission looks automated.
 *
 * Two cheap signals, neither of which asks anything of a real person:
 *
 *  - A honeypot field, hidden from view and left empty by anyone who cannot see
 *    it. Bots fill every input they find.
 *  - Time to submit. Someone reading five labels and typing a message does not
 *    finish in under three seconds; a script does it instantly.
 *
 * Both are trivially defeated by an attacker who looks at the page once, and
 * that is understood. They cost nothing, add no third-party script and no
 * dependency, and stop the indiscriminate traffic that is almost all form spam.
 * The control against a determined abuser is the rate limit — see `route.ts`.
 */
export function looksAutomated(body: unknown, now: number): boolean {
  if (typeof body !== 'object' || body === null) return true

  const raw = body as Record<string, unknown>

  if (text(raw[HONEYPOT_FIELD]) !== '') return true

  const startedAt = Number(raw.startedAt)
  if (!Number.isFinite(startedAt)) return true

  const elapsed = now - startedAt

  // Negative means a clock the client controls disagrees with ours, which is
  // not evidence of a bot — accept it rather than punish a skewed clock.
  return elapsed >= 0 && elapsed < MIN_FILL_MS
}

/** The forwarded enquiry, as plain text. */
export function formatEnquiry(message: ContactMessage): string {
  return [
    `Name:    ${message.firstName} ${message.lastName}`,
    `Email:   ${message.email}`,
    message.phone ? `Phone:   ${message.phone}` : null,
    `Locale:  ${message.locale}`,
    '',
    message.message,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

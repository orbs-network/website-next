import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { formatEnquiry, looksAutomated, validateContactMessage } from '@/lib/contact-message'
import { clientAddress, withinRateLimit } from './rate-limit'

/**
 * Forwards a contact enquiry to the team.
 *
 * Replaces the legacy flow, which was EmailJS in the browser — publishable keys
 * in the bundle — plus a Heroku service at `orbs-website-mailer.herokuapp.com`
 * for the newsletter. That host now returns 404, so anything routed through it
 * has been silently failing in production.
 *
 * Nothing is sent to the person who submitted. Enquiries go to the team and the
 * team replies; there is no autoresponder and no list. That is the operator's
 * instruction, and it also keeps this endpoint unable to deliver mail to an
 * address of the caller's choosing — worth having on an unauthenticated route,
 * because it means an abuser can waste our send quota but cannot use us to mail
 * a victim.
 */

/** Runs on Node rather than the edge — the Resend SDK expects it. */
export const runtime = 'nodejs'

/**
 * Never prerendered. Without this Next would try to evaluate the route at build
 * time, and the API key is not present in every build environment.
 */
export const dynamic = 'force-dynamic'

/**
 * Where enquiries land. Settled with the operator: forwarded to the team, who
 * handle the reply themselves.
 */
const TO = process.env.CONTACT_TO_EMAIL ?? 'hello@orbs.com'

/**
 * The sending identity. Required, with no fallback, and that is the point.
 *
 * The obvious default is Resend's sandbox sender, `onboarding@resend.dev`. It
 * does not work here, and the way it fails is the dangerous kind — it sends
 * fine in a local test and 403s in production. Measured against the live API:
 *
 *   from onboarding@resend.dev to delivered@resend.dev  -> 200, id returned
 *   from onboarding@resend.dev to hello@orbs.com        -> 403 "You can only
 *     send testing emails to your own email address (sukh@orbs.com)"
 *
 * So a sandbox default would turn every real enquiry into a 502 while every
 * smoke test passed. Better to have no sender than a sender that only works
 * when you are testing.
 *
 * Set this once `orbs.com` is verified at https://resend.com/domains — it is
 * not today, and sending from it returns `403 The orbs.com domain is not
 * verified`. See #35.
 */
const FROM = process.env.CONTACT_FROM_EMAIL

/**
 * A plain 200 whatever the reason.
 *
 * A form that answers "that address is invalid" or "you are being rate limited"
 * is a form that answers questions for whoever is probing it, and the browser
 * has already run the same validation, so a real submitter never sees this
 * path. The reader gets one outcome; the detail goes to the server log.
 */
function accepted() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const now = Date.now()
  const address = clientAddress(request.headers)

  // Before the body is read, not after. A flood of malformed requests never
  // gets as far as sending mail, but it does still cost an invocation each, and
  // a limiter that can be skipped by sending garbage is one an abuser will send
  // garbage to skip.
  if (!withinRateLimit(address, now)) {
    console.warn(`[contact] rate limited ${address}`)
    return accepted()
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (looksAutomated(body)) {
    console.info('[contact] discarded a submission that filled the honeypot')
    return accepted()
  }

  const result = validateContactMessage(body)

  if (!result.ok) {
    console.info(`[contact] rejected: ${JSON.stringify(result.errors)}`)
    return accepted()
  }

  const apiKey = process.env.RESEND_API_KEY

  // Loud, and a failure the browser surfaces. The alternative is a form that
  // looks like it works while every enquiry is dropped — exactly the state the
  // legacy form has been in since its backend went away.
  if (!apiKey || !FROM) {
    console.error(
      `[contact] misconfigured (${!apiKey ? 'RESEND_API_KEY' : 'CONTACT_FROM_EMAIL'} is not set) — the enquiry was NOT delivered`
    )
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const { message } = result

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      to: [TO],
      // So replying in the team's mail client goes to the person who wrote in
      // rather than to the sending identity.
      replyTo: message.email,
      subject: `Website enquiry from ${message.firstName} ${message.lastName}`,
      text: formatEnquiry(message),
    })

    if (error) {
      console.error(`[contact] Resend rejected the send: ${error.name} — ${error.message}`)
      return NextResponse.json({ ok: false }, { status: 502 })
    }
  } catch (cause) {
    console.error('[contact] send failed', cause)
    return NextResponse.json({ ok: false }, { status: 502 })
  }

  return accepted()
}

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { clientAddress, withinRateLimit } from '@/lib/rate-limit'
import { isSameOrigin } from '@/lib/same-origin'
import { looksAutomated, splitName, validateSubscribeMessage } from '@/lib/subscribe-message'

/**
 * Adds someone to the newsletter audience.
 *
 * Straight add, no confirmation email — the team's decision (#145). So a
 * submission here puts an address on a list immediately, which is precisely why
 * the guards below are not optional: an unauthenticated endpoint that writes to
 * a mailing list is worth abusing, and every address added by a bot is one the
 * team has to notice and remove.
 *
 * Nothing is SENT from here. The audience is written to and that is all, which
 * keeps this endpoint unable to deliver mail to an address of the caller's
 * choosing — the same property the contact route has, and worth preserving for
 * the same reason.
 *
 * The legacy newsletter posted to `orbs-website-mailer.herokuapp.com`, which
 * has returned 404 for long enough that nobody noticed. Every signup on the
 * live site today is silently discarded.
 */

/** Blank environment variables are not values. `??` does not catch `''`. */
function setting(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * The Resend audience that receives subscribers.
 *
 * Required, with no fallback, for the reason `CONTACT_FROM_EMAIL` has none: a
 * default that happens to work in one environment and silently writes to the
 * wrong list in another is worse than a loud failure. An audience ID is not
 * guessable and not shared, so there is no sensible default to pick.
 */
const AUDIENCE_ID = setting(process.env.RESEND_AUDIENCE_ID)

/**
 * A plain 200 whatever the reason.
 *
 * Same reasoning as the contact route: a form that answers "that address is
 * invalid" or "you are rate limited" answers questions for whoever is probing
 * it, and the browser has already run the same validation, so a real subscriber
 * never reaches this path. The detail goes to the log.
 *
 * It also means this endpoint will not tell a caller whether an address is
 * ALREADY on the list, which would otherwise make it a membership oracle for
 * any address someone cared to try.
 */
function accepted() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  // Before the rate limit, so a cross-site attack driving other people's
  // browsers at this endpoint cannot burn through THEIR allowances.
  if (!isSameOrigin(request.headers)) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return NextResponse.json({ ok: false }, { status: 415 })
  }

  const address = clientAddress(request.headers)
  const limit = withinRateLimit('subscribe', address, Date.now())

  if (!limit.allowed) {
    if (limit.firstBlock) console.warn(`[subscribe] rate limited ${address}`)
    return accepted()
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (looksAutomated(body)) {
    console.info('[subscribe] honeypot filled — dropped')
    return accepted()
  }

  const result = validateSubscribeMessage(body)

  if (!result.ok) {
    console.info(`[subscribe] rejected: ${JSON.stringify(result.errors)}`)
    return accepted()
  }

  const apiKey = setting(process.env.RESEND_API_KEY)

  // Loud, and a failure the browser surfaces. A signup form that looks like it
  // works while every address is dropped is the exact state the legacy one has
  // been in for years.
  if (!apiKey || !AUDIENCE_ID) {
    console.error(
      `[subscribe] misconfigured (${!apiKey ? 'RESEND_API_KEY' : 'RESEND_AUDIENCE_ID'} is not set) — "${result.message.email}" was NOT subscribed`
    )
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const { firstName, lastName } = splitName(result.message.name)

  try {
    const { error } = await new Resend(apiKey).contacts.create({
      audienceId: AUDIENCE_ID,
      email: result.message.email,
      firstName,
      lastName,
      // Straight add means subscribed from the moment they press the button.
      unsubscribed: false,
    })

    if (error) {
      /*
        An address already on the list is NOT an error for the reader — they
        asked to be subscribed and they are subscribed. Resend reports it as a
        failure, so it is logged and answered with the same success the first
        signup gets, rather than showing someone an error for doing nothing
        wrong.
      */
      console.error(`[subscribe] Resend rejected the contact: ${error.name} — ${error.message}`)
      return accepted()
    }
  } catch (cause) {
    console.error(`[subscribe] Resend threw: ${cause instanceof Error ? cause.message : String(cause)}`)
    return NextResponse.json({ ok: false }, { status: 502 })
  }

  return accepted()
}

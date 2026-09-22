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
 * It does NOT hide list membership, and an earlier version of this comment
 * claimed it did. If Resend reports an existing contact as an error then a
 * duplicate answers 502 where a new address answers 200, which is a membership
 * oracle for anyone willing to try addresses one at a time.
 *
 * That is a real cost and it is the lesser one. The alternative — answering
 * success on every error — tells people they subscribed when they did not, and
 * covers a revoked key or an outage just as happily. Worth revisiting if
 * Resend turns out to upsert, in which case the question never arises.
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
        EVERY error is a failure the reader is told about, and the first version
        of this did the opposite.

        It answered success on any error, reasoning that the realistic case is
        an address already on the list — someone who asked to be subscribed and
        is subscribed, who should not see an error for doing nothing wrong.

        That was a guess about a signal I had not identified. Resend's error
        names are `application_error`, `internal_server_error`,
        `invalid_access`, `missing_api_key`, `not_found`, `rate_limit_exceeded`,
        `restricted_api_key`, `security_error` and `validation_error` — there is
        no duplicate code among them, and the SDK reports network failures the
        same way rather than throwing. So "probably a duplicate" also covered a
        revoked key, a wrong audience id and an outage, and each of those would
        have shown a subscriber "you are on the list" while nothing happened.

        Which is precisely the legacy newsletter's failure: a success screen
        over a dropped submission, unnoticed for years. Telling a returning
        subscriber to try again costs far less than telling a new one they
        succeeded when they did not.
      */
      console.error(`[subscribe] Resend rejected the contact: ${error.name} — ${error.message}`)
      return NextResponse.json({ ok: false }, { status: 502 })
    }
  } catch (cause) {
    console.error(`[subscribe] Resend threw: ${cause instanceof Error ? cause.message : String(cause)}`)
    return NextResponse.json({ ok: false }, { status: 502 })
  }

  return accepted()
}

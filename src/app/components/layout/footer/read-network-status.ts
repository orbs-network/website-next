/**
 * Reading the network's health, on the server.
 *
 * Separate from the indicator component because that one is `'use client'`, and
 * a client module is a boundary rather than a place to keep server code: the
 * route handler importing this would be reaching across it for a function that
 * is only ever meant to run on the server, holding a 4 second timeout and a 500
 * KB response.
 */

export type NetworkStatus = 'good' | 'degraded'

/** The network's own status page, which is also what the footer links to. */
const STATUS_URL = 'https://status.orbs.network/json'

/**
 * How long a reading is reused.
 *
 * Long enough that a crawl or a traffic spike does not hammer someone else's
 * service, short enough that a real outage surfaces within a few minutes. The
 * page is otherwise static, so this is the only thing making it revalidate.
 */
const REVALIDATE_SECONDS = 300

/** How long to wait before giving up and rendering nothing. */
const TIMEOUT_MS = 4000

/**
 * The shape we depend on, which is a fraction of what the feed returns.
 *
 * `Statuses` is a map of named checks to `{ Status: "Green" | ... }`. Narrowed
 * to what is read rather than typed in full: the rest of that document is
 * validator and committee detail that will change without warning, and a type
 * describing it would be a promise we cannot keep.
 */
type StatusFeed = {
  Statuses?: Record<string, { Status?: string } | undefined>
}

/**
 * Read the network's status, or `null` when it cannot be established.
 *
 * `null` covers every failure the same way — timeout, non-200, malformed body,
 * a renamed check — because the caller's response to all of them is identical:
 * say nothing. Distinguishing them would only invite rendering a guess.
 */
export async function readNetworkStatus(): Promise<NetworkStatus | null> {
  try {
    const response = await fetch(STATUS_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) return null

    const feed: StatusFeed = await response.json()
    const root = feed.Statuses?.['Root Node Health']?.Status

    // An unrecognised value is NOT "good". A renamed check or a new state
    // would otherwise be reported as healthy, which is the failure this
    // component exists to avoid.
    if (root === undefined) return null
    if (root === 'Green') return 'good'

    return 'degraded'
  } catch {
    // Timed out, offline, or the service returned something that is not JSON.
    return null
  }
}

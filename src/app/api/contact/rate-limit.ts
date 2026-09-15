/**
 * A per-instance sliding-window rate limit for the contact endpoint.
 *
 * Be clear about what this is and is not. It is in-memory, so it is per running
 * function instance: Fluid Compute reuses an instance across concurrent
 * requests, which is what makes it bite at all, but a burst spread over several
 * instances gets a fresh allowance in each. It is therefore a floor, not a
 * ceiling — it turns "one script can send unlimited mail" into "one script gets
 * a handful per instance", and nothing stronger.
 *
 * The ceiling belongs at the edge, where it can see every request: a Vercel
 * Firewall rate-limit rule on `/api/contact`. That is a dashboard setting
 * rather than a file in this repo, which is exactly why this exists too — a
 * control that lives only in someone else's console is a control that silently
 * disappears when the project is recreated. See the PR for #35.
 *
 * Deliberately NOT Upstash or any other shared store. Adding a database, a
 * second set of credentials and a network round trip to the request path is a
 * real cost, and it buys a correct limit on an endpoint whose worst case is a
 * wasted send quota on an address we control. If the Firewall rule proves
 * insufficient, that is the point to reach for one.
 */

/** Requests allowed per client, per window. */
const LIMIT = 5

/** The window, in milliseconds. */
const WINDOW_MS = 10 * 60 * 1000

/**
 * How many clients to track before evicting.
 *
 * Without a cap this map is a memory leak with a public write API: every
 * distinct source address adds an entry that outlives the request. The bound is
 * generous enough that a real burst of genuine traffic is still limited, and an
 * attacker who rotates addresses fast enough to evict themselves has defeated
 * an IP-keyed limit anyway — that is the Firewall's job, not this one's.
 */
const MAX_TRACKED = 10_000

type Client = {
  /** Accepted request times inside the current window. */
  hits: number[]
  /**
   * Whether this client's block has already been logged.
   *
   * Without it, a client that keeps posting after being blocked writes one log
   * record per request forever — an attacker can therefore turn a limit they
   * cannot get past into an unbounded log bill and enough noise to bury the
   * signal that would have shown someone else's problem. Cleared when the
   * window clears, so a client that comes back tomorrow is reported again.
   */
  warned: boolean
}

const clients = new Map<string, Client>()

/**
 * The client address, from the proxy headers Vercel sets.
 *
 * `x-forwarded-for` is a list, and the LEFTMOST entry is the one the client
 * sent — which the client controls. On Vercel the platform appends the real
 * peer address as the RIGHTMOST entry, so that is the one to read. Taking the
 * left one would let a caller reset their own limit with a header.
 */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')

  if (forwarded) {
    const addresses = forwarded
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== '')

    const last = addresses.at(-1)
    if (last) return last
  }

  // Set by Vercel and not forwarded from the client. Falls back to a single
  // shared bucket, which throttles everyone rather than no one — the safe
  // direction for a form nobody has to use.
  return headers.get('x-real-ip') ?? 'unknown'
}

export type RateLimitResult = {
  allowed: boolean
  /**
   * True only on the request that first crosses the limit for this client.
   *
   * The caller logs on this rather than on `!allowed`, so a sustained flood
   * produces one line per client per window instead of one per request.
   */
  firstBlock: boolean
}

/** Whether this client may send now. Records the attempt when it may. */
export function withinRateLimit(address: string, now: number): RateLimitResult {
  const since = now - WINDOW_MS
  const existing = clients.get(address)
  const hits = (existing?.hits ?? []).filter((at) => at > since)

  if (hits.length >= LIMIT) {
    const firstBlock = existing?.warned !== true
    // Rewritten even on rejection, so the pruning above is not skipped for a
    // client that keeps hitting the limit and its array cannot grow.
    clients.set(address, { hits, warned: true })
    return { allowed: false, firstBlock }
  }

  hits.push(now)
  clients.set(address, { hits, warned: false })

  if (clients.size > MAX_TRACKED) {
    evictStale(since)
  }

  return { allowed: true, firstBlock: false }
}

/**
 * Drops clients with no activity in the current window, then — if that was not
 * enough — the oldest entries by insertion order, which is what `Map` preserves.
 */
function evictStale(since: number): void {
  for (const [address, client] of clients) {
    if (client.hits.every((at) => at <= since)) {
      clients.delete(address)
    }
  }

  for (const address of clients.keys()) {
    if (clients.size <= MAX_TRACKED) break
    clients.delete(address)
  }
}

/** Test seam. Not called by the route. */
export function resetRateLimit(): void {
  clients.clear()
}

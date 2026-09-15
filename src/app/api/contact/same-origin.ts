/**
 * Whether a request came from this site's own pages.
 *
 * The attack this closes: a hostile page can make every one of ITS visitors
 * POST to this endpoint from their own browser. A cross-site `fetch` with a
 * safelisted content type — `text/plain` — is a simple request, so there is no
 * preflight to fail, and `Request.json()` parses the body regardless of what
 * the content type claims. CORS then stops the attacker READING our response,
 * which they do not need: the mail has already been sent.
 *
 * That also walks straight past the rate limit, because the limit is keyed on
 * the client address and every visitor brings a fresh one. A few thousand
 * visitors is a few thousand allowances, which is a cheap way to drain the
 * Resend quota and the function budget without controlling a single IP.
 *
 * Two headers, checked in order of how much they can be trusted:
 *
 *  - `Sec-Fetch-Site`, which the browser sets and script cannot. Present in
 *    every current browser. If it says anything but `same-origin`, the request
 *    did not come from a page of ours.
 *  - `Origin`, for anything older. A POST always carries it, including a
 *    same-origin one, so its absence here means the request did not come from a
 *    browser at all.
 *
 * Compared against the request's own `Host` rather than a configured domain, so
 * this keeps working on every Vercel preview URL. Hardcoding `orbs.com` would
 * turn each preview deployment's contact form into a 403 and the bug would be
 * found by whoever tested a preview, if anyone did.
 */
export function isSameOrigin(headers: Headers): boolean {
  const site = headers.get('sec-fetch-site')

  if (site !== null) {
    // `same-origin` only. `same-site` would admit any subdomain, and `none`
    // means a direct navigation, which cannot be this endpoint.
    return site === 'same-origin'
  }

  const origin = headers.get('origin')

  // No `Sec-Fetch-Site` and no `Origin` is not a browser, so it is not the
  // attack this guards against. The rate limit covers scripted callers.
  if (origin === null) return true

  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (host === null) return false

  try {
    return new URL(origin).host === host
  } catch {
    // An `Origin` that is not a URL — including the literal `null` that a
    // sandboxed iframe sends, which is exactly the case worth refusing.
    return false
  }
}

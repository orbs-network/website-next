import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { getPostById } from '@/app/lib/api'
import { postRedirectPath } from '@/app/lib/routes'
import { isValidSlug, secretMatches } from '@/app/lib/secrets'

/**
 * Draft-mode entry point for Contentful's "Open preview" button.
 *
 * Set the preview URL on the blogPost content type to:
 *
 *   https://<host>/api/preview/?secret=<CONTENTFUL_PREVIEW_SECRET>&id={entry.sys.id}
 *
 * Keyed on the entry ID, not the slug. An entry ID is opaque and ASCII, so it
 * survives a query string untouched. A slug does not: two live legacy slugs
 * contain a literal `&`, which truncates the parameter —
 * `slug=Orbs-Farming-&-Single-Stake…` parses as `slug=Orbs-Farming-` — and two
 * more contain U+200A hair spaces that need encoding. Keying on the ID sidesteps
 * both without relying on Contentful to encode its template substitution.
 *
 * Note the trailing slash before the query string. `trailingSlash: true` in
 * next.config.mjs applies to route handlers, so the slashless form returns a
 * 308 — which needlessly copies the secret into a Location header that proxies
 * and access logs will record along the way.
 *
 * Enabling draft mode sets a signed bypass cookie, which makes the target page
 * render on demand against the Preview API instead of serving the cached
 * published version.
 */

export async function GET(request: NextRequest) {
  const expected = process.env.CONTENTFUL_PREVIEW_SECRET
  if (!expected) {
    console.error('[preview] CONTENTFUL_PREVIEW_SECRET is not set; refusing all requests')
    return NextResponse.json({ message: 'Preview is not configured' }, { status: 500 })
  }

  // Contentful's "Open preview" is a top-level navigation, so Sec-Fetch-Dest is
  // `document`. Anything else — `image`, `script`, `empty` — means the URL was
  // embedded in a third-party page, which would silently plant the site-wide
  // draft cookie in a visitor's browser and expose unpublished content to them.
  //
  // Fails OPEN when the header is absent so that clients which don't send it
  // (older browsers, curl, server-side checks) still work. This narrows the
  // window rather than closing it; the secret remains the real control.
  const fetchDest = request.headers.get('sec-fetch-dest')
  if (fetchDest && fetchDest !== 'document') {
    console.warn(`[preview] rejected non-navigation request (sec-fetch-dest: ${fetchDest})`)
    return NextResponse.json({ message: 'Preview must be opened as a navigation' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl

  if (!secretMatches(searchParams.get('secret'), expected)) {
    console.warn('[preview] rejected request with missing or invalid secret')
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ message: 'Missing id' }, { status: 400 })
  }

  // Resolve against Contentful before enabling draft mode, so a stale link 404s
  // here rather than redirecting into a broken page with a draft cookie set.
  const post = await getPostById(id, true)
  if (!post) {
    return NextResponse.json({ message: `No entry found for id "${id}"` }, { status: 404 })
  }

  const slug = post.slug
  if (!slug) {
    return NextResponse.json({ message: `Entry "${id}" has no slug` }, { status: 400 })
  }

  // The slug now comes from Contentful rather than the caller, but it is still
  // untrusted — the field has no validation in the content model, and a value
  // like `//attacker.tld` would build `///attacker.tld`, which browsers resolve
  // as a protocol-relative external URL.
  if (!isValidSlug(slug)) {
    console.warn(`[preview] entry ${id} has an unroutable slug: ${JSON.stringify(slug).slice(0, 120)}`)
    return NextResponse.json({ message: 'Entry has a malformed slug' }, { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(postRedirectPath(slug))
}

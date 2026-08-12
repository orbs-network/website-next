import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/app/lib/api'
import { postRedirectPath } from '@/app/lib/routes'
import { isValidSlug, secretMatches } from '@/app/lib/secrets'

/**
 * Draft-mode entry point for Contentful's "Open preview" button.
 *
 * Set the preview URL on the blogPost content type to:
 *
 *   https://<host>/api/preview/?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}
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
  const slug = searchParams.get('slug')

  if (!secretMatches(searchParams.get('secret'), expected)) {
    console.warn('[preview] rejected request with missing or invalid secret')
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  if (!slug) {
    return NextResponse.json({ message: 'Missing slug' }, { status: 400 })
  }

  // Validate the shape before it reaches redirect(). Existence in Contentful is
  // NOT sufficient protection against an open redirect: the slug field has no
  // validation in the content model, so an entry slugged `//attacker.tld` would
  // produce `Location: ///attacker.tld`, which browsers follow off-site.
  if (!isValidSlug(slug)) {
    console.warn(`[preview] rejected malformed slug: ${JSON.stringify(slug).slice(0, 120)}`)
    return NextResponse.json({ message: 'Malformed slug' }, { status: 400 })
  }

  // Resolve against Contentful before enabling draft mode, so a stale link 404s
  // here rather than redirecting into a broken page with a draft cookie set.
  const post = await getPostBySlug(slug, true)
  if (!post) {
    return NextResponse.json({ message: `No entry found for slug "${slug}"` }, { status: 404 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(postRedirectPath(slug))
}

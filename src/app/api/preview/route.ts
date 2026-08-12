import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/app/lib/api'
import { postPath } from '@/app/lib/routes'
import { isValidSlug, secretMatches } from '@/app/lib/secrets'

/**
 * Draft-mode entry point for Contentful's "Open preview" button.
 *
 * Set the preview URL on the blogPost content type to:
 *
 *   https://<host>/api/preview?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}
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

  redirect(postPath(slug))
}

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/app/lib/api'
import { postPath } from '@/app/lib/routes'

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

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false

  return timingSafeEqual(a, b)
}

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

  // Resolve the slug against Contentful before enabling draft mode, so a bad
  // or stale link 404s here rather than redirecting into a broken page with a
  // draft cookie already set. This also stops the redirect being used as an
  // open redirect — we only ever send the user to a slug Contentful knows.
  const post = await getPostBySlug(slug, true)
  if (!post) {
    return NextResponse.json({ message: `No entry found for slug "${slug}"` }, { status: 404 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(postPath(slug))
}

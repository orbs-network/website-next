import { NextResponse } from 'next/server'
import { readNetworkStatus } from '@/app/components/layout/footer/read-network-status'

/**
 * The network's health, reduced to one word.
 *
 * THIS EXISTS TO KEEP THE PAGES STATIC, which is worth spelling out because
 * reading the status in the footer component is the obvious way to do it and
 * was the first attempt.
 *
 * The footer is on every page. A `fetch` with a revalidate window inside it
 * sets that window on every page that renders it — the build output went from
 * fully static to `5m` on all 103 routes, and for the 456 blog posts a
 * revalidation means re-fetching from Contentful, whose allowance is already
 * exhausted (#115). A footer decoration would have quietly rewritten the
 * caching model of the whole site.
 *
 * So the expensive part stays on the server and behind its own cache, the
 * pages stay static, and the browser asks for about thirty bytes.
 */

/** Matches the window the reading is cached for; see `read-network-status.ts`. */
export const revalidate = 300

export async function GET() {
  const status = await readNetworkStatus()

  if (status === null) {
    // 503 rather than a body saying "unknown". The client renders nothing
    // either way, and a status code says what happened to anyone looking.
    return new NextResponse(null, { status: 503 })
  }

  return NextResponse.json(
    { status },
    {
      headers: {
        // Let the CDN serve it, and keep serving the last good reading while a
        // new one is fetched — a footer dot that blinks out during a
        // revalidation would be worse than one that is a few minutes stale.
        'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 4}`,
      },
    }
  )
}

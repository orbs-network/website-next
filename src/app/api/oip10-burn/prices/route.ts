import { NextResponse } from 'next/server'

/**
 * Hourly ORBS/USD prices for the OIP-10 burn tracker (`public/oip10-burn/`).
 *
 * The page used to call CoinGecko's free public API from the browser, which
 * rate limits (429) after a handful of loads. This route fetches the same
 * series from CoinGecko Pro on the server and lets the CDN cache it, so most
 * visitors never reach CoinGecko at all.
 *
 * SETUP: `COINGECKO_API_KEY` must be set as a server environment variable in
 * Vercel (Production and Preview). The key comes from the CoinGecko Basic
 * plan. It is read here only and never sent to the browser.
 *
 * `COINGECKO_BASE_URL` is a test only override (default
 * `https://pro-api.coingecko.com`) used to point the route at a local mock
 * upstream. Leave it unset in Vercel.
 *
 * The upstream URL is fixed and nothing from the request is forwarded, so the
 * route cannot be used as a proxy. The body keeps CoinGecko's shape,
 * `{ prices: [[ms, price], ...] }`, which is what the page validates.
 *
 * Fetch it with the trailing slash (`/api/oip10-burn/prices/`):
 * `trailingSlash: true` 308s the slashless form.
 */

const DEFAULT_BASE_URL = 'https://pro-api.coingecko.com'
const PATH = '/api/v3/coins/orbs/market_chart?vs_currency=usd&days=15&precision=full'
const TIMEOUT_MS = 10_000
const S_MAXAGE = 1800
const SWR = 3600

// Rendered per request; the CDN (Cache-Control below) does the caching. A
// build time prerender would bake in whatever the build saw, keys or not.
export const dynamic = 'force-dynamic'

function error(status: number, message: string) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function validPrices(body: unknown): body is { prices: [number, number][] } {
  if (!body || typeof body !== 'object') return false
  const prices = (body as { prices?: unknown }).prices
  return (
    Array.isArray(prices) &&
    prices.length > 0 &&
    prices.every(
      (p) =>
        Array.isArray(p) &&
        p.length >= 2 &&
        typeof p[0] === 'number' &&
        Number.isFinite(p[0]) &&
        typeof p[1] === 'number' &&
        Number.isFinite(p[1])
    )
  )
}

export async function GET() {
  const key = process.env.COINGECKO_API_KEY
  if (!key) return error(503, 'Price source is not configured')

  const base = process.env.COINGECKO_BASE_URL || DEFAULT_BASE_URL

  let body: unknown
  try {
    const res = await fetch(base + PATH, {
      headers: { Accept: 'application/json', 'x-cg-pro-api-key': key },
      // Next data cache: bounds paid upstream calls however the route is requested
      // (Authorization-header requests skip the CDN), and a failed revalidation
      // keeps serving the last good copy.
      next: { revalidate: S_MAXAGE },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return error(503, `Price source unavailable (HTTP ${res.status})`)
    body = await res.json()
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError'
    return error(503, timedOut ? 'Price source timed out' : 'Price source unavailable')
  }

  if (!validPrices(body)) return error(502, 'Price source returned an invalid response')

  return NextResponse.json(
    { prices: body.prices.map((p) => [p[0], p[1]]) },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${S_MAXAGE}, stale-while-revalidate=${SWR}`,
      },
    }
  )
}

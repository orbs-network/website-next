#!/usr/bin/env node
/**
 * Load every prerendered route at phone widths and fail if any page scrolls
 * sideways (#189).
 *
 *   npm run build && npm run start      # in one terminal
 *   npm run check:overflow              # in another
 *
 *   node scripts/check-overflow.mjs --base https://<preview>.vercel.app
 *   node scripts/check-overflow.mjs --widths 390,360,320,280
 *
 * This is the guard that actually found #189's causes, and CI cannot run it: it
 * needs a built site, and a build needs Contentful credentials CI does not
 * have. `src/app/components/mobile-overflow.stories.tsx` covers the component
 * level in CI; this covers the one thing a story cannot — how a whole page
 * composes. Run it before a mobile-affecting PR, or against the preview.
 *
 * WHY `scrollWidth` AND NOT A SCREENSHOT. A page that scrolls sideways by six
 * pixels looks identical to one that does not. Every overflow found so far
 * survived visual review for exactly that reason, and `scrollWidth` does not
 * have that problem.
 *
 * On failure it names the narrowest element whose content reaches past the
 * edge. That is usually the cause rather than a symptom — the ancestors above
 * it all overflow too, but only because it does.
 */

import fs from 'node:fs'
import { chromium } from 'playwright'

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '')
const WIDTHS = arg('widths', '390,360,320').split(',').map(Number)

/**
 * Every prerendered page, from the build's own manifest rather than a list kept
 * by hand — a hand-kept list is the thing that goes stale.
 *
 * Blog and news routes are skipped: they are Contentful-backed, and a build
 * made with `CONTENTFUL_ALLOW_DEGRADED` has no posts in them to measure. So are
 * assets and feeds, which have no layout.
 */
function routes() {
  const manifest = '.next/prerender-manifest.json'
  if (!fs.existsSync(manifest)) {
    console.error(`No ${manifest} — run \`npm run build\` first.`)
    process.exit(2)
  }

  return Object.keys(JSON.parse(fs.readFileSync(manifest, 'utf8')).routes)
    .filter((p) => !/^\/(_|api|blog|news)|\.(xml|txt|ico|png|svg|webmanifest)$|\/rss/.test(p))
    .map((p) => (p.endsWith('/') ? p : `${p}/`))
}

/** Runs in the page: the deepest element whose content reaches past the edge. */
function culprit() {
  const vw = document.documentElement.clientWidth
  let found = null

  /*
    Whether something between `el` and the page clips it.

    Checking only the element's OWN overflow was the first version, and it named
    the wrong culprit: a code sample's `<code>` is wider than a phone and
    reports `overflow-x: visible`, but it sits inside a `<pre>` that scrolls, so
    it cannot widen the page. That exact red herring came up twice while
    finding #189 by hand; the script should not need a person to dismiss it.
  */
  function clippedByAncestor(el) {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      if (getComputedStyle(node).overflowX !== 'visible') return true
    }
    return false
  }

  for (const el of document.querySelectorAll('body *')) {
    const box = el.getBoundingClientRect()
    if (!box.width || clippedByAncestor(el)) continue

    const style = getComputedStyle(el)
    // A box that clips or scrolls its own content is not causing page overflow
    // either, however wide that content is.
    const spills = style.overflowX === 'visible'
    const reach = Math.max(box.right, spills ? box.left + el.scrollWidth : 0)

    if (reach > vw + 0.5) found = el // later in document order = deeper
  }

  if (!found) return null

  return {
    tag: found.tagName.toLowerCase(),
    className: String(found.className).slice(0, 90),
    text: (found.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
  }
}

const list = routes()
const browser = await chromium.launch()
const failures = []

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 844 } })

  for (const route of list) {
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    } catch (error) {
      failures.push(`${width}px ${route}  could not load: ${error.message.split('\n')[0]}`)
      continue
    }

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    if (scrollWidth <= width) continue

    const cause = await page.evaluate(culprit)
    failures.push(
      `${width}px ${route}  scrollWidth ${scrollWidth}` +
        (cause ? `\n      <${cause.tag} class="${cause.className}">\n      "${cause.text}"` : '')
    )
  }

  await page.close()
}

await browser.close()

console.log(`Checked ${list.length} routes at ${WIDTHS.join(' / ')}px against ${BASE}`)

if (failures.length) {
  console.error(`\n${failures.length} overflowing:\n\n  ${failures.join('\n\n  ')}`)
  process.exit(1)
}

console.log('No page scrolls sideways.')

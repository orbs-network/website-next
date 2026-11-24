#!/usr/bin/env node
/**
 * Capture the published blog posts and media mentions from Contentful into
 * `src/app/lib/contentful-snapshot/`, the fallback `src/app/lib/api.ts` serves
 * from when Contentful refuses to (quota exhausted, rate limited, outage).
 *
 *   node --env-file=.env.local scripts/snapshot-contentful.mjs
 *
 * WHY THE RAW API AND NOT THE SDK: the SDK hands back link-resolved objects,
 * which are not reliably serialisable. This stores the CDA responses as they
 * arrive — `items` plus `includes` — and the loader runs them through the same
 * resolver the SDK uses (`contentful-resolve-response`, with the SDK's own
 * options), so the snapshot resolves to exactly the shape a live query returns.
 *
 * The queries match the live ones in `api.ts`: same content types, same order,
 * no `include` parameter (so Contentful's default depth, as the SDK sends).
 *
 * Refuses to write anything unless every page came back 200 and the item count
 * matches Contentful's `total`. A partial snapshot is worse than a stale one,
 * because the fallback would serve it as the whole archive.
 *
 * Cost: one request per 100 entries — about 9 for the current archive.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(REPO, 'src/app/lib/contentful-snapshot')
const PAGE = 100

/** Must match POST_ORDER and the media ordering in api.ts. */
const SOURCES = [
  { contentType: 'blogPost', order: '-fields.date,sys.id', file: 'blog-posts.json' },
  { contentType: 'mediaMention', order: '-fields.date,sys.id', file: 'media-mentions.json' },
]

const space = process.env.CONTENTFUL_SPACE_ID
const token = process.env.CONTENTFUL_ACCESS_TOKEN
if (!space || !token) {
  console.error('CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set (try --env-file=.env.local).')
  process.exit(1)
}

async function fetchPage(contentType, order, skip) {
  const query = new URLSearchParams({ content_type: contentType, order, limit: String(PAGE), skip: String(skip) })
  const url = `https://cdn.contentful.com/spaces/${space}/environments/master/entries?${query}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    throw new Error(`${contentType} skip=${skip}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)
  }
  return res.json()
}

/** Every page of one content type, merged into a single CDA-shaped response. */
async function capture({ contentType, order }) {
  const items = []
  const includes = { Entry: new Map(), Asset: new Map() }
  let total = Infinity

  for (let skip = 0; skip < total; skip += PAGE) {
    const page = await fetchPage(contentType, order, skip)
    total = page.total
    items.push(...page.items)
    for (const type of ['Entry', 'Asset']) {
      for (const linked of page.includes?.[type] ?? []) includes[type].set(linked.sys.id, linked)
    }
    if (page.items.length === 0) break
  }

  if (items.length !== total) {
    throw new Error(`${contentType}: captured ${items.length} items but Contentful reports ${total}. Not writing.`)
  }

  return {
    sys: { type: 'Array' },
    total,
    skip: 0,
    limit: total,
    items,
    includes: { Entry: [...includes.Entry.values()], Asset: [...includes.Asset.values()] },
  }
}

const capturedAt = new Date().toISOString()
const results = []
// Capture everything before writing anything, so a failure half way leaves the
// previous snapshot intact rather than one new file next to one stale one.
for (const source of SOURCES) results.push({ source, response: await capture(source) })

await mkdir(OUT_DIR, { recursive: true })
for (const { source, response } of results) {
  await writeFile(resolve(OUT_DIR, source.file), JSON.stringify({ capturedAt, ...response }) + '\n')
  console.log(`${source.file}: ${response.items.length} ${source.contentType} entries`)
}

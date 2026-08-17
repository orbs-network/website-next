// scripts/migrate-media-mentions.mjs
//
// One-off. Moves the legacy /news press-coverage cards into Contentful as
// `mediaMention` entries, uploading each thumbnail and publisher logo.
//
// Usage:
//   node scripts/migrate-media-mentions.mjs           # dry run, writes nothing
//   node scripts/migrate-media-mentions.mjs --apply
//
// Requires CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_SPACE_ID, and
// LEGACY_NEWS_DIR pointing at the legacy repo's content/news/posts.
// LEGACY_ASSET_ROOT points at the repo root, so `/assets/...` resolves.

import 'dotenv/config'
import contentful from 'contentful-management'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import crypto from 'node:crypto'

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT_ID = 'master',
  CONTENTFUL_LOCALE = 'en-US',
  LEGACY_NEWS_DIR,
  LEGACY_ASSET_ROOT,
  PUBLISH_AFTER_UPSERT = 'true',
} = process.env

const APPLY = process.argv.includes('--apply')
const publishAfterUpsert = String(PUBLISH_AFTER_UPSERT).toLowerCase() === 'true'
const CONTENT_TYPE = 'mediaMention'

if (!CONTENTFUL_MANAGEMENT_TOKEN || !CONTENTFUL_SPACE_ID) {
  throw new Error('Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID')
}
if (!LEGACY_NEWS_DIR || !LEGACY_ASSET_ROOT) {
  throw new Error(
    'Set LEGACY_NEWS_DIR and LEGACY_ASSET_ROOT, e.g.\n' +
      '  LEGACY_NEWS_DIR=/path/to/orbs-network-website/content/news/posts\n' +
      '  LEGACY_ASSET_ROOT=/path/to/orbs-network-website'
  )
}

const L = (v) => ({ [CONTENTFUL_LOCALE]: v })
const linkAsset = (id) => ({ sys: { type: 'Link', linkType: 'Asset', id } })
const sha1 = (x) => crypto.createHash('sha1').update(x).digest('hex')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * The URL is the only natural key a media mention has — there is no slug, and
 * the content type marks it unique. Deriving the entry ID from it makes the
 * migration idempotent and collapses the 7 duplicate URLs in the legacy data
 * onto one entry each rather than failing the uniqueness validation.
 */
const entryIdForUrl = (url) => `media-${sha1(url).slice(0, 40)}`
const assetIdForHash = (hash) => `img-${hash.slice(0, 40)}`

function statusOf(error) {
  if (typeof error?.status === 'number') return error.status
  try {
    return JSON.parse(error?.message || '{}')?.status ?? null
  } catch {
    return null
  }
}
const isNotFound = (e) => e?.name === 'NotFound' || statusOf(e) === 404
const isConflict = (e) => statusOf(e) === 409

/** Retry reads on 429/5xx. */
async function withRetry(fn, label, attempts = 5) {
  let last
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      const s = statusOf(e)
      const transient = s === 429 || (typeof s === 'number' && s >= 500)
      if (!transient || i === attempts) throw e
      const wait = Math.min(30000, 1000 * 2 ** (i - 1))
      console.warn(`  retry ${i} after ${wait}ms (${label}): ${s}`)
      await sleep(wait)
    }
  }
  throw last
}

/** Retry writes on 429 only — a 5xx may have applied, and replaying it 409s. */
async function withRetryWrite(fn, label, attempts = 5) {
  let last
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (statusOf(e) !== 429 || i === attempts) throw e
      const wait = Math.min(30000, 1000 * 2 ** (i - 1))
      console.warn(`  retry ${i} after ${wait}ms (${label}): 429`)
      await sleep(wait)
    }
  }
  throw last
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

/**
 * Misspellings and abbreviations present in the legacy frontmatter. All of them
 * appear verbatim in content/news/posts — this is not defensive generalising.
 */
const MONTH_ALIASES = {
  jan: 'january', feb: 'february', mar: 'march', apr: 'april',
  jun: 'june', jul: 'july', aug: 'august', sep: 'september', sept: 'september',
  oct: 'october', nov: 'november', dec: 'december',
  septmber: 'september',
  novermber: 'november',
}

/**
 * Four legacy dates cannot be repaired by normalising the month, so each is
 * corrected explicitly from evidence rather than guessed at.
 *
 * The two five-digit years matter: naive truncation gets both WRONG.
 *
 *   '21, November 20223'  git-added 2023-11-30  -> 2023, not 2022
 *   '28, July 20225'      git-added 2025-07-29  -> 2025, not 2022
 *
 * The two with no year are dated from when the file was added, taking the year
 * that places the article BEFORE it was committed.
 *
 *   '25, January'   git-added 2022-02-06  -> January 2022
 *   '12, November'  git-added 2022-01-06  -> November 2021
 */
const DATE_CORRECTIONS = {
  '21, november 20223': '2023-11-21',
  '28, july 20225': '2025-07-28',
  '25, january': '2022-01-25',
  '12, november': '2021-11-12',
}

/** @returns ISO date string, or null if it cannot be parsed. */
function parseLegacyDate(raw) {
  const value = String(raw || '').trim()
  if (!value) return null

  const corrected = DATE_CORRECTIONS[value.toLowerCase()]
  if (corrected) return new Date(`${corrected}T00:00:00Z`).toISOString()

  const m = value.match(/^(\d{1,2}),\s*([A-Za-z]+)\s+(\d{4})$/)
  if (!m) return null

  const day = Number(m[1])
  const monthWord = m[2].toLowerCase()
  const month = MONTHS.indexOf(MONTH_ALIASES[monthWord] || monthWord)
  const year = Number(m[3])
  if (month < 0 || day < 1 || day > 31) return null

  return new Date(Date.UTC(year, month, day)).toISOString()
}

// ---------------------------------------------------------------------------

/** Contentful Symbol fields cap at 256 characters. */
const SYMBOL_MAX = 256

/**
 * Repairs the malformed URLs in the legacy frontmatter.
 *
 * Four entries failed to import on the first run, from three causes — all of
 * them defects in the source data rather than anything Contentful is doing
 * wrong:
 *
 *   1. `"https://u.today/..."`   quoted, quotes ended up inside the value
 *   2. `www.bloomberg.com/...`   no scheme
 *   3. two Yahoo URLs at 259 chars, over the Symbol limit purely because of a
 *      Chrome `#:~:text=` anchor; without it they are 73
 *   4. one Yahoo URL at 336 chars — 254 of them consent and referrer tracking
 *      (`guccounter`, `guce_referrer`, `guce_referrer_sig`). The real article
 *      is the first 82.
 *
 * Trimming happens in order of least to most destructive: fragment first, then
 * query. A fragment never identifies the article; a query sometimes does, so it
 * only goes if the URL is still too long without the fragment.
 */
function normaliseUrl(raw) {
  let url = String(raw || '').trim()

  // Strip wrapping quotes, single or double.
  url = url.replace(/^["'](.*)["']$/, '$1').trim()
  if (!url) return null

  if (!/^https?:\/\//i.test(url)) {
    // Protocol-relative or bare host. Anything else is not repairable.
    if (/^\/\//.test(url)) url = `https:${url}`
    else if (/^[\w.-]+\.[a-z]{2,}\//i.test(url)) url = `https://${url}`
    else return null
  }

  if (url.length <= SYMBOL_MAX) return url

  const withoutFragment = url.split('#')[0]
  if (withoutFragment.length <= SYMBOL_MAX) return withoutFragment

  const withoutQuery = withoutFragment.split('?')[0]
  if (withoutQuery.length <= SYMBOL_MAX) return withoutQuery

  // Nothing left to trim — the path itself is too long.
  return null
}

function parseFrontmatter(text) {
  const parts = text.split('---')
  if (parts.length < 3) return null

  const fields = {}
  for (const line of parts[1].split('\n')) {
    const m = line.trim().match(/^(\w+):\s*(.*)$/)
    if (m) fields[m[1]] = m[2].trim()
  }
  return { fields, body: parts.slice(2).join('---').trim() }
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.svg') return 'image/svg+xml'
  return 'image/jpeg'
}

/**
 * Resolve a legacy image path, repairing the two known defects.
 *
 * Both of these reference files that DO exist — the paths are simply wrong,
 * and skipping them leaves a card with a blank hero area:
 *
 *   '/assets/img/news/posts/ democratizing-...webp'
 *      a space after `posts/`; trimming the value's ends does not catch it
 *
 *   '/assets/img/news/posts/How-Orbs-is-Positively-Impacting/bg.png'
 *      points into a directory that does not exist; the real file is the
 *      sibling `How-Orbs-is-Positively-Impacting.png`
 *
 * @returns absolute path, or null if nothing matches.
 */
function resolveLegacyImage(root, rawPath) {
  const raw = String(rawPath || '').trim()
  if (!raw) return null

  const candidates = [raw]

  // Spaces around path separators.
  const despaced = raw.replace(/\s*\/\s*/g, '/')
  if (despaced !== raw) candidates.push(despaced)

  // `dir/file.ext` where `dir.ext` is the real file.
  const match = despaced.match(/^(.*)\/([^/]+)\/[^/]+(\.[a-z0-9]+)$/i)
  if (match) {
    candidates.push(`${match[1]}/${match[2]}${match[3]}`)
    // The sibling may not share the referenced extension.
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
      candidates.push(`${match[1]}/${match[2]}${ext}`)
    }
  }

  for (const candidate of candidates) {
    const abs = path.resolve(root, '.' + candidate)
    if (fs.existsSync(abs)) return abs
  }

  return null
}

async function main() {
  const files = (await fsp.readdir(LEGACY_NEWS_DIR)).filter((f) => f.endsWith('.md')).sort()

  const client = contentful.createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN })
  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID)

  const assetIdByHash = new Map()

  async function ensureAssetReady(asset, label) {
    if (!asset.fields?.file?.[CONTENTFUL_LOCALE]?.url) {
      asset = await withRetryWrite(() => asset.processForAllLocales(), `process ${label}`)
    }
    if (!asset.sys.publishedVersion) {
      asset = await withRetryWrite(() => asset.publish(), `publish ${label}`)
    }
    return asset
  }

  /** Content-addressed, so re-runs reuse rather than duplicate. */
  async function uploadAsset(absPath, title) {
    const buf = await fsp.readFile(absPath)
    const hash = sha1(buf)
    if (assetIdByHash.has(hash)) return assetIdByHash.get(hash)

    const assetId = assetIdForHash(hash)
    try {
      const found = await withRetry(() => env.getAsset(assetId), `asset ${assetId}`)
      await ensureAssetReady(found, assetId)
      assetIdByHash.set(hash, assetId)
      return assetId
    } catch (e) {
      if (!isNotFound(e)) throw e
    }

    const fileName = path.basename(absPath)
    const upload = await withRetryWrite(
      () => env.createUpload({ file: fs.createReadStream(absPath) }),
      `upload ${fileName}`
    )

    let asset
    try {
      asset = await withRetryWrite(
        () =>
          env.createAssetWithId(assetId, {
            fields: {
              title: L(title || fileName),
              file: {
                [CONTENTFUL_LOCALE]: {
                  contentType: guessContentType(absPath),
                  fileName,
                  uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } },
                },
              },
            },
          }),
        `create asset ${assetId}`
      )
    } catch (e) {
      if (!isConflict(e)) throw e
      asset = await withRetry(() => env.getAsset(assetId), `adopt ${assetId}`)
    }

    await ensureAssetReady(asset, assetId)
    assetIdByHash.set(hash, assetId)
    return assetId
  }

  const problems = { noFrontmatter: [], notAMention: [], badDate: [], badUrl: [], missingAsset: [] }
  const repaired = []
  const seenUrls = new Map()

  for (const file of files) {
    const full = path.join(LEGACY_NEWS_DIR, file)
    const parsed = parseFrontmatter(await fsp.readFile(full, 'utf8'))
    if (!parsed) {
      problems.noFrontmatter.push(file)
      continue
    }

    const { fields, body } = parsed
    // index.md is the page config — it carries `posts`, not a `url`.
    if (!fields.url) {
      problems.notAMention.push(file)
      continue
    }

    const url = normaliseUrl(fields.url)
    if (!url) {
      problems.badUrl.push(`${file} (${String(fields.url).slice(0, 60)})`)
      continue
    }
    if (url !== fields.url.trim()) {
      repaired.push(`${file}: ${fields.url.length} -> ${url.length} chars`)
    }
    fields.url = url

    const date = parseLegacyDate(fields.date)
    if (!date) {
      problems.badDate.push(`${file} (${fields.date})`)
      continue
    }

    const candidate = { file, url: fields.url, headline: body, date, image: fields.image, logo: fields.logo }
    const previous = seenUrls.get(fields.url)

    if (!previous) {
      seenUrls.set(fields.url, { chosen: candidate, files: [file] })
      continue
    }

    previous.files.push(file)

    // Seven URLs appear twice in the legacy data. Keep the LONGEST headline
    // rather than whichever file sorts last — that is the correct pick in all
    // seven cases, and relying on sort order would be luck. One pair is
    // `'e'` against the real 126-character headline; another has a headline
    // describing an entirely different article.
    if (candidate.headline.length > previous.chosen.headline.length) {
      previous.chosen = candidate
    }
  }

  const planned = [...seenUrls.values()].map((v) => v.chosen)
  const duplicateUrls = [...seenUrls.entries()].filter(([, v]) => v.files.length > 1)

  console.log(`\nfiles scanned        : ${files.length}`)
  console.log(`to migrate           : ${planned.length}`)
  console.log(`not a mention        : ${problems.notAMention.length} ${problems.notAMention.join(', ')}`)
  console.log(`unparseable date     : ${problems.badDate.length} ${problems.badDate.join(', ') || ''}`)
  console.log(`unrepairable URL     : ${problems.badUrl.length} ${problems.badUrl.join(', ')}`)
  console.log(`URLs repaired        : ${repaired.length}`)
  repaired.forEach((r) => console.log(`   ${r}`))
  console.log(`duplicate URLs       : ${duplicateUrls.length} (collapse onto one entry each)`)
  console.log(`distinct entries     : ${seenUrls.size}`)

  if (!APPLY) {
    console.log('\nsample:')
    for (const p of planned.slice(0, 3)) {
      console.log(`  ${p.date.slice(0, 10)}  ${p.headline.slice(0, 62)}`)
      console.log(`     ${p.url.slice(0, 78)}`)
    }
    console.log('\nDry run. Nothing written. Re-run with --apply.\n')
    return
  }

  let created = 0
  const failures = []

  for (const [i, item] of planned.entries()) {
    try {
      const entryId = entryIdForUrl(item.url)

      const thumbAbs = resolveLegacyImage(LEGACY_ASSET_ROOT, item.image)
      const logoAbs = resolveLegacyImage(LEGACY_ASSET_ROOT, item.logo)

      const [thumbId, logoId] = [
        thumbAbs ? await uploadAsset(thumbAbs, `media-${path.basename(thumbAbs)}`) : null,
        logoAbs ? await uploadAsset(logoAbs, `logo-${path.basename(logoAbs)}`) : null,
      ]

      if (!thumbId) problems.missingAsset.push(`${item.file} thumbnail`)
      if (!logoId) problems.missingAsset.push(`${item.file} logo`)

      const fields = {
        headline: L(item.headline),
        url: L(item.url),
        date: L(item.date),
      }
      if (thumbId) fields.thumbnail = L(linkAsset(thumbId))
      if (logoId) fields.publisherLogo = L(linkAsset(logoId))

      let existing = null
      try {
        existing = await withRetry(() => env.getEntry(entryId), `get ${entryId}`)
      } catch (e) {
        if (!isNotFound(e)) throw e
      }

      let entry
      if (existing) {
        existing.fields = { ...existing.fields, ...fields }
        entry = await withRetryWrite(() => existing.update(), `update ${entryId}`)
      } else {
        entry = await withRetryWrite(
          () => env.createEntryWithId(CONTENT_TYPE, entryId, { fields }),
          `create ${entryId}`
        )
      }

      if (publishAfterUpsert) {
        await withRetryWrite(() => entry.publish(), `publish ${entryId}`)
      }

      created++
      if (created % 25 === 0) console.log(`  ${created}/${planned.length}`)
    } catch (error) {
      failures.push({ file: item.file, message: error?.message || String(error) })
      console.error(`  FAILED ${item.file}: ${(error?.message || String(error)).slice(0, 180)}`)
    }
  }

  console.log(`\nprocessed: ${created}/${planned.length}`)
  if (problems.missingAsset.length) {
    console.log(`missing asset files: ${problems.missingAsset.length}`)
    problems.missingAsset.slice(0, 10).forEach((m) => console.log(`  ${m}`))
  }
  if (failures.length) {
    console.log(`FAILED: ${failures.length}`)
    failures.forEach((f) => console.log(`  ${f.file}: ${f.message.slice(0, 200)}`))
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

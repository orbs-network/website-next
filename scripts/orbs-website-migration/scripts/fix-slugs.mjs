// scripts/fix-slugs.mjs
//
// One-off. Restores each blogPost's `slug` to the exact value the legacy site
// serves, undoing the lowercasing the original migration applied.
//
// Why: production URLs are case-sensitive and preserve the original casing and
// punctuation. `slugify(x, { lower: true, strict: true })` produced a DIFFERENT
// URL for 233 of 457 posts, so every one of them would 404 at cutover.
//
//   https://www.orbs.com/SpookySwap-Integrates-dSLTP/   200
//   https://www.orbs.com/spookyswap-integrates-dsltp/   404
//
// Entry IDs are immutable in Contentful and were derived from the LOWERCASED
// slug. This script deliberately keeps that derivation untouched and rewrites
// only the `slug` field — otherwise the remaining migration in #22 would stop
// finding these entries and would duplicate them.
//
// Usage:
//   node scripts/fix-slugs.mjs            # dry run, writes nothing
//   node scripts/fix-slugs.mjs --apply    # perform the updates
//
// Requires CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_SPACE_ID, and
// LEGACY_BLOGS_LIST pointing at the legacy repo's content/blog/blogs.md.

import 'dotenv/config'
import contentful from 'contentful-management'
import matter from 'gray-matter'
import slugify from 'slugify'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT_ID = 'master',
  CONTENTFUL_LOCALE = 'en-US',
  LEGACY_BLOGS_LIST,
} = process.env

const APPLY = process.argv.includes('--apply')

if (!CONTENTFUL_MANAGEMENT_TOKEN || !CONTENTFUL_SPACE_ID) {
  throw new Error('Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID')
}

if (!LEGACY_BLOGS_LIST) {
  throw new Error(
    'Set LEGACY_BLOGS_LIST to the legacy blogs.md, e.g.\n' +
      '  LEGACY_BLOGS_LIST=/path/to/orbs-network-website/content/blog/blogs.md'
  )
}

const blogsList = LEGACY_BLOGS_LIST
if (!fs.existsSync(blogsList)) {
  throw new Error(`Legacy blogs.md not found at ${blogsList}`)
}

const sha1 = (x) => crypto.createHash('sha1').update(x).digest('hex')

/** MUST match migrate-blogposts.mjs — entry IDs are immutable and already set. */
function stableBlogEntryIdFromSlug(slug) {
  const base = slugify(slug, { lower: true, strict: true }).slice(0, 48)
  return `${base}-${sha1(slug).slice(0, 12)}`
}

const toSlug = (x) => slugify(String(x || ''), { lower: true, strict: true })

/**
 * Denylist, not an allowlist. Four live legacy URLs contain characters a tidy
 * allowlist rejects and all return 200 on production today — two with `&`, two
 * separated by U+200A hair spaces.
 *
 * Rejects path separators, `%`, and ASCII control characters plus space. The
 * three legacy `blogUrl` values beginning `blog/` are caught here, and are 404
 * on production anyway.
 *
 * NB: do not use `\s` — in JavaScript it matches U+2000-U+200A.
 */
function isSafeSlug(value) {
  if (!value || value.length > 256) return false
  if (value === '.' || value === '..') return false
  return !/[/\\?#%\x00-\x20\x7F]/.test(value)
}

async function main() {
  const list = matter(fs.readFileSync(blogsList, 'utf8')).data.list.map(String)
  const legacyDir = path.dirname(blogsList)

  const client = contentful.createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN })
  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID)

  const changes = []
  const skipped = { noFile: 0, noBlogUrl: 0, unsafe: 0, notInContentful: 0, alreadyCorrect: 0 }

  for (const rel of list) {
    const file = path.resolve(legacyDir, rel)
    if (!fs.existsSync(file)) {
      skipped.noFile++
      continue
    }

    const fm = matter(fs.readFileSync(file, 'utf8')).data
    const liveSlug = String(fm.blogUrl || '').trim()
    if (!liveSlug) {
      skipped.noBlogUrl++
      continue
    }

    if (!isSafeSlug(liveSlug)) {
      console.warn(`⚠️  unsafe blogUrl, skipping: ${JSON.stringify(liveSlug)}`)
      skipped.unsafe++
      continue
    }

    const entryId = stableBlogEntryIdFromSlug(toSlug(liveSlug))

    let entry
    try {
      entry = await env.getEntry(entryId)
    } catch {
      skipped.notInContentful++
      continue
    }

    const current = entry.fields.slug?.[CONTENTFUL_LOCALE]
    if (current === liveSlug) {
      skipped.alreadyCorrect++
      continue
    }

    changes.push({ entryId, from: current, to: liveSlug, entry })
  }

  console.log(`\nlegacy blogs.md entries : ${list.length}`)
  console.log(`already correct         : ${skipped.alreadyCorrect}`)
  console.log(`not in Contentful yet   : ${skipped.notInContentful}   (covered by #22)`)
  console.log(`no blogUrl / no file    : ${skipped.noBlogUrl + skipped.noFile}`)
  console.log(`unsafe, skipped         : ${skipped.unsafe}`)
  console.log(`TO UPDATE               : ${changes.length}\n`)

  for (const c of changes.slice(0, 10)) {
    console.log(`  ${c.from}  ->  ${c.to}`)
  }
  if (changes.length > 10) console.log(`  ... and ${changes.length - 10} more`)

  if (!APPLY) {
    console.log('\nDry run. Nothing written. Re-run with --apply to perform the updates.')
    return
  }

  console.log('\nApplying...')
  let updated = 0
  const failures = []

  for (const c of changes) {
    try {
      c.entry.fields.slug = { ...c.entry.fields.slug, [CONTENTFUL_LOCALE]: c.to }
      const saved = await c.entry.update()
      await saved.publish()
      updated++
      if (updated % 25 === 0) console.log(`  ${updated}/${changes.length}`)
    } catch (error) {
      // Collect rather than abort — one bad entry should not strand the rest
      // halfway through, which is what killed the original migration run.
      failures.push({ entryId: c.entryId, to: c.to, message: error?.message || String(error) })
    }
  }

  console.log(`\nupdated: ${updated}/${changes.length}`)
  if (failures.length) {
    console.log(`FAILED : ${failures.length}`)
    failures.forEach((f) => console.log(`  ${f.entryId} -> ${f.to}: ${f.message.slice(0, 160)}`))
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

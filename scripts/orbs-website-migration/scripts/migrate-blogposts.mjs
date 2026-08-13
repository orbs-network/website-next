// scripts/migrate-blogposts.mjs
import 'dotenv/config'
import contentful from 'contentful-management'
import matter from 'gray-matter'
import slugify from 'slugify'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import crypto from 'node:crypto'
import { glob } from 'glob'
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown'
console.log('RUNNING:', new URL(import.meta.url).pathname)
const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT_ID = 'master',
  CONTENTFUL_LOCALE = 'en-US',

  BLOGS_LIST_FILE = 'blog/blogs.md',
  AUTHORS_DIR = 'authors',

  // Review mode: import first N posts; set 0 to import all
  POST_SAMPLE_COUNT = '3',

  // If true: only create missing posts; skip updating existing entries
  ONLY_CREATE_NEW = 'false',

  // Root dir for "/assets/..." (Next.js usually public/)
  PUBLIC_DIR = 'public',

  // Optional fallback if a post is missing hero image:
  PLACEHOLDER_HERO,

  // Checkpoint file for resume
  MIGRATION_CHECKPOINT_FILE = '.migrate-blogposts.checkpoint.json',
  MIGRATION_FAILURES_FILE = '.migrate-blogposts.failures.json',
  RESUME_FROM_CHECKPOINT = 'false',
  PUBLISH_AFTER_UPSERT = 'true',
} = process.env

if (!CONTENTFUL_MANAGEMENT_TOKEN || !CONTENTFUL_SPACE_ID) {
  throw new Error('Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID')
}
const publishAfterUpsert = String(PUBLISH_AFTER_UPSERT).toLowerCase() === 'true'

const BLOG_CT = 'blogPost'
const onlyCreateNew = String(ONLY_CREATE_NEW).toLowerCase() === 'true'
const resumeFromCheckpoint = String(RESUME_FROM_CHECKPOINT).toLowerCase() === 'true'

const L = (v) => ({ [CONTENTFUL_LOCALE]: v })
const linkEntry = (id) => ({ sys: { type: 'Link', linkType: 'Entry', id } })
const linkAsset = (id) => ({ sys: { type: 'Link', linkType: 'Asset', id } })

function sha1(x) {
  return crypto.createHash('sha1').update(x).digest('hex')
}

function stableBlogEntryIdFromSlug(slug) {
  const base = slugify(slug, { lower: true, strict: true }).slice(0, 48)
  const hash = sha1(slug).slice(0, 12)
  return `${base}-${hash}`
}

// MUST match your author upsert script’s ID algorithm.
function stableAuthorIdFromPath(authorFilePath) {
  const base = slugify(path.basename(authorFilePath, path.extname(authorFilePath)), {
    lower: true,
    strict: true,
  }).slice(0, 40)
  const hash = sha1(authorFilePath).slice(0, 12)
  return `author-${base}-${hash}`
}

/** Contentful surfaces its HTTP status on the error; shapes vary by SDK path. */
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
const isTransient = (e) => {
  const s = statusOf(e)
  return s === 429 || (typeof s === 'number' && s >= 500)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Retry on rate limits and server errors.
 *
 * The whole reason this exists: the previous version treated any getEntry()
 * failure as "does not exist" and tried to create, which turned a transient 429
 * into a fatal 409 and killed the run — twice, at post 47 and post 319. A
 * sequential pass over 450+ posts with inline image uploads will hit a rate
 * limit; the question is only whether it survives one.
 */
async function withRetry(fn, label, attempts = 5) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isTransient(error) || attempt === attempts) throw error

      const wait = Math.min(30000, 1000 * 2 ** (attempt - 1))
      console.warn(`  retry ${attempt}/${attempts - 1} after ${wait}ms (${label}): ${statusOf(error)}`)
      await sleep(wait)
    }
  }
  throw lastError
}

/**
 * The legacy site embargoes posts with a `publish_at` in the future — the
 * Cuttlebelle build simply does not emit them until that time. Contentful has
 * no equivalent, so an embargoed post must be created as a DRAFT and published
 * by hand (or by editorial flow) on the day.
 *
 * Publishing it immediately would put an unreleased announcement on the live
 * site. That happened once during the migration on 2026-08-13 with the OIP-9
 * DAO post, caught only because the entry was verified against orbs.com, which
 * was still 404ing for it.
 */
function isEmbargoed(fm) {
  const raw = fm.publish_at || fm.publishAt
  if (!raw) return false

  const at = new Date(raw)
  if (Number.isNaN(at.getTime())) return false

  return at.getTime() > Date.now()
}

/**
 * Denylist, not an allowlist. Four live legacy URLs contain characters a tidy
 * allowlist rejects and all return 200 on production today — two with `&`, two
 * separated by U+200A hair spaces. `&` is a legal sub-delim in an RFC 3986 path
 * segment and non-ASCII encodes fine; neither can escape the path.
 *
 * Rejects path separators, `%`, and ASCII control characters plus space. The
 * three legacy `blogUrl` values beginning `blog/` are caught here, and are 404
 * on production anyway.
 *
 * NB: do not use `\s` — in JavaScript it matches U+2000-U+200A and would
 * reject the two live hair-space slugs.
 */
function isRoutableSlug(value) {
  if (!value || value.length > 256) return false
  if (value === '.' || value === '..') return false
  return !/[/\\?#%\x00-\x20\x7F]/.test(value)
}

function toSlug(x) {
  return slugify(String(x || ''), { lower: true, strict: true })
}

function normalizeAssetUrl(u) {
  if (!u) return u
  if (u.startsWith('//')) return u.slice(1) // "//assets/.." -> "/assets/.."
  return u
}

function isRemoteUrl(u) {
  return /^https?:\/\//i.test(u)
}

function isLocalUrl(u) {
  return u.startsWith('./') || u.startsWith('../') || u.startsWith('/') || u.startsWith('//')
}

function resolveLocalPath(mdFile, url) {
  const u = normalizeAssetUrl(url)
  if (u.startsWith('/')) return path.resolve(process.cwd(), PUBLIC_DIR, '.' + u)
  return path.resolve(path.dirname(mdFile), u)
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.pdf') return 'application/pdf'
  return 'application/octet-stream'
}

function parseMdImageUrls(markdown) {
  const re = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  const out = []
  let m
  while ((m = re.exec(markdown)) !== null) out.push(m[1])
  return Array.from(new Set(out))
}

// Fix non-standard links like: (FAQ)[https://...]
function normalizeWeirdLinks(md) {
  return md.replace(/\(([^)]+)\)\[(https?:\/\/[^\]\s]+)\]/g, '[$1]($2)')
}

/**
 * Prevent "hyperlink -> embedded-asset-block" (Contentful rejects).
 * Convert:
 *   [![alt](img)](url)
 * into:
 *   ![alt](img)
 *
 *   [View source](url)
 */
function unwrapLinkedImages(md) {
  let out = md

  out = out.replace(
    /\[\!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (_m, alt, img, url) => `![${alt}](${img})\n\n[View source](${url})`
  )

  out = out.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>\s*<img\s+[^>]*src=["']([^"']+)["'][^>]*>\s*<\/a>/gi,
    (_m, url, img) => `![](${img})\n\n[View source](${url})`
  )

  return out
}

/**
 * Removes the "About Orbs" section entirely (from the "About Orbs" heading to EOF),
 * and also removes a divider immediately above it if present.
 */
function stripDividerAndAboutOrbs(md) {
  const headingRe =
    /^\s*(?:#{1,6}\s*)?(?:(?:\*\*|__)\s*)?About Orbs\s*(?:(?:\*\*|__)\s*)?\s*$/im

  const m = headingRe.exec(md)
  if (!m) return md

  const headingStart = m.index
  const before = md.slice(0, headingStart)

  // `[\s\S]*?` here was catastrophic. Posts contain several line-separator
  // divs, and with `$` anchoring to end-of-string the engine matched the FIRST
  // separator and ran lazily to the LAST `</div>` — so everything after the
  // first separator was discarded. Orbs-V5-Update kept 411 of 7508 characters.
  // 35 posts were truncated this way, 7 of them losing over half their body.
  //
  // Every one of the 310 separators in the archive is whitespace-only inside,
  // so `>\s*</div>` matches them all and cannot span. The `\s*` around `=` and
  // inside the quotes covers the four markup variants actually present,
  // including `<div class = 'line-separator '>`, which the old pattern missed
  // entirely.
  const divSepTail =
    /(?:\n\s*\n)?\s*<div[^>]*class\s*=\s*['"]\s*line-separator\s*['"][^>]*>\s*<\/div>\s*$/i
  const hrTagTail = /(?:\n\s*\n)?\s*<hr\b[^>]*>\s*$/i
  const mdHrTail = /(?:\n\s*\n)?\s*(?:---|\*\*\*|___)\s*$/i

  let cutStart = headingStart

  const mDiv = before.match(divSepTail)
  if (mDiv && typeof mDiv.index === 'number') {
    cutStart = mDiv.index
  } else {
    const mHr = before.match(hrTagTail)
    if (mHr && typeof mHr.index === 'number') {
      cutStart = mHr.index
    } else {
      const mMdHr = before.match(mdHrTail)
      if (mMdHr && typeof mMdHr.index === 'number') {
        cutStart = mMdHr.index
      }
    }
  }

  return md.slice(0, cutStart).replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

/**
 * Heading normalization rules (within body):
 *  - "# Something"  -> "### Something"
 *  - "## Something" -> "### Something"
 *  - "**Stop-Loss Orders**" (bold-only line) -> "#### Stop-Loss Orders"
 *
 * Skips fenced code blocks.
 */
function normalizeHeadings(md) {
  const lines = md.split('\n')
  let inFence = false

  const isFence = (line) => /^```/.test(line.trim())

  const extractBoldOnly = (line) => {
    const trimmed = line.trim()
    const m = trimmed.match(/^(\*\*|__)(.+?)\1$/)
    if (!m) return null

    const text = m[2].trim()
    if (text.length < 3 || text.length > 90) return null
    if (/[.!?]$/.test(text)) return null
    if (/$begin:math:display$\[\^$end:math:display$]+]$begin:math:text$\[\^\)\]\+$end:math:text$/.test(text)) return null
    return text
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (isFence(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const hMatch = line.match(/^\s*(#{1,2})\s+(.*)$/)
    if (hMatch) {
      const headingText = hMatch[2].trim()
      if (headingText) lines[i] = `### ${headingText}`
      continue
    }

    const boldText = extractBoldOnly(line)
    if (boldText) {
      lines[i] = `#### ${boldText}`
      continue
    }
  }

  return lines.join('\n')
}

function stripMarkdownForDescription(input) {
  let s = String(input || '')

  // remove images entirely
  s = s.replace(/!$begin:math:display$\[\^$end:math:display$]*]$begin:math:text$\[\^\)\]\+$end:math:text$/g, '')

  // links -> link text
  // s = s.replace(/$begin:math:display$\(\[\^$end:math:display$]+)]$begin:math:text$\(\[\^\)\]\+\)$end:math:text$/g, '$1')

  // basic formatting
  s = s.replace(/(\*\*|__)(.*?)\1/g, '$2')
  s = s.replace(/(\*|_)(.*?)\1/g, '$2')
  s = s.replace(/`([^`]+)`/g, '$1')

  // strip html tags
  s = s.replace(/<[^>]+>/g, '')

  return s.replace(/\s+/g, ' ').trim()
}

/**
 * Enforces shortDescription length <= 256.
 * If longer:
 *  - try to cut at the last '.' within first 256 chars
 *  - else cut to 250 chars and add '...'
 */
function fitShortDescription(input, max = 256) {
  const s = stripMarkdownForDescription(input)
  if (!s) return ''
  if (s.length <= max) return s

  const slice = s.slice(0, max)
  const lastDot = slice.lastIndexOf('.')

  if (lastDot !== -1) {
    const cut = slice.slice(0, lastDot + 1).trim()
    if (cut.length >= 20) return cut
  }

  const hard = s.slice(0, 250).trim()
  return hard + '...'
}

/**
 * Content-addressed asset ID.
 *
 * Contentful IDs allow [a-zA-Z0-9._-] up to 64 chars. Deriving the ID from the
 * file's sha1 makes uploads idempotent: re-running the migration finds the
 * existing asset instead of creating another copy. Previously the dedup map was
 * in-memory only, so every run re-uploaded every image and orphaned the last
 * run's — 1160 assets currently exist for 458 posts.
 */
function stableAssetIdFromHash(hash) {
  return `img-${hash.slice(0, 40)}`
}

/**
 * Upload with a chosen ID.
 *
 * createAssetFromFiles() allocates a random ID, so it cannot be used here. The
 * two-step upload -> createAssetWithId flow is the only way to control it.
 */
async function uploadAssetWithId(env, absPath, titleOverride, assetId) {
  const fileName = path.basename(absPath)
  const contentType = guessContentType(absPath)

  const upload = await withRetry(
    () => env.createUpload({ file: fs.createReadStream(absPath) }),
    `upload blob ${fileName}`
  )

  let asset = await createOrGetAsset(env, assetId, {
    fields: {
      title: L(titleOverride || fileName),
      file: {
        [CONTENTFUL_LOCALE]: {
          contentType,
          fileName,
          uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } },
        },
      },
    },
  })

  asset = await withRetry(() => asset.processForAllLocales(), `process ${fileName}`)
  asset = await withRetry(() => asset.publish(), `publish asset ${fileName}`)
  return asset
}

/**
 * Create, or adopt what a previous attempt already created.
 *
 * uploadAssetWithId is multi-step (createUpload -> create -> process ->
 * publish), so retrying the whole thing is not idempotent: a 429 after the
 * create succeeds replays the create, gets a 409, and the caller drops the
 * image. Retrying per step and treating 409 as "mine, already made" keeps it
 * recoverable.
 */
async function createOrGetAsset(env, assetId, data) {
  try {
    return await withRetry(() => env.createAssetWithId(assetId, data), `create asset ${assetId}`)
  } catch (error) {
    if (!isConflict(error)) throw error
    return await withRetry(() => env.getAsset(assetId), `adopt asset ${assetId}`)
  }
}

async function resolveAuthorEntryId(authorFrontmatterValue) {
  const authorPath = Array.isArray(authorFrontmatterValue)
    ? authorFrontmatterValue[0]
    : authorFrontmatterValue

  const basename = path.basename(String(authorPath))
  const matches = await glob(`${AUTHORS_DIR}/**/${basename}`)
  if (matches.length > 0) return stableAuthorIdFromPath(matches[0])

  return stableAuthorIdFromPath(String(authorPath))
}

function readCheckpoint(file) {
  if (!resumeFromCheckpoint) return null
  try {
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function writeCheckpoint(file, obj) {
  try {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2))
  } catch {
    // ignore
  }
}

function clearCheckpoint(file) {
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  } catch {
    // ignore
  }
}

function isBlockNode(n) {
  const t = n?.nodeType
  return typeof t === 'string' && t.endsWith('-block')
}

function hasMeaningfulInline(inlineNodes) {
  return inlineNodes.some((n) => {
    if (!n) return false
    if (n.nodeType === 'text') return typeof n.value === 'string' && n.value.trim() !== ''
    return true
  })
}

/**
 * Sanitizes Rich Text to avoid invalid structures like:
 *  - heading-* containing embedded-asset-block
 *  - paragraph containing embedded-asset-block
 *  - hyperlink containing embedded-asset-block
 *
 * Strategy:
 *  - lift block nodes out of inline-only containers
 *  - if a heading/paragraph becomes empty after lifting, drop it
 */
const NEEDS_CHILD = /^(table-cell|table-header-cell|list-item|blockquote)$/

const emptyParagraph = () => ({
  nodeType: 'paragraph',
  data: {},
  content: [{ nodeType: 'text', value: '', marks: [], data: {} }],
})

function sanitizeRichTextDoc(doc) {
  function sanitizeInlineContainer(node) {
    const liftedBlocks = []
    const newInline = []

    for (const child of node.content || []) {
      // hyperlink that contains block nodes -> lift blocks, replace with "View source"
      if (
        child?.nodeType === 'hyperlink' &&
        Array.isArray(child.content) &&
        child.content.some((c) => isBlockNode(c))
      ) {
        for (const c of child.content) if (isBlockNode(c)) liftedBlocks.push(c)
        const uri = child.data?.uri || ''
        newInline.push({
          nodeType: 'hyperlink',
          data: { uri },
          content: [{ nodeType: 'text', value: 'View source', marks: [], data: {} }],
        })
        continue
      }

      // block node directly inside heading/paragraph -> lift it
      if (isBlockNode(child)) {
        liftedBlocks.push(child)
        continue
      }

      // recurse
      newInline.push(...sanitizeNode(child))
    }

    const out = []
    out.push(...liftedBlocks)

    if (hasMeaningfulInline(newInline)) {
      out.push({ ...node, content: newInline })
    }
    return out
  }

  function sanitizeNode(node) {
    if (!node || typeof node !== 'object') return [node]

    if (node.nodeType === 'paragraph' || /^heading-\d$/.test(node.nodeType)) {
      return sanitizeInlineContainer(node)
    }

    if (Array.isArray(node.content)) {
      const next = []
      for (const c of node.content) next.push(...sanitizeNode(c))

      // Containers that Contentful requires to be non-empty. A blank table cell
      // holds an empty paragraph; sanitizeInlineContainer drops that paragraph
      // as "no meaningful inline", leaving a childless cell and a 422:
      //   name: size, min: 1, path: fields.content.en-US...table-cell
      // Re-seed an empty paragraph so the shape stays valid.
      //
      // Masked until now: the divider-regex bug truncated posts before their
      // tables, so no table ever reached validation.
      if (next.length === 0 && NEEDS_CHILD.test(node.nodeType || '')) {
        next.push(emptyParagraph())
      }

      return [{ ...node, content: next }]
    }

    return [node]
  }

  const [sanitized] = sanitizeNode(doc)
  return sanitized || doc
}

async function main() {
  const listRaw = await fsp.readFile(BLOGS_LIST_FILE, 'utf8')
  const { data } = matter(listRaw)

  if (!data?.list || !Array.isArray(data.list)) {
    throw new Error(`Expected a frontmatter "list:" array in ${BLOGS_LIST_FILE}`)
  }

  const allPostRelPaths = data.list.map(String)
  const sampleCount = Number.parseInt(POST_SAMPLE_COUNT, 10)
  const selected = sampleCount > 0 ? allPostRelPaths.slice(0, sampleCount) : allPostRelPaths

  const cp = readCheckpoint(MIGRATION_CHECKPOINT_FILE)
  let startIndex = 0
  if (cp?.relPath) {
    const idx = selected.indexOf(cp.relPath)
    if (idx >= 0) startIndex = idx
  } else if (Number.isInteger(cp?.index) && cp.index >= 0 && cp.index < selected.length) {
    startIndex = cp.index
  }

  console.log(`Total posts in ${BLOGS_LIST_FILE}: ${allPostRelPaths.length}`)
  console.log(
    `Migrating: ${selected.length} post(s)${sampleCount > 0 ? ` (sample: first ${sampleCount})` : ''}`
  )
  console.log(`Mode: ${onlyCreateNew ? 'create-only (skip updates)' : 'upsert (create/update)'}`)
  if (cp && resumeFromCheckpoint) {
    console.log(`Resuming from checkpoint: index ${startIndex + 1}/${selected.length} (${selected[startIndex]})`)
  }

  const client = contentful.createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN })
  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID)

  // Dedupe assets by hash (within this run)
  const assetIdByHash = new Map()
  const failures = []

  async function getAssetId(absPath, titleOverride) {
    try {
      const buf = await fsp.readFile(absPath)
      const hash = sha1(buf)

      // In-run cache first — saves a round trip for images repeated in a post.
      if (assetIdByHash.has(hash)) return assetIdByHash.get(hash)

      const assetId = stableAssetIdFromHash(hash)

      // Across runs: if this exact file was uploaded before, reuse it.
      try {
        await withRetry(() => env.getAsset(assetId), `asset ${assetId}`)
        assetIdByHash.set(hash, assetId)
        return assetId
      } catch (e) {
        if (!isNotFound(e)) throw e
      }

      // No outer withRetry — uploadAssetWithId retries each step itself, and
      // wrapping the whole multi-step flow would replay a create that already
      // succeeded.
      const a = await uploadAssetWithId(env, absPath, titleOverride, assetId)
      assetIdByHash.set(hash, a.sys.id)
      return a.sys.id
    } catch (e) {
      if (e?.code === 'ENOENT') {
        console.warn(`⚠️  Missing image file, skipping asset: ${absPath}`)
        return null
      }
      console.warn(`⚠️  Failed to read/upload asset, skipping: ${absPath} (${e?.message || e})`)
      return null
    }
  }

  for (let i = startIndex; i < selected.length; i++) {
    const rel = selected[i]

    // checkpoint BEFORE attempting
    writeCheckpoint(MIGRATION_CHECKPOINT_FILE, {
      index: i,
      relPath: rel,
      total: selected.length,
      updatedAt: new Date().toISOString(),
    })

    try {
      const mdFile = path.resolve(path.dirname(BLOGS_LIST_FILE), rel)

      // Skip missing blog files
      let raw
      try {
        raw = await fsp.readFile(mdFile, 'utf8')
      } catch (e) {
        if (e?.code === 'ENOENT') {
          console.warn(`⚠️  Missing blog file, skipping: ${mdFile}`)
          continue
        }
        throw e
      }

      const { data: fm, content } = matter(raw)

      const title = String(fm.title || path.basename(mdFile, path.extname(mdFile))).trim()

      // Two different values, deliberately.
      //
      // `idSlug` is the lowercased form. Entry IDs are immutable in Contentful
      // and the 320 entries already migrated derived theirs from it, so this
      // derivation must never change or a re-run duplicates every post.
      //
      // `slug` is the PUBLISHED URL and must match the legacy site byte for
      // byte. Production URLs are case-sensitive and preserve original casing
      // and punctuation, so lowercasing here produced a different URL for 233
      // of 457 posts — each of which would 404 at cutover. See #52.
      const idSlug = toSlug(fm.blogUrl || fm.slug || title)
      const entryId = stableBlogEntryIdFromSlug(idSlug)

      const legacyUrl = String(fm.blogUrl || fm.slug || '').trim()
      const slug = legacyUrl && isRoutableSlug(legacyUrl) ? legacyUrl : idSlug

      if (legacyUrl && slug !== legacyUrl) {
        console.warn(`⚠️  blogUrl is not URL-safe, falling back to slugified form: ${JSON.stringify(legacyUrl)}`)
      }

      // Create-only mode: if exists, skip early
      if (onlyCreateNew) {
        try {
          await env.getEntry(entryId)
          console.log(`Skipped (exists): ${slug}`)
          continue
        } catch {
          // proceed
        }
      }

      if (!fm.date) {
        console.warn(`⚠️  Missing required date, skipping: ${mdFile}`)
        continue
      }
      const isoDate = new Date(fm.date).toISOString()

      const authorEntryId = await resolveAuthorEntryId(fm.author)
      try {
        await withRetry(() => env.getEntry(authorEntryId), `author ${authorEntryId}`)
      } catch (error) {
        if (isNotFound(error)) {
          // stableAuthorIdFromPath() hashes the author file's RELATIVE PATH, so
          // this ID depends on the cwd and AUTHORS_DIR. Run from anywhere other
          // than scripts/orbs-website-migration with AUTHORS_DIR=authors and
          // every author misses, failing every post for a reason that reads as
          // a content problem.
          throw new Error(
            `Author "${authorEntryId}" not found for ${rel}. ` +
              `Check cwd and AUTHORS_DIR — author IDs hash the relative path (cwd=${process.cwd()}, AUTHORS_DIR=${AUTHORS_DIR}).`
          )
        }
        throw error
      }

      // HERO IMAGE (optional)
      const heroSrc = fm.image || PLACEHOLDER_HERO
      let heroAssetId = null
      if (heroSrc) {
        const heroAbs = resolveLocalPath(mdFile, String(heroSrc))
        heroAssetId = await getAssetId(heroAbs, `hero-${slug}`)
        if (!heroAssetId) {
          console.warn(`⚠️  Hero image missing/unreadable, continuing without it: ${slug} (${heroAbs})`)
        }
      }

      // Prepare markdown
      let mdBody = normalizeWeirdLinks(content)
      mdBody = stripDividerAndAboutOrbs(mdBody)
      mdBody = normalizeHeadings(mdBody)
      mdBody = unwrapLinkedImages(mdBody)

      // Inline images: upload what we can
      const inlineUrls = parseMdImageUrls(mdBody).map(normalizeAssetUrl)
      const inlineAssetIdByUrl = new Map()

      for (const u of inlineUrls) {
        if (isLocalUrl(u)) {
          const abs = resolveLocalPath(mdFile, u)
          const assetId = await getAssetId(abs, `${slug}-${path.basename(abs)}`)
          if (assetId) inlineAssetIdByUrl.set(u, assetId)
        }
      }

      let rich = await richTextFromMarkdown(mdBody, (node) => {
        if (node?.type === 'image') {
          const url = normalizeAssetUrl(node.url || '')
          const alt = String(node.alt || '').trim()

          const assetId = inlineAssetIdByUrl.get(url)
          if (assetId) {
            return { nodeType: 'embedded-asset-block', content: [], data: { target: linkAsset(assetId) } }
          }

          if (isRemoteUrl(url)) {
            return {
              nodeType: 'paragraph',
              content: [
                {
                  nodeType: 'hyperlink',
                  data: { uri: url },
                  content: [{ nodeType: 'text', value: alt || url, marks: [], data: {} }],
                },
              ],
              data: {},
            }
          }

          const label = alt ? `Image: ${alt}` : 'Image'
          return {
            nodeType: 'paragraph',
            content: [{ nodeType: 'text', value: `${label} (missing)`, marks: [], data: {} }],
            data: {},
          }
        }

        // No code-block nodes allowed -> inline code mark
        if (node?.type === 'code') {
          return {
            nodeType: 'paragraph',
            content: [
              { nodeType: 'text', value: String(node.value || ''), marks: [{ type: 'code' }], data: {} },
            ],
            data: {},
          }
        }

        return undefined
      })

      // sanitize invalid structures (headings/paragraphs/hyperlinks containing block nodes)
      rich = sanitizeRichTextDoc(rich)

      const fields = {
        title: L(title),
        content: L(rich),
        date: L(isoDate),
        shortDescription: L(fitShortDescription(fm.short_description || fm.shortDescription || '')),
        slug: L(slug),
        author: L(linkEntry(authorEntryId)),
      }
      if (heroAssetId) fields.heroImage = L(linkAsset(heroAssetId))

      const embargoed = isEmbargoed(fm)
      const shouldPublish = publishAfterUpsert && !embargoed

      if (onlyCreateNew) {
        try {
          const created = await withRetry(
            () => env.createEntryWithId(BLOG_CT, entryId, { fields }),
            `create ${slug}`
          )
          if (shouldPublish) await withRetry(() => created.publish(), `publish ${slug}`)
          console.log(
            `Created${shouldPublish ? ' + published' : ''}: ${slug}${embargoed ? `  [DRAFT — embargoed until ${fm.publish_at}]` : ''}`
          )
        } catch (error) {
          // A 409 here means the entry appeared between the existence check and
          // now. That is success, not failure.
          if (!isConflict(error)) throw error
          console.log(`Skipped (raced, exists): ${slug}`)
        }
        continue
      }

      // Upsert. Only a genuine 404 means "create it" — anything else must
      // propagate, or a transient failure silently becomes a duplicate-create
      // attempt and then a fatal 409.
      let existing = null
      try {
        existing = await withRetry(() => env.getEntry(entryId), `get ${slug}`)
      } catch (error) {
        if (!isNotFound(error)) throw error
      }

      if (existing) {
        existing.fields = { ...existing.fields, ...fields }
        const wasPublished = Boolean(existing.sys.publishedVersion)
        const updated = await withRetry(() => existing.update(), `update ${slug}`)

        if (shouldPublish) {
          await withRetry(() => updated.publish(), `publish ${slug}`)
        } else if (embargoed && wasPublished) {
          // update() does not retract a live version. Without this an
          // embargoed post that a previous run already published stays
          // publicly visible, which is the exact failure the embargo check
          // exists to prevent.
          await withRetry(() => updated.unpublish(), `unpublish embargoed ${slug}`)
          console.log(`  retracted live version of embargoed post: ${slug}`)
        }
        console.log(
          `Updated${shouldPublish ? ' + published' : ''}: ${slug}${embargoed ? `  [left unpublished — embargoed until ${fm.publish_at}]` : ''}`
        )
      } else {
        const created = await withRetry(
          () => env.createEntryWithId(BLOG_CT, entryId, { fields }),
          `create ${slug}`
        )
        if (shouldPublish) await withRetry(() => created.publish(), `publish ${slug}`)
        console.log(
          `Created${shouldPublish ? ' + published' : ''}: ${slug}${embargoed ? `  [DRAFT — embargoed until ${fm.publish_at}]` : ''}`
        )
      }
    } catch (err) {
      // Deliberately NOT written to the checkpoint. The next iteration
      // overwrites it at the top of the loop, so recording a failure there
      // meant RESUME_FROM_CHECKPOINT resumed from the last post processed
      // rather than the first that failed — silently skipping the posts that
      // needed attention. Failures go to their own file instead.

      // Collect and continue. Aborting the whole run on one bad post is what
      // left the archive in a partial state twice before — 47 of 448, then
      // 319 of 448 — and each restart re-uploads assets for everything it
      // redoes. A single unmigratable post should not cost the other 400.
      failures.push({ rel, message: err?.message || String(err) })
      console.error(`  FAILED ${rel}: ${(err?.message || String(err)).slice(0, 200)}`)
    }
  }

  if (failures.length === 0) {
    try {
      if (fs.existsSync(MIGRATION_FAILURES_FILE)) fs.unlinkSync(MIGRATION_FAILURES_FILE)
    } catch {
      // ignore
    }
    clearCheckpoint(MIGRATION_CHECKPOINT_FILE)
    console.log(`\nDone. ${selected.length - startIndex} processed, 0 failures. Checkpoint cleared.`)
    return
  }

  // Failures get their own file so a re-run can target exactly these posts:
  //   jq -r '.[].rel' .migrate-blogposts.failures.json
  writeCheckpoint(MIGRATION_FAILURES_FILE, failures)
  console.log(`\nDone with failures: ${failures.length} of ${selected.length - startIndex}`)
  console.log(`Failed posts written to ${MIGRATION_FAILURES_FILE}`)
  for (const f of failures) {
    console.log(`  ${f.rel}`)
    console.log(`    ${f.message.slice(0, 240)}`)
  }
  process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
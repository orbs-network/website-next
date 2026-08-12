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

  const divSepTail =
    /(?:\n\s*\n)?\s*<div[^>]*class=['"]line-separator['"][^>]*>[\s\S]*?<\/div>\s*$/i
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

async function uploadAsset(env, absPath, titleOverride) {
  const fileName = path.basename(absPath)
  const contentType = guessContentType(absPath)

  let asset = await env.createAssetFromFiles({
    fields: {
      title: L(titleOverride || fileName),
      file: {
        [CONTENTFUL_LOCALE]: {
          contentType,
          fileName,
          file: fs.createReadStream(absPath),
        },
      },
    },
  })

  asset = await asset.processForAllLocales()
  asset = await asset.publish()
  return asset
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

  async function getAssetId(absPath, titleOverride) {
    try {
      const buf = await fsp.readFile(absPath)
      const hash = sha1(buf)
      if (assetIdByHash.has(hash)) return assetIdByHash.get(hash)
      const a = await uploadAsset(env, absPath, titleOverride)
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
      const slug = toSlug(fm.blogUrl || fm.slug || title)
      const entryId = stableBlogEntryIdFromSlug(slug)

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
      await env.getEntry(authorEntryId)

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

      if (onlyCreateNew) {
        const created = await env.createEntryWithId(BLOG_CT, entryId, { fields })
        if (publishAfterUpsert) await created.publish()
        console.log(`Created${publishAfterUpsert ? ' + published' : ''}: ${slug}`)
        continue
      }

      // Upsert
      try {
        const existing = await env.getEntry(entryId)
        existing.fields = { ...existing.fields, ...fields }
        const updated = await existing.update()
        if (publishAfterUpsert) await updated.publish()
        console.log(`Updated${publishAfterUpsert ? ' + published' : ''}: ${slug}`)
      } catch {
        const created = await env.createEntryWithId(BLOG_CT, entryId, { fields })
        if (publishAfterUpsert) await created.publish()
        console.log(`Created${publishAfterUpsert ? ' + published' : ''}: ${slug}`)      }
    } catch (err) {
      writeCheckpoint(MIGRATION_CHECKPOINT_FILE, {
        index: i,
        relPath: rel,
        total: selected.length,
        failedAt: new Date().toISOString(),
        error: { message: err?.message || String(err), name: err?.name },
      })
      throw err
    }
  }

  clearCheckpoint(MIGRATION_CHECKPOINT_FILE)
  console.log('Done. Checkpoint cleared.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
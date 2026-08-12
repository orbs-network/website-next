import 'dotenv/config'
import contentful from 'contentful-management'
import matter from 'gray-matter'
import { glob } from 'glob'
import slugify from 'slugify'
import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import crypto from 'node:crypto'

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT_ID = 'master',
  CONTENTFUL_LOCALE = 'en-US',
  AUTHORS_GLOB = 'authors/**/*.md',
  PUBLIC_DIR = 'public',
} = process.env

if (!CONTENTFUL_MANAGEMENT_TOKEN || !CONTENTFUL_SPACE_ID) {
  throw new Error('Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID')
}

const AUTHOR_CT = 'author'

const L = (v) => ({ [CONTENTFUL_LOCALE]: v })
const linkAsset = (id) => ({ sys: { type: 'Link', linkType: 'Asset', id } })

function sha1(x) {
  return crypto.createHash('sha1').update(x).digest('hex')
}

function stableAuthorIdFromPath(authorFilePath) {
  const base = slugify(path.basename(authorFilePath, path.extname(authorFilePath)), {
    lower: true,
    strict: true,
  }).slice(0, 40)
  const hash = sha1(authorFilePath).slice(0, 12)
  return `author-${base}-${hash}`
}

function parseAuthorMarkdown(md) {
  const imgMatch = md.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)
  const linkMatch = md.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/)

  const nameFromImg = imgMatch?.[1]?.trim()
  let imageUrl = imgMatch?.[2]?.trim() || null

  const nameFromLink = linkMatch?.[1]?.trim()
  const profileUrl = linkMatch?.[2]?.trim() || null

  const name = nameFromImg || nameFromLink || null

  // "//assets/..." -> "/assets/..."
  if (imageUrl && imageUrl.startsWith('//')) imageUrl = imageUrl.slice(1)

  return { name, imageUrl, profileUrl }
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

function resolveAssetPath(authorMdAbsPath, imageUrl) {
  if (imageUrl.startsWith('/')) return path.resolve(process.cwd(), PUBLIC_DIR, '.' + imageUrl)
  return path.resolve(path.dirname(authorMdAbsPath), imageUrl)
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

async function main() {
  const files = await glob(AUTHORS_GLOB)
  console.log(`Found ${files.length} author files via ${AUTHORS_GLOB}`)

  const client = contentful.createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN })
  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID)

  // Dedupe assets by file hash within a run
  const assetIdByHash = new Map()
  async function getAssetId(absPath, titleOverride) {
    const buf = await fsp.readFile(absPath)
    const hash = sha1(buf)
    if (assetIdByHash.has(hash)) return assetIdByHash.get(hash)
    const asset = await uploadAsset(env, absPath, titleOverride)
    assetIdByHash.set(hash, asset.sys.id)
    return asset.sys.id
  }

  const results = []

  for (const authorMdPath of files) {
    const authorAbs = path.resolve(process.cwd(), authorMdPath)
    const entryId = stableAuthorIdFromPath(authorMdPath)

    const raw = await fsp.readFile(authorAbs, 'utf8')
    const { content } = matter(raw)
    const parsed = parseAuthorMarkdown(content)

    const fallbackName = path.basename(authorMdPath, path.extname(authorMdPath))
    const name = parsed.name || fallbackName

    // ✅ IMPORTANT: locale-wrapper for all fields, even non-localized ones
    const fields = {
      name: L(name),
    }

    if (parsed.profileUrl) {
      fields.profileUrl = L(parsed.profileUrl)
    }

    if (parsed.imageUrl) {
      const imgAbs = resolveAssetPath(authorAbs, parsed.imageUrl)
      const assetId = await getAssetId(imgAbs, `author-${name}-profile`)
      fields.profilePicture = L(linkAsset(assetId))
    }

    try {
      const existing = await env.getEntry(entryId)
      existing.fields = { ...existing.fields, ...fields }
      await existing.update()
      results.push({ action: 'updated', entryId, name })
      console.log(`Updated author: ${name}`)
    } catch {
      await env.createEntryWithId(AUTHOR_CT, entryId, { fields })
      results.push({ action: 'created', entryId, name })
      console.log(`Created author: ${name}`)
    }
  }

  await fsp.writeFile('author-upsert-results.json', JSON.stringify(results, null, 2))
  console.log('Done. Wrote author-upsert-results.json')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
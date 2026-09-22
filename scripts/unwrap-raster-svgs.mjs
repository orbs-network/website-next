#!/usr/bin/env node
/**
 * Replace SVGs that are only a wrapper around one embedded raster.
 *
 * Many partner "logos" in the legacy assets are a PNG encoded as base64 inside
 * an `<svg>` — a `<rect>` filled by a `<pattern>` holding a single `<image>`.
 * They carry no vector content at all, and they are enormous: one ecosystem
 * logo is 826 KB for something rendered at 96x40.
 *
 * That size reaches the reader. `next/image` does NOT optimise SVG — it emits
 * the raw path — so the browser downloads every byte. Measured on a production
 * build before this script existed: GET /ecosystem/staking/moonstake.svg
 * returned 826,022 bytes.
 *
 *   node scripts/unwrap-raster-svgs.mjs --dir public/ecosystem
 *   node scripts/unwrap-raster-svgs.mjs --dir public/ecosystem --dry-run
 *
 * RENDERS the SVG rather than extracting its payload. The first version of this
 * script pulled the base64 out and resized it, which is wrong: every one of
 * these 97 wrappers positions its image with a `<use>` transform, and several
 * scale X and Y differently to crop it to the viewBox. Extracting the payload
 * discards that geometry and produces different artwork — an uncropped or
 * differently-proportioned logo that still loads fine, so nothing looks broken.
 * Rasterising the whole SVG at the display size keeps the geometry by
 * definition.
 *
 * CONSERVATIVE BY DESIGN. A file is only converted when it holds exactly one
 * base64 payload AND every tag in it belongs to the wrapper vocabulary below.
 * Anything with a `<path>`, `<circle>`, `<text>` or similar has real vector
 * content and is left alone — rasterising a genuine vector would be a worse
 * outcome than the bytes it saves.
 */

import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Tags a pure raster wrapper may contain. Anything else means real vector
 * content, and the file is skipped.
 */
const WRAPPER_TAGS = new Set(['svg', 'g', 'defs', 'pattern', 'rect', 'use', 'image', 'style', 'title', 'desc'])

/** Widest any of these logos is displayed, times two for high-DPI. */
const MAX_WIDTH = 240

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (extname(entry.name).toLowerCase() === '.svg') yield path
  }
}

/**
 * How wide an embedded raster may be before it is worth shrinking.
 *
 * These logos are displayed in a 96px box. An embedded square icon usually
 * occupies a fraction of the SVG's own width, so 128px already covers a 3x
 * display with room to spare — Trader Joe's icon is 41 of 203 viewBox units,
 * about 19 CSS px, needing 57px at 3x.
 */
const MAX_EMBEDDED_WIDTH = 128

/**
 * Shrink an oversized raster embedded in an otherwise REAL vector.
 *
 * The wrapper case above rasterises the whole file, which is only safe when
 * there is no vector content to lose. A hybrid has both, and both are worth
 * keeping: Trader Joe's is a genuine `<path>` wordmark beside a 300x300 PNG
 * icon, so rasterising it would throw away crisp text and converting nothing
 * would leave 53 KB of pixels for a 19px square.
 *
 * So the payload is resized in place and the SVG is otherwise untouched. The
 * geometry lives in the `<use>` transform and the `<pattern>`, which are
 * expressed in proportional units — `patternContentUnits="objectBoundingBox"`
 * with a `scale()` — so swapping the image for a smaller one of the same aspect
 * ratio renders identically. That is the crucial difference from the wrapper
 * case, where the transforms are tied to pixel dimensions and extracting the
 * payload silently changed the artwork.
 *
 * Measured on Trader Joe's at 3x the display size: 77 KB -> 12 KB, mean pixel
 * difference 0.70/255.
 */
async function shrinkEmbeddedRaster(source) {
  const match = source.match(/data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)/)
  if (!match) return null

  const payload = Buffer.from(match[2], 'base64')
  const { width } = await sharp(payload).metadata()
  if (!width || width <= MAX_EMBEDDED_WIDTH) return null

  const resized = await sharp(payload)
    .resize({ width: MAX_EMBEDDED_WIDTH, height: MAX_EMBEDDED_WIDTH, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()

  // Only worth rewriting if it actually helps. A payload that is already
  // efficiently encoded can come back LARGER from a re-encode.
  if (resized.length >= payload.length) return null

  return source.replace(match[0], `data:image/png;base64,${resized.toString('base64')}`)
}

/** Whether this file is a pure raster wrapper and safe to rasterise. */
function isRasterWrapper(source) {
  if ((source.match(/data:image\/[a-z+]+;base64,/g) ?? []).length !== 1) return false

  const tags = new Set([...source.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]))
  for (const tag of tags) {
    if (!WRAPPER_TAGS.has(tag)) return false
  }

  return true
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const dirArg = argv[argv.indexOf('--dir') + 1]
  const root = resolve(REPO, argv.includes('--dir') && dirArg ? dirArg : 'public')

  let before = 0
  let after = 0
  const converted = []
  const shrank = []
  const kept = []

  for await (const path of walk(root)) {
    const size = (await stat(path)).size
    const source = await readFile(path, 'utf8')

    if (!isRasterWrapper(source)) {
      // Real vector content, so the file stays an SVG — but it may still carry
      // an oversized raster alongside the vector art.
      const shrunk = await shrinkEmbeddedRaster(source)

      if (shrunk === null) {
        before += size
        after += size
        kept.push(relative(REPO, path))
        continue
      }

      before += size
      after += Buffer.byteLength(shrunk)
      shrank.push({ file: relative(REPO, path), size, out: Buffer.byteLength(shrunk) })

      if (!dryRun) {
        await writeFile(path, shrunk)
      }
      continue
    }

    // `density` oversamples before the downscale, so the result is sharp at the
    // cap rather than rendered at the SVG's nominal size and stretched.
    const output = await sharp(path, { density: 288 })
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer()

    before += size
    after += output.length
    converted.push({
      from: relative(REPO, path),
      to: relative(REPO, path).replace(/\.svg$/, '.png'),
      size,
      out: output.length,
    })

    if (!dryRun) {
      await writeFile(path.replace(/\.svg$/, '.png'), output)
      await unlink(path)
    }
  }

  converted.sort((a, b) => b.size - a.size)
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`

  for (const c of converted.slice(0, 12)) {
    process.stdout.write(`  ${kb(c.size).padStart(9)} -> ${kb(c.out).padStart(8)}  ${c.from}\n`)
  }

  for (const s of shrank.sort((a, b) => b.size - a.size)) {
    process.stdout.write(
      `  ${kb(s.size).padStart(9)} -> ${kb(s.out).padStart(8)}  ${s.file}  (embedded raster shrunk)\n`
    )
  }

  process.stdout.write(
    `\n${converted.length} wrapper SVGs converted to PNG, ${shrank.length} embedded rasters shrunk, ` +
      `${kept.length} real vectors left alone.\n` +
      `Total: ${kb(before)} -> ${kb(after)} (-${Math.round((1 - after / before) * 100)}%)` +
      `${dryRun ? '  [dry run]' : ''}\n`
  )

  if (!dryRun && converted.length > 0) {
    process.stdout.write('\nUpdate any references from .svg to .png.\n')
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
})

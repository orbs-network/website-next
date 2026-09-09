#!/usr/bin/env node
/**
 * Resize and recompress raster imagery under `public/`.
 *
 * Safe to re-run. That takes care for LOSSY formats: decoding and re-encoding a
 * JPEG always loses a little and always comes out slightly smaller, so a naive
 * "write it if it shrank" rule would degrade the same asset a bit more on every
 * run while looking like a win. Lossy sources already within the size cap are
 * therefore skipped outright — see `optimize`.
 *
 *   node scripts/optimize-images.mjs            # optimise in place
 *   node scripts/optimize-images.mjs --dry-run  # report only
 *   node scripts/optimize-images.mjs --dir public/marketing/dsltp
 *
 * WHAT IT DOES NOT DO: convert formats. `next/image` already negotiates WebP
 * and AVIF at request time, so the source format is irrelevant to what a
 * visitor downloads. Converting would churn every `src` in the codebase to buy
 * nothing a visitor can measure.
 *
 * The wins here are repo weight and build time — Next has to decode every
 * source at build — plus not carrying 60-megapixel originals in git forever.
 */

import { readdir, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The widest any of this imagery is ever displayed, times two for high-DPI.
 *
 * Diagrams cap at `max-w-4xl` (896px) and hero art at roughly half a 1440px
 * viewport, so 1800px covers the largest rendered size at 2x. A source larger
 * than that cannot improve what anyone sees: `next/image` would downscale it on
 * every request instead.
 */
const MAX_WIDTH = 1800

/** Formats worth touching. SVG is vector; leave it alone. */
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) yield path
  }
}

/** JPEG and WebP lose information every time they are encoded. PNG does not. */
const LOSSY = new Set(['.jpg', '.jpeg', '.webp'])

/**
 * Re-encode at the same format, resizing only if the source is over the cap.
 *
 * `withoutEnlargement` matters: several assets are already small, and scaling
 * those UP to the cap would add bytes and blur to fix nothing.
 *
 * A lossy source that is already within the cap is SKIPPED rather than
 * re-encoded. There is nothing to gain — it is already the size it will be
 * displayed at — and re-encoding it would shave a few bytes off by throwing
 * away image data, then do it again on the next run. PNG has no such problem:
 * it is lossless, so re-encoding converges and a second pass is a genuine
 * no-op.
 */
async function optimize(path) {
  const before = (await stat(path)).size
  const image = sharp(path, { limitInputPixels: false })
  const meta = await image.metadata()
  const ext = extname(path).toLowerCase()

  if (LOSSY.has(ext) && (meta.width ?? 0) <= MAX_WIDTH) {
    return { before, after: before, width: meta.width, height: meta.height, buffer: null }
  }

  const pipeline = image.resize({ width: MAX_WIDTH, withoutEnlargement: true })

  const output =
    ext === '.png'
      ? pipeline.png({ compressionLevel: 9, effort: 10, palette: true })
      : ext === '.webp'
        ? pipeline.webp({ quality: 82, effort: 6 })
        : pipeline.jpeg({ quality: 82, mozjpeg: true })

  const buffer = await output.toBuffer()

  return { before, after: buffer.length, width: meta.width, height: meta.height, buffer }
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const dirArg = argv[argv.indexOf('--dir') + 1]
  const root = resolve(REPO, argv.includes('--dir') && dirArg ? dirArg : 'public')

  let totalBefore = 0
  let totalAfter = 0
  const changed = []

  for await (const path of walk(root)) {
    const { before, after, width, height, buffer } = await optimize(path)

    totalBefore += before
    // Never write a result that is bigger than what we started with — some
    // assets are already optimal, and re-encoding those is a pure loss.
    const keep = buffer !== null && after < before
    totalAfter += keep ? after : before

    if (keep) {
      changed.push({ path: relative(REPO, path), before, after, width, height })
      if (!dryRun) await writeFile(path, buffer)
    }
  }

  changed.sort((a, b) => b.before - a.before)

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`
  for (const c of changed.slice(0, 20)) {
    const pct = Math.round((1 - c.after / c.before) * 100)
    process.stdout.write(`  ${kb(c.before).padStart(8)} -> ${kb(c.after).padStart(8)}  (-${pct}%)  ${c.path}\n`)
  }

  process.stdout.write(
    `\n${changed.length} of the images under ${relative(REPO, root)} got smaller.\n` +
      `Total: ${kb(totalBefore)} -> ${kb(totalAfter)} ` +
      `(-${Math.round((1 - totalAfter / totalBefore) * 100)}%)${dryRun ? '  [dry run]' : ''}\n`
  )
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
})

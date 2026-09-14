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
 * CONSERVATIVE BY DESIGN. A file is only converted when it holds exactly one
 * base64 payload AND every tag in it belongs to the wrapper vocabulary below.
 * Anything with a `<path>`, `<circle>`, `<text>` or similar has real vector
 * content and is left alone — shipping a raster in place of a genuine vector
 * would be a worse outcome than the bytes it saves.
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

/** The single embedded raster, or null if this is not a pure wrapper. */
function embeddedRaster(source) {
  const payloads = [...source.matchAll(/data:image\/([a-z+]+);base64,([A-Za-z0-9+/=\s]+)/g)]
  if (payloads.length !== 1) return null

  const tags = new Set([...source.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]))
  for (const tag of tags) {
    if (!WRAPPER_TAGS.has(tag)) return null
  }

  const [, format, data] = payloads[0]
  if (format !== 'png' && format !== 'jpeg' && format !== 'jpg') return null

  return { format: format === 'jpg' ? 'jpeg' : format, buffer: Buffer.from(data.replace(/\s/g, ''), 'base64') }
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const dirArg = argv[argv.indexOf('--dir') + 1]
  const root = resolve(REPO, argv.includes('--dir') && dirArg ? dirArg : 'public')

  let before = 0
  let after = 0
  const converted = []
  const kept = []

  for await (const path of walk(root)) {
    const size = (await stat(path)).size
    const source = await readFile(path, 'utf8')
    const raster = embeddedRaster(source)

    if (!raster) {
      before += size
      after += size
      kept.push(relative(REPO, path))
      continue
    }

    const output = await sharp(raster.buffer)
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

  process.stdout.write(
    `\n${converted.length} wrapper SVGs converted to PNG, ${kept.length} real vectors left alone.\n` +
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

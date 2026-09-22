import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards against a specific, recurring asset mistake: a raster image wrapped in
 * an `<svg>`.
 *
 * Partner logos arrive from designers as "SVGs" that contain no vector content
 * at all — a `<rect>` filled by a `<pattern>` holding one base64 `<image>`. They
 * are enormous. `public/ecosystem` shipped 83 of them, 5.5 MB, the worst being
 * 826 KB for a logo rendered at 96x40 (#134).
 *
 * The bytes reach the reader. `next/image` does NOT optimise SVG — it serves the
 * file as-is — so unlike an oversized PNG, which the optimizer quietly rescues,
 * this one is paid in full by every visitor. Measured on a production build:
 * `GET /ecosystem/staking/moonstake.svg` returned 826,022 bytes.
 *
 * WHY A TEST AND NOT JUST THE SCRIPT. `scripts/unwrap-raster-svgs.mjs` fixes
 * these, and `scripts/optimize-images.mjs` skips SVG by design — correctly, for
 * real vectors. Both rely on somebody remembering to run them. The logos arrive
 * one partner at a time, from outside the repo, and the file looks completely
 * normal in a diff: a `.svg`, a few hundred lines, nothing obviously wrong
 * unless you notice the line that is 100,000 characters long. This runs on every
 * PR instead.
 */

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const PUBLIC = join(REPO, 'public')

/**
 * The most an embedded raster may decode to.
 *
 * These logos display at 96px wide, and an embedded square icon is usually a
 * fraction of that. 128px covers a 3x display with room to spare, and the
 * budget is set above it so an honest asset has slack — this is meant to catch
 * a 300x300 icon or a 990x215 wrapper, not to litigate a few hundred bytes.
 */
const MAX_EMBEDDED_BYTES = 24 * 1024

/** Nothing in here should be anywhere near this. The worst offender was 826 KB. */
const MAX_SVG_BYTES = 140 * 1024

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

async function svgFiles(): Promise<string[]> {
  const files: string[] = []
  for await (const path of walk(PUBLIC)) {
    if (extname(path).toLowerCase() === '.svg') files.push(path)
  }
  return files
}

/** Decoded size of every base64 payload in the file. */
function embeddedPayloads(source: string): number[] {
  return [...source.matchAll(/base64,([A-Za-z0-9+/=]+)/g)].map(([, data]) => Math.floor((data.length * 3) / 4))
}

describe('SVG assets in public/', () => {
  it('carries no oversized embedded raster', async () => {
    const offenders: string[] = []

    for (const path of await svgFiles()) {
      const source = await readFile(path, 'utf8')

      for (const bytes of embeddedPayloads(source)) {
        if (bytes > MAX_EMBEDDED_BYTES) {
          offenders.push(`  ${relative(REPO, path)} — ${(bytes / 1024).toFixed(0)} KB embedded`)
        }
      }
    }

    expect(
      offenders,
      `\nThese SVGs embed a raster larger than ${MAX_EMBEDDED_BYTES / 1024} KB. next/image does not\n` +
        `optimise SVG, so a visitor downloads every byte. Fix with:\n\n` +
        `  node scripts/unwrap-raster-svgs.mjs --dir public --dry-run\n\n${offenders.join('\n')}\n`
    ).toEqual([])
  })

  it('has no single SVG far heavier than a logo should be', async () => {
    // A backstop for the case the check above misses: many small payloads, or a
    // pathological amount of vector data. Deliberately generous — it is a
    // tripwire, not a budget.
    const heavy: string[] = []

    for (const path of await svgFiles()) {
      const { size } = await stat(path)
      if (size > MAX_SVG_BYTES) heavy.push(`  ${relative(REPO, path)} — ${(size / 1024).toFixed(0)} KB`)
    }

    expect(heavy, `\nSVGs over ${MAX_SVG_BYTES / 1024} KB:\n${heavy.join('\n')}\n`).toEqual([])
  })

  it('finds SVGs at all, so a broken walk cannot pass silently', async () => {
    // Both checks above pass trivially on an empty list. If the directory moved
    // or the walk broke, they would go green while checking nothing.
    expect((await svgFiles()).length).toBeGreaterThan(50)
  })
})

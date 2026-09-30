import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import type { LogoRowItem } from '@/components/marketing/logo-row'
import { AGENTIC_CHAINS } from '@/content/pages/agentic'
import { HOME_VENUES } from '@/content/pages/home'
import { INSTITUTIONAL_SIGNERS, INSTITUTIONAL_VENUES } from '@/content/pages/institutional'

/**
 * Guards against a white-only logo reaching the light theme.
 *
 * Logo rows sit on the page colour, #F6F6F6 in light. A mark drawn in white on
 * transparent is invisible there: the row renders as a set of empty boxes and
 * nothing in the build or a dark-mode screenshot says so. It has happened three
 * times — the institutional signers (caught in review), the home venues (#220)
 * and the institutional venues (#228) — because the assets arrive exported for
 * the dark design and the light theme is checked last, if at all.
 *
 * `LogoRow` has two answers, and every white mark must use one: `onLight`, a
 * dark-ink twin of the file, or `invertOnLight`, for monochrome marks.
 */

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const ROWS: Record<string, readonly LogoRowItem[]> = {
  HOME_VENUES,
  INSTITUTIONAL_VENUES,
  INSTITUTIONAL_SIGNERS,
  AGENTIC_CHAINS,
}

/** Alpha at or above which a pixel counts as part of the mark. */
const OPAQUE = 128

/** Every channel at or above this is near-white: under 1.1:1 against #F6F6F6. */
const NEAR_WHITE = 230

/**
 * Share of the mark's pixels that may be near-white before it counts as a white
 * mark. Coloured marks with a white highlight sit far below this; the offending
 * files were 100%.
 */
const MAX_WHITE_SHARE = 0.9

/** Share of a mark's opaque pixels that are near-white. Downscaled: a 1800px chain icon needs no more than this. */
async function whiteShare(src: string): Promise<number> {
  const { data } = await sharp(join(REPO, 'public', src))
    .resize({ width: 200, height: 200, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let opaque = 0
  let white = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < OPAQUE) continue
    opaque++
    if (data[i] >= NEAR_WHITE && data[i + 1] >= NEAR_WHITE && data[i + 2] >= NEAR_WHITE) white++
  }
  return opaque === 0 ? 0 : white / opaque
}

describe('logo rows in the light theme', () => {
  it('give every white mark a light-theme treatment', async () => {
    const offenders: string[] = []

    for (const [row, items] of Object.entries(ROWS)) {
      for (const item of items) {
        if (!item.logo || item.logo.onLight || item.invertOnLight) continue
        const share = await whiteShare(item.logo.src)
        if (share > MAX_WHITE_SHARE) {
          offenders.push(`  ${row} → ${item.name} (${item.logo.src}) — ${(share * 100).toFixed(0)}% white`)
        }
      }
    }

    expect(
      offenders,
      `\nThese marks are white on transparent and vanish on the light page. Give each an\n` +
        `\`onLight\` twin, or \`invertOnLight: true\` if it is monochrome:\n\n${offenders.join('\n')}\n`
    ).toEqual([])
  })

  it('still flags a white mark, so the measurement cannot pass silently', async () => {
    // The check above passes trivially if the measurement always returns 0.
    // The signers are known white-on-transparent SVGs.
    const src = INSTITUTIONAL_SIGNERS.find((item) => item.logo)?.logo?.src
    if (!src) throw new Error('INSTITUTIONAL_SIGNERS has no logo to measure')
    expect(await whiteShare(src)).toBeGreaterThan(MAX_WHITE_SHARE)
  })
})

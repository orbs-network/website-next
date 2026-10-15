#!/usr/bin/env node
/**
 * Check painted hero dots, not just computed mask properties (#315).
 * Run against a built site: node scripts/check-hero-grid.mjs --base http://localhost:3105
 * Add --browser webkit (and optionally --executable /path/to/WebKit) for Safari's engine.
 */
import { chromium, webkit } from 'playwright'
import sharp from 'sharp'

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  return index < 0 ? fallback : process.argv[index + 1]
}
const base = arg('base', 'http://localhost:3000')
const engine = arg('browser', 'chromium')
if (engine !== 'chromium' && engine !== 'webkit') throw new Error('Use --browser chromium or webkit')
const executablePath = arg('executable', undefined)
const browser = await (engine === 'webkit' ? webkit : chromium).launch({ executablePath })
let checks = 0
try {
  for (const dark of [false, true]) {
    for (const reduced of [false, true]) {
      for (const javaScriptEnabled of [false, true]) {
        const context = await browser.newContext({
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
          javaScriptEnabled,
          reducedMotion: reduced ? 'reduce' : 'no-preference',
          colorScheme: dark ? 'dark' : 'light',
        })
        try {
          const page = await context.newPage()
          await page.goto(base, { waitUntil: 'networkidle' })
          // evaluate remains available when page scripts are disabled. Set the
          // class explicitly: next-themes cannot initialise itself with no JS.
          await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark)
          const field = page.locator('.hero-dot-field')
          const grid = field.locator('svg.hero-dot-grid')
          const box = await field.boundingBox()
          if (!box) throw new Error('Hero field has no painted area')
          const clip = { x: box.x + 8, y: box.y + 16, width: Math.min(box.width - 16, 480), height: 80 }
          const before = await sharp(await page.screenshot({ clip }))
            .ensureAlpha()
            .raw()
            .toBuffer()
          await grid.evaluate((el) => {
            el.style.visibility = 'hidden'
          })
          const hidden = await sharp(await page.screenshot({ clip }))
            .ensureAlpha()
            .raw()
            .toBuffer()
          let painted = 0
          for (let i = 0; i < before.length; i += 4) {
            const delta =
              Math.abs(before[i] - hidden[i]) +
              Math.abs(before[i + 1] - hidden[i + 1]) +
              Math.abs(before[i + 2] - hidden[i + 2])
            if (delta > 12) painted++
          }
          if (painted < 32)
            throw new Error(`${engine}: missing dots (dark=${dark}, reduced=${reduced}, JS=${javaScriptEnabled})`)
          await grid.evaluate((el) => {
            el.style.visibility = ''
          })
          if (javaScriptEnabled && !reduced) {
            await page.locator('main canvas').waitFor()
            await page.touchscreen.tap(box.x + 30, box.y + 30)
            await page.waitForFunction(() => document.querySelector('main [data-facet-active]') !== null)
            await page.waitForFunction(() => document.querySelector('main [data-facet-active]') === null)
          }
          if (await field.evaluate((el) => getComputedStyle(el).maskImage !== 'none'))
            throw new Error('Resting grid remains masked')
          if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
            throw new Error('Horizontal overflow')
          checks++
          console.log(
            `${engine}: ${dark ? 'dark' : 'light'}, ${reduced ? 'reduced' : 'normal'} motion, JS ${javaScriptEnabled ? 'on' : 'off'}: ${painted} painted pixels`
          )
        } finally {
          await context.close()
        }
      }
    }
  }
} finally {
  await browser.close()
}
console.log(`Passed ${checks} real-pixel mobile grid checks in ${engine}.`)

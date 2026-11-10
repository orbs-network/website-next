#!/usr/bin/env node
/**
 * November 10 Figma geometry, against a built application or Vercel preview:
 * node scripts/check-refinement-layout.mjs --base http://localhost:3000
 *
 * Reference width: 1612px. Mobile behavior is covered separately by the
 * component stories and check:overflow. See docs/design-refinements-nov10.md
 * for source frames and deliberate differences from them.
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const index = process.argv.indexOf('--base')
const base = (index < 0 ? 'http://localhost:3000' : process.argv[index + 1]).replace(/\/$/, '')
const near = (actual, expected, label, tolerance = 1) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual}, expected ${expected} ±${tolerance}`)

const browser = await chromium.launch({ headless: true })
let cases = 0
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1612, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript((value) => localStorage.setItem('theme', value), theme)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const prefix of ['', '/ko']) {
      for (const product of ['dspot', 'dperps', 'execution-services']) {
        const route = `${prefix}/${product}/`
        const label = `${route} ${theme}`
        assert.equal((await page.goto(base + route)).status(), 200, label)
        await page.evaluate(() => document.fonts.ready)
        await page.waitForFunction(
          (dark) => document.documentElement.classList.contains('dark') === dark,
          theme === 'dark'
        )
        const glow = await page.locator('.closing-cta-glow').evaluate(async (node) => {
          const style = getComputedStyle(node)
          const image = new Image()
          image.src = style.backgroundImage.slice(5, -2)
          await image.decode()
          const field = node.getBoundingClientRect()
          const root = node.parentElement.getBoundingClientRect()
          return {
            src: image.src,
            intrinsicHeight: image.naturalHeight,
            bottomOffset: field.bottom - root.bottom,
            height: field.height,
            expectedHeight: Math.max(root.height, (root.width * 954) / 1612),
            pointerEvents: style.pointerEvents,
          }
        })
        assert(glow.src.endsWith(`closing-glow-${theme}.svg`), label + ' themed CTA artwork')
        assert.equal(glow.intrinsicHeight, 954, label + ' original CTA canvas')
        near(glow.bottomOffset, 0, label + ' CTA bottom alignment')
        near(glow.height, glow.expectedHeight, label + ' responsive CTA artwork')
        assert.equal(glow.pointerEvents, 'none', label + ' decorative CTA background')
        for (const heading of await page.locator('main h1, main h2').all()) {
          assert.equal(await heading.locator('br').count(), 0, label + ' forced heading break')
          assert.equal(
            await heading.evaluate((node) => getComputedStyle(node).whiteSpace),
            'normal',
            label + ' natural heading wrapping'
          )
        }
        if (product === 'dspot') {
          const track = page.locator('#modules ul').first()
          const geometry = await track.evaluate((node) => {
            const [first, second, , fourth] = [...node.children].map((child) => child.getBoundingClientRect())
            return {
              left: first.left,
              width: first.width,
              height: first.height,
              gap: second.left - first.right,
              preview: node.getBoundingClientRect().right - fourth.left,
            }
          })
          near(geometry.left, 40, label + ' rail inset')
          near(geometry.width, 499.2, label + ' card width', 2)
          if (!prefix) near(geometry.height, 440, label + ' card height', 2)
          near(geometry.gap, 16, label + ' card gap')
          assert(geometry.preview >= 24 && geometry.preview < geometry.width, label + ' next-card cue')
          assert.equal(await track.locator('a').count(), 0, label + ' unlinked cards')
          const contrast = await track
            .locator('li')
            .first()
            .evaluate((card) => ({
              title: getComputedStyle(card.querySelector('h3')).color,
              description: getComputedStyle(card.querySelector('p')).color,
            }))
          assert.equal(contrast.description, contrast.title, label + ' card description contrast')
        } else if (product === 'dperps') {
          const sections = await page
            .locator('main > div > div')
            .first()
            .evaluate((flow) => {
              const top = document.querySelector('main').getBoundingClientRect().top
              return [...flow.children].map((node) => {
                const rect = node.getBoundingClientRect()
                return { top: rect.top - top, height: rect.height }
              })
            })
          assert.equal(sections.length, 7, label + ' section count')
          near(sections[0].top, 0, label + ' hero starts at the same main boundary as Agentic')
          for (let i = 1; i < sections.length; i++) {
            near(sections[i].top - sections[i - 1].top - sections[i - 1].height, 96, label + ' section gap ' + i)
          }
          if (!prefix) {
            const heights = [810, 974, 747, 747, 280, 747, 289]
            // These are minimum layout dimensions, not fixed heights: natural
            // wrapping and translated text may make a section taller.
            sections.forEach((section, i) =>
              assert(section.height >= heights[i] - 3, label + ' minimum section height ' + i)
            )
          }
          const disclosure = page
            .getByRole('heading', { name: /Product status|제품 상태/ })
            .locator('xpath=ancestor::section[1]')
          const type = await disclosure
            .locator('p')
            .last()
            .evaluate((node) => ({ size: getComputedStyle(node).fontSize, line: getComputedStyle(node).lineHeight }))
          assert.deepEqual(type, { size: '14px', line: '23px' }, label + ' disclosure type')
          const venue = page.locator('main img[src*="/dperps/venue"]').filter({ visible: true }).first()
          assert.notEqual(
            await venue.evaluate((node) => getComputedStyle(node).filter),
            'none',
            label + ' venue outer glow'
          )
        } else {
          const columns = await page
            .locator('main img[src*="lambda-interface"]')
            .filter({ visible: true })
            .first()
            .evaluate((image) => {
              const graphic = image.closest('div').getBoundingClientRect()
              const copy = image.closest('div').parentElement.firstElementChild.getBoundingClientRect()
              return { copy: copy.width, graphic: graphic.width, gap: graphic.left - copy.right }
            })
          near(columns.copy, 650, label + ' copy width')
          near(columns.graphic, 560, label + ' illustration width')
          near(columns.gap, 164, label + ' column gap')
          for (const asset of ['lambda-interface', 'vm-interface']) {
            const graphic = page.locator(`main img[src*="${asset}"]`).filter({ visible: true }).first()
            assert.notEqual(
              await graphic.evaluate((node) => getComputedStyle(node).filter),
              'none',
              label + ' ' + asset + ' outer glow'
            )
          }
          const closingTop = await page
            .locator('main > div')
            .last()
            .evaluate(
              (node) => node.getBoundingClientRect().top - document.querySelector('main').getBoundingClientRect().top
            )
          near(closingTop, 1812, label + ' detached closing CTA', 2)
        }
        cases++
      }
    }
    // The full Korean homepage needs no CMS credentials. English uses the same
    // HomeHero and has its own Storybook first-fold/type regression checks.
    assert.equal((await page.goto(base + '/ko/')).status(), 200)
    await page.evaluate(() => document.fonts.ready)
    const hero = page.locator('main h1').locator('xpath=ancestor::section[1]')
    for (const height of [900, 1200]) {
      await page.setViewportSize({ width: 1612, height })
      assert(
        (await hero.evaluate((node) => node.getBoundingClientRect().bottom)) >= height,
        'Following home content enters first fold'
      )
      assert(
        (await hero.locator('dl').evaluate((node) => node.getBoundingClientRect().bottom)) <= height,
        'Home stats below first fold'
      )
      cases++
    }
    assert.deepEqual(errors, [])
    await context.close()
  }
  console.log(`Passed ${cases} Figma layout cases: EN/KO, both themes, desktop geometry and tall homepage folds.`)
} finally {
  await browser.close()
}

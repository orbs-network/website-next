#!/usr/bin/env node
/**
 * Screenshot the site for visual review of a frontend PR.
 *
 * Playwright is already a dev dependency — the Storybook tests run in real
 * Chromium through it — so this adds no install, only the capture harness that
 * every frontend PR so far has gone without.
 *
 * Usage:
 *   node scripts/visual-review.mjs                       # current working tree
 *   node scripts/visual-review.mjs --base main           # plus a baseline to compare
 *   node scripts/visual-review.mjs --routes /,/dtwap
 *   node scripts/visual-review.mjs --shots nav-products
 *
 * Output lands in `.visual/<label>/`, which is gitignored. Nothing is diffed:
 * this produces images for a human to look at, deliberately, because pixel
 * assertions in CI are a different decision with real maintenance cost.
 */

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { createServer } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Routes worth looking at by default: every page that actually renders today. */
const DEFAULT_ROUTES = ['/', '/dtwap/', '/dlimit/', '/blog/', '/news/', '/jp/', '/ko/dtwap/']

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

/** `next-themes` runs on `defaultTheme: 'system'`, so the OS preference drives it. */
const THEMES = ['light', 'dark']

/**
 * States that only exist after interaction.
 *
 * A dropdown panel is invisible on load, so a page-load screenshot cannot show
 * it — which is exactly how #90 reached review unseen. Deliberately a short
 * declared list rather than a general scripting API: the moment this becomes
 * "run arbitrary steps" it is a test framework, and there is already one.
 */
const SHOTS = {
  'nav-products': { route: '/', open: 'Products' },
  'nav-resources': { route: '/', open: 'Resources' },
  'nav-developers': { route: '/', open: 'Developers' },
}

function parseArgs(argv) {
  const args = { base: null, routes: DEFAULT_ROUTES, shots: Object.keys(SHOTS), out: '.visual' }

  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inlineValue] = argv[i].split('=')
    const value = inlineValue ?? argv[i + 1]
    const consumeNext = inlineValue === undefined

    if (flag === '--base') args.base = value
    else if (flag === '--routes') args.routes = value.split(',').filter(Boolean)
    else if (flag === '--shots') args.shots = value === 'none' ? [] : value.split(',').filter(Boolean)
    else if (flag === '--out') args.out = value
    else continue

    if (consumeNext) i += 1
  }

  const unknown = args.shots.filter((name) => !(name in SHOTS))
  if (unknown.length > 0) {
    throw new Error(`Unknown shot(s): ${unknown.join(', ')}. Known: ${Object.keys(SHOTS).join(', ')}`)
  }

  return args
}

function git(cwd, ...cmd) {
  return execFileSync('git', cmd, { cwd, encoding: 'utf8' }).trim()
}

/** An OS-assigned free port, so concurrent runs cannot collide. */
function freePort() {
  return new Promise((done, fail) => {
    const server = createServer()
    server.unref()
    server.on('error', fail)
    server.listen(0, () => {
      const { port } = server.address()
      server.close(() => done(port))
    })
  })
}

function run(cmd, cmdArgs, cwd) {
  execFileSync(cmd, cmdArgs, { cwd, stdio: 'inherit' })
}

/**
 * Serve a built app, resolving once it actually answers.
 *
 * Polls rather than sleeping: the build is warm on some runs and cold on
 * others, and a fixed wait is either flaky or wasted time.
 */
async function serve(cwd, port) {
  const child = spawn('npx', ['next', 'start', '-p', String(port)], {
    cwd,
    stdio: 'ignore',
    detached: true,
  })

  const deadline = Date.now() + 90_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`)
      if (response.ok) return child
    } catch {
      // Not up yet.
    }
    await new Promise((r) => setTimeout(r, 300))
  }

  stop(child)
  throw new Error(`Server did not come up on port ${port} within 90s`)
}

function stop(child) {
  try {
    // Negative pid kills the process group — `next start` spawns children that
    // would otherwise keep the port bound and break the next run.
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    // Already gone.
  }
}

/**
 * Navigate and let the page settle.
 *
 * Deliberately NOT `waitUntil: 'networkidle'`. Playwright discourages it, and
 * it timed out here in practice: an open dropdown holds a transition, and a
 * page that never reaches a quiet network — a poll, a font, a late image —
 * hangs the whole run. `load` plus an explicit wait for the header is a
 * condition this app actually reaches.
 */
async function load(page, url) {
  await page.goto(url, { waitUntil: 'load' })
  await page.locator('header, nav').first().waitFor({ state: 'visible' })
  // Fonts and the theme class settle a frame or two after load; without this
  // the first shot of a run can catch unstyled text.
  await page.waitForTimeout(300)
}

/** `/ko/dtwap/` -> `ko-dtwap`, `/` -> `home`. */
function slug(route) {
  const trimmed = route.replace(/^\/|\/$/g, '')
  return trimmed === '' ? 'home' : trimmed.replace(/\//g, '-')
}

async function capture(port, outDir, { routes, shots }) {
  const browser = await chromium.launch()
  mkdirSync(outDir, { recursive: true })

  try {
    for (const theme of THEMES) {
      for (const viewport of VIEWPORTS) {
        const context = await browser.newContext({
          colorScheme: theme,
          viewport: { width: viewport.width, height: viewport.height },
          // Screenshots of a half-loaded animation are noise, not signal.
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()

        for (const route of routes) {
          await load(page, `http://127.0.0.1:${port}${route}`)
          const file = join(outDir, `${slug(route)}__${viewport.name}__${theme}.png`)
          await page.screenshot({ path: file, fullPage: true })
          process.stdout.write(`  ${file}\n`)
        }

        // Interaction states are desktop-only: the dropdowns they open are not
        // rendered at mobile widths, so capturing them there is an empty panel.
        if (viewport.name === 'desktop') {
          for (const name of shots) {
            const shot = SHOTS[name]
            await load(page, `http://127.0.0.1:${port}${shot.route}`)

            const trigger = page.getByRole('button', { name: new RegExp(shot.open) })
            if ((await trigger.count()) === 0) {
              process.stdout.write(`  (skipped ${name}: no "${shot.open}" trigger on ${shot.route})\n`)
              continue
            }

            await trigger.first().click()
            await page.waitForTimeout(400)

            const file = join(outDir, `${name}__${viewport.name}__${theme}.png`)
            // Viewport-only: a full-page shot of an open dropdown is mostly the
            // page underneath it.
            await page.screenshot({ path: file })
            process.stdout.write(`  ${file}\n`)
          }
        }

        await context.close()
      }
    }
  } finally {
    await browser.close()
  }
}

/**
 * Build and shoot one checkout.
 *
 * The base ref is captured from a git WORKTREE rather than by checking the ref
 * out in place. Switching branches under the working tree would demand a clean
 * stash and would silently destroy uncommitted work — unacceptable in a tool
 * whose whole point is to be run mid-review.
 */
async function captureRef(cwd, label, outRoot, options) {
  process.stdout.write(`\n▶ ${label} (${cwd})\n`)

  run('npx', ['next', 'build'], cwd)

  const port = await freePort()
  const server = await serve(cwd, port)

  try {
    await capture(port, join(outRoot, label), options)
  } finally {
    stop(server)
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const outRoot = resolve(REPO, args.out)

  const head = git(REPO, 'rev-parse', '--abbrev-ref', 'HEAD')
  await captureRef(REPO, `after-${head.replace(/\//g, '-')}`, outRoot, args)

  if (!args.base) {
    process.stdout.write(`\nDone. ${outRoot}\n`)
    return
  }

  const worktree = join(outRoot, '.worktree')
  rmSync(worktree, { recursive: true, force: true })
  git(REPO, 'worktree', 'prune')
  git(REPO, 'worktree', 'add', '--detach', worktree, args.base)

  try {
    // node_modules and secrets are symlinked rather than reinstalled. A fresh
    // `npm ci` per run would add minutes; the lockfiles are compared below so
    // the shortcut cannot silently build the baseline against the wrong deps.
    const lockHere = git(REPO, 'hash-object', 'package-lock.json')
    const lockThere = git(worktree, 'hash-object', 'package-lock.json')

    if (lockHere !== lockThere) {
      throw new Error(
        `package-lock.json differs between HEAD and ${args.base}, so node_modules cannot be shared. ` +
          `Run the baseline capture separately from a checkout of ${args.base}.`
      )
    }

    symlinkSync(join(REPO, 'node_modules'), join(worktree, 'node_modules'), 'dir')
    if (existsSync(join(REPO, '.env.local'))) {
      symlinkSync(join(REPO, '.env.local'), join(worktree, '.env.local'))
    }

    await captureRef(worktree, `before-${args.base.replace(/\//g, '-')}`, outRoot, args)
  } finally {
    rmSync(worktree, { recursive: true, force: true })
    git(REPO, 'worktree', 'prune')
  }

  process.stdout.write(`\nDone. ${outRoot}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
})

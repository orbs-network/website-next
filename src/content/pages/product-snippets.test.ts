import { describe, expect, it } from 'vitest'
import { NOTIFICATION_SNIPPET, PRODUCT_SNIPPETS } from './product-snippets'

/**
 * The failure this guards against is a code panel that renders empty, which is
 * exactly what the legacy site does on 14 of the TON Access combinations and
 * what these three pages did until #167 — a bordered box, a copy button, and
 * nothing inside.
 *
 * It is invisible to types and to the build. A missing key yields `undefined`,
 * `<pre>{undefined}</pre>` renders an empty block, and nothing anywhere throws.
 */

const TABBED = { dtwap: PRODUCT_SNIPPETS.dtwap, dlimit: PRODUCT_SNIPPETS.dlimit }

describe('the product snippets', () => {
  for (const [page, snippets] of Object.entries(TABBED)) {
    describe(page, () => {
      it('has exactly the two tabs the page renders', () => {
        // The page reads `.react` and `.styles` by name. A renamed key would be
        // a type error there, but an EXTRA key is silent — a third sample that
        // exists, is shipped to the browser, and is never shown.
        expect(Object.keys(snippets).sort()).toEqual(['react', 'styles'])
      })

      it('has a non-empty sample in each tab', () => {
        for (const [tab, code] of Object.entries(snippets)) {
          expect(code, `${page}.${tab}`).toBeTypeOf('string')
          expect(code.trim().length, `${page}.${tab} length`).toBeGreaterThan(100)
        }
      })

      it('looks like the code it claims to be', () => {
        // Cheap, but it distinguishes a real sample from a placeholder or a
        // stray fragment of prose, which is the realistic way this file goes
        // wrong when someone updates the SDK.
        expect(snippets.react).toMatch(/const|function|=>/)
        expect(snippets.styles).toMatch(/[{:]/)
      })
    })
  }

  it('has the notification sample', () => {
    expect(NOTIFICATION_SNIPPET).toBeTypeOf('string')
    expect(NOTIFICATION_SNIPPET).toContain('class LowHealth')
  })

  it('carries no carriage returns', () => {
    // The legacy files are CRLF throughout. A `\r` surviving into a `<pre>`
    // renders as a stray character at the end of every line — visible to a
    // reader, invisible in a diff, and not caught by any other check here.
    const all = [...Object.values(TABBED).flatMap((page) => Object.values(page)), NOTIFICATION_SNIPPET]

    expect(all.filter((code) => code.includes('\r'))).toEqual([])
  })

  it('carries no HTML entities', () => {
    // The legacy page rendered these through `innerHTML` after highlight.js.
    // Ours puts them in a text node, so an `&lt;` that made it into the data
    // would be shown literally rather than as `<`.
    const all = [...Object.values(TABBED).flatMap((page) => Object.values(page)), NOTIFICATION_SNIPPET]

    expect(all.filter((code) => /&(lt|gt|amp|quot|#\d+);/.test(code))).toEqual([])
  })
})

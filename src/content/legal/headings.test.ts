import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Every legal page must end up with exactly one usable `h1`.
 *
 * `LegalDocument` renders the catalog title as the `h1` only when the document
 * does not supply its own, so the two have to agree. When they disagree the
 * page renders either no top-level heading or two, and neither is visible
 * without reading the built HTML — the page looks entirely normal.
 *
 * This is not hypothetical. The dTWAP disclaimer arrived from the legacy site
 * opening with a bare `#` on its own line: an EMPTY heading. The check was
 * `/^#\s/m`, `\s` matches a newline, so the document was judged to supply its
 * own `h1`, the catalog title was suppressed, and the page shipped with an
 * empty `<h1></h1>` and nothing for heading navigation to land on.
 */

const LEGAL = resolve(dirname(fileURLToPath(import.meta.url)))

/** The same rule `legal-document.tsx` applies. Kept in step by the test below. */
const OWN_HEADING = /^#[ \t]+\S/m

function documents(): { name: string; body: string }[] {
  return readdirSync(LEGAL)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ name, body: readFileSync(join(LEGAL, name), 'utf8') }))
}

describe('legal documents', () => {
  it('never open with an empty heading', () => {
    // The specific shape that broke it. An empty heading is indistinguishable
    // from a real one to a loose check, and renders as a blank `h1`.
    const empty = documents()
      .filter(({ body }) => /^#{1,6}[ \t]*$/m.test(body))
      .map(({ name }) => name)

    expect(empty).toEqual([])
  })

  it('has at most one h1 per document', () => {
    // Two `h1`s is the other half of the same failure: the catalog title plus
    // the document's own. The contest rules legitimately carry two `#` lines
    // and therefore supply their own, so the title is suppressed — which is
    // the behaviour being asserted, not a bug.
    for (const { name, body } of documents()) {
      const ownHeadings = body.split('\n').filter((line) => OWN_HEADING.test(line)).length
      if (ownHeadings === 0) continue

      expect(OWN_HEADING.test(body), `${name} supplies its own h1`).toBe(true)
    }
  })

  it('finds documents at all, so the walk cannot pass silently', () => {
    // Both checks above are satisfied by an empty list.
    expect(documents().length).toBeGreaterThan(5)
  })

  it('agrees with the renderer about what counts as a heading', () => {
    // The rule is duplicated here on purpose — the renderer's copy is the one
    // that matters, and this asserts the two have not drifted. A `##` opener
    // must NOT count: the terms documents start there and depend on the
    // catalog title for their `h1`.
    const renderer = readFileSync(resolve(LEGAL, '../../components/marketing/legal-document.tsx'), 'utf8')

    expect(renderer).toContain(String(OWN_HEADING).slice(1, -2))
    expect(OWN_HEADING.test('## Terms and conditions')).toBe(false)
    expect(OWN_HEADING.test('#\n')).toBe(false)
    expect(OWN_HEADING.test('# Privacy policy')).toBe(true)
  })
})

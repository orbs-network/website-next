import { describe, expect, it } from 'vitest'
import {
  TON_ACCESS_FLAVORS,
  TON_ACCESS_NETWORKS,
  TON_ACCESS_SNIPPETS,
  snippetKey,
  type TonAccessFlavor,
} from './ton-access'

/**
 * The selector and the snippet file have to agree in BOTH directions.
 *
 * A combination the reader can pick with no snippet behind it renders an empty
 * code block — which is the legacy page's actual behaviour for 14 of its 24
 * combinations, and the thing this page is built to avoid. A snippet with no
 * combination pointing at it is dead weight that looks like coverage.
 *
 * Both are only findable by checking, because neither shows up as a type error
 * and neither throws. Hence a test rather than a comment.
 */

function everyCombination(): { key: string; flavor: TonAccessFlavor; library: string; network: string }[] {
  return TON_ACCESS_FLAVORS.flatMap((flavor) =>
    flavor.libraries.flatMap((library) =>
      TON_ACCESS_NETWORKS.map((network) => ({
        key: snippetKey(flavor.id, library.id, network),
        flavor,
        library: library.id,
        network,
      }))
    )
  )
}

describe('the TON Access snippet matrix', () => {
  it('has a snippet for every combination the selector can reach', () => {
    const missing = everyCombination()
      .filter(({ key }) => !(key in TON_ACCESS_SNIPPETS))
      .map(({ key }) => key)

    expect(missing, `\nSelectable combinations with no snippet:\n  ${missing.join('\n  ')}\n`).toEqual([])
  })

  it('has no snippet the selector cannot reach', () => {
    const reachable = new Set(everyCombination().map(({ key }) => key))
    const orphaned = Object.keys(TON_ACCESS_SNIPPETS).filter((key) => !reachable.has(key))

    expect(orphaned, `\nSnippets nothing can select:\n  ${orphaned.join('\n  ')}\n`).toEqual([])
  })

  /**
   * The count is the point rather than a detail. If it ever reads 24, someone
   * has flattened the matrix back into "every library for every flavour" and
   * the empty code blocks are back.
   */
  it('covers ten combinations, not the twenty-four a flat matrix would', () => {
    expect(everyCombination()).toHaveLength(10)
    expect(Object.keys(TON_ACCESS_SNIPPETS)).toHaveLength(10)
  })

  it('offers every flavour at least one library', () => {
    const empty = TON_ACCESS_FLAVORS.filter((flavor) => flavor.libraries.length === 0).map((flavor) => flavor.id)

    expect(empty).toEqual([])
  })

  it('ships snippets with no stray carriage returns', () => {
    // The legacy dataset is CRLF throughout. Left in, every rendered line ends
    // with an invisible character that follows the reader into their editor
    // when they use the copy button.
    const withCr = Object.entries(TON_ACCESS_SNIPPETS)
      .filter(([, snippet]) => snippet.includes('\r'))
      .map(([key]) => key)

    expect(withCr).toEqual([])
  })
})

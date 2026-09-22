import { describe, expect, it } from 'vitest'
import { cn } from './utils'

/**
 * `cn` merges Tailwind classes, and the merge has to know that `text-h2` is a
 * FONT SIZE rather than a text colour.
 *
 * Without the `extendTailwindMerge` hint in `utils.ts`, tailwind-merge sorts
 * the repo's custom `text-*` utilities into the text-colour group and
 * deduplicates them against `text-fg` — silently dropping the size. That has
 * already happened once and was fixed in #12.
 *
 * It is worth being precise about why this needs a test rather than a comment.
 * The failure produces no error, no type error and no warning: the class simply
 * is not in the output, so a heading renders at body size on whichever
 * components happened to combine a size and a colour. Every existing test
 * asserts on class names it passes IN, not on what `cn` gives back, so all of
 * them keep passing.
 *
 * The specific thing that makes this a live risk is that the hint is coupled to
 * tailwind-merge's internal class-group names. A minor release that renamed or
 * restructured `font-size` would break it without breaking the build — which is
 * exactly what a dependency bump looks like the day before someone notices the
 * type scale is wrong.
 */

/** Every custom size in `tailwind.config.ts`, which is what the hint enumerates. */
const SIZES = ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'detail', 'field'] as const

describe('cn', () => {
  it('keeps a custom font size alongside a text colour', () => {
    // THE regression. Both must survive: they are different properties that
    // happen to share the `text-` prefix.
    for (const size of SIZES) {
      const result = cn(`text-${size}`, 'text-fg')

      expect(result, `text-${size} dropped`).toContain(`text-${size}`)
      expect(result, `text-fg dropped next to text-${size}`).toContain('text-fg')
    }
  })

  it('keeps the colour when it comes first', () => {
    // Order matters to tailwind-merge — the later class wins within a group —
    // so a hint that only worked in one order would pass a one-sided check.
    for (const size of SIZES) {
      const result = cn('text-fg-muted', `text-${size}`)

      expect(result).toContain(`text-${size}`)
      expect(result).toContain('text-fg-muted')
    }
  })

  it('still deduplicates two font sizes, keeping the last', () => {
    // The hint must not merely exempt these classes from merging: two sizes on
    // one element is a real conflict and the later one has to win. This is what
    // `/smart-contracts` relies on to step `text-h2` down to `text-h3`.
    expect(cn('text-h2', 'text-h3')).toBe('text-h3')
    expect(cn('text-h3', 'text-h2')).toBe('text-h2')
  })

  it('leaves a responsive variant of the same size alone', () => {
    // `text-h3 sm:text-h2` is one size at each breakpoint, not a conflict.
    // Collapsing it would silently undo every responsive type step in the repo.
    const result = cn('text-h3', 'sm:text-h2')

    expect(result).toContain('text-h3')
    expect(result).toContain('sm:text-h2')
  })

  it('still deduplicates two text colours', () => {
    // The control. If the hint were too broad and swallowed the colour group,
    // this would return both and nothing else here would notice.
    expect(cn('text-fg', 'text-fg-muted')).toBe('text-fg-muted')
  })

  it('merges ordinary Tailwind classes as normal', () => {
    // Confirms the extension did not disturb the stock behaviour.
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })
})

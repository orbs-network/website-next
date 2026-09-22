'use client'

import * as React from 'react'
import { OrbsLogo } from '@/components/icons'
import { cn } from '@/lib/utils'

/**
 * A vertical list of features, each revealing a statement panel.
 *
 * Built on the ARIA tabs pattern, because that is genuinely what it is: a set
 * of labels where exactly one is selected and each controls a panel. That
 * brings obligations most hand-rolled versions skip —
 *
 *  - arrow keys move between tabs, Home and End jump to the ends
 *  - only the SELECTED tab is in the tab order, so Tab moves past the whole
 *    group rather than through eight stops
 *  - each panel is labelled by its tab, so a screen reader announces what it
 *    belongs to
 *
 * Deliberately not `<details>`. That was the right primitive for the FAQ, where
 * several answers can be open and each is independent prose. Here exactly one
 * is shown at a time and the panel is a single large statement — an accordion
 * would let a reader open none and see an empty column.
 *
 * Roving focus is managed rather than relying on `autoFocus`: moving focus on
 * arrow keys is the part of the pattern that makes it usable, and it is also
 * the part everyone forgets.
 */

export type FeatureTab = {
  id: string
  /** The label in the list. */
  title: string
  /** The statement revealed when it is selected. */
  panel: string
  titleLang?: string
  panelLang?: string
}

export function FeatureTabs({ tabs, className }: { tabs: readonly FeatureTab[]; className?: string }) {
  const [selected, setSelected] = React.useState(0)
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const baseId = React.useId()

  function move(to: number) {
    const next = (to + tabs.length) % tabs.length

    setSelected(next)
    // Focus follows selection. Without this the arrow key changes the panel
    // but leaves focus behind, so the next arrow key starts from the old
    // position and the list feels broken.
    refs.current[next]?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const keys: Record<string, number | undefined> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    }

    const to = keys[event.key]
    if (to === undefined) return

    event.preventDefault()
    move(to)
  }

  const active = tabs[selected]

  return (
    <div className={cn('grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]', className)}>
      {/*
        `min-w-0` on both columns, and it is load-bearing rather than tidy. A
        grid item defaults to `min-width: auto`, so it refuses to shrink below
        its content's min-content width — and the panel's statement is set in
        `text-h2`, a fixed 56px, where the single word "counterparty" measures
        364px. With the padding that pinned this section at 428px inside a
        390px viewport and scrolled the whole page sideways. Measured, not
        guessed: `document.scrollWidth` was 448 against a `clientWidth` of 390.
      */}
      <div role="tablist" aria-orientation="vertical" className="flex min-w-0 flex-col">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={index === selected}
            aria-controls={`${baseId}-panel-${tab.id}`}
            // Only the selected tab is reachable by Tab. The arrow keys move
            // within the group — that is the whole point of the pattern, and
            // `0` on every tab would put eight stops in the page's tab order.
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            lang={tab.titleLang}
            className={cn(
              'border-b border-border py-6 text-start text-h4 transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              index === selected ? 'text-accent-primary' : 'text-fg hover:text-accent-primary'
            )}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.id}`}
        aria-labelledby={`${baseId}-tab-${active.id}`}
        // `tabIndex={0}` so a keyboard user can Tab from the selected tab
        // straight into the panel it just revealed, which is where the content
        // they asked for actually is.
        tabIndex={0}
        lang={active.panelLang}
        className={cn(
          /*
            900px, from the design rather than from the type scale: the panel
            is `Frame 2147223102` at 910x900 inside a 1305px section, and it is
            the tallest thing in that row. At `34rem` it stopped level with the
            tab list, which reads as a tile beside a list instead of the full-
            height field the design draws — and it is why the whole section
            measured 1083 against 1305.
            `lg:` because on a phone the list stacks above it and 900px of
            gradient under eight tabs is a screen and a half of nothing.
          */
          'flex min-h-[34rem] min-w-0 flex-col justify-between rounded-sm p-8 sm:p-12 lg:min-h-[900px]',
          // A CSS gradient rather than an exported image: it is a gradient, so
          // it scales to any box at zero bytes and cannot go blurry.
          'bg-gradient-to-br from-periwinkle-200 via-periwinkle-400 to-indigo-600',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        {/*
          Steps down on small screens. `text-h2` has no responsive step — the
          type scale is missing one, which is #108 — so at a phone width this
          line alone is wider than the viewport. `break-words` is the backstop
          for a longer word than any of these.
        */}
        <p className="max-w-2xl text-balance break-words text-h3 text-neutral-900 sm:text-h2">{active.panel}</p>

        {/*
          The design puts the Orbs lockup in the bottom-left of the panel
          (`Logo`, 205x61). `aria-hidden` because it is decoration inside a
          panel that already has its statement — a second "Orbs" announced
          after the sentence adds nothing for a screen reader.
          Hidden until `lg`, where the panel is tall enough to have a bottom
          worth anchoring; below that the statement fills it.
          `lg:inline-flex`, not `lg:block`: the lockup is an `inline-flex` row
          of mark plus wordmark, and `block` won that merge and stacked them.
          `text-neutral-900` explicitly, for the same reason the statement above
          does: this panel's gradient is fixed in both themes, while the band
          around it inverts. `variant="dark"` draws from `currentColor`, so
          without this the lockup turned near-white on pale periwinkle whenever
          a reader was in the light theme.
          `text-[2.75rem]` because `OrbsLogo` sizes its mark in `em` and would
          otherwise inherit the 16px body size, landing at about 22px against
          the design's 61px lockup.
        */}
        <OrbsLogo
          variant="dark"
          aria-hidden
          className="hidden self-start text-[2.75rem] text-neutral-900 lg:inline-flex"
        />
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Three dropdowns over a library of code snippets.
 *
 * The library options are derived from the chosen API flavour rather than being
 * a fixed list. That is the whole point: on the legacy page every flavour offers
 * all four libraries, so 14 of its 24 combinations render an EMPTY code block —
 * "Raw ADNL Proxy" with "NPM TonWeb" among them. ADNL is not HTTP, so the HTTP
 * libraries genuinely cannot speak it; the combination is not missing data, it
 * is not a thing. Here it stops being selectable.
 *
 * Native `<select>` elements, not a custom dropdown. They are keyboard
 * operable, screen-reader labelled, and on a phone they open the platform
 * picker — all of which a div-with-listeners has to reimplement and usually
 * gets wrong. The legacy page rolled its own.
 *
 * No syntax highlighting. It would mean a highlighter in the bundle or
 * `dangerouslySetInnerHTML` around build-time HTML, and this repo has avoided
 * the latter deliberately. Ten short snippets in a monospace block with a copy
 * button is the whole job.
 */

export type SnippetLibrary = { id: string; label: string }

export type SnippetFlavor = {
  id: string
  label: string
  libraries: readonly SnippetLibrary[]
}

export type SnippetSelectorLabels = {
  flavor: string
  library: string
  network: string
  copy: string
  copied: string
}

export type SnippetNetwork = { id: string; label: string }

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { id: string; label: string }[]
  onChange: (value: string) => void
}) {
  const id = React.useId()

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-detail font-medium text-fg-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-12 w-full rounded-sm border border-border bg-transparent px-3 text-field text-fg',
          'transition-colors focus:border-accent-primary focus:outline-none',
          'focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SnippetSelector({
  flavors,
  networks,
  snippets,
  labels,
  className,
}: {
  flavors: readonly SnippetFlavor[]
  networks: readonly SnippetNetwork[]
  /** Keyed `<flavor>.<library>.<network>`. */
  snippets: Readonly<Record<string, string>>
  labels: SnippetSelectorLabels
  className?: string
}) {
  const [flavorId, setFlavorId] = React.useState(flavors[0].id)
  const [libraryId, setLibraryId] = React.useState(flavors[0].libraries[0].id)
  const [networkId, setNetworkId] = React.useState(networks[0].id)
  const [copied, setCopied] = React.useState(false)

  const flavor = flavors.find((candidate) => candidate.id === flavorId) ?? flavors[0]

  /**
   * Changing the flavour can invalidate the chosen library, so the library
   * moves with it. Kept in the event handler rather than an effect that
   * corrects state after the fact — the latter renders one frame showing a pair
   * that cannot exist, which is exactly the state this component is built to
   * make unreachable.
   */
  function chooseFlavor(nextId: string) {
    const next = flavors.find((candidate) => candidate.id === nextId) ?? flavors[0]

    setFlavorId(next.id)

    // Keep the current library if the new flavour also supports it — someone
    // comparing v2 and v4 for `NPM ton` should not have their choice reset.
    if (!next.libraries.some((library) => library.id === libraryId)) {
      setLibraryId(next.libraries[0].id)
    }
  }

  const key = `${flavor.id}.${libraryId}.${networkId}`
  const snippet = snippets[key]

  async function copy() {
    if (!snippet) return

    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      // Not a permanent state: the label has to go back, or the next copy gives
      // no feedback at all.
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Denied permission, or an insecure context. The snippet is on screen and
      // selectable, so there is nothing useful to say and nothing broken.
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label={labels.flavor} value={flavor.id} options={flavors} onChange={chooseFlavor} />
        <Select label={labels.library} value={libraryId} options={flavor.libraries} onChange={setLibraryId} />
        <Select label={labels.network} value={networkId} options={networks} onChange={setNetworkId} />
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-border">
        {/*
          The copy button sits in its own bar rather than floating over the
          code. Absolutely positioning it meant padding the `pre` down to clear
          it, which left a band of empty space above every snippet and still
          overlapped the first line on a narrow viewport. A row is simpler and
          cannot collide with anything.
        */}
        <div className="flex justify-end border-b border-border bg-surface px-3 py-2">
          <button
            type="button"
            onClick={copy}
            className={cn(
              'rounded-sm px-3 py-1 text-detail font-medium transition-colors',
              'hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
          >
            {copied ? labels.copied : labels.copy}
          </button>
        </div>

        {/*
          `lang="en"` because it is source code, not prose — a screen reader in
          a Korean document should not read `getHttpEndpoint` as Korean. Same
          per-string rule the rest of the site follows, applied to the one kind
          of text that is never translated.

          `tabIndex` so a keyboard user can scroll it. A `pre` that scrolls but
          cannot be focused is unreachable without a mouse.
        */}
        <pre
          lang="en"
          tabIndex={0}
          className={cn(
            // Same surface as the toolbar above it, so the box reads as one
            // card. Leaving the `pre` transparent showed the page colour
            // through and made the code area look like a gap in the card.
            'overflow-x-auto bg-surface p-5',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring'
          )}
        >
          <code className="text-detail leading-relaxed">{snippet}</code>
        </pre>
      </div>

      {/*
        The copy outcome, announced rather than only shown. The button's own
        label changing is a visual cue; without this a screen-reader user gets
        no confirmation that anything happened.
      */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? labels.copied : ''}
      </p>
    </div>
  )
}

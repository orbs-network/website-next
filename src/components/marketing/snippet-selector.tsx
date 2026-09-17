'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { CodeBlock } from './code-block'

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
 * The code panel itself is `CodeBlock`, shared with the pages that show a
 * single sample rather than a matrix of them.
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

  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label={labels.flavor} value={flavor.id} options={flavors} onChange={chooseFlavor} />
        <Select label={labels.library} value={libraryId} options={flavor.libraries} onChange={setLibraryId} />
        <Select label={labels.network} value={networkId} options={networks} onChange={setNetworkId} />
      </div>

      <CodeBlock code={snippet} labels={labels} className="mt-6" />
    </div>
  )
}

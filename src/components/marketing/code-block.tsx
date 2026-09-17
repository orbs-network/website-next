'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * A code sample with a copy button.
 *
 * Lifted out of `SnippetSelector`, which had the only copy of this, when the
 * dTWAP, dLIMIT and notification pages needed the same thing — four callers of
 * one arrangement is three chances to get the focus ring, the `lang` or the
 * copy feedback subtly different.
 *
 * No syntax highlighting, the same decision `SnippetSelector` made and for the
 * same reasons: it would mean a highlighter in the bundle or
 * `dangerouslySetInnerHTML` around build-time HTML, and this repo has avoided
 * the latter deliberately. The legacy site used highlight.js client-side, which
 * also meant the code was invisible until the script ran.
 */

export type CopyLabels = {
  copy: string
  copied: string
}

export function CodeBlock({ code, labels, className }: { code: string; labels: CopyLabels; className?: string }) {
  const [copied, setCopied] = React.useState(false)

  /*
    No reset when `code` changes, deliberately.

    The first draft reset `copied` in an effect so that switching tabs could not
    leave "Copied" sitting over a sample nobody copied. The lint rule against
    setState-in-an-effect is what prompted a second look, and the reset turned
    out to be unnecessary: the tabbed callers render one instance per tab, each
    with its own state, so `code` never changes underneath a mounted block.

    `SnippetSelector` is the one caller where it does change, through the
    dropdowns. There the label can lag by up to the two-second timeout, which is
    exactly what it did before this component existed — preserved rather than
    quietly altered in a port.
  */

  async function copy() {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      // Not a permanent state: the label has to go back, or the next copy gives
      // no feedback at all.
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Denied permission, or an insecure context. The code is on screen and
      // selectable, so there is nothing useful to say and nothing broken.
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-sm border border-border', className)}>
      {/*
        The copy button sits in its own bar rather than floating over the code.
        Absolutely positioning it meant padding the `pre` down to clear it,
        which left a band of empty space above every snippet and still
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
        `lang="en"` because it is source code, not prose — a screen reader in a
        Korean document should not read `getHttpEndpoint` as Korean. Same
        per-string rule the rest of the site follows, applied to the one kind of
        text that is never translated.

        `tabIndex` so a keyboard user can scroll it. A `pre` that scrolls but
        cannot be focused is unreachable without a mouse.
      */}
      <pre
        lang="en"
        tabIndex={0}
        className={cn(
          // Same surface as the toolbar above it, so the box reads as one card.
          // Leaving the `pre` transparent showed the page colour through and
          // made the code area look like a gap in the card.
          'overflow-x-auto bg-surface p-5',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring'
        )}
      >
        <code className="text-detail leading-relaxed">{code}</code>
      </pre>

      {/*
        The copy outcome, announced rather than only shown. The button's own
        label changing is a visual cue; without this a screen-reader user gets no
        confirmation that anything happened.
      */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? labels.copied : ''}
      </p>
    </div>
  )
}

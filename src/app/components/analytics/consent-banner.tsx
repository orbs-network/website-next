'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { CONSENT_STORAGE_KEY, consentState, type ConsentChoice } from './consent'
import { cn } from '@/lib/utils'

/**
 * The cookie banner, and the thing that makes it real.
 *
 * Accept and Reject both record the choice and both call `gtag('consent',
 * 'update', ...)`, so rejecting genuinely denies storage rather than dismissing
 * a dialog. That is the entire difference from the legacy banner, whose Reject
 * button wrote a key nothing read while the tag tracked on regardless.
 *
 * Rendered by `RootShell` on every page, and only shown when no choice has been
 * recorded. Copy comes in as props: the shell resolves it server-side, so the
 * catalog namespace does not have to be serialised into the RSC payload of all
 * 456 prerendered post pages for a banner most visitors see once.
 */

declare global {
  interface Window {
    // `@next/third-parties` and the bootstrap script both define this. Declared
    // rather than asserted at the call site so the shape is checked.
    gtag?: (command: 'consent', action: 'update', state: ReturnType<typeof consentState>) => void
  }
}

export type ConsentBannerLabels = {
  message: string
  accept: string
  reject: string
  policyLabel: string
  policyHref: string
}

/** Subscribers in THIS document. `storage` only fires in OTHER tabs. */
const listeners = new Set<() => void>()

/**
 * The choice, when it could not be persisted.
 *
 * `localStorage.setItem` can fail while `getItem` still works — an exhausted
 * quota is the usual way. Without this the snapshot would keep reporting
 * "undecided" after the visitor answered, so the banner would never close and
 * would come back on every page: a consent dialog that cannot be dismissed,
 * for someone who has already answered it twice.
 */
let inMemoryChoice: string | null = null

function readStored(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    // Storage unavailable entirely: cookies blocked, or private mode in some
    // engines. Nothing can be recorded, so nothing is asked — the banner would
    // otherwise return on every page load forever, and the default is denied.
    return 'denied'
  }
}

/** `null` means undecided — distinct from a recorded `'denied'`. */
function getSnapshot(): string | null {
  return inMemoryChoice ?? readStored()
}

/**
 * Apply a choice to THIS document's tag.
 *
 * Consent Mode state is per document, so a grant recorded in another tab does
 * not reach this one. Without this, a visitor with two tabs open who accepts in
 * the first would watch the banner vanish in the second while it quietly stayed
 * denied until reload — consent given and not honoured, which is the same
 * shape of failure as the legacy banner, just in the generous direction.
 */
function applyToTag(choice: string | null) {
  if (choice !== 'granted' && choice !== 'denied') return

  window.gtag?.('consent', 'update', consentState(choice))
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)

  const onStorage = (event: StorageEvent) => {
    // `key` is null when storage is cleared wholesale, which also concerns us.
    if (event.key !== null && event.key !== CONSENT_STORAGE_KEY) return

    // Another tab wrote, so storage is now the authority and any unpersisted
    // value here is stale. Leaving it would let this tab report `granted` from
    // a failed write while the tag had just been set to `denied` elsewhere.
    inMemoryChoice = null

    // A MISSING value means denied, not "leave it as it was". Clearing site
    // data in another tab removes the key, and without this the banner would
    // reappear here — asking again — while the tag carried on granted from the
    // earlier acceptance. That is tracking somebody through the act of
    // withdrawing, which is the worst version of this bug rather than a corner
    // of it.
    applyToTag(readStored() ?? 'denied')
    onChange()
  }

  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * During SSR and hydration there is no storage to read, so the banner is absent
 * from the server HTML and appears once the real snapshot arrives.
 *
 * The other way round — render it, then hide it when storage says otherwise —
 * shows the banner for a frame to every returning visitor who already answered.
 */
function getServerSnapshot(): string | null {
  return 'denied'
}

/**
 * Clears the unpersisted choice. TEST ONLY.
 *
 * `inMemoryChoice` is module state, so it survives between stories in a shared
 * browser context and would carry one story's answer into the next. Exported
 * rather than reached around, so the coupling is visible from both sides.
 */
export function resetConsentMemoryForTests() {
  inMemoryChoice = null
}

export function ConsentBanner({ labels, lang }: { labels: ConsentBannerLabels; lang?: string }) {
  /*
    `useSyncExternalStore` rather than reading storage in an effect. The effect
    version sets state during mount, which lints as a cascading render and is
    the wrong shape for what this is: localStorage IS an external store, and
    this is the hook for subscribing to one.

    It also gets cross-tab agreement for nothing — answer in one tab and the
    banner disappears in the others, instead of each tab holding its own idea of
    whether the question is still open.
  */
  const choice = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function choose(next: ConsentChoice) {
    // Held in memory FIRST, so the answer sticks for this session even if it
    // cannot be written. Persistence is what makes it survive a reload; it is
    // not what makes it take effect.
    inMemoryChoice = next

    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, next)
    } catch {
      // Quota, or a blocked store. The choice still applies to this visit.
    }

    // Updated whichever way they answered. A "reject" that only closed the
    // banner would leave the tag in whatever state a previous grant had left
    // it, which is how a consent control becomes decorative.
    applyToTag(next)
    for (const listener of listeners) listener()
  }

  if (choice !== null) return null

  return (
    <div
      // `role="dialog"` would be wrong: this does not trap focus and must not.
      // It is a complementary region the reader can ignore, reach by Tab, or
      // answer at any point.
      role="region"
      aria-label={labels.message}
      lang={lang}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface',
        'px-5 py-4 sm:px-8',
        // `pb-[env(safe-area-inset-bottom)]` so the buttons clear the home
        // indicator on a phone rather than sitting under it.
        'pb-[max(1rem,env(safe-area-inset-bottom))]'
      )}
    >
      <div className="container mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-detail leading-relaxed text-fg-muted">
          {labels.message}{' '}
          <a
            href={labels.policyHref}
            className="text-accent-primary underline underline-offset-4 hover:text-accent-primary-hover"
          >
            {labels.policyLabel}
          </a>
        </p>

        <div className="flex shrink-0 gap-3">
          {/*
            BOTH `secondary`, so neither reads as the expected answer.

            The first version made Accept the primary button — filled, with the
            house arrow — beside an outlined Reject. That is the standard
            arrangement and it is the exact nudge regulators single out: equally
            available in the markup, unequal to the eye. Consent that was
            steered is not a defence, so the two match.

            Reject first in the DOM as well, so it is the first of the pair a
            keyboard or screen-reader user reaches rather than the one they have
            to pass over.
          */}
          <Button type="button" variant="secondary" onClick={() => choose('denied')}>
            {labels.reject}
          </Button>
          <Button type="button" variant="secondary" onClick={() => choose('granted')}>
            {labels.accept}
          </Button>
        </div>
      </div>
    </div>
  )
}

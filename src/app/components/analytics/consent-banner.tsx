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

/**
 * Subscribers for writes made in THIS tab.
 *
 * The `storage` event only fires in other tabs, so a choice made here would not
 * otherwise notify our own snapshot.
 */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)

  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** `null` means undecided — distinct from a recorded `'denied'`. */
function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    // Storage unavailable: a browser with cookies blocked, or private mode in
    // some engines. Nothing can be recorded, so nothing is asked — without
    // persistence the banner would return on every page load forever, and the
    // default is already denied.
    return 'denied'
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
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, next)
    } catch {
      // The choice still applies to this page load even if it cannot be kept.
    }

    // Updated whichever way they answered. A "reject" that only closed the
    // banner would leave the tag in whatever state a previous grant had left
    // it, which is how a consent control becomes decorative.
    window.gtag?.('consent', 'update', consentState(next))
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

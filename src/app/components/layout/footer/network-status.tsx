'use client'

import * as React from 'react'
import type { NetworkStatus } from './read-network-status'
import { cn } from '@/lib/utils'

/**
 * The footer's network status indicator.
 *
 * The 3.4 design draws a green dot and "NETWORK STATUS: GOOD". Hardcoding that
 * is the one thing this must not do: it is a claim about production that cannot
 * be false, on a page that would keep making it during an outage. So it is read
 * from the network's own status service, and when that cannot be read the
 * indicator does not render at all — decided with Sarbloc, and the right way
 * round. A missing dot is a smaller problem than a green one that is lying.
 *
 * The 500 KB feed is read on the SERVER, by `/api/network-status`, which is
 * also where the caching lives — the reader gets about thirty bytes. Doing that
 * read in this component directly was the first attempt and it put a five
 * minute revalidate window on all 103 routes, because the footer renders on
 * every one of them. See the route for why that matters.
 */

export type NetworkStatusLabels = {
  /** e.g. "Network status" */
  label: string
  good: string
  degraded: string
}

export function NetworkStatusIndicator({ labels, href }: { labels: NetworkStatusLabels; href: string }) {
  /*
    `null` until a reading arrives, and `null` again if one never does — the
    component renders nothing in both cases. Decided with Sarbloc and it is the
    right way round: a missing dot is a smaller problem than a green one that
    is lying during an outage.
  */
  const [status, setStatus] = React.useState<NetworkStatus | null>(null)

  React.useEffect(() => {
    let cancelled = false

    fetch('/api/network-status')
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && (body?.status === 'good' || body?.status === 'degraded')) setStatus(body.status)
      })
      .catch(() => {
        // Offline, or the route returned 503. Nothing to say.
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (status === null) return null

  const label = `${labels.label}: ${status === 'good' ? labels.good : labels.degraded}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 text-detail font-medium uppercase tracking-wide text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {/*
        The dot is decoration: the label already says the state in words. An
        indicator that carries its meaning ONLY in colour is the classic
        failure — invisible to a screen reader and ambiguous to the ~8% of men
        with a red/green deficiency, who are exactly the readers a green-versus-
        amber dot is aimed at.
      */}
      <span
        aria-hidden
        className={cn('size-2 shrink-0 rounded-full', status === 'good' ? 'bg-emerald-500' : 'bg-amber-500')}
      />
      {label}
    </a>
  )
}

import type { Metadata } from 'next'
import { NotFoundPage } from '@/app/components/not-found-page'

/**
 * Without this the page inherits the root layout's title and a missing URL
 * renders as "Orbs" in the browser tab and in any crawled snippet, looking like
 * a normal page despite the 404 status.
 */
export const metadata: Metadata = {
  title: 'Page not found',
}

/** 404 boundary for this locale group — see NotFoundPage for why each needs one. */
export default function NotFound() {
  return <NotFoundPage locale="en" />
}

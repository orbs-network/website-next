import type { Metadata } from 'next'
import { DsltpPage } from '@/app/marketing/dsltp'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/dsltp'

/**
 * Uses the same helper as the Korean route so the two cannot describe the same
 * page differently. There is no Japanese route: the page has no Japanese
 * version — see `AVAILABILITY`.
 */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <DsltpPage locale="en" />
}

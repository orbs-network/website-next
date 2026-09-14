import type { Metadata } from 'next'
import { OverviewPage } from '@/app/marketing/overview'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/overview'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <OverviewPage locale="en" />
}

import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { PerpetualHubPage } from '@/app/marketing/perpetual-hub'

const PATH = '/perpetual-hub'

/** Same helper as the Korean route. There is no Japanese route — see `AVAILABILITY`. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <PerpetualHubPage locale="en" />
}

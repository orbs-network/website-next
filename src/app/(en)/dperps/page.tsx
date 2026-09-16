import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { DperpsPage } from '@/app/marketing/dperps'

const PATH = '/dperps'

/** Same helper as the Korean route. There is no Japanese route — see `AVAILABILITY`. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <DperpsPage locale="en" />
}

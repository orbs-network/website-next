import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { VenuesPage } from '@/app/marketing/venues'

const PATH = '/venues'

/** English only — see `AVAILABILITY`. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <VenuesPage locale="en" />
}

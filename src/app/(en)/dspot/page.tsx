import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { DspotPage } from '@/app/marketing/dspot'

const PATH = '/dspot'

/** English only — see `AVAILABILITY`. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <DspotPage locale="en" />
}

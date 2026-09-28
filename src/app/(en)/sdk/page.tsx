import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { SdkPage } from '@/app/marketing/sdk'

const PATH = '/sdk'

/** English only — see `AVAILABILITY`. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <SdkPage locale="en" />
}

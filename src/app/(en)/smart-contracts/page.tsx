import type { Metadata } from 'next'
import { SmartContractsPage } from '@/app/marketing/smart-contracts'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/smart-contracts'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <SmartContractsPage locale="en" />
}

import type { Metadata } from 'next'
import { EcosystemPage } from '@/app/marketing/ecosystem'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/ecosystem'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <EcosystemPage locale="en" />
}

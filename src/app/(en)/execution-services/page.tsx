import type { Metadata } from 'next'
import { ExecutionServicesPage } from '@/app/marketing/execution-services'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/execution-services'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <ExecutionServicesPage locale="en" />
}

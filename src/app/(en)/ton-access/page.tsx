import type { Metadata } from 'next'
import { TonAccessPage } from '@/app/marketing/ton-access'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/ton-access'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <TonAccessPage locale="en" />
}

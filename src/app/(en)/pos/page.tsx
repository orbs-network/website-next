import type { Metadata } from 'next'
import { PosPage } from '@/app/marketing/pos'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/pos'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <PosPage locale="en" />
}

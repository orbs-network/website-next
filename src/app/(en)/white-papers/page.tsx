import type { Metadata } from 'next'
import { WhitePapersPage } from '@/app/marketing/white-papers'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/white-papers'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <WhitePapersPage locale="en" />
}

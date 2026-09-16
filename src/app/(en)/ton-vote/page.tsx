import type { Metadata } from 'next'
import { TonVotePage } from '@/app/marketing/ton-vote'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/ton-vote'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <TonVotePage locale="en" />
}

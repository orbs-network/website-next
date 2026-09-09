import type { Metadata } from 'next'
import { AgenticPage } from '@/app/marketing/agentic'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/agentic'

/** Same helper as the Korean route. No Japanese route — see `AVAILABILITY`. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <AgenticPage locale="en" />
}

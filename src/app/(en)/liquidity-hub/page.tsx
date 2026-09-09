import type { Metadata } from 'next'
import { LiquidityHubPage } from '@/app/marketing/liquidity-hub'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/liquidity-hub'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <LiquidityHubPage locale="en" />
}

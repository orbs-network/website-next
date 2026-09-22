import type { Metadata } from 'next'
import { LegalPage } from '@/app/marketing/legal'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/ORBS-NFT-CONTEST-OFFICIAL-RULES'

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <LegalPage path={PATH} locale="en" namespace="pages.nftContestRules" />
}

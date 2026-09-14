import type { Metadata } from 'next'
import { LegalPage } from '@/app/marketing/legal'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/terms-of-use'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function TermsOfUse() {
  return <LegalPage path={PATH} locale="en" namespace="pages.termsOfUse" />
}

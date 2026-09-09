import type { Metadata } from 'next'
import { InstitutionalPage } from '@/app/marketing/institutional'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/institutional'

/**
 * English only. The legacy repo has no Japanese or Korean version of this page,
 * so it is absent from `AVAILABILITY` entirely — the documented default for an
 * English-only path, which keeps the language selector from offering a locale
 * that cannot be served.
 */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <InstitutionalPage locale="en" />
}

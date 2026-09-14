import type { Metadata } from 'next'
import { FaqPage } from '@/app/marketing/faq'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/faq'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Faq() {
  return <FaqPage path={PATH} locale="en" namespace="pages.faq" />
}

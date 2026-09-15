import type { Metadata } from 'next'
import { ContactPage } from '@/app/marketing/contact'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/contact'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <ContactPage locale="en" />
}

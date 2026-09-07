import type { Metadata } from 'next'
import { DlimitPage } from '@/app/marketing/dlimit'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/dlimit'

/**
 * Uses the same helper as the Japanese and Korean routes so the three cannot
 * describe the same page differently.
 */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <DlimitPage locale="en" />
}

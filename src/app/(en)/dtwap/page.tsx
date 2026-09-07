import type { Metadata } from 'next'
import { DtwapPage } from '@/app/marketing/dtwap'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/dtwap'

/**
 * Uses the same helper as the Japanese and Korean routes so the three cannot
 * describe the same page differently — the title and description previously
 * lived here alone, which left both translated URLs on the generic site
 * metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <DtwapPage locale="en" />
}

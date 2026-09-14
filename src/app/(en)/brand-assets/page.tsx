import type { Metadata } from 'next'
import { BrandAssetsPage } from '@/app/marketing/brand-assets'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/brand-assets'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <BrandAssetsPage locale="en" />
}

import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { SpotOrdersPage } from '@/app/marketing/spot-orders'

const PATH = '/ai/skills/spot-advanced-swap-orders'

/**
 * A concrete route rather than `/ai/skills/[skill]/`: there is exactly one
 * skill, and a dynamic segment would need a params source and a not-found path
 * to serve a single page. The second skill is the right moment to add one.
 */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <SpotOrdersPage locale="en" />
}

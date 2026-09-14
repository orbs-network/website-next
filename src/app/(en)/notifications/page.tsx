import type { Metadata } from 'next'
import { NotificationsPage } from '@/app/marketing/notifications'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/notifications'

/** Same helper as the Japanese and Korean routes, so the three cannot drift. */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <NotificationsPage locale="en" />
}

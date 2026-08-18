import type { Metadata } from 'next'
import { DtwapPage } from '@/app/marketing/dtwap'
import { localeAlternates, placeholderRobots } from '@/i18n/availability'

const PATH = '/dtwap'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'dTWAP',
    description:
      'A decentralized on-chain protocol that extends DEX/AMMs with time-weighted average price orders, reducing the market impact of large trades.',
    alternates: localeAlternates(PATH, 'en'),
    robots: placeholderRobots(PATH, 'en'),
  }
}

export default function Page() {
  return <DtwapPage locale="en" />
}

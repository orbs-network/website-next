import type { Metadata } from 'next'
import { marketingMetadata } from '@/app/marketing/metadata'
import { SecurityAndAuditsPage } from '@/app/marketing/security-and-audits'

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata('/security-and-audits', 'en')
}

export default function SecurityAndAudits() {
  return <SecurityAndAuditsPage locale="en" />
}

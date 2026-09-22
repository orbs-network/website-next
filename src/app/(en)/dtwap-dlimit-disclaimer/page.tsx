import type { Metadata } from 'next'
import { LegalPage } from '@/app/marketing/legal'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/dtwap-dlimit-disclaimer'

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <LegalPage path={PATH} locale="en" namespace="pages.dtwapDlimitDisclaimer" />
}

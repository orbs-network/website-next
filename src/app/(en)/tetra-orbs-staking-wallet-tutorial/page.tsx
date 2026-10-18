import { marketingMetadata } from '@/app/marketing/metadata'
import { TetraArchivePage } from '@/app/marketing/tetra-archive'

export const generateMetadata = () => marketingMetadata('/tetra-orbs-staking-wallet-tutorial', 'en')

export default function TetraArchive() {
  return <TetraArchivePage />
}

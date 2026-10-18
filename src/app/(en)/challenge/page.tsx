import { marketingMetadata } from '@/app/marketing/metadata'
import { LegalPage } from '@/app/marketing/legal'

export const generateMetadata = () => marketingMetadata('/challenge', 'en')

export default function ChallengeArchive() {
  return <LegalPage path="/challenge" locale="en" namespace="pages.challengeArchive" />
}

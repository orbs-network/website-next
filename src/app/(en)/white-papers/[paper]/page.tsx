import { WhitePaperPage, whitePaperMetadata } from '@/app/marketing/white-paper'
import { WHITE_PAPERS } from '@/content/pages/white-papers'

type Props = { params: Promise<{ paper: string }> }

export function generateStaticParams() {
  return WHITE_PAPERS.map(({ slug }) => ({ paper: slug }))
}

export async function generateMetadata({ params }: Props) {
  return whitePaperMetadata((await params).paper, 'en')
}

export default async function PaperPage({ params }: Props) {
  return <WhitePaperPage slug={(await params).paper} locale="en" />
}

import type { Metadata } from 'next'
import { AiSkillsPage } from '@/app/marketing/ai-skills'
import { marketingMetadata } from '@/app/marketing/metadata'

const PATH = '/ai/skills'

/**
 * There is deliberately no `/ai/` route above this one: the legacy site returns
 * 404 for `/ai/`, and this index is the section's entry point.
 */
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata(PATH, 'en')
}

export default function Page() {
  return <AiSkillsPage locale="en" />
}

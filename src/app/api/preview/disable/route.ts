import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { BLOG_INDEX_PATH } from '@/app/lib/routes'

/**
 * Exit draft mode. Clears the bypass cookie so cached published pages are
 * served again.
 */
export async function GET() {
  const draft = await draftMode()
  draft.disable()

  redirect(BLOG_INDEX_PATH)
}

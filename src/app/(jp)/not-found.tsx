import { NotFoundPage } from '@/app/components/not-found-page'

/** 404 boundary for this locale group — see NotFoundPage for why each needs one. */
export default function NotFound() {
  return <NotFoundPage locale="ja" />
}

import { ROOT_METADATA, RootShell } from '@/app/components/layout/root-shell'

export const metadata = ROOT_METADATA

/**
 * Root layout for English, which is served from the root with no locale prefix
 * (`/`, `/blog/`, `/Some-Post/`) exactly as the legacy site serves it. The `(en)`
 * group adds no URL segment, so no English URL changes.
 */
export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="en">{children}</RootShell>
}

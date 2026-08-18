import { ROOT_METADATA, RootShell } from '@/app/components/layout/root-shell'

export const metadata = ROOT_METADATA

/** Root layout for Japanese, served under the legacy `/jp/` prefix. */
export default function JapaneseRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="ja">{children}</RootShell>
}

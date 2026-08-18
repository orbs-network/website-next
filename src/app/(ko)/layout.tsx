import { ROOT_METADATA, RootShell } from '@/app/components/layout/root-shell'

export const metadata = ROOT_METADATA

/** Root layout for Korean, served under the legacy `/ko/` prefix. */
export default function KoreanRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="ko">{children}</RootShell>
}

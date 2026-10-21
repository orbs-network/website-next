import localFont from 'next/font/local'
import { ROOT_METADATA, RootShell } from '@/app/components/layout/root-shell'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata = ROOT_METADATA

/** Root layout for Korean, served under the legacy `/ko/` prefix. */
export default function KoreanRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell locale="ko" fontClassName={pretendard.className} fallbackFontFamily={pretendard.style.fontFamily}>
      {children}
    </RootShell>
  )
}

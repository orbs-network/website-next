import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Header } from './components/layout/header'
import './globals.css'
import { ThemeProvider } from 'next-themes'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Orbs',
    template: '%s | Orbs',
  },
  description: 'Bringing CeFi execution to DeFi.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

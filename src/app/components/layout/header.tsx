import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from '../theme/theme-toggle'
import { LanguageSelector } from './language-selector'
import { OrbsLogo } from '@/components/icons'
import { NavMenu } from './navigation/nav-menu'

export function Header() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <OrbsLogo />
          </Link>

          <NavMenu />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
            <Button size="sm">Get in Touch</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

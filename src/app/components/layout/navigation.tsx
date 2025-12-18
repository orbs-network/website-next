'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OrbsLogo } from './orbs-logo'

const navLinks = [{ href: '/blog', label: 'Blog' }]

export function Navigation() {
  const pathname = usePathname()

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

          <ul className="flex items-center gap-8">
            {navLinks.map(({ href, label }) => {
              console.log(href, pathname)
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'border-b-2 border-gray-900 dark:border-white' : ''
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}

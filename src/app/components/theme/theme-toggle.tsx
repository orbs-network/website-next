'use client'

import { Computer, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

/**
 * `lang="en"` on the trigger and the menu: this component's strings are
 * hardcoded English in every locale, so on `/jp/` and `/ko/` they are English
 * text inside a `lang="ja"`/`lang="ko"` document and a screen reader would
 * pronounce them with the wrong rules.
 *
 * It is set here rather than by the header because the menu content renders in
 * a portal, outside any wrapper the header could put around it.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          lang="en"
          className="relative inline-flex size-9 items-center justify-center text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {/*
            A solid 14px sun in both themes, as the header frame draws it
            (#230). It was an outline sun that swapped to a moon in dark; the
            menu it opens is where the choice is made, so the icon only has to
            say "theme".
          */}
          <Sun className="size-3.5" fill="currentColor" aria-hidden="true" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" lang="en">
        <DropdownMenuItem onClick={() => setTheme('light')} className="text-xs">
          <Sun className="size-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="text-xs">
          <Moon className="size-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="text-xs">
          <Computer className="size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

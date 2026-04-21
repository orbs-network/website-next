'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

export function LanguageSelector() {
  const [language, setLanguage] = useState('EN')
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {language}
          <ChevronDownIcon
            className="transition-transform duration-200 size-5"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          <span className="sr-only">Language Selector</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('EN')} className="text-xs">
          EN
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('KO')} className="text-xs">
          KO
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('JP')} className="text-xs">
          JP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

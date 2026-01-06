'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

export function LanguageSelector() {
  const [language, setLanguage] = useState('EN')
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-xs">
          {language}
          <ChevronDownIcon
            className="transition-transform duration-200 size-5"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          <span className="sr-only">Language Selector</span>
        </Button>
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

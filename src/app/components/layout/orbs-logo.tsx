'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useMemo } from 'react'

export function OrbsLogo({ className }: { className?: string }) {
  const { theme } = useTheme()
  const logo = useMemo(() => {
    return theme === 'dark' ? '/logos/orbs-gradient-white-logo.svg' : '/logos/orbs-gradient-black-logo.svg'
  }, [theme])

  return (
    <div className={`p-2 w-32 h-auto ${className}`}>
      <Image src={logo} alt="Orbs Logo" width={227} height={68} />
    </div>
  )
}

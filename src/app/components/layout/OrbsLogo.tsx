import Image from 'next/image'

export function OrbsLogo({ className }: { className?: string }) {


  return (
    <div className={`p-2 w-32 h-auto ${className}`}>
      <Image src="/logos/orbs-gradient-logo.svg" alt="Orbs Logo" width={227} height={68} />
    </div>
  )
} 
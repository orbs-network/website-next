import Image from 'next/image'

export function OrbsLogo({ className }: { className?: string }) {
  return (
    <div className={`p-2 w-32 h-auto ${className}`}>
      <Image
        className="dark:block hidden"
        src={'/logos/orbs-gradient-white-logo.svg'}
        alt="Orbs Logo"
        width={227}
        height={68}
      />
      <Image
        className="block dark:hidden"
        src={'/logos/orbs-gradient-black-logo.svg'}
        alt="Orbs Logo"
        width={227}
        height={68}
      />
    </div>
  )
}

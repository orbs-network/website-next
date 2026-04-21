import { cn } from '@/lib/utils'
import Link from 'next/link'

export function NavButton({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 uppercase text-xs tracking-widest font-medium text-fg transition-colors',
        'hover:text-accent-primary',
        className
      )}
    >
      {children}
    </Link>
  )
}

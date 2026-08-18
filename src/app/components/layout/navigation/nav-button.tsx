import { cn } from '@/lib/utils'
import Link from 'next/link'

export function NavButton({
  href,
  children,
  className,
  lang,
}: {
  href: string
  children: React.ReactNode
  className?: string
  /** Set when the label is English inside a non-English document. */
  lang?: string
}) {
  return (
    <Link
      href={href}
      lang={lang}
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

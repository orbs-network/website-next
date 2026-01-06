import { Button } from '@/components/ui/button'
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
    <Button variant="ghost" asChild>
      <Link
        href={href}
        className={cn('uppercase text-xs tracking-widest font-medium transition-colors gap-0', className)}
      >
        {children}
      </Link>
    </Button>
  )
}

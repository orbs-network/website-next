import * as React from 'react'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

type BaseProps = {
  href?: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export type LargeLinkProps = BaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>

/**
 * Full-width large link with a trailing arrow and a bottom border.
 * States: default / disabled / hover — text, arrow, and border switch together.
 */
export const LargeLink = React.forwardRef<HTMLAnchorElement, LargeLinkProps>(
  ({ href, disabled = false, className, children, ...props }, ref) => {
    const classes = cn(
      'group flex w-full items-center justify-between gap-4 border-b py-4 transition-colors',
      'text-h2 font-normal',
      disabled
        ? 'pointer-events-none text-fg-muted border-fg-muted'
        : 'text-fg border-border hover:text-accent-primary hover:border-accent-primary',
      className
    )

    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        className={classes}
        {...props}
      >
        <span>{children}</span>
        <ArrowRight className="size-8 shrink-0" aria-hidden="true" />
      </a>
    )
  }
)
LargeLink.displayName = 'LargeLink'

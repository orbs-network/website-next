import * as React from 'react'

import { cn } from '@/lib/utils'

type BaseProps = {
  href?: string
  active?: boolean
  className?: string
  children: React.ReactNode
}

type AnchorProps = BaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>
type ButtonNativeProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

export type SecondaryNavLinkProps = AnchorProps | ButtonNativeProps

/**
 * Small uppercase nav link (e.g. "ALL" in a sub-nav).
 * - Default: `text-fg-muted`
 * - Hover / active: `text-accent-primary`
 */
export const SecondaryNavLink = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, SecondaryNavLinkProps>(
  ({ href, active = false, className, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center uppercase font-medium text-detail tracking-wide transition-colors',
      'hover:text-accent-primary',
      active ? 'text-accent-primary' : 'text-fg-muted',
      className
    )

    if (href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-current={active ? 'page' : undefined}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-current={active ? 'page' : undefined}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }
)
SecondaryNavLink.displayName = 'SecondaryNavLink'

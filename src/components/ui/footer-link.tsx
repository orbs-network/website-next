import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type BaseProps = {
  href?: string
  active?: boolean
  className?: string
  /**
   * Render the child element with these styles instead of an `<a>`, the same
   * `asChild` contract `Button` uses.
   *
   * Exists for internal links. Passing `href` renders a plain anchor, which is
   * a full document load — fine for the external links that make up the
   * Resources column, wrong for in-site navigation. `asChild` lets the caller
   * supply a `next/link` and keep client-side routing and prefetching without
   * this primitive having to know about the router.
   */
  asChild?: boolean
  children: React.ReactNode
}

type AnchorProps = BaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>
type ButtonNativeProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

export type FooterLinkProps = AnchorProps | ButtonNativeProps

function renderFooterLink(
  classes: string,
  {
    href,
    active,
    asChild,
    children,
    ref,
    ...rest
  }: FooterLinkProps & { ref: React.Ref<HTMLAnchorElement | HTMLButtonElement> }
) {
  if (asChild) {
    return (
      <Slot
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-current={active ? 'page' : undefined}
        className={classes}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Slot>
    )
  }

  if (href !== undefined) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={classes}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
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
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}

/**
 * Uppercase footer link (e.g. "LIQUIDITY HUB").
 * - Default: `text-fg-muted`
 * - Hover: `text-link` (no underline)
 */
export const FooterLink1 = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, FooterLinkProps>(
  ({ active = false, className, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center uppercase font-medium text-detail tracking-wide transition-colors',
      'hover:text-link',
      active ? 'text-link' : 'text-fg-muted',
      className
    )

    return renderFooterLink(classes, { ...props, active, ref })
  }
)
FooterLink1.displayName = 'FooterLink1'

/**
 * Uppercase footer link with hover underline (e.g. "TERMS AND CONDITIONS").
 * - Default: `text-fg-muted`
 * - Hover: `text-link` + underline
 */
export const FooterLink2 = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, FooterLinkProps>(
  ({ active = false, className, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center uppercase font-medium text-detail tracking-wide transition-colors underline-offset-4',
      'hover:text-link hover:underline',
      active ? 'text-link underline' : 'text-fg-muted',
      className
    )

    return renderFooterLink(classes, { ...props, active, ref })
  }
)
FooterLink2.displayName = 'FooterLink2'

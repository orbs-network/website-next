import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type BaseProps = {
  href?: string
  active?: boolean
  className?: string
  /**
   * Render the child element with these styles instead of an `<a>`, the same
   * `asChild` contract `Button` and `FooterLink` use.
   *
   * Exists for internal links: a plain `href` anchor is a full document load,
   * which is wrong for in-site navigation. `asChild` lets the caller pass a
   * `next/link` and keep client-side routing without this primitive having to
   * know about the router.
   */
  asChild?: boolean
  children: React.ReactNode
}

type AnchorProps = BaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>
type ButtonNativeProps = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>

export type MenuItemProps = AnchorProps | ButtonNativeProps

/**
 * Uppercase nav link (e.g. header nav items).
 * - Default: `text-fg`
 * - Hover: underline + `text-accent-primary`
 * - Active: underline + bold + `text-accent-primary`
 *
 * Renders as an `<a>` when `href` is provided, otherwise a `<button>`.
 */
export const MenuItem = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, MenuItemProps>(
  ({ href, active = false, asChild = false, className, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center uppercase text-detail tracking-wide transition-colors',
      'hover:underline hover:text-accent-primary underline-offset-4',
      active ? 'underline font-bold text-accent-primary' : 'font-medium text-fg',
      className
    )

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLAnchorElement>}
          aria-current={active ? 'page' : undefined}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
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
MenuItem.displayName = 'MenuItem'

type MenuItemWBaseProps = BaseProps & {
  icon?: React.ReactNode
}

type MenuItemWAnchorProps = MenuItemWBaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof MenuItemWBaseProps>
type MenuItemWButtonProps = MenuItemWBaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MenuItemWBaseProps>

export type MenuItemWProps = MenuItemWAnchorProps | MenuItemWButtonProps

/**
 * Title-case menu item with an optional leading icon (e.g. "Liquidity Hub").
 * - Default: `text-fg`
 * - Hover: underline + `text-accent-primary`
 * - Active: underline + `text-accent-primary`
 */
export const MenuItemW = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, MenuItemWProps>(
  ({ href, active = false, asChild = false, icon, className, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center gap-2 font-medium text-field transition-colors underline-offset-4',
      'hover:underline hover:text-accent-primary',
      active ? 'underline text-accent-primary' : 'text-fg',
      className
    )

    const body = (
      <>
        {icon ? <span className="inline-flex shrink-0 items-center">{icon}</span> : null}
        <span>{children}</span>
      </>
    )

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLAnchorElement>}
          aria-current={active ? 'page' : undefined}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {/*
            `Slottable` marks which child is the element to render as — the
            caller's `next/link`. The icon is a sibling here and ends up INSIDE
            that element, which is what lets an icon row still be a real link.
            Passing a fragment to `Slot` instead would throw: it needs exactly
            one element to clone.
          */}
          {icon ? <span className="inline-flex shrink-0 items-center">{icon}</span> : null}
          <Slottable>{children}</Slottable>
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
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {body}
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
        {body}
      </button>
    )
  }
)
MenuItemW.displayName = 'MenuItemW'

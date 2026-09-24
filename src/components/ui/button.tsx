import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Orbs brand button. Two variants:
 *
 * - `primary` (default) — bordered, uppercase, trailing arrow.
 * - `secondary` — identical styling minus the trailing arrow.
 *
 * Shared states: default / disabled / hover (border + text + arrow all switch
 * to the accent colour on hover, or `fg-muted` when disabled).
 *
 * Icon behaviour:
 * - The primary variant auto-renders a Lucide `ArrowRight` after the children.
 * - Pass a custom `icon` (ReactNode) to override the default arrow.
 * - Pass `noIcon` to suppress the trailing icon entirely (useful when `asChild`
 *   is wrapping a Link whose icon you want to control manually).
 * - The secondary variant never renders an icon automatically.
 */
const buttonVariants = cva(
  [
    /*
      The label WRAPS rather than overflowing (#189). This was `whitespace-nowrap`,
      which is the shadcn default and is fine for "Submit" — and on a 390px
      phone a label that does not fit one line then pushes the whole document
      sideways. "Contribute your notification" on `/notifications/` did exactly
      that: 449px of button in a 350px column, the page scrolling horizontally.

      `max-w-full` caps it at its container so there is a width to wrap
      against; `text-center` keeps a wrapped label centred rather than ragged
      left. A label that fits on one line is unaffected — wrapping only
      happens when there is nothing else to do, so desktop buttons do not
      change.
    */
    'inline-flex max-w-full items-center justify-center gap-2 text-center',
    'font-semibold uppercase tracking-wide',
    'border transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:border-fg-muted disabled:text-fg-muted',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'border-fg text-fg hover:border-accent-primary hover:text-accent-primary',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
      },
      size: {
        sm: 'px-3 py-1.5 text-detail',
        default: 'px-3.5 py-2.5 text-h5',
        lg: 'px-5 py-3 text-field',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

const arrowSizeMap: Record<NonNullable<VariantProps<typeof buttonVariants>['size']>, string> = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Override the trailing icon. Defaults to `ArrowRight` on the primary variant. */
  icon?: React.ReactNode
  /** Suppress the trailing icon entirely (primary variant only). */
  noIcon?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', asChild = false, icon, noIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const resolvedSize = size ?? 'default'

    const showIcon = variant === 'primary' && !noIcon
    const iconNode = showIcon
      ? (icon ?? <ArrowRight className={arrowSizeMap[resolvedSize]} aria-hidden="true" />)
      : null

    const content =
      asChild && React.isValidElement(children) ? (
        React.cloneElement(children as React.ReactElement<{ children?: React.ReactNode }>, {
          children: (
            <>
              {(children as React.ReactElement<{ children?: React.ReactNode }>).props.children}
              {iconNode}
            </>
          ),
        })
      ) : (
        <>
          {children}
          {iconNode}
        </>
      )

    return (
      <Comp className={cn(buttonVariants({ variant, size: resolvedSize, className }))} ref={ref} {...props}>
        {content}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

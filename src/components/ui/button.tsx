import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Orbs brand button. Four variants:
 *
 * - `primary` (default) — bordered, uppercase, trailing arrow.
 * - `secondary` — identical styling minus the trailing arrow.
 * - `solid` — filled with the foreground colour, trailing arrow. The design
 *   uses it once per page at most, for the hero's main action, so it reads as
 *   THE action beside an outline one. Inverts with the theme like the text.
 * - `overlay` — `primary` made opaque, with a white fill on hover and focus,
 *   for a button over an animated backdrop (the home hero). See below.
 *
 * Shared states: default / disabled / hover (border + text + arrow all switch
 * to the accent colour on hover, or `fg-muted` when disabled).
 *
 * Sized to the design system (#229): 33px tall, 11px regular uppercase at the
 * `detail` token's 0.08em tracking, 10px side padding, and a thin 12x9 arrow.
 * The previous 42px semibold button with a `lg` step came from the 3.4 page
 * frames; the system that replaced them has one CTA size, so `lg` is gone.
 * `sm` stays for the header chrome until #230 redraws it.
 *
 * Icon behaviour:
 * - The primary variant auto-renders `ButtonArrow` after the children.
 * - Pass a custom `icon` (ReactNode) to override the default arrow.
 * - Pass `noIcon` to suppress the trailing icon entirely (useful when `asChild`
 *   is wrapping a Link whose icon you want to control manually).
 * - The secondary variant never renders an icon automatically; `solid` does.
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
    /*
      No `tracking-*` utility: Tailwind's `tracking-wide` is 0.025em and, being
      a later utility, overrode the 0.08em the `detail` token carries.
    */
    'font-normal uppercase',
    'border transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:border-fg-muted disabled:text-fg-muted',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    'border-control-border text-fg hover:border-accent-primary hover:text-accent-primary',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        solid: 'border-fg bg-fg text-bg hover:border-fg-muted hover:bg-fg-muted hover:text-bg',
        /*
          For a button over a moving backdrop — the home hero's facet field
          (#268). The default variant is transparent, so on hover its indigo
          label sat directly on indigo-and-violet facets and all but vanished.

          OPAQUE AT EVERY STATE, which is the actual fix. At rest the fill is the
          page colour, so it looks exactly like the outline button beside it
          while keeping the facets from ever passing behind the label — the
          field follows the cursor, so it is under this button whenever the
          reader is reaching for it or the CTA next to it. On hover and
          keyboard focus the fill goes white and the label and border go
          indigo/400.

          Palette stops, not the semantic tokens, and on purpose: the
          semantic accent flips to periwinkle in dark, which is 3.2:1 on white.
          White and indigo/400 are the same in both themes, so the pair holds
          at 6.4:1 in either. Focus gets the same fill as hover plus the ring,
          so it is never the weaker of the two.
        */
        overlay: [
          'bg-bg',
          'hover:border-indigo-400 hover:bg-neutral-100 hover:text-indigo-400',
          'focus-visible:border-indigo-400 focus-visible:bg-neutral-100 focus-visible:text-indigo-400',
        ].join(' '),
      },
      size: {
        sm: 'px-3 py-1.5 text-detail',
        /*
          `min-h`, not `h`: a label that wraps on a phone (see above) has to be
          allowed to grow. 16px line + 12px padding + 2px border is 30, so the
          33px floor is what sets the height of a one-line button.
        */
        default: 'min-h-[2.0625rem] px-2.5 py-1.5 text-detail',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

/**
 * The design system's CTA arrow: a 12x9 stroke at 1px with round ends, drawn
 * rather than taken from Lucide, whose `ArrowRight` is a 2px stroke on a
 * square box and reads twice as heavy next to 11px type.
 *
 * Exported for text links that end in the same arrow (dSPOT's module cards),
 * where a typed `→` at 11px renders as a near-invisible dash.
 */
function ButtonArrow() {
  return (
    <svg
      width="14"
      height="13"
      viewBox="0 0 14 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 6.5H13M8.5 11L13 6.5L8.5 2" />
    </svg>
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Override the trailing icon. Defaults to `ButtonArrow` on the primary variant. */
  icon?: React.ReactNode
  /** Suppress the trailing icon entirely (primary variant only). */
  noIcon?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', asChild = false, icon, noIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const resolvedSize = size ?? 'default'

    const showIcon = variant !== 'secondary' && !noIcon
    const iconNode = showIcon ? (icon ?? <ButtonArrow />) : null

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

export { Button, ButtonArrow, buttonVariants }

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: 'research' | 'partnership'
}

const badgeVariantClasses: Record<BadgeProps['variant'], string> = {
  research: 'bg-periwinkle-200/50 text-periwinkle-600',
  partnership: 'bg-coral-200/60 text-coral-600',
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-p font-medium',
        badgeVariantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
Badge.displayName = 'Badge'

export { Badge }

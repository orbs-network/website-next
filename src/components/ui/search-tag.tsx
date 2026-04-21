import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SearchTagProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean
  children: React.ReactNode
}

const SearchTag = React.forwardRef<HTMLButtonElement, SearchTagProps>(
  ({ className, active = false, type = 'button', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={active}
        data-state={active ? 'active' : 'inactive'}
        className={cn(
          'inline-flex items-center justify-center rounded-full px-4 py-1.5 text-detail font-semibold uppercase transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          active
            ? 'bg-indigo-400 text-neutral-100 hover:bg-indigo-500'
            : 'bg-periwinkle-200/40 text-periwinkle-500 hover:bg-periwinkle-200/60',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SearchTag.displayName = 'SearchTag'

export { SearchTag }

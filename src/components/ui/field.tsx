import * as React from 'react'

import { cn } from '@/lib/utils'

export interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ className, label, error, disabled, type = 'text', id, ...props }, ref) => {
    const reactId = React.useId()
    const inputId = id ?? reactId
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className={cn('flex w-full flex-col', className)}>
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={label}
          disabled={disabled}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'h-12 w-full border-0 border-b bg-transparent px-0 text-field text-fg outline-none transition-colors',
            'placeholder:text-fg-muted',
            'focus:outline-none focus-visible:outline-none',
            error
              ? 'border-b-[var(--destructive)] focus:border-b-[var(--destructive)]'
              : 'border-border focus:border-accent-primary',
            disabled && 'cursor-not-allowed text-fg-muted placeholder:text-fg-muted'
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="mt-2 text-detail text-coral-500">
            {error}
          </p>
        ) : null}
      </div>
    )
  }
)
Field.displayName = 'Field'

export { Field }

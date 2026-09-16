import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * The multi-line counterpart to `Field`, matching it line for line.
 *
 * Deliberately a sibling rather than a `multiline` prop on `Field`: the two
 * render different elements, so one component would have to branch on the prop
 * and forward a ref whose type depends on it. Two small components beat one
 * component with a union ref.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * The accessible name. Also the default placeholder, so a field with nothing
   * else set still says what it is — pass `placeholder` to separate them.
   */
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, disabled, id, rows = 5, ...props }, ref) => {
    const reactId = React.useId()
    const textareaId = id ?? reactId
    const errorId = error ? `${textareaId}-error` : undefined

    return (
      <div className={cn('flex w-full flex-col', className)}>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          placeholder={label}
          disabled={disabled}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'w-full resize-y border-0 border-b bg-transparent px-0 py-3 text-field text-fg outline-none transition-colors',
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
Textarea.displayName = 'Textarea'

export { Textarea }

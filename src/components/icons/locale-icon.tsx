import { ChevronDown } from 'lucide-react'
import type { HTMLAttributes } from 'react'

type LocaleIconProps = HTMLAttributes<HTMLSpanElement> & {
  /** Two-letter locale code rendered in uppercase. Defaults to `EN`. */
  locale?: string
}

/**
 * Locale indicator — more of a compound than a pure icon: shows the current
 * locale label (e.g. "EN") with a small chevron-down. Renders as a `<span>`
 * so it composes inside buttons/menus without adding block-level layout.
 */
export function LocaleIcon({ locale = 'EN', className, ...rest }: LocaleIconProps) {
  const classes = ['inline-flex items-center gap-1 text-detail uppercase tracking-wide', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={classes} {...rest}>
      {locale}
      <ChevronDown className="size-3" aria-hidden />
    </span>
  )
}

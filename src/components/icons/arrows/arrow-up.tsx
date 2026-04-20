import { ArrowUp as LucideArrowUp } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { ArrowVariant } from '../types'

type ArrowUpProps = ComponentProps<typeof LucideArrowUp> & {
  variant?: ArrowVariant
}

const VARIANT_CLASS: Record<ArrowVariant, string> = {
  default: 'text-fg',
  ghost: 'text-fg-muted',
  accent: 'text-cyan-400',
}

/** Up-pointing arrow. Wraps Lucide `ArrowUp`. */
export function ArrowUp({ variant = 'default', className, ...rest }: ArrowUpProps) {
  const variantClass = VARIANT_CLASS[variant]
  return <LucideArrowUp className={[variantClass, className].filter(Boolean).join(' ')} {...rest} />
}

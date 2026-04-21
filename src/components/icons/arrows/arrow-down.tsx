import { ArrowDown as LucideArrowDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { ArrowVariant } from '../types'

type ArrowDownProps = ComponentProps<typeof LucideArrowDown> & {
  variant?: ArrowVariant
}

const VARIANT_CLASS: Record<ArrowVariant, string> = {
  default: 'text-fg',
  ghost: 'text-fg-muted',
  accent: 'text-cyan-400',
}

/** Down-pointing arrow. Wraps Lucide `ArrowDown`. */
export function ArrowDown({ variant = 'default', className, ...rest }: ArrowDownProps) {
  const variantClass = VARIANT_CLASS[variant]
  return <LucideArrowDown className={[variantClass, className].filter(Boolean).join(' ')} {...rest} />
}

import { ArrowRight as LucideArrowRight } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { ArrowVariant } from '../types'

type ArrowRightProps = ComponentProps<typeof LucideArrowRight> & {
  variant?: ArrowVariant
}

const VARIANT_CLASS: Record<ArrowVariant, string> = {
  default: 'text-fg',
  ghost: 'text-fg-muted',
  accent: 'text-cyan-400',
}

/** Right-pointing arrow. Wraps Lucide `ArrowRight`; variant maps to a Tailwind `text-*` class. */
export function ArrowRight({ variant = 'default', className, ...rest }: ArrowRightProps) {
  const variantClass = VARIANT_CLASS[variant]
  return <LucideArrowRight className={[variantClass, className].filter(Boolean).join(' ')} {...rest} />
}

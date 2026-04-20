import { ArrowLeft as LucideArrowLeft } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { ArrowVariant } from '../types'

type ArrowLeftProps = ComponentProps<typeof LucideArrowLeft> & {
  variant?: ArrowVariant
}

const VARIANT_CLASS: Record<ArrowVariant, string> = {
  default: 'text-fg',
  ghost: 'text-fg-muted',
  accent: 'text-cyan-400',
}

/** Left-pointing arrow. Wraps Lucide `ArrowLeft`. */
export function ArrowLeft({ variant = 'default', className, ...rest }: ArrowLeftProps) {
  const variantClass = VARIANT_CLASS[variant]
  return <LucideArrowLeft className={[variantClass, className].filter(Boolean).join(' ')} {...rest} />
}

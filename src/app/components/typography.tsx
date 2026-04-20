import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type PolymorphicProps<E extends React.ElementType> = React.ComponentPropsWithoutRef<E> & {
  asChild?: boolean
  className?: string
}

export const H1 = React.forwardRef<HTMLHeadingElement, PolymorphicProps<'h1'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h1'
    return <Comp ref={ref} className={cn('text-h1 text-fg font-normal', className)} {...props} />
  }
)
H1.displayName = 'H1'

export const H2 = React.forwardRef<HTMLHeadingElement, PolymorphicProps<'h2'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h2'
    return <Comp ref={ref} className={cn('text-h2 text-fg font-normal', className)} {...props} />
  }
)
H2.displayName = 'H2'

export type H3Weight = 'regular' | 'medium'

export interface H3Props extends PolymorphicProps<'h3'> {
  weight?: H3Weight
}

export const H3 = React.forwardRef<HTMLHeadingElement, H3Props>(
  ({ asChild = false, className, weight = 'regular', ...props }, ref) => {
    const Comp = asChild ? Slot : 'h3'
    const weightClass = weight === 'medium' ? 'font-semibold' : 'font-normal'
    return <Comp ref={ref} className={cn('text-h3 text-fg', weightClass, className)} {...props} />
  }
)
H3.displayName = 'H3'

export const H4 = React.forwardRef<HTMLHeadingElement, PolymorphicProps<'h4'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h4'
    return <Comp ref={ref} className={cn('text-h4 text-fg font-normal', className)} {...props} />
  }
)
H4.displayName = 'H4'

export const H5 = React.forwardRef<HTMLHeadingElement, PolymorphicProps<'h5'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h5'
    return <Comp ref={ref} className={cn('text-h5 text-fg font-semibold uppercase', className)} {...props} />
  }
)
H5.displayName = 'H5'

export const P = React.forwardRef<HTMLParagraphElement, PolymorphicProps<'p'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'p'
    return <Comp ref={ref} className={cn('text-p text-fg font-normal', className)} {...props} />
  }
)
P.displayName = 'P'

export const Detail = React.forwardRef<HTMLSpanElement, PolymorphicProps<'span'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span'
    return <Comp ref={ref} className={cn('text-detail text-fg font-medium uppercase', className)} {...props} />
  }
)
Detail.displayName = 'Detail'

export const FieldInput = React.forwardRef<HTMLSpanElement, PolymorphicProps<'span'>>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span'
    return <Comp ref={ref} className={cn('text-field text-fg font-normal', className)} {...props} />
  }
)
FieldInput.displayName = 'FieldInput'

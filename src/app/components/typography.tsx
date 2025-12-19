import { cn } from '@/lib/utils'

export function Heading1({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        'text-4xl font-black mb-4 uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary',
        className
      )}
    >
      {children}
    </h1>
  )
}

export function Heading2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-3xl font-bold mb-4', className)}>{children}</h2>
}

export function Heading3({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-2xl font-bold mb-4', className)}>{children}</h3>
}

export function Heading4({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h4 className={cn('text-xl font-bold mb-4', className)}>{children}</h4>
}

export function Heading5({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h5 className={cn('text-lg font-bold mb-4', className)}>{children}</h5>
}

export function Heading6({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h6 className={cn('text-base font-bold mb-4', className)}>{children}</h6>
}

export function Paragraph({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-base mb-4', className)}>{children}</p>
}

export function List({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn('list-disc list-inside mb-4', className)}>{children}</ul>
}

export function ListItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn('mb-2', className)}>{children}</li>
}

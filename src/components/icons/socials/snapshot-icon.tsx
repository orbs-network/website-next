import type { BrandVariant, IconBaseProps } from '../types'

type SnapshotIconProps = IconBaseProps & {
  variant?: BrandVariant
}

/**
 * Snapshot (governance) mark — rendered as a lightning bolt glyph similar to
 * Lucide's `Zap`. Stroke-only to keep the shape clean at small sizes.
 */
export function SnapshotIcon({ variant = 'dark', width = '1em', height = '1em', ...rest }: SnapshotIconProps) {
  const fill = variant === 'color' ? '#FFBB33' : variant === 'white' ? '#ffffff' : 'currentColor'
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Snapshot"
      {...rest}
    >
      <path fill={fill} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  )
}

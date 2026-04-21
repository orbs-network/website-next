import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge doesn't know about our custom `text-*` font-size utilities
 * (`text-h1`..`text-h5`, `text-p`, `text-detail`, `text-field`) defined in
 * `tailwind.config.ts`. Without this hint it classifies them as text colors
 * and deduplicates them against `text-fg`/`text-fg-muted`/etc., silently
 * dropping the font-size when both appear in the same className. Extending
 * the `font-size` class group restores proper merge semantics.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'detail', 'field'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

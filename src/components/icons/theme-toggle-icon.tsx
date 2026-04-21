import { Moon, Sun } from 'lucide-react'
import type { ComponentProps } from 'react'
import type { Theme } from './types'

type ThemeToggleIconProps = Omit<ComponentProps<typeof Sun>, 'ref'> & {
  theme: Theme
}

/**
 * Renders a sun glyph when `theme === 'light'` and a moon glyph when
 * `theme === 'dark'`. The icon intentionally shows the *current* theme (not
 * the target); the consuming control decides what switching means.
 */
export function ThemeToggleIcon({ theme, ...rest }: ThemeToggleIconProps) {
  const Icon = theme === 'light' ? Sun : Moon
  return <Icon aria-label={theme === 'light' ? 'Light theme' : 'Dark theme'} {...rest} />
}

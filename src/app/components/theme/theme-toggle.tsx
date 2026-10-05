'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/**
 * False on the server and during hydration, true once mounted.
 *
 * `useSyncExternalStore` rather than `useState` set in an effect: it gives the
 * same answer without a second render being requested from inside an effect.
 */
function useIsMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

/** Before mount the resolved theme is unknown, so the name cannot say which way a click goes. */
const PLACEHOLDER_LABEL = 'Toggle theme'

/**
 * One click switches between light and dark, as on docs.orbs.com (#267). It
 * was a menu of Light / Dark / System.
 *
 * The first visit follows the OS: the provider keeps `defaultTheme="system"`.
 * A click sets an explicit theme, the opposite of the one showing, and
 * next-themes persists it, so the OS setting stops mattering from then on.
 *
 * The icon is the theme a click goes TO, as on docs.orbs.com — a sun in dark, a
 * moon in light. Both glyphs are rendered and CSS picks one off the `dark` class
 * on <html>, which next-themes' inline script sets before first paint. That is
 * what lets the icon be right from the server render: `resolvedTheme` is not
 * known until the client mounts, so anything read from it would either flash or
 * mismatch on hydration. The label does depend on it, so it is a neutral
 * placeholder until then.
 *
 * The tooltip repeats the accessible name for sighted users. It appears on
 * hover — only where hover exists, or a tap on a phone would leave it stuck
 * open — and on keyboard focus. `display: none` until then, so it never adds to
 * a page's scroll width; it hangs to the left from the button's right edge,
 * because in the mobile panel the button sits near the right edge.
 *
 * `lang="en"`: these strings are hardcoded English in every locale, so on
 * `/jp/` and `/ko/` they are English text inside a `lang="ja"`/`lang="ko"`
 * document and a screen reader would pronounce them with the wrong rules.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useIsMounted()

  const target = resolvedTheme === 'dark' ? 'light' : 'dark'
  const label = mounted && resolvedTheme ? `Switch to ${target} theme` : PLACEHOLDER_LABEL

  return (
    <button
      type="button"
      aria-label={label}
      lang="en"
      onClick={() => setTheme(target)}
      className="group relative inline-flex size-9 items-center justify-center text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {/* Solid 14px glyphs, as the header frame draws the sun (#230). */}
      <Moon className="size-3.5 dark:hidden" fill="currentColor" aria-hidden="true" />
      <Sun className="hidden size-3.5 dark:block" fill="currentColor" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded-[var(--radius)] bg-fg px-2 py-1 text-xs text-bg shadow-md group-focus-visible:block [@media(hover:hover)]:group-hover:block"
      >
        {label}
      </span>
    </button>
  )
}

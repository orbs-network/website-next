import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemeProvider } from 'next-themes'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ThemeToggle } from './theme-toggle'

/** next-themes' default, which root-shell.tsx does not override. */
const STORAGE_KEY = 'theme'

const html = () => document.documentElement

/**
 * Stored theme primed before mount, and everything restored after: stories
 * share one browser context, so a theme left in storage or on <html> by one
 * would decide how the next one starts.
 */
function prime(stored: 'light' | 'dark' | null) {
  if (stored === null) window.localStorage.removeItem(STORAGE_KEY)
  else window.localStorage.setItem(STORAGE_KEY, stored)
  html().classList.remove('dark', 'light')
  return () => {
    window.localStorage.removeItem(STORAGE_KEY)
    html().classList.remove('dark', 'light')
    html().style.colorScheme = ''
  }
}

const meta = {
  title: 'Theme/ThemeToggle',
  component: ThemeToggle,
  // The provider as root-shell.tsx configures it.
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="flex justify-end p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

/**
 * One click flips the theme — no menu — and the name always says what the next
 * click will do. The choice is stored, so it outlives the page.
 */
export const ClickFlipsTheTheme: Story = {
  beforeEach: () => prime('light'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = await canvas.findByRole('button', { name: 'Switch to dark theme' })
    await expect(html()).not.toHaveClass('dark')

    await userEvent.click(toggle)
    await waitFor(() => expect(html()).toHaveClass('dark'))
    await expect(toggle).toHaveAccessibleName('Switch to light theme')
    await expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark')
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()

    await userEvent.click(toggle)
    await waitFor(() => expect(html()).not.toHaveClass('dark'))
    await expect(toggle).toHaveAccessibleName('Switch to dark theme')
    await expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light')
  },
}

/**
 * With nothing stored, the first visit follows the OS, and the first click goes
 * to the other theme and stores it explicitly — "system" is never written.
 */
export const FirstVisitFollowsTheSystem: Story = {
  beforeEach: () => prime(null),
  play: async ({ canvasElement }) => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const other = systemDark ? 'light' : 'dark'
    const toggle = await within(canvasElement).findByRole('button', { name: `Switch to ${other} theme` })

    await userEvent.click(toggle)
    await waitFor(() => expect(window.localStorage.getItem(STORAGE_KEY)).toBe(other))
    await expect(html().classList.contains('dark')).toBe(other === 'dark')
  },
}

/**
 * The tooltip says what the accessible name says, and shows on keyboard focus
 * as well as hover. It is hidden from the accessibility tree so the name is not
 * read twice.
 */
export const TooltipMatchesTheName: Story = {
  beforeEach: () => prime('light'),
  play: async ({ canvasElement }) => {
    const toggle = await within(canvasElement).findByRole('button', { name: 'Switch to dark theme' })
    const tooltip = toggle.querySelector('span[aria-hidden="true"]')
    if (!(tooltip instanceof HTMLElement)) throw new Error('tooltip not rendered')

    await expect(tooltip).toHaveTextContent('Switch to dark theme')
    await expect(getComputedStyle(tooltip).display).toBe('none')

    await userEvent.tab()
    await expect(toggle).toHaveFocus()
    await waitFor(() => expect(getComputedStyle(tooltip).display).toBe('block'))

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(tooltip).toHaveTextContent('Switch to light theme'))
  },
}

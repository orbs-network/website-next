import React from 'react'
import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

// Design tokens in globals.css are scoped to `:root.dark`, so the dark class
// must live on <html> for CSS custom properties to flip. Align the Storybook
// backgrounds toolbar with the brand tokens so light/dark previews match
// what the app actually renders.
const LIGHT_BG = '#f6f6f6'
const DARK_BG = '#121214'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: LIGHT_BG },
        { name: 'dark', value: DARK_BG },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.backgrounds?.value === DARK_BG
      React.useEffect(() => {
        const html = document.documentElement
        if (isDark) html.classList.add('dark')
        else html.classList.remove('dark')
        return () => {
          html.classList.remove('dark')
        }
      }, [isDark])
      return <Story />
    },
  ],
}

export default preview

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ECOSYSTEM_CATEGORIES } from '@/content/pages/ecosystem'
import { EcosystemDirectory } from './ecosystem-directory'

const meta = {
  title: 'Marketing/EcosystemDirectory',
  component: EcosystemDirectory,
  args: {
    eyebrow: '[ECOSYSTEM]',
    headline: 'Projects building on the Orbs network',
    groups: [{ ...ECOSYSTEM_CATEGORIES[0], title: 'Use-cases and Applications' }],
    locale: 'en',
  },
} satisfies Meta<typeof EcosystemDirectory>

export default meta
type Story = StoryObj<typeof meta>

export const LogosInBothThemes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    try {
      for (const dark of [false, true]) {
        html.classList.toggle('dark', dark)
        for (const entry of ECOSYSTEM_CATEGORIES[0].entries) {
          const link = canvas.getByRole('link', { name: entry.name })
          const images = [...link.querySelectorAll('img')]
          const visible = images.filter((image) => getComputedStyle(image).display !== 'none')
          await expect(visible).toHaveLength(1)
          await expect(visible[0]).toHaveAttribute('alt', '')
          await expect(visible[0].getAttribute('src')).toContain(dark && entry.darkLogo ? entry.darkLogo : entry.logo)
          if (!entry.darkLogo) {
            await expect(getComputedStyle(visible[0].parentElement!).backgroundColor).toBe('rgb(255, 255, 255)')
          }
        }
      }
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}

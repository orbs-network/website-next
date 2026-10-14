import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import en from '@/i18n/messages/en.json'
import { ECOSYSTEM_CARDS, type EcosystemCategory } from '@/content/pages/ecosystem-cards'
import { EcosystemGrid } from './ecosystem-grid'

const meta = {
  title: 'Marketing/EcosystemGrid',
  component: EcosystemGrid,
  args: { cards: ECOSYSTEM_CARDS, labels: en.pages.ecosystem },
} satisfies Meta<typeof EcosystemGrid>
export default meta
type Story = StoryObj<typeof meta>

export const FiltersShowOnlyTheirMembers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const [filter, label] of Object.entries(en.pages.ecosystem.filters)) {
      await userEvent.click(canvas.getByRole('tab', { name: label }))
      const expected = ECOSYSTEM_CARDS.filter(
        (card) => filter === 'all' || card.categories.includes(filter as EcosystemCategory)
      )
      await waitFor(() => expect(canvas.getAllByRole('link')).toHaveLength(expected.length))
      const links = canvas.getAllByRole('link')
      await expect(links.map((link) => link.textContent)).toEqual(expected.map((card) => card.name))
      for (const [i, link] of links.entries()) {
        await expect(link).toHaveAttribute('href', expected[i].xUrl)
        await expect(link).toHaveAttribute('target', '_blank')
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        await expect(link).toHaveAccessibleName(`${expected[i].name}: ${en.pages.ecosystem.viewOnX}`)
      }
      await expect(canvas.queryAllByRole('img')).toHaveLength(0)
      await expect(canvas.getByRole('tabpanel')).toHaveAccessibleName(label)
    }
  },
}

export const KeyboardCanSelectEveryFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('tab', { name: 'All' })
    first.focus()
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'dPERPS' })).toHaveAttribute('aria-selected', 'true'))
    await expect(canvas.getAllByRole('link')).toHaveLength(7)
    await userEvent.keyboard('{End}')
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Chains' })).toHaveFocus())
    await expect(canvas.getAllByRole('link')).toHaveLength(13)
    await userEvent.keyboard('{Home}')
    await waitFor(() => expect(first).toHaveFocus())
    await expect(canvas.getAllByRole('link')).toHaveLength(39)
  },
}

export const NarrowLayoutKeepsAllFiltersReachable: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.style.width = '280px'
    const tabs = within(canvasElement).getAllByRole('tab')
    for (const tab of tabs) {
      const bounds = tab.getBoundingClientRect()
      const container = canvasElement.getBoundingClientRect()
      await expect(bounds.left).toBeGreaterThanOrEqual(container.left)
      await expect(bounds.right).toBeLessThanOrEqual(container.right + 1)
      await userEvent.click(tab)
      await expect(tab).toHaveAttribute('aria-selected', 'true')
    }
    canvasElement.style.width = ''
  },
}

/** Each card shows exactly one logo, with contrast against its actual theme surface. */
export const ThemeSwitchKeepsEveryLogoVisible: Story = {
  play: async ({ canvasElement }) => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    try {
      for (const dark of [false, true]) {
        html.classList.toggle('dark', dark)
        const cards = within(canvasElement).getAllByRole('link')
        await expect(cards).toHaveLength(39)
        for (const [index, card] of cards.entries()) {
          const logo = ECOSYSTEM_CARDS[index].logo
          const visible = [...card.querySelectorAll('img')].filter(
            (image) => getComputedStyle(image).display !== 'none'
          )
          await expect(visible).toHaveLength(1)
          await expect(decodeURIComponent(visible[0].getAttribute('src')!)).toContain(
            dark && logo.onDark ? logo.onDark : logo.src
          )
          const filter = getComputedStyle(visible[0]).filter
          if (dark && logo.invertOnDark) await expect(filter).toContain('invert(1)')
          else await expect(filter).toBe('none')
          await expect(getComputedStyle(card).backgroundColor).toBe(dark ? 'rgb(41, 41, 43)' : 'rgb(255, 255, 255)')
          await expect(getComputedStyle(card).color).toBe(dark ? 'rgb(246, 246, 246)' : 'rgb(18, 18, 20)')
        }
      }
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}

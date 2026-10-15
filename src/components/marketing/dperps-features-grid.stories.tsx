import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import en from '@/i18n/messages/en.json'
import { DPERPS_FEATURES } from '@/content/pages/dperps'
import { DperpsFeaturesGrid } from './dperps-features-grid'

const meta = {
  title: 'Marketing/DperpsFeaturesGrid',
  component: DperpsFeaturesGrid,
  args: { features: DPERPS_FEATURES.map((id) => ({ id, ...en.pages.dperps.features.items[id] })), locale: 'en' },
  decorators: [
    (Story) => (
      <div className="product-benefits p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
        phone: { name: 'Phone', styles: { width: '320px', height: '900px' } },
      },
    },
  },
} satisfies Meta<typeof DperpsFeaturesGrid>
export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await document.fonts.ready
    const cards = within(canvasElement).getAllByRole('listitem')
    expect(cards).toHaveLength(6)
    const boxes = cards.map((card) => card.getBoundingClientRect())
    expect(new Set(boxes.slice(0, 3).map((box) => box.top)).size).toBe(1)
    expect(boxes[3].top).toBeGreaterThan(boxes[0].bottom)
    expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
    expect(within(canvasElement).queryAllByRole('link')).toHaveLength(0)
  },
}

export const Phone: Story = {
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    await document.fonts.ready
    const boxes = within(canvasElement)
      .getAllByRole('listitem')
      .map((card) => card.getBoundingClientRect())
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].top).toBeGreaterThan(boxes[i - 1].bottom)
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
    const wasDark = document.documentElement.classList.contains('dark')
    try {
      for (const dark of [false, true]) {
        document.documentElement.classList.toggle('dark', dark)
        expect(getComputedStyle(canvasElement.querySelector('p')!).color).toBe('rgb(51, 51, 58)')
      }
    } finally {
      document.documentElement.classList.toggle('dark', wasDark)
    }
  },
}

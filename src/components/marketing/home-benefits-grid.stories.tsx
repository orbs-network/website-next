import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { HOME_FEATURES } from '@/content/pages/home'
import en from '@/i18n/messages/en.json'
import { HomeBenefitsGrid } from './home-benefits-grid'

const meta = {
  title: 'Marketing/HomeBenefitsGrid',
  component: HomeBenefitsGrid,
  args: {
    locale: 'en',
    features: HOME_FEATURES.map((id) => ({
      id,
      title: en.pages.home.features[id].title,
      body: en.pages.home.features.grid[id],
    })),
  },
  decorators: [
    (Story) => (
      <div className="institutional-benefits p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomeBenefitsGrid>
export default meta
type Story = StoryObj<typeof meta>

export const AllSummariesAreVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(8)
    await expect(canvas.queryByRole('tab')).toBeNull()
    await expect(canvas.queryByRole('button')).toBeNull()
    for (const id of HOME_FEATURES) {
      await expect(canvas.getByRole('heading', { name: en.pages.home.features[id].title })).toBeVisible()
      await expect(canvas.getByText(en.pages.home.features.grid[id])).toBeVisible()
    }
    await expect(canvasElement.querySelectorAll('[aria-hidden="true"] svg')).toHaveLength(8)
  },
}

export const FourByTwoOnDesktop: Story = {
  parameters: {
    viewport: { options: { desktop: { name: 'Desktop', styles: { width: '1440px', height: '1000px' } } } },
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const boxes = [...canvasElement.querySelectorAll('li')].map((el) => el.getBoundingClientRect())
    expect(boxes.slice(0, 4).every((b) => Math.abs(b.top - boxes[0].top) < 1)).toBe(true)
    expect(boxes.slice(4).every((b) => Math.abs(b.top - boxes[4].top) < 1)).toBe(true)
    expect(boxes[4].top).toBeGreaterThan(boxes[0].bottom - 1)
  },
}

export const NarrowPhoneKeepsAllContent: Story = {
  parameters: { viewport: { options: { phone: { name: 'Phone', styles: { width: '320px', height: '844px' } } } } },
  globals: { viewport: { value: 'phone' } },
  play: async ({ canvasElement }) => {
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth)
    const boxes = [...canvasElement.querySelectorAll('li')].map((el) => el.getBoundingClientRect())
    expect(boxes.every((box) => Math.abs(box.left - boxes[0].left) < 1)).toBe(true)
    expect(boxes[7].top).toBeGreaterThan(boxes[6].bottom - 1)
  },
}

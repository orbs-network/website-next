import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { LIQUIDITY_HUB_PARTNERS } from '@/content/pages/liquidity-hub'
import { PartnerShowcase } from './partner-showcase'

const meta = {
  title: 'Marketing/PartnerShowcase',
  component: PartnerShowcase,
  args: {
    locale: 'en',
    partners: LIQUIDITY_HUB_PARTNERS.map((partner) => ({
      ...partner,
      subtitle: 'Trade with deeper liquidity',
      items: ['Better pricing', 'The same trading experience'],
      cta: 'Start trading',
    })),
  },
  decorators: [
    (Story) => (
      <div className="container">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '1000px' } },
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
      },
    },
  },
} satisfies Meta<typeof PartnerShowcase>

export default meta
type Story = StoryObj<typeof meta>

async function partnerBoxes(canvasElement: HTMLElement) {
  await document.fonts.ready
  await Promise.all([...canvasElement.querySelectorAll('img')].map((img) => img.decode()))
  return [...canvasElement.querySelectorAll('img[alt=""]')].map((image) => ({
    image: image.getBoundingClientRect(),
    copy: image.previousElementSibling!.getBoundingClientRect(),
  }))
}

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    for (const { image, copy } of await partnerBoxes(canvasElement)) {
      await expect(Math.abs(image.top - copy.top)).toBeLessThan(1)
      await expect(image.left - copy.right).toBeCloseTo(64, 0)
    }
  },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile' } },
  play: async ({ canvasElement }) => {
    for (const { image, copy } of await partnerBoxes(canvasElement)) {
      await expect(image.top - copy.bottom).toBeCloseTo(40, 0)
      await expect(Math.abs(image.left - copy.left)).toBeLessThan(1)
    }
  },
}

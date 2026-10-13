import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { StatementBand } from './statement-band'

const meta = {
  title: 'Marketing/StatementBand',
  component: StatementBand,
  args: { text: 'Your brand and user experience', locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '1000px' } },
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
      },
    },
  },
} satisfies Meta<typeof StatementBand>

export default meta
type Story = StoryObj<typeof meta>

const checkCentre: Story['play'] = async ({ canvasElement }) => {
  await document.fonts.ready
  const panel = canvasElement.querySelector('section')!.getBoundingClientRect()
  const text = canvasElement.querySelector('p')!
  const box = text.getBoundingClientRect()
  await expect(Math.abs(box.x + box.width / 2 - panel.x - panel.width / 2)).toBeLessThan(1)
  await expect(Math.abs(box.y + box.height / 2 - panel.y - panel.height / 2)).toBeLessThan(1)
  await expect(getComputedStyle(text).textAlign).toBe('center')
}

export const Desktop: Story = { globals: { viewport: { value: 'desktop' } }, play: checkCentre }
export const Mobile: Story = { globals: { viewport: { value: 'mobile' } }, play: checkCentre }

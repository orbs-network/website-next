import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import en from '@/i18n/messages/en.json'
import ko from '@/i18n/messages/ko.json'
import { RiskDisclosure } from './risk-disclosure'

const meta = { title: 'Marketing/Risk Disclosure', component: RiskDisclosure } satisfies Meta<typeof RiskDisclosure>
export default meta
type Story = StoryObj<typeof meta>

export const FullDisclosure: Story = {
  args: { ...en.pages.dperps.risk, text: en.pages.dperps.disclaimer, locale: 'en' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: /Product status/ })).toBeVisible()
    await expect(canvas.getByText(/may result in total or partial loss of funds/)).toBeVisible()
    await expect(canvas.getByText(/solely responsible for all transaction decisions/)).toBeVisible()
    await expect(canvasElement.querySelector('details')).toBeNull()
    for (const paragraph of canvasElement.querySelectorAll('p')) await expect(paragraph).toBeVisible()
    const clause = canvas.getByText(/may result in total or partial loss of funds/)
    await expect(getComputedStyle(clause).fontSize).toBe('14px')
    await expect(getComputedStyle(clause).lineHeight).toBe('23px')
  },
}

export const Korean: Story = {
  args: { ...ko.pages.dperps.risk, text: ko.pages.dperps.disclaimer, locale: 'ko' },
  decorators: [
    (Story) => (
      <div lang="ko">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading')
    await expect(heading.closest('[lang]')).toHaveAttribute('lang', 'ko')
    await expect(canvasElement.querySelectorAll('p').length).toBeGreaterThan(4)
  },
}

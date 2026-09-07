import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Prose } from './prose'

const meta = {
  title: 'Marketing/Prose',
  component: Prose,
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

export const Paragraphs: Story = {
  args: {
    text: 'First paragraph of the benefit.\n\nSecond paragraph, separated by a blank line.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/First paragraph/)).toBeInTheDocument()
    await expect(canvas.getByText(/Second paragraph/)).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(2)
  },
}

export const Bold: Story = {
  args: {
    text: '**TWAP (Time-Weighted Average Price)** is an algorithmic trading strategy.',
  },
  play: async ({ canvasElement }) => {
    const strong = canvasElement.querySelector('strong')
    await expect(strong).toHaveTextContent('TWAP (Time-Weighted Average Price)')
  },
}

/**
 * A stray `**` must not swallow the rest of the paragraph — a malformed catalog
 * entry should look wrong rather than silently lose copy.
 */
export const UnmatchedBoldMarker: Story = {
  args: {
    text: 'Copy with an **unclosed marker that runs to the end.',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('strong')).toBeNull()
    await expect(canvasElement.textContent).toContain('unclosed marker that runs to the end.')
  },
}

/** Korean copy renders unchanged — the splitter is script-agnostic. */
export const Korean: Story = {
  args: {
    text: '**TWAP (시간 가중 평균값 매매)** 이란 하나의 거래주문을 여러 작은 주문으로 나누어 트레이딩하는 전략입니다.\n\n두 번째 문단입니다.',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(2)
    await expect(canvasElement.querySelector('strong')).toHaveTextContent('TWAP (시간 가중 평균값 매매)')
  },
}

/** Blank segments between paragraph breaks must not produce empty `<p>`s. */
export const ExtraBlankLines: Story = {
  args: {
    text: 'One.\n\n\n\nTwo.',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(2)
  },
}

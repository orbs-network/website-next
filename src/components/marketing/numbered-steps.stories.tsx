import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { NumberedSteps } from './numbered-steps'

const meta = {
  title: 'Marketing/NumberedSteps',
  component: NumberedSteps,
} satisfies Meta<typeof NumberedSteps>

export default meta
type Story = StoryObj<typeof meta>

const STEPS = ['Agent decides what to do.', 'Agent submits execution parameters.', 'The oracle cosigns.']

/**
 * An ordered list, because the order IS the content — this is a process, not a
 * set of facts. That distinction is what a screen reader announces.
 */
export const StepsAreAnOrderedList: Story = {
  args: { title: 'Cosigned oracle verification', steps: STEPS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvasElement.querySelector('ol')).toBeTruthy()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
  },
}

/**
 * The numerals are decorative: an `<ol>` already conveys order, so exposing
 * them would have a screen reader read "1 1. Agent decides".
 */
export const NumeralsAreNotAnnounced: Story = {
  args: { title: 'Cosigned oracle verification', steps: STEPS },
  play: async ({ canvasElement }) => {
    const badges = canvasElement.querySelectorAll('[aria-hidden="true"]')
    await expect(badges.length).toBeGreaterThanOrEqual(3)
  },
}

/** The statement is a claim about the whole flow, so it sits outside the list. */
export const StatementSitsOutsideTheList: Story = {
  args: { title: 'Cosigned oracle verification', statement: 'Every execution is independently verified.', steps: STEPS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText(/independently verified/)).toBeInTheDocument()
    await expect(canvasElement.querySelector('ol')?.textContent).not.toContain('independently verified')
  },
}

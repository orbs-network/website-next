import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatsRow } from './stats-row'

const meta = {
  title: 'Marketing/StatsRow',
  component: StatsRow,
} satisfies Meta<typeof StatsRow>

export default meta
type Story = StoryObj<typeof meta>

const STATS = [
  { id: 'volume', value: '$2.5B+', label: 'Cumulative volume' },
  { id: 'chains', value: '10+', label: 'Chains live' },
]

/**
 * A description list, not a grid of divs: each label is the term and each
 * figure its value, so a screen reader announces "Cumulative volume, $2.5B+"
 * rather than two loose strings whose relationship is only visual.
 */
export const IsADescriptionList: Story = {
  args: { stats: STATS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvasElement.querySelectorAll('dt')).toHaveLength(2)
    await expect(canvasElement.querySelectorAll('dd')).toHaveLength(2)
    await expect(canvas.getByText('$2.5B+')).toBeInTheDocument()
    await expect(canvas.getByText('Cumulative volume')).toBeInTheDocument()
  },
}

/**
 * The figure shows above its label but is the `<dd>`: `flex-col-reverse` gives
 * the design's emphasis without inverting the reading order in the markup.
 */
export const LabelPrecedesValueInTheMarkup: Story = {
  args: { stats: STATS },
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector('dl > div')

    await expect(first?.firstElementChild?.tagName).toBe('DT')
    await expect(first?.lastElementChild?.tagName).toBe('DD')
  },
}

/** The title is optional — the institutional page runs these bare. */
export const TitleIsOptional: Story = {
  args: { stats: STATS },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('heading')).not.toBeInTheDocument()
  },
}

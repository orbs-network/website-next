import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BenefitColumns } from './benefit-columns'

const meta = {
  title: 'Marketing/BenefitColumns',
  component: BenefitColumns,
} satisfies Meta<typeof BenefitColumns>

export default meta
type Story = StoryObj<typeof meta>

const COLUMNS = [
  { id: 'users', title: 'Users', items: ['Better execution price', 'AMM fallback'] },
  { id: 'dex', title: 'DEX', items: ['Additional fee revenue', 'Increased volume'] },
  { id: 'solvers', title: 'Solvers', items: ['Simple integration'] },
]

/**
 * The columns are parallel AUDIENCES, and each holds a list rather than prose.
 * Real `<ul>`s keep that structure for a screen reader — which is the point of
 * the layout, not decoration.
 */
export const ColumnsAreRealLists: Story = {
  args: { title: 'New DEX Standard', columns: COLUMNS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 2, name: 'New DEX Standard' })).toBeInTheDocument()
    await expect(canvas.getAllByRole('list')).toHaveLength(3)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
    await expect(canvas.getByRole('heading', { level: 3, name: 'Users' })).toBeInTheDocument()
  },
}

/** The intro is optional; without it the heading stands alone. */
export const IntroIsOptional: Story = {
  args: { title: 'New DEX Standard', columns: COLUMNS },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('p')).toHaveLength(0)
  },
}

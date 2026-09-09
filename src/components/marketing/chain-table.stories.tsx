import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ChainTable } from './chain-table'

const meta = {
  title: 'Marketing/ChainTable',
  component: ChainTable,
} satisfies Meta<typeof ChainTable>

export default meta
type Story = StoryObj<typeof meta>

const CHAINS = [
  { name: 'Ethereum', id: 1 },
  { name: 'Base', id: 8453 },
]

/**
 * A real table with headers, not a styled grid. Name and chain ID are two
 * columns of one record and someone is looking a value up, so each cell needs
 * something to be announced against.
 */
export const IsATableWithHeaders: Story = {
  args: { title: 'Supported Chains', nameHeader: 'Chain', idHeader: 'Chain ID', chains: CHAINS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('table')).toBeInTheDocument()
    await expect(canvas.getByRole('columnheader', { name: 'Chain' })).toBeInTheDocument()
    await expect(canvas.getByRole('columnheader', { name: 'Chain ID' })).toBeInTheDocument()
    // Chain names are row headers, so each ID is announced against its chain.
    await expect(canvas.getByRole('rowheader', { name: 'Ethereum' })).toBeInTheDocument()
    await expect(canvas.getByRole('cell', { name: '8453' })).toBeInTheDocument()
  },
}

/** Chain names are proper nouns, marked English in any document. */
export const NamesAreMarkedEnglish: Story = {
  args: { title: 'Supported Chains', nameHeader: 'Chain', idHeader: 'Chain ID', chains: CHAINS },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('th[scope="row"][lang="en"]')).toBeTruthy()
  },
}

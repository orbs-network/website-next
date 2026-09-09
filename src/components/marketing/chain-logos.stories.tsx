import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ChainLogos } from './chain-logos'

const meta = {
  title: 'Marketing/ChainLogos',
  component: ChainLogos,
} satisfies Meta<typeof ChainLogos>

export default meta
type Story = StoryObj<typeof meta>

const CHAINS = [
  { name: 'Ethereum', logo: '/marketing/agentic/chains/ethereum.png' },
  { name: 'Base', logo: '/marketing/agentic/chains/base.png' },
]

/**
 * The chain name is announced once, by the visible text. The logo beside it is
 * decorative — naming it too would give "Ethereum, Ethereum" for every chain.
 */
export const NamesAreAnnouncedOnce: Story = {
  args: { title: 'Chains', chains: CHAINS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Ethereum')).toBeInTheDocument()
    await expect(canvas.queryAllByRole('img')).toHaveLength(0)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}

/** Chain names are proper nouns, so they are marked English in any document. */
export const NamesAreMarkedEnglish: Story = {
  args: { title: 'Chains', chains: CHAINS },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('span[lang="en"]')).toBeTruthy()
  },
}

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
 * Each logo carries its chain's name. The names appear nowhere else in this
 * section, so an empty alt would leave a screen reader with "two images" and no
 * way to know which chains are supported — which is the whole content.
 */
export const LogosAreNamed: Story = {
  args: { title: 'Chains', chains: CHAINS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('img', { name: 'Ethereum' })).toBeInTheDocument()
    await expect(canvas.getByRole('img', { name: 'Base' })).toBeInTheDocument()
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

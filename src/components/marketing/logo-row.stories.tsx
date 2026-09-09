import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LogoRow } from './logo-row'

const meta = {
  title: 'Marketing/LogoRow',
  component: LogoRow,
} satisfies Meta<typeof LogoRow>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { name: 'Ethereum', logo: { src: '/marketing/agentic/chains/ethereum.png', width: 250, height: 250 } },
  { name: 'Base', logo: { src: '/marketing/agentic/chains/base.png', width: 200, height: 200 } },
]

/**
 * The chain name is announced once, by the visible text. The logo beside it is
 * decorative — naming it too would give "Ethereum, Ethereum" for every chain.
 */
export const NamesAreAnnouncedOnce: Story = {
  args: { title: 'Chains', items: ITEMS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Ethereum')).toBeInTheDocument()
    await expect(canvas.queryAllByRole('img')).toHaveLength(0)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}

/** Chain names are proper nouns, so they are marked English in any document. */
export const NamesAreMarkedEnglish: Story = {
  args: { title: 'Chains', items: ITEMS },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('span[lang="en"]')).toBeTruthy()
  },
}

/** Some rows are names only — the institutional venues carry no logos. */
export const LogosAreOptional: Story = {
  args: { title: 'Integrated by leading venues', items: [{ name: 'PancakeSwap' }, { name: 'SushiSwap' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('PancakeSwap')).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('img')).toHaveLength(0)
  },
}

/**
 * Monochrome white wordmarks are inverted in the light theme — without it they
 * are white on a near-white background. Opt-in, because full-colour brand marks
 * must not be inverted.
 */
export const WhiteMarksInvertInLightTheme: Story = {
  args: {
    title: 'Works with existing security infrastructure',
    items: [{ name: 'Ledger', logo: { src: '/marketing/institutional/infra-ledger.svg', width: 160, height: 54 }, invertOnLight: true }],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toHaveClass('invert')
    await expect(canvasElement.querySelector('img')).toHaveClass('dark:invert-0')
  },
}

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
  args: { title: 'Supported Chains', nameHeader: 'Chain', idHeader: 'Chain ID', chains: CHAINS, locale: 'en' },
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

/**
 * Chain names are proper nouns and stay Latin, so inside a Korean document
 * they are marked English.
 *
 * THE LOCALE HERE MUST NOT BE ENGLISH, and that is the whole point of the
 * story rather than a detail of its setup. `textLang` returns 'en' only for
 * Latin text inside a NON-Latin document; in an English one there is nothing
 * to distinguish Latin from, so it returns `undefined` and no attribute is
 * emitted.
 *
 * This assertion used to pass against a hardcoded `lang="en"` on the cell, so
 * it held at any locale. Now that the value is derived, running it at 'en'
 * would find no attribute and the story would either fail or — if someone
 * "fixed" it by loosening the selector — silently assert nothing.
 */
export const NamesAreMarkedEnglish: Story = {
  args: { title: '지원 체인', nameHeader: '체인', idHeader: '체인 ID', chains: CHAINS, locale: 'ko' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('th[scope="row"][lang="en"]')).toBeTruthy()

    // And the Korean heading beside them is NOT marked English — the pair is
    // what one section-level `lang` could never get right at once.
    await expect(canvasElement.querySelector('h2')).not.toHaveAttribute('lang', 'en')
  },
}

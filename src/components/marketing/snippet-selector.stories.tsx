import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SnippetSelector } from './snippet-selector'
import { TON_ACCESS_FLAVORS, TON_ACCESS_NETWORKS, TON_ACCESS_SNIPPETS, snippetKey } from '@/content/pages/ton-access'

const meta = {
  title: 'Marketing/SnippetSelector',
  component: SnippetSelector,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SnippetSelector>

export default meta
type Story = StoryObj<typeof meta>

const LABELS = {
  flavor: 'HTTP API Flavor',
  library: 'Client Library',
  network: 'Network',
  copy: 'Copy',
  copied: 'Copied',
}

/** The real data, so the stories fail if the page's matrix goes wrong. */
const args = {
  flavors: TON_ACCESS_FLAVORS,
  networks: TON_ACCESS_NETWORKS.map((id) => ({ id, label: id })),
  snippets: TON_ACCESS_SNIPPETS,
  labels: LABELS,
}

export const Default: Story = { args }

/**
 * The defect this component exists to fix.
 *
 * The legacy page offers all four client libraries whatever flavour is chosen,
 * so 14 of its 24 combinations render an empty code block. Here the library
 * options come from the flavour, and there is nothing empty to reach.
 */
export const LibraryOptionsFollowTheFlavor: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const flavor = canvas.getByLabelText(LABELS.flavor)
    const library = canvas.getByLabelText(LABELS.library)

    const options = () =>
      within(library as HTMLElement)
        .getAllByRole('option')
        .map((option) => (option as HTMLOptionElement).value)

    await userEvent.selectOptions(flavor, 'toncenter-http-api-v2')
    await expect(options()).toEqual(['npm-ton', 'npm-tonweb', 'cdn-tonweb'])

    // ADNL is not HTTP, so the HTTP libraries cannot speak it. One option, not
    // four with three dead ends.
    await userEvent.selectOptions(flavor, 'raw-adnl-api')
    await expect(options()).toEqual(['ton-lite-client'])

    await userEvent.selectOptions(flavor, 'tonhub-http-api-v4')
    await expect(options()).toEqual(['npm-ton'])
  },
}

/**
 * Every combination a reader can reach shows code.
 *
 * Walked exhaustively rather than spot-checked: the failure being guarded
 * against is one specific pair among several, and a sample would find it only
 * by luck.
 */
export const NoReachableCombinationIsEmpty: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const flavor = canvas.getByLabelText(LABELS.flavor)
    const library = canvas.getByLabelText(LABELS.library)
    const network = canvas.getByLabelText(LABELS.network)
    const code = canvasElement.querySelector('pre code')

    let reached = 0

    for (const candidate of TON_ACCESS_FLAVORS) {
      await userEvent.selectOptions(flavor, candidate.id)

      for (const lib of candidate.libraries) {
        await userEvent.selectOptions(library, lib.id)

        for (const net of TON_ACCESS_NETWORKS) {
          await userEvent.selectOptions(network, net)
          reached += 1

          await expect(code?.textContent?.trim(), snippetKey(candidate.id, lib.id, net)).toBeTruthy()
        }
      }
    }

    await expect(reached).toBe(10)
  },
}

/**
 * Switching flavour keeps the library where both support it. Someone comparing
 * TonCenter v2 against TonHub v4 for `NPM ton` should not have their choice
 * silently reset under them.
 */
export const KeepsTheLibraryWhenTheNewFlavorSupportsIt: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const flavor = canvas.getByLabelText(LABELS.flavor)
    const library = canvas.getByLabelText(LABELS.library)

    await userEvent.selectOptions(flavor, 'toncenter-http-api-v2')
    await userEvent.selectOptions(library, 'npm-ton')
    await userEvent.selectOptions(flavor, 'tonhub-http-api-v4')

    await expect((library as HTMLSelectElement).value).toBe('npm-ton')
  },
}

/**
 * Leaving a flavour whose library the next one cannot use has to move the
 * selection, and move it in the same update — not in an effect afterwards,
 * which would paint one frame of a pair that cannot exist.
 */
export const MovesTheLibraryWhenTheNewFlavorCannotUseIt: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const flavor = canvas.getByLabelText(LABELS.flavor)
    const library = canvas.getByLabelText(LABELS.library)

    await userEvent.selectOptions(flavor, 'toncenter-http-api-v2')
    await userEvent.selectOptions(library, 'cdn-tonweb')
    await userEvent.selectOptions(flavor, 'raw-adnl-api')

    await expect((library as HTMLSelectElement).value).toBe('ton-lite-client')
  },
}

/** Source code is English inside a Korean or Japanese document. */
export const CodeIsMarkedEnglish: Story = {
  args,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('pre[lang="en"]')).toBeTruthy()
  },
}

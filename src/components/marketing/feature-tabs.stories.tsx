import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { FeatureTabs } from './feature-tabs'

const meta = {
  title: 'Marketing/FeatureTabs',
  component: FeatureTabs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FeatureTabs>

export default meta
type Story = StoryObj<typeof meta>

const TABS = [
  { id: 'nonCustodial', title: 'Non-custodial by design', panel: 'No custody handoff. No counterparty risk on Orbs.' },
  { id: 'gasless', title: 'Gasless across every product', panel: 'Gasless across every product.' },
  { id: 'mev', title: 'MEV protection', panel: 'MEV protection.' },
]

const args = { tabs: TABS }

export const Default: Story = { args }

/** One tab selected, one panel, and the panel says it belongs to that tab. */
export const SelectedTabOwnsThePanel: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const selected = canvas.getAllByRole('tab', { selected: true })
    await expect(selected).toHaveLength(1)
    await expect(selected[0]).toHaveTextContent(TABS[0].title)

    const panel = canvas.getByRole('tabpanel')
    await expect(panel).toHaveTextContent(TABS[0].panel)
    // The panel is labelled BY the tab, so it is announced as belonging to it.
    await expect(panel.getAttribute('aria-labelledby')).toBe(selected[0].id)
  },
}

export const ClickingATabShowsItsPanel: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('tab', { name: TABS[2].title }))

    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(TABS[2].panel)
  },
}

/**
 * Arrow keys move between tabs and take focus with them.
 *
 * This is the half of the tabs pattern that gets skipped. Without it the arrow
 * key changes the panel but leaves focus behind, so the next press starts from
 * the old position and the list stops making sense.
 */
export const ArrowKeysMoveSelectionAndFocus: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('tab', { name: TABS[0].title })

    first.focus()
    await userEvent.keyboard('{ArrowDown}')

    await waitFor(async () => {
      await expect(canvas.getByRole('tab', { name: TABS[1].title })).toHaveFocus()
    })
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(TABS[1].panel)
  },
}

/** Up from the first wraps to the last, rather than dead-ending. */
export const ArrowKeysWrapAtTheEnds: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    canvas.getByRole('tab', { name: TABS[0].title }).focus()
    await userEvent.keyboard('{ArrowUp}')

    await waitFor(async () => {
      await expect(canvas.getByRole('tab', { name: TABS[2].title })).toHaveFocus()
    })
  },
}

/**
 * Exactly one tab is in the page's tab order.
 *
 * Eight tabs each with `tabIndex=0` would put eight stops between the heading
 * above and the buttons below. The arrow keys are what move within the group.
 */
export const OnlyTheSelectedTabIsInTheTabOrder: Story = {
  args,
  play: async ({ canvasElement }) => {
    const reachable = canvas_tabs(canvasElement).filter((tab) => tab.tabIndex === 0)

    await expect(reachable).toHaveLength(1)
    await expect(reachable[0]).toHaveAttribute('aria-selected', 'true')
  },
}

function canvas_tabs(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'))
}

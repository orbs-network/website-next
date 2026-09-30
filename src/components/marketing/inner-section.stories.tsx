import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { InnerSection, PointColumns } from './inner-section'

/**
 * The legacy inner pages' sections on the master's vocabulary (#227): rule,
 * bracketed eyebrow, left-aligned heading, unboxed points.
 */
const meta = {
  title: 'Marketing/InnerSection',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const AUDIENCES = [
  { id: 'institutional', title: 'Institutional users', list: ['Trading desks', 'OTC desks', 'Asset managers'] },
  { id: 'partners', title: 'Infrastructure & access partners', list: ['Wallets & MPC providers', 'Custodians'] },
]

/**
 * Two audiences fill two columns beside the heading — the layout that
 * replaced a three-column grid with its right third empty.
 */
export const SplitWithLists: Story = {
  render: () => (
    <InnerSection eyebrow="[Audience]" heading="Who is it for?" locale="en">
      <PointColumns columns={2} points={AUDIENCES} locale="en" />
    </InnerSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 2, name: 'Who is it for?' })).toBeInTheDocument()
    // Under a section heading the points are one level down.
    await expect(canvas.getByRole('heading', { level: 3, name: 'Institutional users' })).toBeInTheDocument()
    // The eyebrow labels the section for the eye; it is not a level in the outline.
    await expect(canvas.queryByRole('heading', { name: '[Audience]' })).not.toBeInTheDocument()
    // One outer list of points, one inner list per audience, every line a real item.
    await expect(canvas.getAllByRole('list')).toHaveLength(3)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(7)
  },
}

/**
 * Without a section heading the points are the section's top level, so the
 * caller raises them to `h2` rather than skipping from the page `h1` to `h3`.
 */
export const HeadinglessPointsAreH2: Story = {
  render: () => (
    <section className="container">
      <PointColumns
        columns={2}
        headingLevel="h2"
        ruled={false}
        points={[
          { id: 'challenge', label: '[Pain]', title: 'On-chain Trading Challenges', body: 'Liquidity is fragmented.' },
          { id: 'solution', label: '[Solution]', title: 'Layer 3 Technology Stack', body: 'A decentralized backend.' },
        ]}
        locale="en"
      />
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    await expect(canvas.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  },
}

/** Stacked: the heading and intro span the top, the points run full width beneath. */
export const StackedWithIntro: Story = {
  render: () => (
    <InnerSection
      eyebrow="[Benefits]"
      heading={'How do Users Benefit from\nProtocols Powered by Orbs'}
      intro="Users benefit in several key ways:"
      layout="stacked"
      locale="en"
    >
      <PointColumns
        columns={3}
        points={[
          { id: 'a', title: 'Advanced orders', body: 'Limit and TWAP orders on chain.' },
          { id: 'b', title: 'Competitive pricing', body: 'Aggregated liquidity.' },
          { id: 'c', title: 'Decentralization', body: 'No centralized backend.' },
        ]}
        locale="en"
      />
    </InnerSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Users benefit in several key ways:')).toBeInTheDocument()
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3)
  },
}

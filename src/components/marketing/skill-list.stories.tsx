import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SkillList } from './skill-list'

const meta = {
  title: 'Marketing/SkillList',
  component: SkillList,
} satisfies Meta<typeof SkillList>

export default meta
type Story = StoryObj<typeof meta>

const SKILLS = [
  {
    id: 'spotOrders',
    name: 'Spot Advanced Swap Orders',
    // Already locale-resolved by the page, so it carries the trailing slash
    // `trailingSlash: true` requires.
    href: '/ai/skills/spot-advanced-swap-orders/',
    chains: ['Ethereum', 'Base'],
    orderTypes: ['TWAP', 'Limit'],
    description: 'Gasless limit, stop-loss, take-profit and TWAP orders.',
  },
]

/**
 * A skill is a catalogue entry: structured metadata beside its description.
 * The chains and order types are `<dl>` pairs rather than prose, because that
 * is what a reader scans for.
 */
export const MetadataIsADescriptionList: Story = {
  args: { title: 'AI Skills', chainsLabel: 'Chains', orderTypesLabel: 'Order types', skills: SKILLS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('heading', { level: 2, name: 'AI Skills' })).toBeInTheDocument()
    await expect(canvas.getByText('Chains')).toBeInTheDocument()
    await expect(canvas.getByText('Ethereum, Base')).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('dt')).toHaveLength(2)
  },
}

/** The card is clickable, but named by the skill rather than by all its text. */
export const CardIsNamedByTheSkill: Story = {
  args: { title: 'AI Skills', chainsLabel: 'Chains', orderTypesLabel: 'Order types', skills: SKILLS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'Spot Advanced Swap Orders' })

    await expect(link).toHaveAttribute('href', '/ai/skills/spot-advanced-swap-orders/')
    await expect(link).toHaveAttribute('lang', 'en')
  },
}

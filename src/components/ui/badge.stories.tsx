import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['research', 'partnership'],
      description: 'The visual style of the badge',
    },
  },
  args: {
    children: 'Research',
    variant: 'research',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Research: Story = {
  args: {
    variant: 'research',
    children: 'Research',
  },
}

export const Partnership: Story = {
  args: {
    variant: 'partnership',
    children: 'Partnership',
  },
}

export const Group: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="research">Research</Badge>
      <Badge variant="partnership">Partnership</Badge>
    </div>
  ),
}

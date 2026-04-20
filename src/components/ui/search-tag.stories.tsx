import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { SearchTag } from './search-tag'

const meta = {
  title: 'UI/SearchTag',
  component: SearchTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Whether the tag is in the selected/active state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tag is disabled',
    },
  },
  args: {
    onClick: fn(),
    children: 'Integration',
  },
} satisfies Meta<typeof SearchTag>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  args: {
    active: false,
  },
}

export const Active: Story = {
  args: {
    active: true,
  },
}

export const Group: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    const labels = ['Integration', 'Partnership', 'Research'] as const
    const [selected, setSelected] = React.useState<(typeof labels)[number]>('Partnership')
    return (
      <div className="flex flex-wrap items-center gap-2">
        {labels.map((label) => (
          <SearchTag key={label} active={selected === label} onClick={() => setSelected(label)}>
            {label}
          </SearchTag>
        ))}
      </div>
    )
  },
}

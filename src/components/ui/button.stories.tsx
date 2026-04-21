import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { Download } from 'lucide-react'

import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child component using Radix Slot',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    noIcon: {
      control: 'boolean',
      description: 'Suppress the trailing icon (primary variant only)',
    },
  },
  args: {
    onClick: fn(),
    children: 'Get in Touch',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Primary variant states
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
}

export const PrimaryNoIcon: Story = {
  args: {
    variant: 'primary',
    noIcon: true,
  },
}

export const PrimaryCustomIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Download',
    icon: <Download className="size-4" />,
  },
}

// Secondary variant states
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Join Community',
  },
}

export const SecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    children: 'Join Community',
    disabled: true,
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Default: Story = {
  args: {
    size: 'default',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

// All combinations
export const AllStates: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Primary</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Get in Touch</Button>
          <Button variant="primary" disabled>
            Get in Touch
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Secondary</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary">Join Community</Button>
          <Button variant="secondary" disabled>
            Join Community
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Sizes</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="default">
            Default
          </Button>
          <Button variant="secondary" size="lg">
            Large
          </Button>
        </div>
      </div>
    </div>
  ),
}

// Dark background rendering
export const AllStatesDark: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark bg-bg p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Get in Touch</Button>
        <Button variant="primary" disabled>
          Get in Touch
        </Button>
        <Button variant="secondary">Join Community</Button>
        <Button variant="secondary" disabled>
          Join Community
        </Button>
      </div>
    </div>
  ),
}

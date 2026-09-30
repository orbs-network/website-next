import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'
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
      options: ['primary', 'secondary', 'solid'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'default'],
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

/**
 * Solid: the hero's main action. Filled with the text colour, so the label has
 * to take the BACKGROUND colour or it disappears into its own fill. And it
 * keeps the arrow, unlike `secondary`.
 */
export const Solid: Story = {
  args: {
    variant: 'solid',
    children: 'Talk to the team',
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    const style = getComputedStyle(button)

    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    await expect(style.color).not.toBe(style.backgroundColor)
    await expect(button.querySelector('svg')).toBeTruthy()
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

/**
 * Pins the design-system CTA (#229): 33px tall, 11px regular, 0.08em tracking.
 * The tracking check is the one worth having — a `tracking-*` utility on the
 * base class silently beats the token's letter-spacing, which is how the
 * button shipped at 0.025em before.
 */
export const Default: Story = {
  args: {
    size: 'default',
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    const style = getComputedStyle(button)

    await expect(button.getBoundingClientRect().height).toBe(33)
    await expect(style.fontSize).toBe('11px')
    await expect(style.fontWeight).toBe('400')
    await expect(style.letterSpacing).toBe('0.88px')
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
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="default">
            Default
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

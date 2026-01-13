import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { Mail, ChevronRight, Loader2 } from 'lucide-react'

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
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child component using Radix Slot',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
  args: {
    onClick: fn(),
    children: 'Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Variants
export const Default: Story = {
  args: {
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <ChevronRight className="h-4 w-4" />,
    'aria-label': 'Next',
  },
}

// With Icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="h-4 w-4" />
        Login with Email
      </>
    ),
  },
}

export const IconRight: Story = {
  args: {
    children: (
      <>
        Continue
        <ChevronRight className="h-4 w-4" />
      </>
    ),
  },
}

// States
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
}

// All Variants Overview
export const AllVariants: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
}

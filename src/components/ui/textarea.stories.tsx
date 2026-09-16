import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name, and the default placeholder',
    },
    error: {
      control: 'text',
      description: 'Optional error message shown beneath the field',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    rows: {
      control: 'number',
      description: 'Visible line count before scrolling',
    },
  },
  args: {
    onChange: fn(),
    label: 'Message',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The contact form's shape: a distinct prompt in the box, a short name for AT. */
export const SeparatePlaceholder: Story = {
  args: {
    label: 'Message',
    placeholder: 'Something you want to tell us? Or maybe to ask?',
  },
}

export const Filled: Story = {
  args: {
    defaultValue: 'We are building a perpetuals venue and would like to talk about Liquidity Hub.',
  },
}

export const WithError: Story = {
  args: {
    error: 'Please fill the field',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'Sending…',
    disabled: true,
  },
}

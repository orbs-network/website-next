import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { Field } from './field'

const meta = {
  title: 'UI/Field',
  component: Field,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Placeholder/label text rendered inside the input',
    },
    error: {
      control: 'text',
      description: 'Optional error message shown beneath the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'url', 'number'],
      description: 'The HTML input type',
    },
  },
  args: {
    onChange: fn(),
    label: 'Your name',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Your name',
  },
}

export const Filled: Story = {
  args: {
    label: 'Your name',
  },
  render: (args) => {
    const ControlledField = () => {
      const [value, setValue] = React.useState('Ada Lovelace')
      return <Field {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    }
    return <ControlledField />
  },
}

export const Focused: Story = {
  args: {
    label: 'Your name',
    autoFocus: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Your name',
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'not-an-email',
    error: 'Please enter a valid email address',
  },
}

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    name: 'email',
  },
}

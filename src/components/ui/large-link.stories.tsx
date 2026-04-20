import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LargeLink } from './large-link'

const meta = {
  title: 'UI/LargeLink',
  component: LargeLink,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    href: '#',
    children: 'Whitepapers',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LargeLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const AllStates: Story = {
  parameters: { controls: { hideNoControlsWarning: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <LargeLink href="#">Whitepapers</LargeLink>
      <LargeLink href="#" disabled>
        Whitepapers
      </LargeLink>
    </div>
  ),
}

export const AllStatesDark: Story = {
  parameters: { controls: { hideNoControlsWarning: true }, backgrounds: { default: 'dark' } },
  render: () => (
    <div className="dark bg-bg p-8">
      <div className="flex flex-col gap-6">
        <LargeLink href="#">Whitepapers</LargeLink>
        <LargeLink href="#" disabled>
          Whitepapers
        </LargeLink>
      </div>
    </div>
  ),
}

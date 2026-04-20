import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SecondaryNavLink } from './secondary-nav-link'

const meta = {
  title: 'UI/SecondaryNavLink',
  component: SecondaryNavLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
    active: { control: 'boolean' },
  },
  args: {
    href: '#',
    children: 'All',
  },
} satisfies Meta<typeof SecondaryNavLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    active: false,
  },
}

export const Active: Story = {
  args: {
    active: true,
  },
}

export const AllStates: Story = {
  parameters: { controls: { hideNoControlsWarning: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <SecondaryNavLink href="#">All</SecondaryNavLink>
      <SecondaryNavLink href="#" active>
        Products
      </SecondaryNavLink>
      <SecondaryNavLink href="#">Developers</SecondaryNavLink>
    </div>
  ),
}

export const AllStatesDark: Story = {
  parameters: { controls: { hideNoControlsWarning: true }, backgrounds: { default: 'dark' } },
  render: () => (
    <div className="dark bg-bg p-8">
      <div className="flex items-center gap-6">
        <SecondaryNavLink href="#">All</SecondaryNavLink>
        <SecondaryNavLink href="#" active>
          Products
        </SecondaryNavLink>
        <SecondaryNavLink href="#">Developers</SecondaryNavLink>
      </div>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MenuItem, MenuItemW } from './menu-item'

const meta = {
  title: 'UI/MenuItem',
  component: MenuItem,
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
    children: 'Menu Item',
  },
} satisfies Meta<typeof MenuItem>

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

export const AsButton: Story = {
  args: {
    href: undefined,
    children: 'Menu Item (button)',
  },
}

export const AllStates: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <MenuItem href="#">Menu Item</MenuItem>
      <MenuItem href="#" active>
        Menu Item Active
      </MenuItem>
    </div>
  ),
}

export const AllStatesDark: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark bg-bg p-8">
      <div className="flex flex-col gap-6">
        <MenuItem href="#">Menu Item</MenuItem>
        <MenuItem href="#" active>
          Menu Item Active
        </MenuItem>
      </div>
    </div>
  ),
}

// MenuItemW (title-case + optional icon)
type MenuItemWStory = StoryObj<typeof MenuItemW>

export const MenuItemWDefault: MenuItemWStory = {
  render: () => <MenuItemW href="#">Liquidity Hub</MenuItemW>,
}

export const MenuItemWWithIcon: MenuItemWStory = {
  render: () => (
    <MenuItemW
      href="#"
      icon={<span className="inline-block size-4 rounded-full bg-periwinkle-300" aria-hidden="true" />}
    >
      Liquidity Hub
    </MenuItemW>
  ),
}

export const MenuItemWActive: MenuItemWStory = {
  render: () => (
    <MenuItemW href="#" active>
      Liquidity Hub
    </MenuItemW>
  ),
}

export const MenuItemWAllStates: MenuItemWStory = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MenuItemW href="#">Liquidity Hub</MenuItemW>
      <MenuItemW
        href="#"
        icon={<span className="inline-block size-4 rounded-full bg-periwinkle-300" aria-hidden="true" />}
      >
        Liquidity Hub
      </MenuItemW>
      <MenuItemW href="#" active>
        Liquidity Hub (active)
      </MenuItemW>
    </div>
  ),
}

export const MenuItemWAllStatesDark: MenuItemWStory = {
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="dark bg-bg p-8">
      <div className="flex flex-col gap-4">
        <MenuItemW href="#">Liquidity Hub</MenuItemW>
        <MenuItemW
          href="#"
          icon={<span className="inline-block size-4 rounded-full bg-periwinkle-300" aria-hidden="true" />}
        >
          Liquidity Hub
        </MenuItemW>
        <MenuItemW href="#" active>
          Liquidity Hub (active)
        </MenuItemW>
      </div>
    </div>
  ),
}

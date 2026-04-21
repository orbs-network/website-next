import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FooterLink1, FooterLink2 } from './footer-link'

const meta = {
  title: 'UI/FooterLink',
  component: FooterLink1,
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
    children: 'Liquidity Hub',
  },
} satisfies Meta<typeof FooterLink1>

export default meta
type Story = StoryObj<typeof meta>

export const FooterLink1Default: Story = {
  args: {
    active: false,
  },
}

export const FooterLink1Active: Story = {
  args: {
    active: true,
  },
}

type FooterLink2Story = StoryObj<typeof FooterLink2>

export const FooterLink2Default: FooterLink2Story = {
  render: () => <FooterLink2 href="#">Terms and Conditions</FooterLink2>,
}

export const FooterLink2Active: FooterLink2Story = {
  render: () => (
    <FooterLink2 href="#" active>
      Terms and Conditions
    </FooterLink2>
  ),
}

export const AllStates: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Footer Link 1</p>
        <FooterLink1 href="#">Liquidity Hub</FooterLink1>
        <FooterLink1 href="#" active>
          Liquidity Hub (active)
        </FooterLink1>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-detail uppercase tracking-wide text-fg-muted">Footer Link 2</p>
        <FooterLink2 href="#">Terms and Conditions</FooterLink2>
        <FooterLink2 href="#" active>
          Terms and Conditions (active)
        </FooterLink2>
      </div>
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
        <FooterLink1 href="#">Liquidity Hub</FooterLink1>
        <FooterLink1 href="#" active>
          Liquidity Hub (active)
        </FooterLink1>
        <FooterLink2 href="#">Terms and Conditions</FooterLink2>
        <FooterLink2 href="#" active>
          Terms and Conditions (active)
        </FooterLink2>
      </div>
    </div>
  ),
}

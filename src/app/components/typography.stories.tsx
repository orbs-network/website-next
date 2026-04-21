import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Detail, FieldInput, H1, H2, H3, H4, H5, P } from './typography'

const meta = {
  title: 'UI/Typography',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const sample = 'The quick brown fox jumps over the lazy dog'

export const All: Story = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => (
    <div className="flex flex-col gap-8 bg-bg p-8">
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">H1 — 72/80 · 400</span>
        <H1>{sample}</H1>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">H2 — 56/64 · 400</span>
        <H2>{sample}</H2>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">H3 regular — 32/40 · 400</span>
        <H3>{sample}</H3>
        <span className="text-detail text-fg-muted font-medium uppercase">H3 medium — 32/40 · 600</span>
        <H3 weight="medium">{sample}</H3>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">H4 — 22/30 · 400</span>
        <H4>{sample}</H4>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">H5 — 14/20 · 600 · uppercase</span>
        <H5>{sample}</H5>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">P — 18/28 · 400</span>
        <P>{sample}</P>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">Detail — 11/16 · 500 · uppercase</span>
        <Detail>{sample}</Detail>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-detail text-fg-muted font-medium uppercase">FieldInput — 20/28 · 400</span>
        <FieldInput>{sample}</FieldInput>
      </section>
    </div>
  ),
}

export const H1Story: Story = {
  name: 'H1',
  render: () => <H1>{sample}</H1>,
}

export const H2Story: Story = {
  name: 'H2',
  render: () => <H2>{sample}</H2>,
}

export const H3Regular: Story = {
  name: 'H3 / Regular',
  render: () => <H3>{sample}</H3>,
}

export const H3Medium: Story = {
  name: 'H3 / Medium',
  render: () => <H3 weight="medium">{sample}</H3>,
}

export const H4Story: Story = {
  name: 'H4',
  render: () => <H4>{sample}</H4>,
}

export const H5Story: Story = {
  name: 'H5',
  render: () => <H5>{sample}</H5>,
}

export const PStory: Story = {
  name: 'P',
  render: () => <P>{sample}</P>,
}

export const DetailStory: Story = {
  name: 'Detail',
  render: () => <Detail>{sample}</Detail>,
}

export const FieldInputStory: Story = {
  name: 'FieldInput',
  render: () => <FieldInput>{sample}</FieldInput>,
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

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

/**
 * The heading scale is FLUID, and this is what proves it (#108).
 *
 * `text-h1` and `text-h2` were fixed at their desktop sizes with no smaller
 * step, so one long word could be wider than a phone's content area and
 * scroll the whole page sideways. They are `clamp()` now, reaching the
 * design's exact desktop size at 1440px and a safe floor at 390px.
 *
 * Asserted as a RANGE rather than a number, because the whole point is that
 * there is no single number: the runner's viewport sits between the two ends,
 * so a size strictly inside the range is the evidence of fluidity. Pin either
 * token back to a fixed value and it lands exactly on the maximum, and these
 * fail.
 */
export const ScaleIsFluid: Story = {
  name: 'Heading scale is fluid',
  render: () => (
    <div>
      <H1>Works with existing security infrastructure</H1>
      <H2>Works with existing security infrastructure</H2>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const size = (sel: string) => parseFloat(getComputedStyle(canvasElement.querySelector(sel)!).fontSize)

    const h1 = size('h1')
    const h2 = size('h2')

    // Between the floor and the design's desktop size, exclusive at the top.
    expect(h1).toBeGreaterThanOrEqual(40)
    expect(h1).toBeLessThan(72)
    expect(h2).toBeGreaterThanOrEqual(32)
    expect(h2).toBeLessThan(56)

    // The scale still descends. A clamp typo that crossed two levels over
    // would keep both in range and still be wrong.
    expect(h1).toBeGreaterThan(h2)

    /*
      And no hyphenation. #107 set `hyphens-auto` on H2 as a stopgap for the
      overflow this replaces; hyphenating a display heading was always the
      worse of the two outcomes, and leaving it in place would hide a
      regression in the scale rather than let it show.
    */
    expect(getComputedStyle(canvasElement.querySelector('h2')!).hyphens).not.toBe('auto')
  },
}

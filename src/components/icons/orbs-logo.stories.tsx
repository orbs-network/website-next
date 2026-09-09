import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { OrbsLogo } from './orbs-logo'
import { OrbsMark } from './orbs-mark'

const meta = {
  title: 'Icons/OrbsLogo',
  component: OrbsLogo,
} satisfies Meta<typeof OrbsLogo>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The wordmark is real text, not an SVG `<text>` node as the placeholder had
 * it. That is what lets it be selected and read, and what stops it rendering in
 * a fallback font when Montserrat is slow.
 */
export const WordmarkIsRealText: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Orbs')).toBeInTheDocument()
    await expect(canvasElement.querySelectorAll('text')).toHaveLength(0)
  },
}

/**
 * The mark is decorative inside the lockup: the wordmark beside it already
 * names the thing, so exposing the SVG's own `role="img"` would name one
 * lockup twice (#84).
 */
export const MarkIsDecorativeInsideTheLockup: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.queryAllByRole('img')).toHaveLength(0)
    await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  },
}

/**
 * The colour variant paints from a gradient; the others do not, so they must
 * not emit an unused definition — and must not resolve against the colour
 * variant's, which is why the id is keyed on the variant.
 */
export const OnlyTheColourVariantDefinesAGradient: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')

    await expect(svg?.querySelectorAll('linearGradient')).toHaveLength(1)
    await expect(svg?.querySelector('linearGradient')?.id).toBe('orbs-mark-color')
    // One definition for all 38 segments, not one each as the export had it.
    await expect(svg?.querySelectorAll('path').length).toBeGreaterThan(30)
  },
}

export const WhiteVariantHasNoGradient: Story = {
  args: { variant: 'white' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')

    await expect(svg?.querySelectorAll('linearGradient')).toHaveLength(0)
    await expect(svg?.querySelector('path')).toHaveAttribute('fill', '#ffffff')
  },
}

export const DarkVariantInheritsCurrentColor: Story = {
  args: { variant: 'dark' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    await expect(svg?.querySelector('path')).toHaveAttribute('fill', 'currentColor')
  },
}

/**
 * Standalone, the mark keeps its own accessible name — nothing else on the
 * page supplies one. This is the `HomeHero` case.
 */
export const MarkAloneIsNamed: Story = {
  args: {},
  render: () => <OrbsMark />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('img', { name: 'Orbs' })).toBeInTheDocument()
  },
}

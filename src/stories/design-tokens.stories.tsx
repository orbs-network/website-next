import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Mirrors the literal palette defined in src/app/globals.css. Keeping the hex
// values inline (rather than reading them via getComputedStyle at render time)
// makes the story robust in the headless-browser test runner where computed
// styles for CSS variables can be whitespace-padded.
type Swatch = { token: string; hex: string; className: string }

const neutrals: Swatch[] = [
  { token: '--color-neutral-100', hex: '#FFFFFF', className: 'bg-neutral-100' },
  { token: '--color-neutral-200', hex: '#F6F6F6', className: 'bg-neutral-200' },
  { token: '--color-neutral-300', hex: '#E2E2E2', className: 'bg-neutral-300' },
  { token: '--color-neutral-400', hex: '#C5C5C5', className: 'bg-neutral-400' },
  { token: '--color-neutral-500', hex: '#59595A', className: 'bg-neutral-500' },
  { token: '--color-neutral-600', hex: '#414142', className: 'bg-neutral-600' },
  { token: '--color-neutral-700', hex: '#29292B', className: 'bg-neutral-700' },
  { token: '--color-neutral-900', hex: '#121214', className: 'bg-neutral-900' },
]

const periwinkle: Swatch[] = [
  { token: '--color-periwinkle-100', hex: '#EBEDFC', className: 'bg-periwinkle-100' },
  { token: '--color-periwinkle-200', hex: '#CAD0F6', className: 'bg-periwinkle-200' },
  { token: '--color-periwinkle-300', hex: '#95A1ED', className: 'bg-periwinkle-300' },
  { token: '--color-periwinkle-400', hex: '#7A89E9', className: 'bg-periwinkle-400' },
  { token: '--color-periwinkle-500', hex: '#626EBA', className: 'bg-periwinkle-500' },
  { token: '--color-periwinkle-600', hex: '#49528C', className: 'bg-periwinkle-600' },
  { token: '--color-periwinkle-700', hex: '#31375D', className: 'bg-periwinkle-700' },
]

const pink: Swatch[] = [
  { token: '--color-pink-100', hex: '#F8EDF9', className: 'bg-pink-100' },
  { token: '--color-pink-200', hex: '#EED6EF', className: 'bg-pink-200' },
  { token: '--color-pink-300', hex: '#E0ABE2', className: 'bg-pink-300' },
  { token: '--color-pink-400', hex: '#DC8AE0', className: 'bg-pink-400' },
  { token: '--color-pink-500', hex: '#B06EB3', className: 'bg-pink-500' },
  { token: '--color-pink-600', hex: '#58375A', className: 'bg-pink-600' },
  { token: '--color-pink-700', hex: '#2C1C2D', className: 'bg-pink-700' },
]

const cyan: Swatch[] = [
  { token: '--color-cyan-100', hex: '#D9FAFC', className: 'bg-cyan-100' },
  { token: '--color-cyan-200', hex: '#99F2F6', className: 'bg-cyan-200' },
  { token: '--color-cyan-300', hex: '#67E9F4', className: 'bg-cyan-300' },
  { token: '--color-cyan-400', hex: '#2CEDFC', className: 'bg-cyan-400' },
  { token: '--color-cyan-500', hex: '#23BECA', className: 'bg-cyan-500' },
  { token: '--color-cyan-600', hex: '#125F65', className: 'bg-cyan-600' },
  { token: '--color-cyan-700', hex: '#082F32', className: 'bg-cyan-700' },
]

const lilac: Swatch[] = [
  { token: '--color-lilac-100', hex: '#ECE7F9', className: 'bg-lilac-100' },
  { token: '--color-lilac-200', hex: '#D3C6F4', className: 'bg-lilac-200' },
  { token: '--color-lilac-300', hex: '#B99DEE', className: 'bg-lilac-300' },
  { token: '--color-lilac-400', hex: '#A17AE9', className: 'bg-lilac-400' },
  { token: '--color-lilac-500', hex: '#8165C7', className: 'bg-lilac-500' },
  { token: '--color-lilac-600', hex: '#403263', className: 'bg-lilac-600' },
  { token: '--color-lilac-700', hex: '#201932', className: 'bg-lilac-700' },
]

const indigo: Swatch[] = [
  { token: '--color-indigo-100', hex: '#D9DFFC', className: 'bg-indigo-100' },
  { token: '--color-indigo-200', hex: '#99A7F6', className: 'bg-indigo-200' },
  { token: '--color-indigo-300', hex: '#5C6FF4', className: 'bg-indigo-300' },
  { token: '--color-indigo-400', hex: '#3346F2', className: 'bg-indigo-400' },
  { token: '--color-indigo-500', hex: '#1A2379', className: 'bg-indigo-500' },
  { token: '--color-indigo-600', hex: '#0D123D', className: 'bg-indigo-600' },
  { token: '--color-indigo-700', hex: '#0D123D', className: 'bg-indigo-700' },
]

const coral: Swatch[] = [
  { token: '--color-coral-100', hex: '#FFF2F2', className: 'bg-coral-100' },
  { token: '--color-coral-200', hex: '#FFD7D8', className: 'bg-coral-200' },
  { token: '--color-coral-300', hex: '#FFAEAF', className: 'bg-coral-300' },
  { token: '--color-coral-400', hex: '#FFADAE', className: 'bg-coral-400' },
  { token: '--color-coral-500', hex: '#CC8788', className: 'bg-coral-500' },
  { token: '--color-coral-600', hex: '#664344', className: 'bg-coral-600' },
  { token: '--color-coral-700', hex: '#332122', className: 'bg-coral-700' },
]

type SemanticSwatch = { token: string; cssVar: string; className: string; description: string }

const semantics: SemanticSwatch[] = [
  { token: 'bg', cssVar: '--color-bg', className: 'bg-bg', description: 'App background' },
  { token: 'surface', cssVar: '--color-surface', className: 'bg-surface', description: 'Card / elevated surface' },
  { token: 'fg', cssVar: '--color-fg', className: 'bg-fg', description: 'Primary foreground / body text' },
  { token: 'fg-muted', cssVar: '--color-fg-muted', className: 'bg-fg-muted', description: 'Secondary / muted text' },
  { token: 'border', cssVar: '--color-border', className: 'bg-border', description: 'Default border' },
  {
    token: 'accent-primary',
    cssVar: '--color-accent-primary',
    className: 'bg-accent-primary',
    description: 'Primary accent / CTA fill',
  },
  { token: 'link', cssVar: '--color-link', className: 'bg-link', description: 'Link color' },
]

type TypeSample = { name: string; className: string; sample: string }

const typeSamples: TypeSample[] = [
  { name: 'H1 / 72', className: 'text-h1 font-semibold', sample: 'Bringing CeFi execution to DeFi' },
  { name: 'H2 / 56', className: 'text-h2 font-semibold', sample: 'Orbs powers performant onchain apps' },
  { name: 'H3 / 32', className: 'text-h3 font-semibold', sample: 'A decentralized backend for Web3' },
  { name: 'H4 / 22', className: 'text-h4 font-medium', sample: 'Section heading for supporting content' },
  { name: 'H5 / 14', className: 'text-h5 font-semibold uppercase', sample: 'Eyebrow label' },
  { name: 'P / 18', className: 'text-p', sample: 'Orbs is an open and decentralized public blockchain infrastructure.' },
  { name: 'Detail / 11', className: 'text-detail uppercase', sample: 'Fine print / metadata' },
  { name: 'Field / 20', className: 'text-field', sample: 'Form field input text' },
]

function ColorRow({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-fg-muted">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-8">
        {swatches.map((s) => (
          <div
            key={s.token}
            className="flex flex-col overflow-hidden rounded-md border border-border bg-surface text-fg"
          >
            <div className={`${s.className} h-16 w-full`} aria-hidden />
            <div className="flex flex-col gap-0.5 p-2">
              <code className="text-[11px] leading-tight">{s.token}</code>
              <span className="font-mono text-[11px] uppercase text-fg-muted">{s.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TokensPage({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-8 bg-bg p-6 text-fg">{children}</div>
}

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'fullscreen',
    controls: { hideNoControlsWarning: true },
  },
}

export default meta
type Story = StoryObj

export const Colors: Story = {
  render: () => (
    <TokensPage>
      <header className="flex flex-col gap-1">
        <h2 className="text-h3 font-semibold">Palette</h2>
        <p className="text-p text-fg-muted">Literal color ladders. Each swatch renders via a CSS custom property.</p>
      </header>
      <ColorRow title="Neutrals" swatches={neutrals} />
      <ColorRow title="Periwinkle" swatches={periwinkle} />
      <ColorRow title="Pink" swatches={pink} />
      <ColorRow title="Cyan" swatches={cyan} />
      <ColorRow title="Lilac" swatches={lilac} />
      <ColorRow title="Indigo" swatches={indigo} />
      <ColorRow title="Coral" swatches={coral} />
    </TokensPage>
  ),
}

export const SemanticAliases: Story = {
  render: () => (
    <TokensPage>
      <header className="flex flex-col gap-1">
        <h2 className="text-h3 font-semibold">Semantic aliases</h2>
        <p className="text-p text-fg-muted">
          Aliases resolve to different literal tokens per theme. Toggle the Storybook background to preview dark.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {semantics.map((s) => (
          <div
            key={s.token}
            className="flex flex-col overflow-hidden rounded-md border border-border bg-surface text-fg"
          >
            <div className={`${s.className} h-20 w-full`} aria-hidden />
            <div className="flex flex-col gap-0.5 p-3">
              <code className="text-sm font-semibold">{s.token}</code>
              <span className="font-mono text-[11px] text-fg-muted">{s.cssVar}</span>
              <span className="text-[11px] text-fg-muted">{s.description}</span>
            </div>
          </div>
        ))}
      </div>
    </TokensPage>
  ),
}

export const Typography: Story = {
  render: () => (
    <TokensPage>
      <header className="flex flex-col gap-1">
        <h2 className="text-h3 font-semibold">Type scale</h2>
        <p className="text-p text-fg-muted">Each row uses the Tailwind utility backed by the typography CSS vars.</p>
      </header>
      <div className="flex flex-col gap-6">
        {typeSamples.map((t) => (
          <div key={t.name} className="flex flex-col gap-1 border-b border-border pb-4 last:border-b-0">
            <code className="text-[11px] uppercase tracking-wide text-fg-muted">{t.name}</code>
            <div className={t.className}>{t.sample}</div>
          </div>
        ))}
      </div>
    </TokensPage>
  ),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BaseLogo,
  DiscordIcon,
  DLimit,
  DSltp,
  DTwap,
  GithubIcon,
  LiquidityHub,
  LocaleIcon,
  LynexLogo,
  OrbsLogo,
  PerpetualHub,
  QuickSwapLogo,
  SnapshotIcon,
  SpookySwapLogo,
  SwapXLogo,
  TelegramIcon,
  ThemeToggleIcon,
  ThenaLogo,
  XIcon,
  YoutubeIcon,
} from './index'
import type { ArrowVariant, BrandVariant, PartnerVariant } from './types'

type BrandIconComponent = React.ComponentType<{ variant?: BrandVariant; className?: string }>
type PartnerLogoComponent = React.ComponentType<{ variant?: PartnerVariant; className?: string }>
type ArrowComponent = React.ComponentType<{ variant?: ArrowVariant; className?: string }>
type ProductComponent = React.ComponentType<{ className?: string }>

const BRAND_VARIANTS: BrandVariant[] = ['color', 'white', 'dark']
const PARTNER_VARIANTS: PartnerVariant[] = ['dark', 'light']
const ARROW_VARIANTS: ArrowVariant[] = ['default', 'ghost', 'accent']

const SOCIAL_ICONS: Array<{ name: string; Component: BrandIconComponent }> = [
  { name: 'X', Component: XIcon },
  { name: 'GitHub', Component: GithubIcon },
  { name: 'Telegram', Component: TelegramIcon },
  { name: 'Discord', Component: DiscordIcon },
  { name: 'YouTube', Component: YoutubeIcon },
  { name: 'Snapshot', Component: SnapshotIcon },
]

const ARROW_ICONS: Array<{ name: string; Component: ArrowComponent }> = [
  { name: 'ArrowRight', Component: ArrowRight },
  { name: 'ArrowLeft', Component: ArrowLeft },
  { name: 'ArrowUp', Component: ArrowUp },
  { name: 'ArrowDown', Component: ArrowDown },
]

const PRODUCTS: Array<{ name: string; Component: ProductComponent }> = [
  { name: 'Liquidity Hub', Component: LiquidityHub },
  { name: 'Perpetual Hub', Component: PerpetualHub },
  { name: 'dLIMIT', Component: DLimit },
  { name: 'dTWAP', Component: DTwap },
  { name: 'dSLTP', Component: DSltp },
]

const PARTNERS: Array<{ name: string; Component: PartnerLogoComponent }> = [
  { name: 'Lynex', Component: LynexLogo },
  { name: 'SpookySwap', Component: SpookySwapLogo },
  { name: 'Thena', Component: ThenaLogo },
  { name: 'Base', Component: BaseLogo },
  { name: 'SwapX', Component: SwapXLogo },
  { name: 'QuickSwap', Component: QuickSwapLogo },
]

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface p-3 text-fg">
      <div className="flex h-12 items-center justify-center text-2xl">{children}</div>
      <code className="text-[11px] text-fg-muted">{label}</code>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">{title}</h3>
      {children}
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{children}</div>
}

function IconsPage({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-8 bg-bg p-6 text-fg">{children}</div>
}

const meta: Meta = {
  title: 'Design System/Icons',
  parameters: {
    layout: 'fullscreen',
    controls: { hideNoControlsWarning: true },
  },
}

export default meta
type Story = StoryObj

export const AllIcons: Story = {
  render: () => (
    <IconsPage>
      <header className="flex flex-col gap-1">
        <h2 className="text-h3 font-semibold">Icon library</h2>
        <p className="text-p text-fg-muted">
          Every icon × every variant. Toggle the Storybook backgrounds toolbar to preview dark mode.
        </p>
      </header>

      <Section title="Orbs logo">
        <Grid>
          {BRAND_VARIANTS.map((v) => (
            <Cell key={v} label={`orbs / ${v}`}>
              <OrbsLogo variant={v} />
            </Cell>
          ))}
        </Grid>
      </Section>

      <Section title="Socials">
        <Grid>
          {SOCIAL_ICONS.flatMap(({ name, Component }) =>
            BRAND_VARIANTS.map((v) => (
              <Cell key={`${name}-${v}`} label={`${name} / ${v}`}>
                <Component variant={v} />
              </Cell>
            ))
          )}
        </Grid>
      </Section>

      <Section title="Arrows">
        <Grid>
          {ARROW_ICONS.flatMap(({ name, Component }) =>
            ARROW_VARIANTS.map((v) => (
              <Cell key={`${name}-${v}`} label={`${name} / ${v}`}>
                <Component variant={v} />
              </Cell>
            ))
          )}
        </Grid>
      </Section>

      <Section title="Theme + locale">
        <Grid>
          <Cell label="theme / light">
            <ThemeToggleIcon theme="light" />
          </Cell>
          <Cell label="theme / dark">
            <ThemeToggleIcon theme="dark" />
          </Cell>
          <Cell label="locale / EN">
            <LocaleIcon locale="EN" />
          </Cell>
        </Grid>
      </Section>

      <Section title="Products">
        <Grid>
          {PRODUCTS.map(({ name, Component }) => (
            <Cell key={name} label={name}>
              <Component />
            </Cell>
          ))}
        </Grid>
      </Section>

      <Section title="Partners">
        <Grid>
          {PARTNERS.flatMap(({ name, Component }) =>
            PARTNER_VARIANTS.map((v) => (
              <Cell key={`${name}-${v}`} label={`${name} / ${v}`}>
                <Component variant={v} />
              </Cell>
            ))
          )}
        </Grid>
      </Section>
    </IconsPage>
  ),
}

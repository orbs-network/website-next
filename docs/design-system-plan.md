# Orbs 2.0 Design System — Implementation Plan

**Status:** Wave 1 — Atomic primitives (1.3 merged; 1.1, 1.2, 1.4, 1.5 rebased, awaiting merge)
**Last updated:** 2026-04-21
**Owner:** Sukh + Claude

This document is the source of truth for the Orbs 2.0 design-system rollout. Update the **Progress table** and the **Status** field as PRs land. Do not rewrite the brief once it ships — append revisions at the bottom.

## Source of truth

Designer has produced a Figma file; section exports are saved as PNGs on `~/Desktop/orbs-2.0-*.png`. Because the Figma MCP is not wired up, implementation is driven from screenshots. All components have light + dark variants per the brand.

Design decisions locked with the user:
1. **Font family:** Montserrat (already loaded via `next/font/google` in `src/app/layout.tsx`).
2. **Token naming:** hybrid — literal palette (e.g. `--color-periwinkle-400`) plus semantic aliases (e.g. `--color-surface`, `--color-accent-primary`).
3. **Existing components are fair game to replace outright** — `OrbsLogo`, `src/app/components/typography.tsx`, `src/app/blog/blog-card.tsx`, `src/app/components/layout/header.tsx`, theme toggle, and the shadcn `button`/`card`/`navigation-menu` defaults.
4. **Parallelism:** up to 5 concurrent subagents per wave, each in its own git worktree, each targeting Opus 4.7.

## Palette (from `orbs-2.0-colour-palette.png`)

Ladder convention: 7 steps per accent, `400` is the named base, lower = lighter, higher = darker (mirrors Tailwind's lighter-to-darker direction).

**Neutrals**

| Token | Hex |
|---|---|
| `neutral.100` | `#FFFFFF` |
| `neutral.200` | `#F6F6F6` (Orbs Light) |
| `neutral.300` | `#E2E2E2` |
| `neutral.400` | `#C5C5C5` |
| `neutral.500` | `#59595A` |
| `neutral.600` | `#414142` |
| `neutral.700` | `#29292B` |
| `neutral.900` | `#121214` (Orbs Dark) |

**Periwinkle**

| 100 | 200 | 300 | 400 (base) | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| `#EBEDFC` | `#CAD0F6` | `#95A1ED` | `#7A89E9` | `#626EBA` | `#49528C` | `#31375D` |

**Pink**

| 100 | 200 | 300 | 400 (base) | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| `#F8EDF9` | `#EED6EF` | `#E0ABE2` | `#DC8AE0` | `#B06EB3` | `#58375A` | `#2C1C2D` |

**Cyan**

| 100 | 200 | 300 | 400 (base) | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| `#D9FAFC` | `#99F2F6` | `#67E9F4` | `#2CEDFC` | `#23BECA` | `#125F65` | `#082F32` |

**Lilac**

| 100 | 200 | 300 | 400 (base) | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| `#ECE7F9` | `#D3C6F4` | `#B99DEE` | `#A17AE9` | `#8165C7` | `#403263` | `#201932` |

**Indigo**

| 100 | 200 | 300 | 400 (base) | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| `#D9DFFC` | `#99A7F6` | `#5C6FF4` | `#3346F2` | `#1A2379` | `#0D123D` | `#0D123D` |

> Indigo palette in the Figma only shows 3 dark steps ending at `#0D123D`. `600` and `700` collapse to the same value until the designer ships additional stops.

**Coral**

| 100 | 200 | 300 | 400 (base) | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| `#FFF2F2` | `#FFD7D8` | `#FFAEAF` | `#FFADAE` | `#CC8788` | `#664344` | `#332122` |

### Semantic aliases (initial mapping — tunable)

| Alias | Light theme | Dark theme |
|---|---|---|
| `--color-bg` | `neutral.200` | `neutral.900` |
| `--color-surface` | `neutral.100` | `neutral.700` |
| `--color-fg` | `neutral.900` | `neutral.200` |
| `--color-fg-muted` | `neutral.500` | `neutral.400` |
| `--color-border` | `neutral.300` | `neutral.600` |
| `--color-accent-primary` | `indigo.400` | `indigo.400` |
| `--color-accent-primary-hover` | `indigo.500` | `indigo.300` |
| `--color-link` | `indigo.400` | `periwinkle.300` |

The six named accents (`periwinkle`, `pink`, `cyan`, `lilac`, `indigo`, `coral`) are available as literal tokens for brand moments (product logos, gradient backgrounds). Indigo is the default interactive accent.

## Type scale (from `orbs-2.0-typography.png`)

Sizes are v1 estimates read off the export; tune once real specs are available. Line heights biased to tight display / generous body.

| Token | Weight | Size / LH | Tracking | Usage |
|---|---|---|---|---|
| `H1` | 400 | 72 / 80 | -0.01em | Hero |
| `H2` | 400 | 56 / 64 | -0.01em | Section heads |
| `H3-M` | 600 | 32 / 40 | 0 | Card titles (bold) |
| `H3-R` | 400 | 32 / 40 | 0 | Card titles (regular) |
| `H4` | 400 | 22 / 30 | 0 | Sub-head |
| `H5` | 600 | 14 / 20 | 0.08em, uppercase | Eyebrow / section label |
| `P` | 400 | 18 / 28 | 0 | Body |
| `Detail` | 500 | 11 / 16 | 0.12em, uppercase | Labels, meta |
| `FieldInput` | 400 | 20 / 28 | 0 | Form fields |

## Rollout waves

### Wave 0 — Foundations (1 serial PR, blocks everything)

| # | PR branch | Scope |
|---|---|---|
| 0 | `feat/design-tokens` | Palette + type scale wired through `globals.css` + `tailwind.config.ts`, replaces shadcn neutral defaults, tokens preview story in Storybook. |

### Wave 1 — Atomic primitives (5 parallel PRs, each a worktree)

| # | PR branch | Depends on | Source image |
|---|---|---|---|
| 1.1 | `feat/typography` | Wave 0 | `orbs-2.0-typography.png` |
| 1.2 | `feat/buttons-and-links` | Wave 0 | `orbs-2.0-buttons-and-links.png` + `orbs-2.0-large-links.png` |
| 1.3 | `feat/icons` | Wave 0 | `orbs-2.0-icons.png` |
| 1.4 | `feat/fields` | Wave 0 | `orbs-2.0-fields.png` |
| 1.5 | `feat/tags` | Wave 0 | `orbs-2.0-tags.png` |

### Wave 2 — Compositions (4 parallel PRs)

| # | PR branch | Depends on | Source image |
|---|---|---|---|
| 2.1 | `feat/cards` | 1.1, 1.3, 1.5 | `orbs-2.0-cards.png` |
| 2.2 | `feat/text-layouts` | 1.1, 1.2 | `orbs-2.0-components.png` |
| 2.3 | `feat/signup-area` | 1.1, 1.2, 1.4 | `orbs-2.0-sections.png` (right side) |
| 2.4 | `feat/resources-nav` | 1.1, 1.2, 1.5 | `orbs-2.0-sections.png` (bottom) |

### Wave 3 — Shell (2 parallel PRs)

| # | PR branch | Depends on | Source image |
|---|---|---|---|
| 3.1 | `feat/header` | 1.2, 1.3 | `orbs-2.0-sections.png` (top) |
| 3.2 | `feat/footer` | 1.2, 1.3 | `orbs-2.0-sections.png` (bottom) |

## Per-PR workflow (every wave follows this)

1. Branch off latest `main` in an isolated worktree.
2. Implement per the referenced Figma export, using the Wave 0 tokens.
3. Add Storybook stories covering light + dark + every variant/state — these double as vitest browser tests.
4. `npm run lint` + `npm test` pass locally.
5. Open PR with a clear "Why / What / Test plan" body, linking back to this doc.
6. Run `/code-review:code-review` at threshold **75**.
7. Address every finding above threshold; re-run review until clean.
8. Mark PR ready; Sukh merges.

## Progress

| # | PR | Branch | Status | PR link |
|---|---|---|---|---|
| — | Plan doc | `chore/design-system-plan` | **merged** | [#2](https://github.com/orbs-network/website-next/pull/2) |
| 0 | Design tokens | `feat/design-tokens` | **merged** | [#3](https://github.com/orbs-network/website-next/pull/3) |
| 1.1 | Typography | `feat/typography` | rebased, ready | [#5](https://github.com/orbs-network/website-next/pull/5) |
| 1.2 | Buttons & Links | `feat/buttons-and-links` | rebased, ready | [#8](https://github.com/orbs-network/website-next/pull/8) |
| 1.3 | Icons & Logos | `feat/icons` | **merged** | [#9](https://github.com/orbs-network/website-next/pull/9) |
| 1.4 | Fields | `feat/fields` | rebased, ready | [#6](https://github.com/orbs-network/website-next/pull/6) |
| 1.5 | Tags & Badges | `feat/tags` | rebased, ready | [#7](https://github.com/orbs-network/website-next/pull/7) |
| 2.1 | Cards | `feat/cards` | blocked on Wave 1 | — |
| 2.2 | Text Layouts | `feat/text-layouts` | blocked on Wave 1 | — |
| 2.3 | Signup Area | `feat/signup-area` | blocked on Wave 1 | — |
| 2.4 | Resources Nav | `feat/resources-nav` | blocked on Wave 1 | — |
| 3.1 | Header | `feat/header` | blocked on Waves 1+2 | — |
| 3.2 | Footer | `feat/footer` | blocked on Waves 1+2 | — |

### Out-of-plan follow-ups

| # | PR | Status | Notes |
|---|---|---|---|
| — | CI lint fix | merged | [#4](https://github.com/orbs-network/website-next/pull/4) — switched `next lint` → `eslint .` for Next 16 compatibility after discovering `next lint` was removed in v16. |

## After the design system

Homepage build. Uses the primitives and compositions above. Separate implementation plan to be written once Wave 3 lands.

## Revision log

- **2026-04-20** — Initial plan.
- **2026-04-20** — Wave 0 (`feat/design-tokens`, #3) merged after two review rounds; lint CI hotfix (#4) shipped in parallel after Next 16 removed `next lint`. Wave 1 dispatched (1.1–1.5 in parallel worktrees).
- **2026-04-21** — Wave 1.3 Icons (#9) merged first to carry the `.storybook/preview.tsx` decorator fix (the `.dark` class needed to live on `<html>` for CSS custom properties in `:root.dark` to flip — the prior wrapper-div placement was masking real dark-mode bugs across every Wave 1 story). Remaining Wave 1 PRs (#5, #6, #7, #8) rebased onto updated main; only `feat/typography` needed a manual `page.tsx` resolution (merged new `@/components/icons` `OrbsLogo` import path with the new `H1`/`H3` names). Suggested merge order going forward: #6 → #7 → #5 → #8 to minimise further rebase churn.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server with Turbopack (http://localhost:3000)
- `npm run build` — Production build; emits a static site to `out/` (see Static Export below)
- `npm run start` — Serve a production build
- `npm run lint` — ESLint (`next/core-web-vitals` + `eslint-plugin-storybook`)
- `npm run storybook` — Storybook on port 6006
- `npm run build-storybook` — Build static Storybook
- `npm run generate-types` — Regenerate Contentful TS types from `src/contentful-types/*.json` into `src/app/generated-types/`
- `npm run export-content` — Export the Contentful content model to `src/contentful-types/` using `contentful-cli-config.json`
- Tests are Storybook stories run via `@storybook/addon-vitest` in a real Chromium browser (`@vitest/browser-playwright`). There is no standalone `test` script yet — `npx vitest` runs the `storybook` project defined in `vitest.config.ts`. Run a single story file with `npx vitest run src/components/ui/button.stories.tsx`.

## Architecture

**Next.js 16 App Router, statically exported.** `next.config.mjs` sets `output: 'export'` and `images.unoptimized: true`, and `reactCompiler: true` enables the React Compiler for automatic memoization. Everything must be buildable into a static site — no server-only runtime features (no route handlers that need a server at request time, no ISR, no middleware that depends on request context). The `src/app/api/` directory is empty and should stay that way unless the export target changes.

**Three component roots, by convention:**
- `src/components/ui/` — shadcn/ui primitives (`components.json` points here; style `new-york`, base color `neutral`, CSS variables). Add shadcn components here via the CLI.
- `src/components/icons/` — typed SVG icon components (Orbs logo, socials, arrows, theme/locale, product + partner logos). Re-exported via `src/components/icons/index.ts`. Use `currentColor` for monochrome variants so Tailwind `text-*` controls them; color variants may hard-code brand hex. Partner wordmarks are placeholders pending real brand SVGs.
- `src/app/components/` — app-specific compositions (`layout/`, `blog/`, `theme/`, `typography.tsx`). Not managed by shadcn.

Path alias `@/*` → `./src/*` (see `tsconfig.json`). `@/lib/utils` is the `cn()` helper.

**Contentful is the content source.** `src/app/lib/api.ts` wraps the Contentful Delivery API and exposes `getAllPosts`, `getPostBySlug`, `getPostAndMorePosts`, plus `getAssetUrl` / `getAuthorInfo` helpers that narrow unresolved links. Requires `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` at build time (static export fetches at build). See `.env.example` for the full list. The Contentful content-model JSON lives in `src/contentful-types/`, and `cf-content-types-generator` produces the typed skeletons in `src/app/generated-types/` (`TypeBlogPostSkeleton`, `TypeAuthorSkeleton`) consumed by `api.ts`. When the content model changes: run `export-content`, then `generate-types`. Note: `contentful-cli-config.json` is **gitignored** and holds a Contentful management token locally — do not commit it or paste its contents anywhere.

**Routing.** `src/app/page.tsx` is the landing page, `src/app/blog/page.tsx` is the blog index, and `src/app/[slug]/page.tsx` renders individual posts (so post slugs live at the root, not under `/blog/`). `src/app/layout.tsx` sets up the Montserrat font, `next-themes` `ThemeProvider` (class-based, system default), and the global `<Header />`.

**Styling.** Tailwind v3 with shadcn CSS variables defined in `src/app/globals.css`. Dark mode is class-based (`darkMode: ['class']`) driven by `next-themes`. `@tailwindcss/typography` and `tailwindcss-animate` are enabled.

## Conventions

- Prettier: no semicolons, single quotes, `printWidth: 120`, `trailingComma: 'es5'` (`.prettierrc.json`).
- TypeScript strict mode is on (`tsconfig.json`). No `any`.
- Import icons from `lucide-react` (set in `components.json`).
- Stories live next to components as `*.stories.tsx` (e.g. `src/components/ui/button.stories.tsx`); the Storybook config globs `src/**/*.stories.@(js|jsx|mjs|ts|tsx)`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server with Turbopack (http://localhost:3000)
- `npm run build` — Production build (server build to `.next/`, deployed on Vercel)
- `npm run start` — Serve a production build
- `npm run lint` — ESLint (`next/core-web-vitals` + `eslint-plugin-storybook`)
- `npm run storybook` — Storybook on port 6006
- `npm run build-storybook` — Build static Storybook
- `npm run generate-types` — Regenerate Contentful TS types from `src/contentful-types/*.json` into `src/app/generated-types/`
- `npm run export-content` — Export the Contentful content model to `src/contentful-types/` using `contentful-cli-config.json`
- `npm test` — Vitest, running **two projects** defined in `vitest.config.ts`:
  - `storybook` — stories rendered in real Chromium via `@vitest/browser-playwright`. Run one file with `npx vitest run src/components/ui/button.stories.tsx`.
  - `node` — plain unit tests (`src/**/*.test.ts`), no browser. Run with `npx vitest run --project node`.
- `npm run optimize-images` — resize and recompress rasters under `public/`. Visually lossless and idempotent; see the script's header for the measurement. **Do not run it over `public/marketing/brand-assets/`** — those are downloads, served byte-for-byte as published, and the width cap would shrink two of them.
- `node scripts/unwrap-raster-svgs.mjs --dir <dir>` — replaces SVGs that are only a wrapper around one embedded raster. `next/image` does not optimise SVG, so those reach the reader at full size; one ecosystem logo was 826 KB for a 96x40 render.
- `npm run visual-review` — screenshots at desktop and mobile, optionally against a base branch.

## Architecture

**Next.js 16 App Router, deployed on Vercel.** `reactCompiler: true` in `next.config.mjs` enables the React Compiler for automatic memoization. Pages are prerendered at build time via `generateStaticParams()` and served from the CDN; server features (route handlers, ISR, on-demand revalidation, draft mode) are available and in use.

This replaced a static export (`output: 'export'` + `images.unoptimized: true`), which could not run `next/image` and forced a full rebuild of every blog page to publish one post. Rationale in `docs/migration-plan.md` section 2.1. Do not reintroduce `output: 'export'` — Contentful revalidation webhooks, draft-mode preview, and the Resend form handlers all require a server.

**Three component roots, by convention:**
- `src/components/ui/` — shadcn/ui primitives (`components.json` points here; style `new-york`, base color `neutral`, CSS variables). Add shadcn components here via the CLI.
- `src/components/icons/` — typed SVG icon components (Orbs logo, socials, arrows, theme/locale, product + partner logos). Re-exported via `src/components/icons/index.ts`. Use `currentColor` for monochrome variants so Tailwind `text-*` controls them; color variants may hard-code brand hex. Partner wordmarks are placeholders pending real brand SVGs.
- `src/app/components/` — app-specific compositions (`layout/`, `blog/`, `theme/`, `typography.tsx`). Not managed by shadcn.

Path alias `@/*` → `./src/*` (see `tsconfig.json`). `@/lib/utils` is the `cn()` helper.

**Internal links are checked in CI.** `src/content/link-integrity.test.ts` fails if anything in `src/content/` links to a route that does not exist. Its `PENDING` list is the known-missing set and can only shrink — an entry that has been built fails, and an entry nothing links to fails. Add a new blog-post destination to `KNOWN_POST_SLUGS`, not to `PENDING`.

**Page copy lives in `src/i18n/messages/*.json`; long-form documents do not.** Legal pages and FAQs are markdown under `src/content/legal/` and `src/content/faq/`, rendered by `MarkdownProse` in a server component so the parser never reaches the browser. The rule is roughly: interpolated UI strings go in the catalog, documents a lawyer or editor replaces wholesale go in markdown.

**Language is decided per string, not per page.** `textLang(value, locale)` inspects the script and returns `'en'` for Latin text inside a non-Latin document. Catalog coverage is uneven — several pages are real translations with English gaps — so a single `lang` on a section marks real translated prose as English or vice versa. This also applies to `aria-label` and other attributes that become accessible names: they take their language from the element carrying them, not from a neighbouring span. See #103.

**Contentful is the content source.** `src/app/lib/api.ts` wraps the Contentful Delivery API and exposes `getAllPosts`, `getRecentPosts`, `getAllPostSlugs`, `getPostBySlug`, plus `getAssetUrl` / `getAuthorInfo` helpers that narrow unresolved links. **Always pass an explicit `limit` to `getEntries`** — the CDA defaults to 100 and silently truncates; anything fetching a full collection must paginate on `skip` until `skip >= total`. Requires `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` at build time (pages are prerendered at build) and at runtime (revalidation refetches). See `.env.example` for the full list. The Contentful content-model JSON lives in `src/contentful-types/`, and `cf-content-types-generator` produces the typed skeletons in `src/app/generated-types/` (`TypeBlogPostSkeleton`, `TypeAuthorSkeleton`) consumed by `api.ts`. When the content model changes: run `export-content`, then `generate-types`. Note: `contentful-cli-config.json` is **gitignored** and holds a Contentful management token locally — do not commit it or paste its contents anywhere.

**Routing.** `src/app/page.tsx` is the landing page, `src/app/blog/page.tsx` is the blog index, and `src/app/[slug]/page.tsx` renders individual posts (so post slugs live at the root, not under `/blog/`). `src/app/layout.tsx` sets up the Montserrat font, `next-themes` `ThemeProvider` (class-based, system default), and the global `<Header />`.

**Styling.** Tailwind v3 with shadcn CSS variables defined in `src/app/globals.css`. Dark mode is class-based (`darkMode: ['class']`) driven by `next-themes`. `@tailwindcss/typography` and `tailwindcss-animate` are enabled.

## Conventions

- Prettier: no semicolons, single quotes, `printWidth: 120`, `trailingComma: 'es5'` (`.prettierrc.json`).
- TypeScript strict mode is on (`tsconfig.json`). No `any`.
- Import icons from `lucide-react` (set in `components.json`).
- Stories live next to components as `*.stories.tsx` (e.g. `src/components/ui/button.stories.tsx`); the Storybook config globs `src/**/*.stories.@(js|jsx|mjs|ts|tsx)`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

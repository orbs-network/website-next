# orbs.com Migration Plan

Migrating the legacy [`orbs-network/website`](https://github.com/orbs-network/website)
(Cuttlebelle static site, served from GitHub Pages) into this repo
(`orbs-network/website-next`, Next.js 16 App Router + Contentful).

This document is the record of decisions and rationale. Individual work items are
tracked as GitHub issues in this repo and link back here.

**Status:** planning complete, implementation not started.
**Last updated:** 2026-08-12

---

## 1. Executive summary

The migration is a **rewrite, not a port**. No code moves across:

- The old site is Cuttlebelle — React JSX rendered server-side only, no hooks,
  content injected as markdown strings via YAML frontmatter, styled with Bulma
  plus ~59 hand-rolled SCSS files compiling to a 396 KB `index.css`.
- The new site is Next.js 16 App Router, Tailwind design tokens, shadcn/ui, and
  Contentful.

All ~270 components in the old repo's `code/partials/` and `code/pages/`
(~6.1k LOC) get re-authored. The old markup and copy are a **visual and content
reference**, not a source to import.

The blog backbone in this repo is already built and working. The bulk of the
remaining effort is the ~25 marketing pages, rebuilt to visually match the
current site, across three locales.

---

## 2. Decisions

Recorded with rationale so we don't relitigate them.

### 2.1 Hosting: Vercel with ISR (not static export)

**Decision:** move to Vercel, drop `output: 'export'` and GitHub Pages.

**Rationale:**

- **ISR is not slower than static export.** An ISR cache hit is byte-for-byte
  the same CDN delivery as a static export. On a miss, ISR serves the stale page
  immediately and regenerates in the background — nobody waits. The "static is
  faster" intuition does not apply here.
- **`unoptimized: true` is costing us LCP.** Static export cannot run
  `next/image`, so every Contentful hero image ships full-size in its original
  format — no WebP/AVIF, no responsive `srcset`, no resizing. Across the blog
  archive this is almost certainly our worst Core Web Vitals number, and LCP is
  a ranking signal. Moving to Vercel turns image optimization back on.
- **Rebuild-per-post does not scale.** Static export regenerates all ~467 blog
  pages to publish one post. The old Cuttlebelle build already took 10+ minutes;
  we would rediscover that ceiling. ISR plus a Contentful webhook calling
  `revalidatePath()` regenerates a single page in seconds.
- **Server routes are now a hard requirement.** Contact and newsletter forms
  will use Resend (see 2.5), and Contentful draft-mode preview needs a route
  handler. Neither is possible on a static export.
- **Preview deployments per PR** for design review.

**SEO impact is neutral between the two.** Both emit complete HTML with content
in the initial payload. The real SEO risks are URL preservation, sitemap, RSS,
and redirects — all addressed in Phase 0.

**Costs accepted:** Vercel Pro is already in place for the Orbs org, and org
admin access to `orbs.com` DNS is available.

### 2.2 Content split: Contentful vs hardcoded

| Content | Home | Reason |
| --- | --- | --- |
| Blog posts, authors | Contentful | Already built. Frequently added by non-developers. |
| Media mentions | Contentful | 328 entries, actively growing, added by comms. |
| ~25 marketing pages | Hardcoded | Bespoke layout, low churn, developer-owned. |
| White papers | Hardcoded | 33 entries, last updated 2024-01. |
| Policy pages | Hardcoded | Effectively static. |
| Governance blog | Deleted | Empty since 2023-01. See 2.6. |

**Why marketing pages are not in Contentful:** the product and landing pages are
heavy bespoke layout — sliders, code-snippet switchers, schema diagrams, benefit
grids. Modelling them as generic CMS blocks means building a page-builder
abstraction used ~7 times that fights us on every one. Marketing is not going to
edit the dTWAP architecture diagram from a CMS. Contentful earns its keep on
repetitive content; landing pages are not that.

**Why media mentions *are* in Contentful:** this is the exception that proves
the rule. Each entry is five fields (headline, thumbnail, publisher logo,
external URL, date) with no body. New entries land roughly weekly. Hardcoding
them would mean a PR and a deploy every time comms adds a press hit.

### 2.3 Blog authoring: direct in Contentful

**Decision:** authors write directly in Contentful. The Google Docs pipeline is
retired.

**Consequence:** the old repo's `scripts/blog-pull.sh`, `scripts/blog-preview.js`,
and most of its `CLAUDE.md` blog workflow die at cutover.

**Replacement for the lost preview step:** Contentful preview API plus Next's
`draftMode()` behind a route handler, so an author clicks "Open preview" in
Contentful and sees the real rendered page. Requires a server — available now
that we are on Vercel.

**The bulk migration script is throwaway.** It runs once to move any remaining
posts, then is deleted. It needs to be correct, not maintainable.

### 2.4 i18n: EN / JP / KO, marketing pages only

**Key finding: JP and KO have zero blog posts.** `content/jp/blog` and
`content/ko/blog` do not exist in the old repo. Both locales are marketing pages
only — roughly 20 page directories for JP, 24 for KO.

**Key finding: the Contentful space has a single locale, `en-US`.** The
`localized: true` flags on `blogPost.title` / `content` / `slug` are inert.

**Therefore i18n never touches Contentful.** It is a `next-intl` message-catalog
job over hardcoded pages — mechanical and parallelizable. The existing JP/KO
markdown in the old repo is the translation source.

**URL structure:** `app/[locale]/` with `localePrefix: 'as-needed'`, so English
stays at the root (`/dtwap`) and the other locales keep their existing prefixes
(`/jp/dtwap`, `/ko/dtwap`). This preserves every live URL.

**Untranslated pages:** JP is behind EN — missing `agentic`, `dsltp`,
`perpetual-hub`, `institutional`, `dtwap-and-dlimit-faq`. KO is near-parity.

Fallback is English. Three ways to implement it, and the choice is purely
forward-looking because these URLs 404 on the live site today:

1. Render EN content at `/jp/agentic` — keeps JP chrome, but creates duplicate
   content across three URLs. Needs a canonical pointing at `/agentic` and no
   `hreflang="ja"` alternate.
2. `301 /jp/agentic → /agentic` — clean, but an invisible hop.
3. **Link the JP nav directly to `/agentic`; no `/jp/` route exists for
   untranslated pages.**

**Chosen: option 3.** Zero duplicate content, zero redirect hops, nothing to get
wrong in the hreflang setup, honest to the user that they have left the JP
section, and the least code.

> Open: confirm with Sarbloc whether keeping the JP header/footer chrome is worth
> switching to option 1. Default stands at option 3.

### 2.5 Forms: Resend

The old site posts contact and newsletter submissions to
`orbs-website-mailer.herokuapp.com` (see the old repo's
`assets/js/services/user-post.js`) via EmailJS. Heroku retired free dynos; this
is likely already broken.

**Decision:** Resend behind a Next.js route handler.

### 2.6 Governance blog: delete

`content/governance-blog/` contains two files (`body.md`, `index.yml`) and no
posts. Last commit **2023-01-02**. It has been linked from the navbar and footer
for over three years while serving nothing.

**Decision:** delete it, remove the nav and footer entries, `301 → /blog`.

### 2.7 Visual approach: match current, redesign later

Rebuild marketing pages as close to the current Bulma site as practical, in
Tailwind and shadcn. A full redesign is a separate future effort and explicitly
out of scope here.

---

## 3. Content inventory

Measured against the old repo at commit `3d8280483` (2026-07-20).

### Pages

- **39** top-level directories under `content/`
- **~25** English marketing and policy pages
- **~20** JP page directories, **~24** KO (excluding `_shared` and `index.yml`)
- **467** blog post directories under `content/blog/`
- **328** media mention entries under `content/news/posts/`
- **33** white papers under `content/white-papers/`

### Blog cadence

14 commits touching `content/blog/` since 2026-04-01; most recent post
2026-07-20 (Ring Protocol dLIMIT & dTWAP). The backlog of newer posts is small —
the bulk is the historical archive, most of which is reported already migrated.

### Assets

| Bucket | Size | Destination |
| --- | --- | --- |
| Blog images | 782 MB | Contentful assets |
| Media thumbnails and logos | 62 MB | Contentful assets |
| Marketing page images | ~58 MB | `public/`, optimized on the way in |
| Fonts | 1.5 MB | `next/font` where possible |

Total `assets/img` in the old repo is 901 MB. The old repo carries
`remove-large-files.sh` and `return-large-files.sh` specifically to work around
this on GitHub Pages — those hacks do not come with us.

### Contentful space

- Space `ivp9qsr6kthp`, environment `master`
- Single locale `en-US`
- Content types: `blogPost` (title, heroImage, content, date, shortDescription,
  slug, author), `author` (name, profilePicture, profileUrl)
- `mediaMention` to be added — see Phase 1b

> Open: exact count of `blogPost` entries currently in the space. Needs a
> read-only delivery token to diff against the 467 directories in the old repo.

### Third-party integrations to carry over

- Google Analytics 4, property `G-HJ74DHDLS3`
- Ecosystem dataset (`assets/datasets/ecosystem.json`) powering the ecosystem browser
- Code-snippet datasets for dTWAP / dLIMIT / notifications / gateway pages
- Interactive libraries: Swiper, AOS, globe.gl, three.js, highlight.js

---

## 4. Known issues in the current codebase

Independent of the migration, these are wrong today:

- **Blog URLs are broken.** `src/app/blog/blog-card.tsx:14` links to
  `/${post.slug}` and `src/app/[slug]/page.tsx` generates params at the root.
  The live site serves `orbs.com/blog/<slug>/`. Shipping as-is breaks 467 URLs
  plus every backlink and the RSS feed.
- **`unoptimized: true`** in `next.config.mjs` disables all image optimization.
- **Nav points at placeholders.** `src/app/components/layout/navigation/nav-menu.tsx`
  links to `/products/1`, `/resources/2`, `/developers/3` — no routes exist.
- **Language selector is inert.** `src/app/components/layout/language-selector.tsx`
  is client-side state only, no routing or content behind it.
- **No sitemap, no robots, no RSS.** The old site serves a feed at
  `/blog/rss.xml`; that URL must not move.
- **`BASE_PATH` / `src/app/config.ts`** exists only for GitHub Pages and appears
  unused elsewhere. Deleted with the hosting move.

---

## 5. Phases

Phase 0 has no dependencies and can start immediately. Phase 3 is roughly 80% of
total effort and parallelizes across pages once shared components land.

### Phase 0 — Foundations

No user-visible change. Unblocks everything else. DNS stays on the old site
throughout.

- Create the Vercel project; remove `.github/workflows/deploy.yml` and
  `src/app/config.ts` `BASE_PATH`
- Drop `output: 'export'` and `unoptimized: true` from `next.config.mjs`
- Move blog routes from `/[slug]` to `/blog/[slug]`, with redirects
- `sitemap.ts` and `robots.ts`
- RSS feed at `/blog/rss.xml` — the existing URL, not a new one
- Contentful webhook → `revalidatePath()` route handler
- Contentful preview → `draftMode()` route handler

### Phase 1 — Blog completion

- Obtain a read-only delivery token; diff Contentful slugs against the 467
  directories in the old repo and produce a gap report
- Migrate the delta (one-off script, deleted afterwards)
- Verify hero images and rich-text fidelity on a sample, especially tables,
  embedded assets, and the custom `<div class='line-separator'>` markup

### Phase 1b — Media section

- Model the `mediaMention` content type
- Migrate 328 entries plus thumbnails and publisher logos to Contentful assets
- Build the `/news` listing page (hero, trending, load-more, video section)

### Phase 2 — i18n scaffold

- `next-intl`, `app/[locale]/`, `localePrefix: 'as-needed'`
- Extract JP and KO copy from the old repo into message catalogs
- Locale switcher wired to real routing
- Untranslated-page handling per decision 2.4

### Phase 3 — Marketing pages

The bulk of the work.

- Shared components first: footer, subscribe, socials, breadcrumbs, grids, meta
- Then page-by-page, visually matching the current site
- Interactive widgets are separate tickets, not part of a page's "port":
  Swiper carousels, AOS scroll animations, globe.gl, three.js, highlight.js
  code switchers, the ecosystem browser
- Optimize and import the ~58 MB of marketing imagery

### Phase 4 — Forms and integrations

- Resend route handler for contact and newsletter
- GA4 (`G-HJ74DHDLS3`)
- Ecosystem dataset and the code-snippet datasets

### Phase 5 — Cutover

- Full URL audit against the live sitemap
- Redirect map, including `/governance-blog → /blog`
- DNS switch
- Decommission the old repo's CircleCI pipeline

---

## 6. Open questions

1. Exact `blogPost` entry count in Contentful — blocked on a delivery token.
2. Location and contents of the bulk migration script (currently local-only on
   Sarbloc's laptop, not in git).
3. Whether to keep JP/KO chrome on untranslated pages (decision 2.4, option 1)
   rather than the current default of linking straight to English.
4. Vercel image-optimization cost at current traffic — pull monthly pageviews
   from GA before the DNS switch.

---

## 7. Reference: old repo map

For anyone reading the Cuttlebelle source during the rebuild.

| Path | What it is |
| --- | --- |
| `content/` | Markdown + YAML frontmatter. Directory structure equals URL routes. |
| `code/pages/page.js` | The single root layout. |
| `code/partials/` | ~262 components across 31 feature directories plus `shared/`. |
| `code/util/` | Date formatting, URL mapping, i18n helpers. |
| `assets/sass/` | 59 SCSS files compiling to `assets/css/index.css`. |
| `assets/js/` | Vanilla JS bundles for analytics, forms, sliders, ecosystem. |
| `assets/datasets/` | Ecosystem JSON, code snippets, geo data. |
| `markdown.js` | Custom Marked renderer — heading anchors, table wrappers, link rules. |
| `prebuild.sh` | Flattens blog directories before the Cuttlebelle build. |
| `build-rss-feed.js` | Generates `/blog/rss.xml` by parsing built HTML. |
| `.circleci/config.yml` | Build and deploy to GitHub Pages. |

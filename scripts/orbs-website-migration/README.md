# orbs-website-migration

One-off scripts to move blog content from the legacy
[`orbs-network/website`](https://github.com/orbs-network/website) Cuttlebelle
site into Contentful.

**These are throwaway.** They run until the archive is fully migrated, then this
whole directory gets deleted. See `docs/migration-plan.md` Phase 1.

## Inputs are not committed

The scripts read the legacy site's markdown and images. Those live in the old
repo and are **deliberately not tracked here** — an earlier commit added 132 MB
of blog imagery plus a nested `node_modules` to git history and had to be
rewritten out.

Point the scripts at a local checkout of the old repo instead:

```bash
# in .env.local
LEGACY_REPO=/path/to/orbs-network-website
BLOGS_LIST_FILE=$LEGACY_REPO/content/blog/blogs.md
PUBLIC_DIR=$LEGACY_REPO
```

`blog/`, `public/`, and the checkpoint file are gitignored. Keep it that way.

## Author IDs are path-dependent

`stableAuthorIdFromPath()` in `scripts/migrate-blogposts.mjs` hashes the author
file's **path**, not its contents:

```js
const hash = sha1(authorFilePath).slice(0, 12)
return `author-${base}-${hash}`
```

The 40 author entries already in Contentful were created from paths relative to
this directory, which is why `authors/` **is** committed here. Moving or
renaming it produces different IDs on the next run and orphans every author
link on every post. Don't.

## Scripts

- `scripts/upsert-authors.mjs` — creates/updates the 40 `author` entries.
  Results recorded in `author-upsert-results.json`.
- `scripts/migrate-blogposts.mjs` — creates/updates `blogPost` entries, uploading
  hero and inline images as Contentful assets.

Run authors first; blog posts link to them and the script hard-fails on a
missing author.

## Environment

Required in `.env.local`:

```
CONTENTFUL_MANAGEMENT_TOKEN   # CMA token — write access to the whole space
CONTENTFUL_SPACE_ID
CONTENTFUL_ENVIRONMENT_ID     # default: master
CONTENTFUL_LOCALE             # default: en-US
```

Useful flags:

| Var | Default | Notes |
| --- | --- | --- |
| `POST_SAMPLE_COUNT` | `3` | First N posts only. Set `0` for all. **Defaults to a sample — easy to forget.** |
| `ONLY_CREATE_NEW` | `false` | Skip entries that already exist. Use this for the remaining backlog. |
| `RESUME_FROM_CHECKPOINT` | `false` | Resume from `.migrate-blogposts.checkpoint.json`. |
| `PUBLISH_AFTER_UPSERT` | `true` | Publish immediately after write. |

## Known state (2026-08-12)

Measured against the live Contentful space and the old repo's `blogs.md`:

- **448** posts listed in `content/blog/blogs.md`
- **320** `blogPost` entries in Contentful (identical count via CDA and Preview,
  so none are sitting unpublished)
- **129** missing — a contiguous tail block, list indices **319–447**
- Everything dated **2020-10-05 and earlier** is absent. The last migrated post
  is `grant-approved-paradigm-fund` (2020-10-13).
- One entry in `blogs.md` has no file on disk.

The committed `.migrate-blogposts.checkpoint.json` records a 409 failure at
index 47 from 2025-12-17. That checkpoint is stale — a later run clearly got to
index 319 — but the run still stopped short. See the open issues for the
suspected cause.

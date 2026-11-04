# Page metadata and sharing images

Every page supplies its own title and description to `withSocialMetadata` (or the shared marketing metadata helper). The helper emits complete Open Graph and X large-image cards, with absolute image URLs and the page's existing canonical URL on `https://www.orbs.com`. Existing canonical/hreflang and robots rules remain authoritative, including archived pages and untranslated placeholders.

The root layouts set `metadataBase` and generic sharing defaults. They deliberately do not set a shared page URL: inheriting the homepage URL would misidentify other routes. Each real page overrides sharing metadata rather than inheriting the site's generic title.

## Image selection

- Marketing pages with a hero use the artwork listed in `src/content/social-images.json`. Japanese Execution Services has no hero and uses the generic fallback.
- The homepage, legal/contact pages, indexes and white-paper detail pages have no hero image and use the existing `/blog/placeholder.png` Orbs cover. White-paper thumbnails belong to the listing, rather than the detail page's hero.
- Blog articles use their resolved Contentful hero image and dimensions, with the same Orbs fallback if an image is missing or unresolved. Article metadata uses the actual publication date and resolved author. If an editorial description is missing, an excerpt comes from the article body.
- The preserved Tetra tutorial uses its opening image and remains undated and noindex.

SVG hero artwork is rendered onto an opaque dark 1200×630 PNG canvas so sharing crawlers can load it directly. Original artwork is kept in place; only the social derivatives are generated. Rebuild the committed PNGs after a hero changes:

```sh
npm run generate:social-images
```

The generator reads local files only. It does not fetch Contentful or add work to normal production builds. Tests check the hero mapping against the page artwork exports and validate every generated image's dimensions, opacity and nonblank content.

Before merging, check emitted HTML as a sharing crawler as well as the returned metadata objects. Next streams metadata for ordinary browsers on dynamic pages, while known sharing bots receive blocking metadata in the document head. Check page-specific titles/descriptions, the canonical `og:url`, one image in each card type, localized metadata, and successful image responses.

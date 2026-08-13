// scripts/create-media-mention-type.mjs
//
// Creates (or updates) the `mediaMention` content type.
//
// /news on the legacy site is 333 press-coverage cards — headline, thumbnail,
// publisher logo, external URL, date. No body, no page of its own: every card
// links out. New entries land roughly weekly, added by comms, which is why this
// lives in Contentful rather than being hardcoded like the marketing pages.
// See docs/migration-plan.md section 2.2.
//
// Usage:
//   node scripts/create-media-mention-type.mjs          # dry run
//   node scripts/create-media-mention-type.mjs --apply
//
// Requires CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID.

import 'dotenv/config'
import contentful from 'contentful-management'

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT_ID = 'master',
} = process.env

const APPLY = process.argv.includes('--apply')

if (!CONTENTFUL_MANAGEMENT_TOKEN || !CONTENTFUL_SPACE_ID) {
  throw new Error('Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID')
}

const CONTENT_TYPE_ID = 'mediaMention'

const definition = {
  name: 'Media Mention',
  description:
    'External press coverage of Orbs. Displayed as a card on /news that links out to the publisher; it has no page of its own.',
  displayField: 'headline',
  fields: [
    {
      id: 'headline',
      name: 'Headline',
      // Text, not Symbol. Symbol caps at 256 and 12 of the 333 legacy
      // headlines exceed that, the longest at 370. blogPost.shortDescription
      // is a Symbol and that is exactly why 106 of its values arrived
      // machine-truncated — not repeating it here.
      type: 'Text',
      required: true,
      localized: false,
      validations: [{ size: { max: 500 } }],
    },
    {
      id: 'url',
      name: 'Article URL',
      type: 'Symbol',
      required: true,
      localized: false,
      // Unique: the same article should not be entered twice. This is the only
      // natural key a media mention has — there is no slug.
      validations: [{ unique: true }, { regexp: { pattern: '^https?://' } }],
    },
    {
      id: 'date',
      name: 'Published date',
      type: 'Date',
      required: true,
      localized: false,
    },
    {
      id: 'thumbnail',
      name: 'Thumbnail',
      type: 'Link',
      linkType: 'Asset',
      required: false,
      localized: false,
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
    {
      id: 'publisherLogo',
      name: 'Publisher logo',
      // Deliberately an asset link rather than a `publisher` reference type.
      // 70 distinct logos serve 333 entries, so reuse is real — but the legacy
      // data has only logo FILENAMES, no publisher names. A publisher entity
      // would mean inventing the names, and a shared asset link already gives
      // the dedup. Revisit if editors ever need publisher metadata.
      type: 'Link',
      linkType: 'Asset',
      required: false,
      localized: false,
      validations: [{ linkMimetypeGroup: ['image'] }],
    },
  ],
}

async function main() {
  const client = contentful.createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN })
  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  const env = await space.getEnvironment(CONTENTFUL_ENVIRONMENT_ID)

  let existing = null
  try {
    existing = await env.getContentType(CONTENT_TYPE_ID)
  } catch {
    // not created yet
  }

  console.log(`\ncontent type : ${CONTENT_TYPE_ID}`)
  console.log(`state        : ${existing ? 'exists — will update' : 'does not exist — will create'}`)
  console.log(`fields       : ${definition.fields.map((f) => `${f.id}:${f.type}${f.required ? '*' : ''}`).join(', ')}`)

  if (!APPLY) {
    console.log('\nDry run. Nothing written. Re-run with --apply.\n')
    return
  }

  const contentType = existing
    ? Object.assign(existing, definition)
    : await env.createContentTypeWithId(CONTENT_TYPE_ID, definition)

  const saved = existing ? await contentType.update() : contentType
  await saved.publish()

  console.log(`\n${existing ? 'Updated' : 'Created'} and published: ${CONTENT_TYPE_ID}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

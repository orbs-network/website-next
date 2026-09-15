/**
 * The social channels listed beside the contact form, ported from the legacy
 * `content/contact/socials/` tree.
 *
 * Data only. The group titles and the language prefixes live in the message
 * catalogs under `pages.contact.channels.*`, keyed by the `key` fields here —
 * the same split the footer uses, and for the same reason: a Korean reader
 * should see "한국어" beside the Korean channel without the data file branching
 * on locale.
 *
 * Handles and channel names are NOT in the catalog. `@orbs_network` is the same
 * string in every language; putting it in three files would only create three
 * places for it to drift.
 *
 * Every URL here was checked to resolve to a live account: the five Telegram
 * handles against their `og:title` (a dead handle serves a generic
 * "Telegram: Contact @x" page with a 200, so the status code proves nothing),
 * and the Discord invite against `discord.com/api/v10/invites` — which reports
 * `expires_at: null`, i.e. permanent.
 */

/** Which language's audience a channel serves. Keys into `channels.languages`. */
type ChannelLanguage = 'en' | 'ja' | 'ko' | 'announcements'

export type ContactChannelLink = {
  language: ChannelLanguage
  /** The handle or channel name, shown as the link text. Not translated. */
  label: string
  url: string
}

export type ContactChannelGroup = {
  /** Message key under `pages.contact.channels.groups`. */
  key: string
  links: readonly ContactChannelLink[]
}

export const CONTACT_CHANNELS: readonly ContactChannelGroup[] = [
  {
    key: 'telegram',
    links: [
      { language: 'en', label: '@OrbsNetwork', url: 'https://t.me/OrbsNetwork' },
      { language: 'announcements', label: '@OrbsAnnouncements', url: 'https://t.me/OrbsAnnouncements' },
      { language: 'ja', label: '@orbsjpannouncements', url: 'https://t.me/orbsjpannouncements' },
      { language: 'ko', label: '@orbskrannouncement', url: 'https://t.me/orbskrannouncement' },
    ],
  },
  {
    // Legacy titles this group "Twitter". The footer already calls the same
    // account "X", and shipping both names for one service on one site is worse
    // than picking the current one.
    key: 'x',
    links: [
      { language: 'en', label: '@orbs_network', url: 'https://twitter.com/orbs_network' },
      { language: 'ko', label: '@orbs_korea', url: 'https://twitter.com/orbs_korea' },
      { language: 'ja', label: '@JapanOrbs', url: 'https://twitter.com/JapanOrbs' },
    ],
  },
  {
    key: 'youtube',
    links: [
      {
        language: 'en',
        label: 'YouTube EN',
        url: 'https://www.youtube.com/channel/UCfpV4z-MGxeiabFkht1LNPQ/featured',
      },
      { language: 'ko', label: 'YouTube KR', url: 'https://www.youtube.com/channel/UCKxNkYT3UAEra9jp947l5gw' },
      { language: 'ja', label: 'YouTube JP', url: 'https://www.youtube.com/channel/UCZePjhX4e6CuAe8v63Li9lg' },
    ],
  },
  {
    // Legacy calls this group "Communication" and lists three different
    // services — LINE for Japan, Telegram for Korea, Discord for English. The
    // name is kept because the group really is "the chat we use in your
    // region", which no single service name describes.
    key: 'community',
    links: [
      // `discord.gg` rather than the legacy `discord.com/invite` — the same
      // invite code, spelled the way the footer spells it.
      { language: 'en', label: 'Discord', url: 'https://discord.gg/sswGDYGBt5' },
      { language: 'ja', label: 'LINE', url: 'https://lin.ee/yjbkD8U' },
      { language: 'ko', label: 'Telegram', url: 'https://t.me/orbskr' },
    ],
  },
  {
    key: 'blog',
    links: [
      // Internal, so it goes through `localeHref` rather than being hardcoded
      // as `https://www.orbs.com/blog/` the way the legacy file does it. The
      // blog is English-only, so this resolves to the same URL in all three
      // locales — but deriving it means one fewer absolute URL to update at the
      // DNS cutover (#39).
      { language: 'en', label: 'orbs.com/blog', url: '/blog' },
      { language: 'ko', label: 'blog.naver.com/orbskorea', url: 'https://blog.naver.com/orbskorea' },
      { language: 'ja', label: 'medium.com/@orbs-japan-community', url: 'https://medium.com/@orbs-japan-community' },
    ],
  },
]

/**
 * Where the form's enquiries go, shown as a fallback for anyone who would
 * rather use their own mail client.
 *
 * The legacy contact page offers no address at all — the form is the only way
 * through, and it has been silently broken since the Heroku mailer behind it
 * went away. Same address as the footer.
 */
export const CONTACT_EMAIL = 'hello@orbs.com'

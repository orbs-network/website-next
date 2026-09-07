import {
  DiscordIcon,
  GithubIcon,
  type IconBaseProps,
  SnapshotIcon,
  TelegramIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/icons'
import { FOOTER_SOCIALS, type FooterSocialSpec } from '@/content/shared/footer'

/**
 * Named rather than resolved by string at render, so a typo in the data file is
 * a TypeScript error at build time instead of an undefined component.
 */
const ICONS: Record<FooterSocialSpec['icon'], React.ComponentType<IconBaseProps>> = {
  github: GithubIcon,
  x: XIcon,
  telegram: TelegramIcon,
  discord: DiscordIcon,
  youtube: YoutubeIcon,
  snapshot: SnapshotIcon,
}

/**
 * The social row in the bottom bar.
 *
 * Each link needs an accessible name from the catalog because its only content
 * is an SVG — without one a screen reader announces six unlabelled links. The
 * names are brand nouns ("GitHub", "Discord") and identical in all three
 * locales, so they are not passed through `textLang`: there is no locale in
 * which they are anything but English, and marking them per-string would be the
 * same answer every time.
 */
export function FooterSocials({ labels }: { labels: Record<string, string> }) {
  return (
    <ul className="flex items-center gap-5">
      {FOOTER_SOCIALS.map((social) => {
        const Icon = ICONS[social.icon]

        return (
          <li key={social.key}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={labels[social.key]}
              lang="en"
              className="inline-flex text-fg-muted transition-colors hover:text-link"
            >
              {/*
                Every icon component sets its own `role="img"` and `aria-label`.
                Left alone that name would compete with the anchor's, so the
                glyph is hidden and the link keeps the single accessible name
                the catalog gives it.
              */}
              <Icon className="size-5" aria-hidden focusable="false" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

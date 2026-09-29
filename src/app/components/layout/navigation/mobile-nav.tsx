'use client'

import { ArrowRight, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MenuItemW } from '@/components/ui/menu-item'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { FOOTER_EMAIL, FOOTER_STATUS_URL } from '@/content/shared/footer'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { FooterSocials } from '../footer/footer-socials'
import { NetworkStatusIndicator, type NetworkStatusLabels } from '../footer/network-status'
import { hasIcons, rowIcon, type ResolvedNavGroup, type ResolvedNavLink } from './nav-menu-client'

/** The footer-catalog strings the panel's footer area shows, already resolved. */
export type MobileNavFooter = {
  status: NetworkStatusLabels
  /** Visible label above the email address, e.g. "Contact". */
  contactLabel: string
  /** Accessible names for the icon-only social links, keyed as in `FOOTER_SOCIALS`. */
  socialLabels: Record<string, string>
}

/**
 * The navigation for viewports too narrow for the dropdown bar.
 *
 * There was none. The header rendered the desktop nav at every width with no
 * responsive rule, so below roughly 900px it overflowed and pushed the document
 * wider than the viewport — at 390px the page laid out at 880px and every page
 * scrolled sideways (#96).
 *
 * Structure follows the `Mobile / Menu` design: a `[Menu]` label, one large row
 * per group and per top-level link, each with an arrow, then "Talk to the
 * team". The design does not show what a group row opens; with no landing page
 * behind "Products" (see `resolveNavigation`), it opens the group's links in
 * place, and its arrow turns down to say so. Collapsed by default — twenty
 * links listed open would push the call to action off the first screen, which
 * is what the design keeps on it.
 *
 * It renders from the same resolved data as the desktop menu, so the two cannot
 * drift — a link added to `NAV_GROUPS` appears in both or neither. The featured
 * post is the one thing it leaves out: the design has no room for it.
 *
 * `Sheet` (Radix Dialog) rather than a hand-rolled panel: an overlay nav needs
 * a focus trap, Escape to close, background scroll lock and `aria-modal`, and
 * hand-writing those is where accessibility bugs come from.
 *
 * It carries no breakpoint of its own. `Header` decides at which width each nav
 * shows, which keeps that decision in one place next to the desktop bar's — and
 * leaves this component renderable, and therefore testable, at any width.
 */
export function MobileNav({
  groups,
  topLevel,
  locale,
  label,
  title,
  closeLabel,
  cta,
  footer,
}: {
  groups: readonly ResolvedNavGroup[]
  topLevel: readonly ResolvedNavLink[]
  /**
   * Needed to decide each label's `lang`.
   *
   * These strings go through the same per-string rule as the menu rows: they
   * are English in the Japanese catalog (as almost all Japanese chrome is) and
   * translated in Korean, so a blanket document `lang` would have a screen
   * reader pronounce "Open menu" with Japanese rules.
   */
  locale: Locale
  /** Accessible name for the trigger — the button shows only an icon. */
  label: string
  /** Required by Radix Dialog: names the panel, and is its visible `[Menu]` label. */
  title: string
  /** Accessible name for the panel's close control. */
  closeLabel: string
  /** The header's call to action, repeated in the panel where the header hides it. */
  cta: { label: string; href: string }
  footer: MobileNavFooter
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={label}
        lang={textLang(label, locale)}
        className="inline-flex size-9 items-center justify-center text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <MenuIcon className="size-5" aria-hidden focusable="false" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(24rem,100vw)] overflow-y-auto"
        closeLabel={closeLabel}
        closeLang={textLang(closeLabel, locale)}
      >
        {/*
          Radix requires a title on a dialog, and the design has one: the
          bracketed `[Menu]` above the rows. The brackets are the design's
          typographic treatment, not part of the word, so they are drawn here.
        */}
        <SheetTitle
          className="text-detail font-medium uppercase tracking-widest text-fg"
          lang={textLang(title, locale)}
        >
          {/* Drawn, not spoken: the dialog is named "Menu", not "left bracket Menu". */}
          <span aria-hidden="true">[</span>
          {title}
          <span aria-hidden="true">]</span>
        </SheetTitle>

        <nav className="mt-4">
          <ul>
            {groups.map((group) => (
              <li key={group.key} className="border-b border-border">
                <MobileGroup group={group} onNavigate={close} />
              </li>
            ))}
            {topLevel
              .filter((link) => !link.desktopOnly)
              .map((link) => (
                <li key={link.key} className="border-b border-border">
                  <NavLinkElement link={link} onNavigate={close} className={cn(TOP_ROW, 'hover:text-accent-primary')}>
                    <span lang={link.lang}>{link.label}</span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </NavLinkElement>
                </li>
              ))}
          </ul>
        </nav>

        <Button asChild size="sm" className="mt-10">
          <Link href={cta.href} onClick={close} lang={textLang(cta.label, locale)}>
            {cta.label}
          </Link>
        </Button>

        <MobileNavFooterArea footer={footer} locale={locale} />
      </SheetContent>
    </Sheet>
  )
}

/**
 * `Mobile / Menu` → `Footer Area`: three bands, each under a rule.
 *
 * The status band carries `empty:hidden` for the same reason as the footer's
 * `<li>`: the indicator renders nothing until it has a reading, and nothing at
 * all if the service cannot be read. Without it that is an empty band between
 * two rules — a gap that looks like something failed to load, because it did.
 *
 * The email is a `mailto:` link rather than text: on a phone, which is where
 * this panel is, tapping it opens the mail app.
 */
function MobileNavFooterArea({ footer, locale }: { footer: MobileNavFooter; locale: Locale }) {
  return (
    <div className="mt-10">
      <div className="border-t border-border py-1.5 empty:hidden">
        <NetworkStatusIndicator labels={footer.status} href={FOOTER_STATUS_URL} />
      </div>

      <div className="border-t border-border py-4">
        <p className="text-base leading-[1.625rem] text-fg" lang={textLang(footer.contactLabel, locale)}>
          {footer.contactLabel}
        </p>
        {/* English in every locale, like the socials' names — marked so a Japanese or Korean document does not read it with its own rules. */}
        <a
          href={`mailto:${FOOTER_EMAIL}`}
          lang="en"
          className="inline-flex py-2 text-detail font-medium uppercase tracking-wide text-fg transition-colors hover:text-link"
        >
          {FOOTER_EMAIL}
        </a>
      </div>

      <div className="border-t border-border pt-4">
        <FooterSocials labels={footer.socialLabels} className="justify-between" />
      </div>
    </div>
  )
}

/** A top-level row: 20px, full width, the arrow at the far end. */
const TOP_ROW = 'flex w-full items-center justify-between gap-4 py-3 text-field text-fg transition-colors'

/**
 * A group row, and the links it opens.
 *
 * A real `<button>` with `aria-expanded` and `aria-controls`: the row does not
 * go anywhere, so it must not look like a link to assistive technology.
 */
function MobileGroup({ group, onNavigate }: { group: ResolvedNavGroup; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const reserve = hasIcons(group.links)

  return (
    <>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
        className={cn(
          TOP_ROW,
          'hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        )}
      >
        <span lang={group.lang}>{group.label}</span>
        <ArrowRight
          aria-hidden="true"
          className={cn('size-4 shrink-0 transition-transform', expanded && 'rotate-90')}
        />
      </button>

      <ul id={panelId} hidden={!expanded} className="pb-4">
        {group.links.map((link) => (
          <li key={link.key}>
            <MobileNavRow link={link} icon={rowIcon(link, reserve)} onNavigate={onNavigate} />
            {link.children && link.children.length > 0 && (
              <ul className="mb-1 pl-[3.125rem]">
                {link.children.map((child) => (
                  <li key={child.key}>
                    <MobileNavRow link={child} nested onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * Closing on navigation is not optional.
 *
 * An internal link is a client-side transition: without this the route changes
 * underneath an open panel that still covers it, and the reader has to find the
 * close button to see the page they asked for. External links open in a new tab,
 * so the panel is closed for the same reason — this tab did not go anywhere, but
 * leaving a menu open over it is still wrong.
 */
function NavLinkElement({
  link,
  onNavigate,
  className,
  children,
}: {
  link: ResolvedNavLink
  onNavigate: () => void
  className?: string
  children: React.ReactNode
}) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={link.href} onClick={onNavigate} className={className}>
      {children}
    </Link>
  )
}

function MobileNavRow({
  link,
  icon,
  nested = false,
  onNavigate,
}: {
  link: ResolvedNavLink
  icon?: React.ReactNode
  nested?: boolean
  onNavigate: () => void
}) {
  // No hover background, matching the desktop rows — see the note on `NavRow`
  // in nav-menu-client.tsx.
  return (
    <MenuItemW
      asChild
      lang={link.lang}
      icon={icon}
      className={cn(
        '-mx-2 flex w-full gap-2 rounded-sm px-2 text-h5 font-normal tracking-normal hover:no-underline',
        nested ? 'py-1.5 text-fg-muted' : 'py-2.5'
      )}
    >
      <NavLinkElement link={link} onNavigate={onNavigate}>
        {link.label}
      </NavLinkElement>
    </MenuItemW>
  )
}

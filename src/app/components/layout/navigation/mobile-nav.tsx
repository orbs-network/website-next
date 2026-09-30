'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ArrowRight, MenuIcon, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MenuItemW } from '@/components/ui/menu-item'
import { FOOTER_EMAIL, FOOTER_STATUS_URL } from '@/content/shared/footer'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'
import { cn } from '@/lib/utils'
import { FooterSocials } from '../footer/footer-socials'
import { NetworkStatusIndicator, type NetworkStatusLabels } from '../footer/network-status'
import { hasIcons, isCurrent, rowIcon, type ResolvedNavGroup, type ResolvedNavLink } from './nav-menu-client'

/** The footer-catalog strings the panel's footer area shows, already resolved. */
export type MobileNavFooter = {
  status: NetworkStatusLabels
  /** Visible label above the email address, e.g. "Contact". */
  contactLabel: string
  /** Accessible names for the icon-only social links, keyed as in `FOOTER_SOCIALS`. */
  socialLabels: Record<string, string>
}

/**
 * The `Mobile / Menu` tint: 20% of the brand cyan running into 20% pink,
 * bottom-left to top-right. `color-mix` rather than an opacity modifier — the
 * tokens are bare `var()`s and Tailwind v3 emits nothing for `/20` on those
 * (#237). The footer band lays a second coat of the same tint over the first,
 * which is why the design draws it more saturated with the same 20%.
 */
const TINT =
  'bg-gradient-to-tr from-[color-mix(in_srgb,var(--color-cyan-400)_20%,transparent)] to-[color-mix(in_srgb,var(--color-pink-400)_20%,transparent)]'

/** The rules between rows: #59595A in both themes, as the footer draws them. */
const RULE = 'border-neutral-500'

/**
 * Hover colour only where there is a hover. On a phone a tap leaves `:hover`
 * stuck on the row until the next tap elsewhere, which is how an opened
 * "Products" came to stay accent-blue when the design keeps it black.
 */
const HOVER_ACCENT = '[@media(hover:hover)]:hover:text-accent-primary'

/**
 * The navigation for viewports too narrow for the dropdown bar.
 *
 * There was none. The header rendered the desktop nav at every width with no
 * responsive rule, so below roughly 900px it overflowed and pushed the document
 * wider than the viewport — at 390px the page laid out at 880px and every page
 * scrolled sideways (#96).
 *
 * Layout follows the `Mobile / Menu` frames (#230): a full-width tinted panel
 * BELOW the header, which stays visible; a `[Menu]` label, one large row per
 * group and per top-level link, then "Talk to the team" with the theme and
 * language controls beside it; the footer band last. The header shows only the
 * logo and this trigger at these widths, so the settings row is the only place
 * the theme and language controls are.
 *
 * The design does not show what a group row opens; with no landing page behind
 * "Products" (see `resolveNavigation`), it opens the group's links in place,
 * and its arrow turns down to say so — the Products Open frame. Collapsed by
 * default, so the call to action stays on the first screen.
 *
 * It renders from the same resolved data as the desktop menu, so the two cannot
 * drift — a link added to `NAV_GROUPS` appears in both or neither.
 *
 * A Radix dialog rather than a hand-rolled panel: an overlay nav needs a focus
 * trap, Escape to close, background scroll lock and `aria-modal`, and
 * hand-writing those is where accessibility bugs come from. It is composed
 * from the primitive rather than `Sheet` because nothing of `Sheet` survives
 * the design: no overlay, no side, and a close control that has to sit where
 * the header's burger is.
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
  settings,
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
  /**
   * The theme and language controls, beside the call to action.
   *
   * A slot rather than rendered here: both read app context (next-themes, the
   * next-intl catalog, the router), and the header already renders them for
   * the desktop bar. Passing them in keeps this component free of that context,
   * so a story can render it bare.
   */
  settings?: React.ReactNode
  footer: MobileNavFooter
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  // Null outside the App Router, which is where Storybook renders this.
  const pathname = usePathname() ?? ''

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label={label}
        lang={textLang(label, locale)}
        // Hidden, not removed, while open: the close control takes its place and
        // the burger showed through it.
        className="inline-flex size-9 items-center justify-center text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:invisible"
      >
        <MenuIcon className="size-5" strokeWidth={1.5} aria-hidden focusable="false" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/*
          No overlay element: the panel is the overlay. It starts at the
          header's 60px rule and runs to the bottom of the viewport, so the
          header — logo and all — stays in view, as both frames draw it. A tap
          on the header is outside the dialog and closes it, the same as the
          shadcn overlay did.

          The tint is 20% over the page with a 10px blur, from the frame.
        */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-x-0 bottom-0 top-[3.75rem] z-50 backdrop-blur-[10px] focus-visible:outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            TINT
          )}
        >
          {/*
            The close control sits exactly over the burger, in the header's
            row, so the control that opened the panel is where it closes. It
            has to be inside the dialog — the header is outside the focus trap
            and hidden from assistive technology while this is open — hence
            positioned up out of the panel rather than left in the header. The
            frames still draw the burger here; an X says what pressing it does.

            `bottom-full` on a box the header row's height: this element has
            no overflow of its own, so nothing clips it. The scrolling happens
            one level down.
          */}
          <div className="absolute bottom-full right-[var(--gutter)] flex h-[3.75rem] items-center pb-px">
            <DialogPrimitive.Close className="inline-flex size-9 items-center justify-center text-fg transition-colors hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <X className="size-5" strokeWidth={1.5} aria-hidden focusable="false" />
              <span className="sr-only" lang={textLang(closeLabel, locale)}>
                {closeLabel}
              </span>
            </DialogPrimitive.Close>
          </div>

          {/*
            A column the height of the panel: the menu takes what is left, so
            the footer band sits on the bottom edge whenever the menu is short
            enough — the first frame. When it is not (a group open, or a short
            phone) the band follows the menu instead of covering it. The
            Products Open frame draws the band fixed over the Network and
            Ecosystem rows, which on a real phone would hide the rows being
            reached for.
          */}
          <div className="flex h-full flex-col overflow-y-auto overscroll-contain">
            <div className="container flex-1 pb-10">
              {/*
                Radix requires a title on a dialog, and the design has one: the
                bracketed `[Menu]`, centred 40px under the header. The brackets are the
                design's typographic treatment, not part of the word, so they
                are drawn here.
              */}
              <DialogPrimitive.Title
                className="pt-8 text-detail font-medium uppercase tracking-widest text-fg"
                lang={textLang(title, locale)}
              >
                {/* Drawn, not spoken: the dialog is named "Menu", not "left bracket Menu". */}
                <span aria-hidden="true">[</span>
                {title}
                <span aria-hidden="true">]</span>
              </DialogPrimitive.Title>

              <nav className="mt-4">
                <ul>
                  {groups.map((group) => (
                    <li key={group.key} className={cn('border-b', RULE)}>
                      <MobileGroup group={group} pathname={pathname} onNavigate={close} />
                    </li>
                  ))}
                  {topLevel
                    .filter((link) => !link.desktopOnly)
                    .map((link) => (
                      <li key={link.key} className={cn('border-b', RULE)}>
                        <NavLinkElement
                          link={link}
                          onNavigate={close}
                          current={isCurrent(link, pathname)}
                          className={cn(TOP_ROW, HOVER_ACCENT, 'aria-[current=page]:text-accent-primary')}
                        >
                          <span lang={link.lang}>{link.label}</span>
                          <RowArrow />
                        </NavLinkElement>
                      </li>
                    ))}
                </ul>
              </nav>

              {/* 35px under the last rule; the settings sit on the button's line at the right edge. */}
              <div className="mt-[2.1875rem] flex flex-wrap items-center justify-between gap-4">
                <Button asChild>
                  <Link href={cta.href} onClick={close} lang={textLang(cta.label, locale)}>
                    {cta.label}
                  </Link>
                </Button>
                {settings ? <div className="flex items-center gap-6">{settings}</div> : null}
              </div>
            </div>

            <MobileNavFooterArea footer={footer} locale={locale} onNavigate={close} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** The design's long thin arrow at the end of each row, 19px. */
function RowArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={1}
      className={cn('size-[1.1875rem] shrink-0 transition-transform', className)}
    />
  )
}

/**
 * `Mobile / Menu` → `Footer Area`: a band of its own under the menu, carrying
 * a second coat of the panel's tint, then three sections, each under a rule —
 * status, contact, socials. The frame's 5px blur on the band is left off: the
 * band sits inside the panel's 10px blur already, and a nested backdrop filter
 * reads the panel, not the page, so it would blur nothing new.
 *
 * The status band carries `empty:hidden` for the same reason as the footer's
 * `<li>`: the indicator renders nothing until it has a reading, and nothing at
 * all if the service cannot be read. Without it that is an empty band between
 * two rules — a gap that looks like something failed to load, because it did.
 *
 * The email is a `mailto:` link rather than text: on a phone, which is where
 * this panel is, tapping it opens the mail app.
 *
 * Every link here closes the panel, per the rule on `NavLinkElement`. One
 * delegated handler rather than an `onNavigate` threaded through the page
 * footer's components, which have no panel to close.
 */
function MobileNavFooterArea({
  footer,
  locale,
  onNavigate,
}: {
  footer: MobileNavFooter
  locale: Locale
  onNavigate: () => void
}) {
  return (
    <div
      className={cn('shrink-0', TINT)}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) onNavigate()
      }}
    >
      <div className="container pb-5 pt-8">
        <div className={cn('flex h-[3.75rem] items-center border-t empty:hidden', RULE)}>
          <NetworkStatusIndicator labels={footer.status} href={FOOTER_STATUS_URL} />
        </div>

        <div className={cn('border-t py-4', RULE)}>
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

        <div className={cn('border-t pt-5', RULE)}>
          <FooterSocials labels={footer.socialLabels} className="justify-between" />
        </div>
      </div>
    </div>
  )
}

/**
 * A top-level row: 24px on a 50px pitch, the arrow at the far end. The frame
 * draws these larger than the desktop bar's anything — they are the page.
 */
const TOP_ROW = 'flex h-[3.125rem] w-full items-center justify-between gap-4 text-2xl text-fg transition-colors'

/**
 * A group row, and the links it opens.
 *
 * A real `<button>` with `aria-expanded` and `aria-controls`: the row does not
 * go anywhere, so it must not look like a link to assistive technology.
 */
function MobileGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: ResolvedNavGroup
  pathname: string
  onNavigate: () => void
}) {
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
        className={cn(TOP_ROW, HOVER_ACCENT, 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
      >
        <span lang={group.lang}>{group.label}</span>
        <RowArrow className={cn(expanded && 'rotate-90')} />
      </button>

      {/*
        From the Products Open frame: a rule under the open row, then the links
        indented 20px — marks at 35, labels at 65 — ending 28px above the next
        rule.
      */}
      <ul id={panelId} hidden={!expanded} className={cn('border-t pb-7 pl-5 pt-2', RULE)}>
        {group.links.map((link) => (
          <li key={link.key}>
            <MobileNavRow
              link={link}
              icon={rowIcon(link, reserve)}
              current={isCurrent(link, pathname)}
              onNavigate={onNavigate}
            />
            {link.children && link.children.length > 0 && (
              // Order types 47px in from the mark, tucked 6px up under dSPOT.
              <ul className="-mt-1.5 mb-2 pl-[2.9375rem]">
                {link.children.map((child) => (
                  <li key={child.key}>
                    <MobileNavRow link={child} nested current={isCurrent(child, pathname)} onNavigate={onNavigate} />
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
  current = false,
  className,
  children,
  ...props
}: {
  link: ResolvedNavLink
  onNavigate: () => void
  current?: boolean
  className?: string
  children: React.ReactNode
  // What `MenuItemW` hands down through `Slot` — `lang` above all, which is
  // the row's language and was being dropped here.
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'className' | 'children'>) {
  const ariaCurrent = current ? ('page' as const) : undefined

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    // `aria-current` after the spread: `MenuItemW` hands down its own, unset.
    <Link href={link.href} onClick={onNavigate} className={className} {...props} aria-current={ariaCurrent}>
      {children}
    </Link>
  )
}

/** 15px rows on a 46px pitch; dSPOT's order types on 30px, muted. The same as the desktop panel's rows. */
function MobileNavRow({
  link,
  icon,
  nested = false,
  current,
  onNavigate,
}: {
  link: ResolvedNavLink
  icon?: React.ReactNode
  nested?: boolean
  current: boolean
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
        'w-full gap-3 text-[0.9375rem] font-normal leading-5 tracking-normal hover:no-underline',
        'aria-[current=page]:text-accent-primary',
        nested ? 'py-[0.3125rem] text-fg-muted' : 'py-[0.8125rem]'
      )}
    >
      <NavLinkElement link={link} onNavigate={onNavigate} current={current}>
        {link.label}
      </NavLinkElement>
    </MenuItemW>
  )
}

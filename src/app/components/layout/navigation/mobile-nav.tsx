'use client'

import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MenuItemW } from '@/components/ui/menu-item'
import { textLang } from '@/i18n/script'
import type { Locale } from '@/i18n/locales'
import { GLYPHS, type ResolvedNavGroup, type ResolvedNavLink } from './nav-menu-client'

/**
 * The navigation for viewports too narrow for the dropdown bar.
 *
 * There was none. The header rendered the desktop nav at every width with no
 * responsive rule, so below roughly 900px it overflowed and pushed the document
 * wider than the viewport — at 390px the page laid out at 880px and every page
 * scrolled sideways (#96).
 *
 * Structure follows the legacy mobile menu rather than inventing one: a panel
 * with a close control and the groups listed OPEN, not as accordions. The
 * legacy site made that choice with ~29 links; with twelve there is even less
 * reason to make someone tap twice to see a destination.
 *
 * It renders from the same `ResolvedNavGroup` data as the desktop menu, so the
 * two cannot drift — a link added to `NAV_GROUPS` appears in both or neither.
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
}: {
  groups: readonly ResolvedNavGroup[]
  topLevel: readonly ResolvedNavLink[]
  /**
   * Needed to decide each label's `lang`.
   *
   * These three strings go through the same per-string rule as the menu rows:
   * they are English in the Japanese catalog (as almost all Japanese chrome is)
   * and translated in Korean, so a blanket document `lang` would have a screen
   * reader pronounce "Open menu" with Japanese rules.
   */
  locale: Locale
  /** Accessible name for the trigger — the button shows only an icon. */
  label: string
  /** Required by Radix Dialog: names the panel for assistive tech. */
  title: string
  /** Accessible name for the panel's close control. */
  closeLabel: string
}) {
  const [open, setOpen] = useState(false)

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
        className="w-[min(22rem,90vw)] overflow-y-auto"
        closeLabel={closeLabel}
        closeLang={textLang(closeLabel, locale)}
      >
        {/*
          Radix warns — and screen readers suffer — without a title on a dialog.
          It is visually hidden because the panel's own heading is the groups
          themselves; a visible "Menu" above them would be noise.
        */}
        <SheetTitle className="sr-only" lang={textLang(title, locale)}>
          {title}
        </SheetTitle>

        <nav className="mt-8 flex flex-col gap-6">
          {groups.map((group, groupIndex) => (
            <div key={group.key}>
              {groupIndex > 0 && <Separator className="mb-6" />}

              <h2 lang={group.lang} className="text-detail font-semibold uppercase tracking-widest text-fg-muted">
                {group.label}
              </h2>

              {group.sections.map((section, sectionIndex) => (
                <div key={section.key ?? `section-${sectionIndex}`} className="mt-4">
                  {section.label && (
                    <h3
                      lang={section.labelLang}
                      className="mb-2 text-detail uppercase tracking-widest text-fg-muted"
                    >
                      [{section.label}]
                    </h3>
                  )}

                  <ul className="space-y-1">
                    {section.links.map((link) => (
                      <li key={link.key}>
                        <MobileNavRow link={link} onNavigate={() => setOpen(false)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}

          {topLevel.length > 0 && (
            <>
              <Separator />
              <ul className="space-y-1">
                {topLevel.map((link) => (
                  <li key={link.key}>
                    <MobileNavRow link={link} onNavigate={() => setOpen(false)} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
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
function MobileNavRow({ link, onNavigate }: { link: ResolvedNavLink; onNavigate: () => void }) {
  const className = '-mx-2 flex w-full rounded-sm px-2 py-2.5 text-h5 tracking-normal hover:bg-accent hover:no-underline'
  // Same map as the desktop rows: a product shows the same mark in both navs.
  const Glyph = link.icon ? GLYPHS[link.icon] : undefined
  const icon = Glyph ? <Glyph className="size-5" /> : undefined

  if (link.external) {
    return (
      <MenuItemW
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        lang={link.lang}
        icon={icon}
        className={className}
        onClick={onNavigate}
      >
        {link.label}
      </MenuItemW>
    )
  }

  return (
    <MenuItemW asChild lang={link.lang} icon={icon} className={className}>
      <Link href={link.href} onClick={onNavigate}>
        {link.label}
      </Link>
    </MenuItemW>
  )
}

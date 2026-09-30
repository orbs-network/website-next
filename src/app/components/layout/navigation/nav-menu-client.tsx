'use client'

import Link from 'next/link'
import { AgenticGlyph, DPerpsGlyph, DSpotMenuGlyph, SdkApiGlyph } from '@/components/icons'
import { MenuItem, MenuItemW } from '@/components/ui/menu-item'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import type { NavLinkSpec } from '@/content/shared/navigation'
import { cn } from '@/lib/utils'

/**
 * Icon components cannot cross the server/client boundary, so the server passes
 * the icon's KEY and the map lives here. Named rather than resolved by string
 * at render, so a typo in the data file is a build error.
 *
 * Exported because the mobile panel renders the same rows and must show the
 * same marks; a second copy of this map is a second thing to update.
 */
export const GLYPHS: Record<NonNullable<NavLinkSpec['icon']>, React.ComponentType<{ className?: string }>> = {
  sdk: SdkApiGlyph,
  dspot: DSpotMenuGlyph,
  dperps: DPerpsGlyph,
  agentic: AgenticGlyph,
}

/** A link with its label and destination already resolved on the server. */
export type ResolvedNavLink = {
  key: string
  href: string
  external: boolean
  label: string
  /** Set when the label is English inside a non-English document. */
  lang?: string
  icon?: NavLinkSpec['icon']
  children?: readonly ResolvedNavLink[]
  desktopOnly?: true
}

export type ResolvedNavGroup = {
  key: string
  label: string
  lang?: string
  links: readonly ResolvedNavLink[]
}

/**
 * Whether a list's rows should keep a column for an icon.
 *
 * Every Products row has a mark; Solutions and Network have none, so there the
 * column would be 30px of nothing. The reserve is kept for a Products row added
 * before its mark exists — without it that label would sit left of its
 * neighbours'.
 */
export function hasIcons(links: readonly ResolvedNavLink[]) {
  return links.some((link) => link.icon !== undefined)
}

/**
 * The mark, or an empty box of the same size when the list keeps an icon column.
 *
 * 18px: the menu frame draws every mark at about 17px, in a column whose
 * labels start 30px from the mark's left edge — hence the rows' `gap-3`.
 */
export function rowIcon(link: ResolvedNavLink, reserve: boolean) {
  const Glyph = link.icon ? GLYPHS[link.icon] : undefined
  if (Glyph) return <Glyph className="size-[1.125rem] shrink-0" />
  return reserve ? <span aria-hidden="true" className="size-[1.125rem] shrink-0" /> : undefined
}

/**
 * The header menu.
 *
 * Built on Radix `NavigationMenu` rather than the previous CSS `group-hover`
 * panel. That is not a refactor for its own sake: a hover-only dropdown cannot
 * be opened by keyboard at all, and on touch the first tap follows the trigger
 * link instead of revealing the menu — so every dropdown destination was
 * unreachable without a mouse. Radix gives real trigger semantics, focus
 * management, Escape-to-close and arrow-key traversal.
 *
 * Everything is a prop because this is a client component: resolving labels
 * here would mean shipping the whole `nav` namespace in the RSC payload of all
 * 456 prerendered pages.
 *
 * Each panel is the group's links alone. The design adds a featured blog post
 * as a second column; Eran and Sara dropped it (#216) — one newest post under
 * every product read as a mismatch, and it made the menu busy.
 */
export function NavMenuClient({
  groups,
  topLevel,
}: {
  groups: readonly ResolvedNavGroup[]
  topLevel: readonly ResolvedNavLink[]
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        {groups.map((group) => (
          <NavigationMenuItem key={group.key}>
            {/*
              The shadcn trigger ships a filled pill — `hover:bg-accent`,
              `data-[state=open]:bg-accent/50` — which renders as a loud blue
              block on the open group. The designs have plain text triggers, so
              the background is neutralised and the open/hover state is carried
              by the accent text colour instead, matching the rest of the
              chrome.
            */}
            <NavigationMenuTrigger
              className="px-2.5 uppercase text-xs tracking-widest bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent hover:text-accent-primary focus:text-accent-primary data-[state=open]:text-accent-primary"
              lang={group.lang}
            >
              {group.label}
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <NavLinks links={group.links} />
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        {topLevel.map((link) => (
          <NavigationMenuItem key={link.key}>
            <NavigationMenuLink asChild>
              <MenuItem asChild className="h-9 px-2.5 text-xs tracking-widest" lang={link.lang}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </MenuItem>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

/**
 * The links column. 348px wide in the design, whatever the labels.
 *
 * dSPOT's order types are a nested list under the dSPOT row — indented to the
 * design's 50px, muted, no marks — so the structure a sighted reader gets from
 * the indent is the structure a screen reader announces too.
 */
function NavLinks({ links }: { links: readonly ResolvedNavLink[] }) {
  const reserve = hasIcons(links)

  return (
    <ul className="w-[21.75rem] shrink-0 px-[1.125rem] pb-8 pt-7">
      {links.map((link) => (
        <li key={link.key}>
          <NavRow link={link} icon={rowIcon(link, reserve)} />
          {link.children && link.children.length > 0 && (
            <ul className="mb-2 pl-[3.125rem]">
              {link.children.map((child) => (
                <li key={child.key}>
                  <NavRow link={child} nested />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * One row inside a dropdown.
 *
 * `-mx-2 px-2` makes the hover and focus target the full width of the column
 * rather than just the text, so it is clear what a single item is.
 */
function NavRow({ link, icon, nested = false }: { link: ResolvedNavLink; icon?: React.ReactNode; nested?: boolean }) {
  return (
    <NavigationMenuLink asChild>
      <MenuItemW
        asChild
        lang={link.lang}
        icon={icon}
        // `MenuItemW` defaults to `text-field` (20px), the design system's
        // FORM-FIELD size. The menu design sets rows at 15px regular; the
        // scale steps 14 -> 18 with nothing between, so `h5` (14px) it is, with
        // its heading `tracking-wider` reset because these rows are title-case.
        //
        // No hover background: `--accent` is the brand indigo here, not
        // shadcn's subtle neutral, so `hover:bg-accent` filled the row with
        // saturated blue. Hover is the accent TEXT colour `MenuItemW` already
        // applies. Same token bites elsewhere — see #120.
        className={cn(
          '-mx-2 w-full gap-3 rounded-sm px-2 text-h5 font-normal tracking-normal hover:no-underline',
          // The order types sit tighter under their parent, and at 70% in the
          // design — `fg-muted` is the token for that.
          nested ? 'py-1 text-fg-muted' : 'py-2.5'
        )}
      >
        {link.external ? (
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        ) : (
          <Link href={link.href}>{link.label}</Link>
        )}
      </MenuItemW>
    </NavigationMenuLink>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AgenticGlyph, DPerpsGlyph, DSpotMenuGlyph, SdkApiGlyph } from '@/components/icons'
import { MenuItemW } from '@/components/ui/menu-item'
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

/** Trailing slashes differ between `localeHref` output and `usePathname`. */
function normalisePath(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

/** Whether this link is the page being viewed. External links never are. */
export function isCurrent(link: ResolvedNavLink, pathname: string) {
  return !link.external && normalisePath(link.href) === normalisePath(pathname)
}

/** Whether the page being viewed is anywhere in this group, including dSPOT's children. */
export function groupIsCurrent(group: ResolvedNavGroup, pathname: string) {
  return group.links.some(
    (link) => isCurrent(link, pathname) || (link.children ?? []).some((child) => isCurrent(child, pathname))
  )
}

/*
  One style for every item in the bar, dropdown trigger or plain link, so the
  two kinds cannot drift. From the header frame (#230): 10.875px medium at
  0.13em, no chevrons, 30px between items.

  Three states, and the design tells them apart:
  - hover: semibold, with an accent UNDERLINE and the text left in `fg`
  - open (a trigger whose panel is showing): accent text plus underline
  - current page (`data-current`): the same as open, so a reader on /dspot
    sees Products marked without opening anything

  `h-full` so each item spans the bar's height, which is what puts the panel's
  top edge on the header rule rather than a few pixels below the text.
*/
const BAR_ITEM = cn(
  'inline-flex h-full items-center px-[0.9375rem] text-[0.6797rem] font-medium uppercase tracking-[0.13em] text-fg',
  // Thickness as an arbitrary property: `tailwind-merge` does not know the
  // custom `accent-primary` colour, reads `decoration-accent-primary` and
  // `decoration-1` as the same group, and drops the colour.
  'decoration-accent-primary [text-decoration-thickness:1px] underline-offset-[0.375rem] transition-colors',
  'hover:font-semibold hover:underline focus-visible:underline focus-visible:outline-none',
  'data-[state=open]:text-accent-primary data-[state=open]:underline',
  'data-[current=true]:text-accent-primary data-[current=true]:underline'
)

/**
 * The label, with room reserved for its semibold hover state.
 *
 * Going 500 -> 600 on hover widens the word, and in a centred row that nudges
 * every item after it sideways as the pointer moves along the bar. An
 * invisible semibold copy in the same grid cell holds the width at the wider
 * of the two, so only the weight changes.
 */
function BarLabel({ children }: { children: string }) {
  return (
    <span className="inline-grid">
      <span className="col-start-1 row-start-1">{children}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
        {children}
      </span>
    </span>
  )
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
  // Null outside the App Router (Storybook, tests); no page is then current.
  const pathname = usePathname() ?? ''
  // Controlled only so the page overlay knows when a panel is open.
  const [open, setOpen] = React.useState('')

  return (
    <NavigationMenu
      value={open}
      onValueChange={setOpen}
      className="h-full"
      /*
        Flush with the header rule: `top-full` of a full-height root is the
        rule's top edge, and `mt-px` steps past it. Square, borderless and
        unshadowed, as drawn — the page overlay is what separates it.
      */
      viewportClassName="mt-px rounded-none border-0 bg-surface shadow-none"
    >
      {/*
        The design's page overlay: a 20% cyan-to-pink wash with a 10px blur
        over everything below the header while a panel is open. `fixed` works
        here only because the header's own blur moved to a background layer —
        a `backdrop-filter` on an ancestor makes it the containing block for
        fixed descendants, and this would have been clipped to the header.
        `pointer-events-none` so it never swallows a click on the page.
      */}
      {open !== '' && (
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed inset-x-0 bottom-0 top-[6.25rem] -z-10 backdrop-blur-[10px]',
            'bg-gradient-to-r from-[color-mix(in_srgb,var(--color-cyan-400)_20%,transparent)] to-[color-mix(in_srgb,var(--color-pink-400)_20%,transparent)]'
          )}
        />
      )}

      <NavigationMenuList className="h-full space-x-0">
        {groups.map((group) => (
          <NavigationMenuItem key={group.key} value={group.key} className="h-full">
            {/*
              The shadcn trigger ships a filled pill — `hover:bg-accent`,
              `data-[state=open]:bg-accent/50` — which renders as a loud blue
              block on the open group. The designs have plain text triggers, so
              the backgrounds are neutralised and the states come from
              `BAR_ITEM`.
            */}
            <NavigationMenuTrigger
              className={cn(
                BAR_ITEM,
                'w-auto rounded-none py-0',
                'bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent',
                'hover:text-fg focus:text-fg data-[state=open]:hover:text-accent-primary data-[current=true]:hover:text-accent-primary'
              )}
              data-current={groupIsCurrent(group, pathname) || undefined}
              lang={group.lang}
            >
              <BarLabel>{group.label}</BarLabel>
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <NavPanel title={group.label} titleLang={group.lang} links={group.links} pathname={pathname} />
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        {topLevel.map((link) => {
          const current = isCurrent(link, pathname)

          return (
            <NavigationMenuItem key={link.key} className="h-full">
              <NavigationMenuLink asChild active={current}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" lang={link.lang} className={BAR_ITEM}>
                    <BarLabel>{link.label}</BarLabel>
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    lang={link.lang}
                    aria-current={current ? 'page' : undefined}
                    data-current={current || undefined}
                    className={BAR_ITEM}
                  >
                    <BarLabel>{link.label}</BarLabel>
                  </Link>
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

/**
 * One open panel: the group's name over a rule, then its links. 348px wide
 * in the design, whatever the labels.
 *
 * The title row carries no arrow and is not a link, which is a DECISION
 * rather than an omission. The design draws "Products →", implying a landing
 * page for the group, and there is no `/products`, `/solutions` or `/network`
 * page, nor one planned (#30). It is `aria-hidden` because the trigger that
 * opened the panel already names it.
 *
 * dSPOT's order types are a nested list under the dSPOT row — indented to the
 * design's 50px, muted, no marks — so the structure a sighted reader gets from
 * the indent is the structure a screen reader announces too.
 */
function NavPanel({
  title,
  titleLang,
  links,
  pathname,
}: {
  title: string
  titleLang?: string
  links: readonly ResolvedNavLink[]
  pathname: string
}) {
  const reserve = hasIcons(links)

  return (
    <div className="w-[21.75rem]">
      <p
        aria-hidden="true"
        lang={titleLang}
        className="flex h-[3.125rem] items-center border-b border-neutral-400 px-[1.125rem] text-field dark:border-neutral-600"
      >
        {title}
      </p>
      <ul className="px-[1.125rem] pb-8 pt-2">
        {links.map((link) => (
          <li key={link.key}>
            <NavRow link={link} icon={rowIcon(link, reserve)} current={isCurrent(link, pathname)} />
            {link.children && link.children.length > 0 && (
              <ul className="mb-2 pl-[3.125rem]">
                {link.children.map((child) => (
                  <li key={child.key}>
                    <NavRow link={child} nested current={isCurrent(child, pathname)} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * One row inside a dropdown.
 *
 * `-mx-2 px-2` makes the hover and focus target the full width of the column
 * rather than just the text, so it is clear what a single item is.
 */
function NavRow({
  link,
  icon,
  nested = false,
  current,
}: {
  link: ResolvedNavLink
  icon?: React.ReactNode
  nested?: boolean
  current: boolean
}) {
  return (
    <NavigationMenuLink asChild active={current}>
      <MenuItemW
        asChild
        lang={link.lang}
        icon={icon}
        aria-current={current ? 'page' : undefined}
        // 15px regular, from the menu frame. Top-level rows sit on a 46px
        // pitch and dSPOT's order types on 30px, which is the padding here
        // around a 20px line.
        //
        // No hover background: `--accent` is the brand indigo here, not
        // shadcn's subtle neutral, so `hover:bg-accent` filled the row with
        // saturated blue. Hover is the accent TEXT colour `MenuItemW` already
        // applies. Same token bites elsewhere — see #120.
        className={cn(
          '-mx-2 w-full gap-3 rounded-sm px-2 text-[0.9375rem] font-normal leading-5 tracking-normal hover:no-underline',
          'aria-[current=page]:text-accent-primary',
          // The order types are muted, at 70% in the design — `fg-muted` is
          // the token for that.
          nested ? 'py-[0.3125rem] text-fg-muted' : 'py-[0.8125rem]'
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

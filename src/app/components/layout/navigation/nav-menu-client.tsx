'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DSpotGlyph, PerpetualHubGlyph } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { MenuItem, MenuItemW } from '@/components/ui/menu-item'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import type { FeaturedPost } from '@/app/lib/api'
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
  dspot: DSpotGlyph,
  perpetualHub: PerpetualHubGlyph,
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

/** The post, plus its title's `lang` — decided on the server, where the locale is. */
export type ResolvedFeaturedPost = FeaturedPost & { titleLang?: string }

/** The featured-post column's two catalog strings, resolved on the server like every other label. */
export type FeaturedCopy = {
  label: string
  labelLang?: string
  cta: string
  ctaLang?: string
}

/**
 * Whether a list's rows should keep a column for an icon.
 *
 * Products has marks on some rows and (for now) none on SDK/API and Agentic —
 * see `NavLinkSpec['icon']`. Without a reserved column their labels would sit
 * 33px left of their neighbours'. Solutions and Network have no marks at all,
 * so there it would be 33px of nothing.
 */
export function hasIcons(links: readonly ResolvedNavLink[]) {
  return links.some((link) => link.icon !== undefined)
}

/** The mark, or an empty box of the same size when the list keeps an icon column. */
export function rowIcon(link: ResolvedNavLink, reserve: boolean) {
  const Glyph = link.icon ? GLYPHS[link.icon] : undefined
  if (Glyph) return <Glyph className="size-6" />
  return reserve ? <span aria-hidden="true" className="size-6" /> : undefined
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
 * Each panel is the design's two columns: the group's links, and the newest
 * blog post. The post is the same in all three panels. Without one — a
 * degraded build, an empty space — the panel is the links column alone rather
 * than a column with a hole in it.
 */
export function NavMenuClient({
  groups,
  topLevel,
  featured,
  featuredCopy,
}: {
  groups: readonly ResolvedNavGroup[]
  topLevel: readonly ResolvedNavLink[]
  featured: ResolvedFeaturedPost | null
  featuredCopy: FeaturedCopy
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
              <div className="flex">
                <NavLinks links={group.links} />
                {featured && <FeaturedPostCard post={featured} copy={featuredCopy} />}
              </div>
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
          '-mx-2 w-full gap-2 rounded-sm px-2 text-h5 font-normal tracking-normal hover:no-underline',
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

/**
 * The second column: the newest blog post, as one link.
 *
 * One link, not an image link, a title link and a "Learn more" link to the
 * same place — three tab stops to one destination. The title is the link's
 * accessible name; the image is decorative and the button-shaped "Learn more"
 * is hidden from assistive technology, since "Learn more" as a name says
 * nothing about where it goes.
 */
function FeaturedPostCard({ post, copy }: { post: ResolvedFeaturedPost; copy: FeaturedCopy }) {
  return (
    <div className="w-[30.125rem] shrink-0 p-[1.125rem]">
      <p className="text-detail font-medium uppercase tracking-widest text-fg" lang={copy.labelLang}>
        [{copy.label}]
      </p>

      <NavigationMenuLink asChild>
        <Link href={post.href} className="group mt-3.5 block focus-visible:outline-none">
          <Image
            src={post.image ?? '/blog/placeholder.png'}
            alt=""
            width={446}
            height={294}
            sizes="446px"
            className="aspect-[446/294] w-full rounded-sm object-cover"
          />
          <span className="mt-5 flex items-center justify-between gap-6">
            <span
              className="text-h5 tracking-normal text-fg transition-colors group-hover:text-accent-primary group-focus-visible:text-accent-primary"
              lang={post.titleLang}
            >
              {post.title}
            </span>
            <span
              aria-hidden="true"
              lang={copy.ctaLang}
              // The button's look without a second interactive element: it
              // follows the card's hover and focus rather than its own.
              className={cn(
                buttonVariants({ size: 'sm' }),
                'shrink-0 group-hover:border-accent-primary group-hover:text-accent-primary group-focus-visible:border-accent-primary group-focus-visible:text-accent-primary'
              )}
            >
              {copy.cta}
              <ArrowRight className="size-3" />
            </span>
          </span>
        </Link>
      </NavigationMenuLink>
    </div>
  )
}

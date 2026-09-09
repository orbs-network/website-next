'use client'

import Link from 'next/link'
import {
  DLimitGlyph,
  DSltpGlyph,
  DTwapGlyph,
  LiquidityHubGlyph,
  PerpetualHubGlyph,
} from '@/components/icons'
import { MenuItem, MenuItemW } from '@/components/ui/menu-item'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
import type { NavLinkSpec } from '@/content/shared/navigation'

/**
 * Icon components cannot cross the server/client boundary, so the server passes
 * the icon's KEY and the map lives here. Named rather than resolved by string
 * at render, so a typo in the data file is a build error.
 */
const GLYPHS: Record<NonNullable<NavLinkSpec['icon']>, React.ComponentType<{ className?: string }>> = {
  liquidityHub: LiquidityHubGlyph,
  perpetualHub: PerpetualHubGlyph,
  dlimit: DLimitGlyph,
  dtwap: DTwapGlyph,
  dsltp: DSltpGlyph,
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
}

export type ResolvedNavSection = {
  key?: string
  /** Absent for the unlabelled run the designs open Resources and Developers with. */
  label?: string
  labelLang?: string
  links: readonly ResolvedNavLink[]
}

export type ResolvedNavGroup = {
  key: string
  label: string
  lang?: string
  sections: readonly ResolvedNavSection[]
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
              className="uppercase text-xs tracking-widest bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent hover:text-accent-primary focus:text-accent-primary data-[state=open]:text-accent-primary"
              lang={group.lang}
            >
              {group.label}
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              {/*
                The panel is deliberately roomy. The previous menu was a single
                `p-4` box of bare links with no per-item padding, so rows ran
                together and it was not clear where one item ended — the row
                padding and the section dividers below are what separate them.
              */}
              <div className="w-80 p-6">
                {group.sections.map((section, index) => (
                  <div key={section.key ?? `section-${index}`}>
                    {index > 0 && <Separator className="my-5" />}

                    {section.label && (
                      <h3
                        lang={section.labelLang}
                        className="mb-3 text-detail font-medium uppercase tracking-widest text-fg-muted"
                      >
                        {/*
                          The brackets are the design's typographic treatment,
                          not part of the words, so they live here rather than
                          in every catalog entry for a translator to reproduce.
                        */}
                        [{section.label}]
                      </h3>
                    )}

                    <ul className="space-y-1">
                      {section.links.map((link) => (
                        <li key={link.key}>
                          <NavRow link={link} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        {topLevel.map((link) => (
          <NavigationMenuItem key={link.key}>
            <NavigationMenuLink asChild>
              <MenuItem asChild className="h-9 px-4 text-xs tracking-widest" lang={link.lang}>
                <Link href={link.href}>{link.label}</Link>
              </MenuItem>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

/**
 * One row inside a dropdown.
 *
 * `-mx-2 px-2 py-2.5` makes the hover and focus target the full width of the
 * panel rather than just the text, which is the other half of "it is not clear
 * what a single item is".
 */
function NavRow({ link }: { link: ResolvedNavLink }) {
  const Glyph = link.icon ? GLYPHS[link.icon] : undefined

  const content = (
    <MenuItemW
      asChild
      lang={link.lang}
      // `size-5`, not `size-4`: the marks sit at opposite corners of a 24-unit
      // box with a lot of empty space between them, so at 16px they read as
      // specks rather than as the paired triangles the design shows.
      icon={Glyph ? <Glyph className="size-5" /> : undefined}
      // `MenuItemW` defaults to `text-field` (20px), which is the design
      // system's FORM-FIELD size and reads as oversized in a menu — measured
      // against the mockup, its rows are ~13-14px. The scale steps 14 -> 18 ->
      // 20 with nothing between, so `h5` (14px) is the closest fit. Its
      // `tracking-wider` is meant for uppercase headings and is reset here,
      // since these rows are title-case.
      //
      // Overridden at the call site rather than changed on `MenuItemW`, whose
      // default is a design-system decision rather than this PR's to make.
      className="-mx-2 w-full rounded-sm px-2 py-2.5 text-h5 tracking-normal hover:bg-accent hover:no-underline"
    >
      {link.external ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      ) : (
        <Link href={link.href}>{link.label}</Link>
      )}
    </MenuItemW>
  )

  return <NavigationMenuLink asChild>{content}</NavigationMenuLink>
}

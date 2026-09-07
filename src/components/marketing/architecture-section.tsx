import { Button } from '@/components/ui/button'
import { H2 } from '@/app/components/typography'
import Image from 'next/image'
import Link from 'next/link'
import { Prose } from './prose'

export type ArchitectureLink = {
  /** Falsy label means the link is not shown — see the dTWAP page for why. */
  label: string
  href: string
}

/**
 * How the protocol works: a diagram plus prose, followed by the deeper reading.
 *
 * Links with an empty label are skipped rather than rendered blank. The legacy
 * Japanese and Korean pages omit the FAQ link entirely — the key exists in
 * their catalogs with an empty value, so parity is expressed as data rather
 * than as a conditional in the page.
 */
export function ArchitectureSection({
  title,
  body,
  image,
  imageAlt,
  links,
  lang,
}: {
  title: string
  body: string
  image: string
  imageAlt: string
  links: readonly ArchitectureLink[]
  /** Set when this copy is English inside a non-English document. */
  lang?: string
}) {
  const visibleLinks = links.filter((link) => link.label.trim() !== '')

  return (
    <section className="container mx-auto px-5 py-20" lang={lang}>
      <H2 className="text-balance text-center">{title}</H2>

      <div className="relative mx-auto mt-12 aspect-[16/9] w-full max-w-4xl">
        <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 896px, 100vw" className="object-contain" />
      </div>

      <Prose text={body} className="mx-auto mt-12 max-w-3xl" />

      {visibleLinks.length > 0 && (
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {visibleLinks.map((link) => (
            <Button key={link.href} asChild variant="secondary">
              {link.href.startsWith('/') ? (
                <Link href={link.href}>{link.label}</Link>
              ) : (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              )}
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}

import Image from 'next/image'
import { H1, H2 } from '@/app/components/typography'

export type EcosystemCard = {
  name: string
  url: string
  logo?: string
}

export type EcosystemGroup = {
  key: string
  title: string
  entries: readonly EcosystemCard[]
}

/**
 * The ecosystem directory: categories of projects, each a logo linking out.
 *
 * Every entry is an external link, so each is a plain `<a>` with
 * `rel="noopener noreferrer"` rather than a `next/link`.
 *
 * The logo is decorative and the NAME is the accessible label. A logo grid
 * where each image carries the project name as `alt` reads out the name twice —
 * once for the image, once for the visible text — so the image is `alt=""` and
 * the text does the work. One entry has no logo at all and renders as text
 * alone, which is why the name is always present rather than being replaced by
 * the image.
 */
export function EcosystemDirectory({ title, groups }: { title: string; groups: readonly EcosystemGroup[] }) {
  return (
    <section className="container mx-auto px-5 pt-16 pb-24">
      <H1 className="mb-16">{title}</H1>

      {groups.map((group) => (
        <div key={group.key} className="mt-16 first:mt-0">
          <H2 className="mb-8">{group.title}</H2>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.entries.map((entry) => (
              <li key={`${group.key}-${entry.name}`}>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col items-center justify-center gap-3 rounded-sm border border-border p-5 text-center transition-colors hover:border-accent-primary hover:text-accent-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {entry.logo && (
                    <Image
                      src={entry.logo}
                      alt=""
                      width={96}
                      height={40}
                      sizes="96px"
                      className="h-10 w-auto max-w-[6rem] object-contain"
                    />
                  )}
                  <span className="text-detail font-medium">{entry.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  currentPage: number
  totalPages: number
  /**
   * Builds the href for a page number. Passed in rather than imported so the
   * same component serves /blog and /news — two copies of this logic would
   * drift, and the ellipsis rules are the fiddly part.
   */
  pathFor: (pageNumber: number) => string
  /** Distinguishes the two navs for screen readers. */
  label?: string
}

/**
 * Builds a compact page list with ellipses, e.g. for page 7 of 27:
 *   1 … 6 7 8 … 27
 * Always includes the first and last page so the ends of the archive stay one
 * click away.
 */
function pageItems(currentPage: number, totalPages: number): (number | 'gap')[] {
  const pages = new Set<number>([1, totalPages, currentPage])
  if (currentPage - 1 > 1) pages.add(currentPage - 1)
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1)

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const items: (number | 'gap')[] = []
  let previous = 0
  for (const page of sorted) {
    if (previous && page - previous > 1) items.push('gap')
    items.push(page)
    previous = page
  }

  return items
}

export function Pagination({ currentPage, totalPages, pathFor, label = 'Pagination' }: Props) {
  if (totalPages <= 1) return null

  const items = pageItems(currentPage, totalPages)
  const linkClass = 'px-3 py-2 rounded-[var(--radius)] text-sm transition-colors hover:bg-accent'

  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label={label}>
      {currentPage > 1 && (
        <Link href={pathFor(currentPage - 1)} className={linkClass} rel="prev">
          Previous
        </Link>
      )}

      {items.map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-2 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pathFor(item)}
            className={cn(linkClass, item === currentPage && 'bg-accent font-semibold')}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link href={pathFor(currentPage + 1)} className={linkClass} rel="next">
          Next
        </Link>
      )}
    </nav>
  )
}

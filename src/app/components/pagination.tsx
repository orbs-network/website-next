import Link from 'next/link'
import { blogPagePath } from '../lib/routes'
import { cn } from '@/lib/utils'

type Props = {
  currentPage: number
  totalPages: number
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

export function Pagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null

  const items = pageItems(currentPage, totalPages)
  const linkClass = 'px-3 py-2 rounded-[var(--radius)] text-sm transition-colors hover:bg-accent'

  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Blog pagination">
      {currentPage > 1 && (
        <Link href={blogPagePath(currentPage - 1)} className={linkClass} rel="prev">
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
            href={blogPagePath(item)}
            className={cn(linkClass, item === currentPage && 'bg-accent font-semibold')}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link href={blogPagePath(currentPage + 1)} className={linkClass} rel="next">
          Next
        </Link>
      )}
    </nav>
  )
}

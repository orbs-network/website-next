import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Preserved legacy copy. No publication date was present in its source. */
export const TETRA_ARCHIVE_MARKDOWN = readFileSync(join(process.cwd(), 'src/content/archive/tetra.md'), 'utf8')

export const TETRA_ARCHIVE_KOREAN_MARKDOWN = readFileSync(
  join(process.cwd(), 'src/content/archive/tetra.ko.md'),
  'utf8'
)

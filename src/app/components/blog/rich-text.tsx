import { documentToReactComponents, type Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, type Document } from '@contentful/rich-text-types'
import Image from 'next/image'
import type { ReactNode } from 'react'

// Helper to unwrap paragraph from list item children
function unwrapParagraphFromListItem(children: ReactNode): ReactNode {
  // Children is typically an array with a single <p> element
  // We want to extract the content from inside the <p>
  if (Array.isArray(children) && children.length === 1) {
    const child = children[0]
    // Check if it's a paragraph element and extract its children
    if (
      child &&
      typeof child === 'object' &&
      'type' in child &&
      child.type === 'p' &&
      'props' in child &&
      child.props?.children
    ) {
      return child.props.children
    }
  }
  return children
}

// Rich text rendering options for embedded assets and entries
const richTextOptions: Options = {
  renderNode: {
    // Wide tables scroll inside the article instead of widening the page.
    [BLOCKS.TABLE]: (node, children) => (
      <div className="my-6 max-w-full overflow-x-auto" role="region" aria-label="Scrollable table" tabIndex={0}>
        <table>
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    // Fix list items containing unnecessary <p> tags
    [BLOCKS.LIST_ITEM]: (node, children) => <li>{unwrapParagraphFromListItem(children)}</li>,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields
      const url = file?.url
      const mimeType = file?.contentType

      if (!url) return null

      // Handle images
      if (mimeType?.startsWith('image/')) {
        return (
          <figure className="my-8">
            <Image
              src={`https:${url}`}
              alt={description || title || 'Embedded image'}
              width={file.details?.image?.width || 800}
              height={file.details?.image?.height || 600}
              className="rounded-[var(--radius)] w-full h-auto"
              sizes="(min-width: 896px) 896px, 100vw"
            />
            {description && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">{description}</figcaption>
            )}
          </figure>
        )
      }

      // Handle videos
      if (mimeType?.startsWith('video/')) {
        return (
          <video controls className="w-full my-8 rounded-[var(--radius)]">
            <source src={`https:${url}`} type={mimeType} />
          </video>
        )
      }

      // Handle other files as download links
      return (
        <a
          href={`https:${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-2 text-primary no-underline [overflow-wrap:anywhere] hover:underline hover:text-secondary"
        >
          📎 {title || 'Download file'}
        </a>
      )
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary no-underline [overflow-wrap:anywhere] hover:underline hover:text-secondary"
      >
        {children}
      </a>
    ),
  },
}

/** Shared by the post page and its real-browser overflow regression stories. */
export function BlogRichText({ document }: { document: Document }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {documentToReactComponents(document, richTextOptions)}
    </div>
  )
}

import type { Asset, EntryFields, EntrySkeletonType } from 'contentful'
import type { TypeAuthorFields } from './TypeAuthor'

export interface TypeBlogPostFields {
  title: EntryFields.Symbol
  longTitle?: EntryFields.Symbol
  heroImage: Asset
  thumbnailImage: Asset
  content: EntryFields.RichText
  date: EntryFields.Date
  shortDescription?: EntryFields.Symbol
  slug?: EntryFields.Symbol
  author: EntrySkeletonType<TypeAuthorFields>
}

export type TypeBlogPost = EntrySkeletonType<TypeBlogPostFields>

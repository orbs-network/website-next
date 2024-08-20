import type { Asset, EntryFields, EntrySkeletonType } from 'contentful'

export interface TypeAuthorFields {
  name: EntryFields.Symbol
  profilePicture?: Asset
}

export type TypeAuthor = EntrySkeletonType<TypeAuthorFields>

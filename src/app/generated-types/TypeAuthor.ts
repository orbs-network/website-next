import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeAuthorFields {
    name: EntryFieldTypes.Symbol;
    profilePicture?: EntryFieldTypes.AssetLink;
    profileUrl?: EntryFieldTypes.Symbol;
}

export type TypeAuthorSkeleton = EntrySkeletonType<TypeAuthorFields, "author">;
export type TypeAuthor<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeAuthorSkeleton, Modifiers, Locales>;

import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeAuthorSkeleton } from "./TypeAuthor";

export interface TypeBlogPostFields {
    title: EntryFieldTypes.Symbol;
    longTitle?: EntryFieldTypes.Symbol;
    heroImage: EntryFieldTypes.AssetLink;
    thumbnailImage: EntryFieldTypes.AssetLink;
    content: EntryFieldTypes.RichText;
    date: EntryFieldTypes.Date;
    shortDescription?: EntryFieldTypes.Symbol;
    slug?: EntryFieldTypes.Symbol;
    author: EntryFieldTypes.EntryLink<TypeAuthorSkeleton>;
}

export type TypeBlogPostSkeleton = EntrySkeletonType<TypeBlogPostFields, "blogPost">;
export type TypeBlogPost<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeBlogPostSkeleton, Modifiers, Locales>;

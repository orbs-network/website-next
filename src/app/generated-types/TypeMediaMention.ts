import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeMediaMentionFields {
    headline: EntryFieldTypes.Text;
    url: EntryFieldTypes.Symbol;
    date: EntryFieldTypes.Date;
    thumbnail?: EntryFieldTypes.AssetLink;
    publisherLogo?: EntryFieldTypes.AssetLink;
}

export type TypeMediaMentionSkeleton = EntrySkeletonType<TypeMediaMentionFields, "mediaMention">;
export type TypeMediaMention<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeMediaMentionSkeleton, Modifiers, Locales>;

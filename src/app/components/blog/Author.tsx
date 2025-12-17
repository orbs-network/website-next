import Image from 'next/image'
import { AuthorInfo } from "@/app/lib/api";

export function Author({ author }: { author: AuthorInfo }) {
  return (
    <div className="flex items-center gap-2">
    {author.profilePictureUrl && (
      <Image
        src={author.profilePictureUrl}
        alt={author.name}
        width={40}
        height={40}
        className="rounded-full object-cover w-10 h-10 max-w-10 max-h-10 min-w-10 min-h-10"
        unoptimized
      />
    )}
    <span className="font-medium text-gray-700 dark:text-gray-300">
      {author.profileUrl ? (
        <a
          href={author.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          {author.name}
        </a>
      ) : (
        author.name
      )}
    </span>
    <span>·</span>
  </div>
  )
}
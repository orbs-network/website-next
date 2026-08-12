import { BlogPostFields } from '../lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { Author } from '../components/blog/author'
import { getAssetUrl, getAuthorInfo } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BlogCard({ post }: { post: BlogPostFields }) {
  const heroImageUrl = getAssetUrl(post.heroImage)
  const author = getAuthorInfo(post.author)

  return (
    <Card key={post.slug} className="p-0 group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/${post.slug}`} className="h-full flex flex-col">
        <CardHeader className="p-0 pb-4">
          <div className="aspect-video overflow-hidden relative">
            <Image
              src={heroImageUrl || '/blog/placeholder.png'}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-between h-full gap-4">
          <CardTitle className="leading-6 tracking-normal transition-colors group-hover:text-link">
            {post.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {author && <Author author={{ ...author, profileUrl: null }} />}
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

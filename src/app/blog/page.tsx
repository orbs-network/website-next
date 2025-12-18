import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAllPosts, getAssetUrl, getAuthorInfo } from '../lib/api'
import { Author } from '../components/blog/Author'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts',
}

export default async function BlogPage() {
  const allPosts = await getAllPosts()

  if (!allPosts || allPosts.length === 0) {
    return (
      <div className="container mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          No posts found. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {allPosts.map((post) => {
          const heroImageUrl = getAssetUrl(post.heroImage)
          const author = getAuthorInfo(post.author)


          return (
            <article
              key={post.slug}
              className="group rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-shadow hover:shadow-lg"
            >
              <Link href={`/${post.slug}`} className="block">
                
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={heroImageUrl || '/blog/placeholder.png'}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {author && (
                      <Author author={{ ...author, profileUrl: null }} />
                    )}
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}

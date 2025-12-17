import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { getAllPosts, getPostBySlug, getAssetUrl } from '../lib/api'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return posts
    .filter((post) => post.slug)
    .map((post) => ({
      slug: post.slug as string,
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.shortDescription || post.longTitle || '',
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const heroImageUrl = getAssetUrl(post.heroImage)

  return (
    <article className="container mx-auto px-5 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.longTitle && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {post.longTitle}
          </p>
        )}
        <time className="text-gray-500" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>

      {heroImageUrl && (
        <div className="mb-10 relative aspect-video">
          <Image
            src={heroImageUrl}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
            unoptimized
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {documentToReactComponents(post.content)}
      </div>
    </article>
  )
}

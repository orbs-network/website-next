import { getAllPosts } from '../lib/api'

export default async function Page() {
  const allPosts = await getAllPosts()

  return (
    <div className="container mx-auto px-5">
      {allPosts &&
        allPosts.map((post) => (
          <div key={post.slug} className="mb-10">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-lg">{post.longTitle}</p>
            <p className="text-gray-500">{post.date}</p>
            <p>{post.heroImage.fields.file?.url as string}</p>
          </div>
        ))}
    </div>
  )
}

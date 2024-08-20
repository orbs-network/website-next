export async function generateStaticParams() {
  return [
    {
      slug: 'hello-world',
    },
  ]
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  return <div className="container mx-auto px-5">{slug}</div>
}

import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/db/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog · pentrumomente.ro',
  description: 'Articole, ghiduri și povești de pe platforma pentrumomente.ro',
  openGraph: {
    title: 'Blog · pentrumomente.ro',
    description: 'Articole, ghiduri și povești de pe platforma pentrumomente.ro',
    siteName: 'pentrumomente.ro',
    type: 'website',
    locale: 'ro_RO',
  },
}

export default async function BlogListPage() {
  const allPosts = await getAllBlogPosts()
  const posts = allPosts.filter((p) => p.published)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F9FC' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E6EF' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/" className="text-sm mb-6 inline-block" style={{ color: '#8B92A8' }}>
            ← pentrumomente.ro
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1A1D2E' }}>Blog</h1>
          <p className="mt-2 text-base" style={{ color: '#4A5068' }}>
            Articole, ghiduri și povești.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p style={{ color: '#8B92A8' }}>Nu există articole publicate încă.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blogs/${post.slug}`}
                className="group block rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E6EF' }}
              >
                {/* Thumbnail */}
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full object-cover"
                    style={{ height: '200px' }}
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{ height: '120px', backgroundColor: '#EEF1FD' }}
                  >
                    <span className="text-4xl">📝</span>
                  </div>
                )}

                <div className="px-5 py-4">
                  <h2
                    className="text-base font-semibold leading-snug group-hover:underline"
                    style={{ color: '#1A1D2E', textDecorationColor: '#4F6EF5' }}
                  >
                    {post.title}
                  </h2>
                  {post.summary && (
                    <p className="mt-1.5 text-sm line-clamp-2" style={{ color: '#4A5068' }}>
                      {post.summary}
                    </p>
                  )}
                  {post.publishedAt && (
                    <p className="mt-3 text-xs" style={{ color: '#8B92A8' }}>
                      {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

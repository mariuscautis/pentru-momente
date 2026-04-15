import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getAllBlogPosts } from '@/lib/db/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog · pentrumomente.ro',
  description: 'Articole, ghiduri și povești de pe platforma pentrumomente.ro.',
  openGraph: {
    title: 'Blog · pentrumomente.ro',
    description: 'Articole, ghiduri și povești de pe platforma pentrumomente.ro.',
    siteName: 'pentrumomente.ro',
    type: 'website',
    locale: 'ro_RO',
  },
}

export default async function BlogListPage() {
  const allPosts = await getAllBlogPosts()
  const posts = allPosts.filter((p) => p.published)

  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2D1A0E 0%, #5A3420 50%, #8B5A3A 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #C4956A 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
            <p className="text-xs uppercase tracking-widest mb-4 font-medium" style={{ color: '#C4956A' }}>
              pentrumomente.ro
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">Blog</h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#D4B89A' }}>
              Articole, ghiduri și povești despre momentele care contează.
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-18">
          {posts.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">✍️</div>
              <p className="text-base font-medium mb-1" style={{ color: '#2D1A0E' }}>Nu există articole publicate încă.</p>
              <p className="text-sm" style={{ color: '#9A7B60' }}>Reveniți în curând.</p>
            </div>
          ) : (
            <>
              {/* Featured post — first card is larger */}
              {posts[0] && (
                <Link
                  href={`/blogs/${posts[0].slug}`}
                  className="group block rounded-2xl overflow-hidden mb-8 transition-shadow hover:shadow-lg"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}
                >
                  <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-1/2 shrink-0">
                      {posts[0].coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={posts[0].coverImageUrl}
                          alt={posts[0].title}
                          className="w-full h-full object-cover"
                          style={{ minHeight: '260px', maxHeight: '340px' }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ minHeight: '260px', backgroundColor: '#F5EDE3' }}
                        >
                          <span className="text-6xl">📖</span>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="md:w-1/2 p-7 md:p-10 flex flex-col justify-center">
                      <span
                        className="inline-block text-xs font-semibold uppercase tracking-wider mb-3 px-2.5 py-1 rounded-full w-fit"
                        style={{ backgroundColor: '#F5EDE3', color: '#C4956A' }}
                      >
                        Articol recomandat
                      </span>
                      <h2
                        className="text-xl sm:text-2xl font-bold leading-snug mb-3 group-hover:underline"
                        style={{ color: '#2D1A0E', textDecorationColor: '#C4956A' }}
                      >
                        {posts[0].title}
                      </h2>
                      {posts[0].summary && (
                        <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: '#7A6652' }}>
                          {posts[0].summary}
                        </p>
                      )}
                      {posts[0].publishedAt && (
                        <p className="text-xs mt-auto" style={{ color: '#9A7B60' }}>
                          {new Date(posts[0].publishedAt).toLocaleDateString('ro-RO', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Remaining posts grid */}
              {posts.length > 1 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="group block rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}
                    >
                      {/* Thumbnail */}
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full object-cover"
                          style={{ height: '190px' }}
                        />
                      ) : (
                        <div
                          className="w-full flex items-center justify-center"
                          style={{ height: '140px', backgroundColor: '#F5EDE3' }}
                        >
                          <span className="text-4xl">📝</span>
                        </div>
                      )}

                      <div className="px-5 py-5">
                        <h2
                          className="text-base font-semibold leading-snug mb-2 group-hover:underline line-clamp-2"
                          style={{ color: '#2D1A0E', textDecorationColor: '#C4956A' }}
                        >
                          {post.title}
                        </h2>
                        {post.summary && (
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: '#7A6652' }}>
                            {post.summary}
                          </p>
                        )}
                        {post.publishedAt && (
                          <p className="text-xs" style={{ color: '#9A7B60' }}>
                            {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Footer strip */}
        <section style={{ backgroundColor: '#F5EDE3', borderTop: '1px solid #EAD8C8' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: '#7A6652' }}>
              pentrumomente.ro · Platformă românească de strângere de fonduri
            </p>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Acasă</Link>
              <Link href="/despre-noi" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Despre noi</Link>
              <Link href="/contact" className="text-sm hover:underline" style={{ color: '#9A7B60' }}>Contact</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}

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
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-navy)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-amber)' }}>
              pentrumomente.ro
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">Blog</h1>
            <p className="text-base max-w-lg" style={{ color: '#8895A7' }}>
              Articole, ghiduri și povești despre momentele care contează.
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
          {posts.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--color-amber-light)' }}
              >
                <span className="text-2xl">✍️</span>
              </div>
              <p className="text-base font-bold" style={{ color: 'var(--color-ink)' }}>Nu există articole publicate încă.</p>
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Reveniți în curând.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {posts[0] && (
                <Link
                  href={`/blogs/${posts[0].slug}`}
                  className="group block rounded-2xl overflow-hidden mb-8 transition-all"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="md:flex">
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
                          style={{ minHeight: '260px', backgroundColor: 'var(--color-navy)' }}
                        >
                          <span className="text-6xl">📖</span>
                        </div>
                      )}
                    </div>
                    <div className="md:w-1/2 p-7 md:p-10 flex flex-col justify-center">
                      <span
                        className="inline-block text-xs font-bold uppercase tracking-wider mb-3 px-3 py-1 rounded-lg w-fit"
                        style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
                      >
                        Articol recomandat
                      </span>
                      <h2
                        className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug mb-3 group-hover:underline"
                        style={{ color: 'var(--color-ink)', textDecorationColor: 'var(--color-amber)' }}
                      >
                        {posts[0].title}
                      </h2>
                      {posts[0].summary && (
                        <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--color-ink-muted)' }}>
                          {posts[0].summary}
                        </p>
                      )}
                      {posts[0].publishedAt && (
                        <p className="text-xs mt-auto" style={{ color: 'var(--color-ink-faint)' }}>
                          {new Date(posts[0].publishedAt).toLocaleDateString('ro-RO', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Remaining posts */}
              {posts.length > 1 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="group block rounded-2xl overflow-hidden transition-all"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
                    >
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
                          style={{ height: '140px', backgroundColor: 'var(--color-navy)' }}
                        >
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                      <div className="px-5 py-5">
                        <h2
                          className="text-base font-bold leading-snug mb-2 group-hover:underline line-clamp-2"
                          style={{ color: 'var(--color-ink)', textDecorationColor: 'var(--color-amber)' }}
                        >
                          {post.title}
                        </h2>
                        {post.summary && (
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-ink-muted)' }}>
                            {post.summary}
                          </p>
                        )}
                        {post.publishedAt && (
                          <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
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
        <section style={{ backgroundColor: 'var(--color-navy)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: '#4A5568' }}>
              pentrumomente.ro · Platformă românească de strângere de fonduri
            </p>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm transition-colors hover:underline" style={{ color: '#4A5568' }}>Acasă</Link>
              <Link href="/despre-noi" className="text-sm transition-colors hover:underline" style={{ color: '#4A5568' }}>Despre noi</Link>
              <Link href="/contact" className="text-sm transition-colors hover:underline" style={{ color: '#4A5568' }}>Contact</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}

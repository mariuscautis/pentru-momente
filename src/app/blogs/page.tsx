import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getAllBlogPosts } from '@/lib/db/admin'
import { ArrowRight } from 'lucide-react'

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
  const posts = allPosts.filter(p => p.published)

  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Hero ── */}
        <section style={{ backgroundColor: 'var(--color-forest)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-4" style={{ color: '#F0B860' }}>
              pentrumomente.ro
            </p>
            <h1
              className="font-extrabold tracking-tight text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Blog
            </h1>
            <p className="text-base leading-relaxed" style={{ color: '#7A9A88', maxWidth: '48ch' }}>
              Articole, ghiduri și povești despre momentele care contează.
            </p>
          </div>
        </section>

        {/* ── Posts ── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          {posts.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-3xl py-24 text-center space-y-4"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--color-amber-light)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-amber-dark)' }}>
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
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
                  className="group block rounded-3xl overflow-hidden mb-6 card-lift"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div className="md:grid md:grid-cols-2">
                    <div className="shrink-0">
                      {posts[0].coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={posts[0].coverImageUrl}
                          alt={posts[0].title}
                          className="w-full h-full object-cover"
                          style={{ minHeight: '260px', maxHeight: '360px' }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ minHeight: '260px', backgroundColor: 'var(--color-forest)' }}
                        >
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <span
                        className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full w-fit"
                        style={{ backgroundColor: 'var(--color-amber-light)', color: 'var(--color-amber-dark)' }}
                      >
                        Articol recomandat
                      </span>
                      <h2
                        className="font-extrabold tracking-tight leading-snug mb-3"
                        style={{ color: 'var(--color-ink)', fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)' }}
                      >
                        {posts[0].title}
                      </h2>
                      {posts[0].summary && (
                        <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: 'var(--color-ink-muted)' }}>
                          {posts[0].summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        {posts[0].publishedAt && (
                          <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                            {new Date(posts[0].publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-amber)' }}>
                          Citește <ArrowRight size={12} strokeWidth={2.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Remaining posts grid */}
              {posts.length > 1 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.slice(1).map(post => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="group block rounded-2xl overflow-hidden card-lift"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
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
                          style={{ height: '140px', backgroundColor: 'var(--color-forest)' }}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.20)' }}>
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                          </svg>
                        </div>
                      )}
                      <div className="px-5 py-5 space-y-2">
                        <h2 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: 'var(--color-ink)' }}>
                          {post.title}
                        </h2>
                        {post.summary && (
                          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                            {post.summary}
                          </p>
                        )}
                        {post.publishedAt && (
                          <p className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>
                            {new Date(post.publishedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
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

        {/* ── Footer ── */}
        <footer style={{ backgroundColor: 'var(--color-forest-mid)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-extrabold tracking-tight text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              pentru<span style={{ color: 'var(--color-amber)' }}>momente</span>
            </p>
            <div className="flex items-center gap-5">
              {[['/', 'Acasă'], ['/despre-noi', 'Despre noi'], ['/contact', 'Contact']].map(([href, label]) => (
                <Link key={href} href={href} className="text-xs hover:underline" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</Link>
              ))}
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getAllBlogPosts } from '@/lib/db/admin'
import { ArrowRight, Calendar, Clock } from 'lucide-react'

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
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'pentrumomente.ro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog · pentrumomente.ro',
    description: 'Articole, ghiduri și povești de pe platforma pentrumomente.ro.',
    images: ['/og-image.svg'],
  },
}

function readingTime(text: string): number {
  const words = (text ?? '').trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogListPage() {
  const allPosts = await getAllBlogPosts()
  const posts = allPosts.filter(p => p.published)
  const featured = posts[0] ?? null
  const rest = posts.slice(1)

  return (
    <>
      <Nav />
      <main style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-forest)' }}
        >
          {/* Subtle warm ambient — top right, same as single post */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `radial-gradient(ellipse 60% 55% at 78% 30%, rgba(212,136,42,0.09) 0%, transparent 65%)`,
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-end">

              <div className="space-y-5">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs" aria-label="breadcrumb">
                  <Link href="/" className="link-underline font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Acasă
                  </Link>
                  <span style={{ color: 'rgba(255,255,255,0.22)' }}>/</span>
                  <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Blog
                  </span>
                </nav>

                {/* Label pill — same as homepage */}
                <div
                  className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    backgroundColor: 'rgba(212,136,42,0.15)',
                    border: '1px solid rgba(212,136,42,0.30)',
                    color: '#F0B860',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: '#F0B860', animation: 'pulse-dot 2.4s ease-in-out infinite' }}
                  />
                  Articole & ghiduri
                </div>

                <h1
                  className="font-extrabold tracking-tight leading-[1.06] text-white"
                  style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}
                >
                  Blog
                </h1>

                <p
                  className="leading-relaxed"
                  style={{
                    color: '#C4D4CB',
                    fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                    maxWidth: '48ch',
                  }}
                >
                  Articole, ghiduri și povești despre momentele care contează.
                </p>
              </div>

              {/* Post count — right-aligned, large stat like homepage hero */}
              {posts.length > 0 && (
                <div
                  className="hidden lg:block rounded-2xl p-6 text-right"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    minWidth: '140px',
                  }}
                >
                  <p
                    className="font-extrabold tracking-tight leading-none tabular-nums"
                    style={{ fontSize: '3.2rem', color: 'var(--color-amber)' }}
                  >
                    {posts.length}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#7A9E90' }}>
                    {posts.length === 1 ? 'articol publicat' : 'articole publicate'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══ AMBER MARQUEE — same as homepage & single post ═══════════════════ */}
        <div
          className="py-3 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-amber)',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div className="animate-marquee inline-flex whitespace-nowrap items-center gap-0">
            {[...Array(2)].map((_, repeat) => (
              <div key={repeat} className="inline-flex items-center gap-0">
                {[
                  'Plăți securizate Stripe',
                  'Transparent la fiecare pas',
                  'Pagina ta în 3 minute',
                  'Fără cont pentru donatori',
                  'Direct în IBAN-ul tău',
                  'Apple Pay & Google Pay',
                ].map((text, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span
                      className="text-[0.75rem] font-bold uppercase tracking-[0.08em] px-5"
                      style={{ color: 'rgba(26,18,8,0.80)' }}
                    >
                      {text}
                    </span>
                    <span className="text-[0.6rem]" style={{ color: 'rgba(26,18,8,0.30)' }}>◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══ POSTS ════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-20">

          {posts.length === 0 ? (

            /* ── Empty state ── */
            <div className="py-32 text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'var(--color-amber-light)', border: '1px solid var(--color-border)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-amber-dark)' }}>
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                </svg>
              </div>
              <p className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>
                Nu există articole publicate încă.
              </p>
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                Reveniți în curând.
              </p>
            </div>

          ) : (
            <>

              {/* ── Featured post — full-width asymmetric ── */}
              {featured && (
                <Link
                  href={`/blogs/${featured.slug}`}
                  className="group block mb-12 md:mb-16"
                  aria-label={featured.title}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-0 rounded-3xl overflow-hidden card-lift"
                    style={{
                      border: '1px solid var(--color-border)',
                      boxShadow: '0 4px 32px rgba(26,18,8,0.08)',
                    }}
                  >
                    {/* Left — image or forest placeholder */}
                    <div className="relative overflow-hidden" style={{ minHeight: '300px' }}>
                      {featured.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={featured.coverImageUrl}
                          alt={featured.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-mid) 100%)',
                          }}
                        >
                          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.15)' }}>
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                          </svg>
                        </div>
                      )}
                      {/* Directional fade to right — blends into content panel */}
                      <div
                        className="absolute inset-0 hidden md:block"
                        style={{
                          background: 'linear-gradient(to right, transparent 60%, var(--color-surface) 100%)',
                        }}
                      />
                    </div>

                    {/* Right — content */}
                    <div
                      className="flex flex-col justify-center p-8 md:p-10"
                      style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                      {/* Featured badge */}
                      <div
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] mb-5 w-fit"
                        style={{
                          backgroundColor: 'var(--color-amber-light)',
                          color: 'var(--color-amber-dark)',
                          border: '1px solid rgba(212,136,42,0.18)',
                        }}
                      >
                        Articol recomandat
                      </div>

                      <h2
                        className="font-extrabold tracking-tight leading-snug mb-3"
                        style={{
                          color: 'var(--color-ink)',
                          fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)',
                        }}
                      >
                        {featured.title}
                      </h2>

                      {featured.summary && (
                        <p
                          className="text-sm leading-relaxed line-clamp-3 mb-6"
                          style={{ color: 'var(--color-ink-muted)' }}
                        >
                          {featured.summary}
                        </p>
                      )}

                      <div
                        className="flex items-center justify-between pt-5 mt-auto"
                        style={{ borderTop: '1px solid var(--color-border-faint)' }}
                      >
                        <div className="flex items-center gap-4">
                          {featured.publishedAt && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={11} strokeWidth={2} style={{ color: 'var(--color-ink-faint)' }} />
                              <span className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>
                                {formatDate(featured.publishedAt)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} strokeWidth={2} style={{ color: 'var(--color-ink-faint)' }} />
                            <span className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>
                              {readingTime(featured.content ?? '')} min
                            </span>
                          </div>
                        </div>

                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold transition-transform group-hover:translate-x-0.5"
                          style={{ color: 'var(--color-amber)' }}
                        >
                          Citește
                          <ArrowRight size={13} strokeWidth={2.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* ── Section label if there are more posts ── */}
              {rest.length > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: 'var(--color-ink-faint)' }}
                  >
                    Toate articolele
                  </p>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-faint)' }} />
                </div>
              )}

              {/* ── Rest — asymmetric 2-col grid ── */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {rest.map((post, i) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.slug}`}
                      className="group block rounded-2xl overflow-hidden card-lift"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        // Slight size variation between odd/even — breaks the AI grid monotony
                        ...(i % 3 === 0 ? { gridColumn: 'span 1' } : {}),
                      }}
                    >
                      {/* Cover */}
                      <div className="relative overflow-hidden" style={{ height: '200px' }}>
                        {post.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-mid) 100%)',
                            }}
                          >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.15)' }}>
                              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-3">
                        <h2
                          className="font-bold leading-snug line-clamp-2"
                          style={{
                            fontSize: '0.9375rem',
                            color: 'var(--color-ink)',
                          }}
                        >
                          {post.title}
                        </h2>

                        {post.summary && (
                          <p
                            className="text-xs leading-relaxed line-clamp-2"
                            style={{ color: 'var(--color-ink-muted)' }}
                          >
                            {post.summary}
                          </p>
                        )}

                        <div
                          className="flex items-center justify-between pt-3"
                          style={{ borderTop: '1px solid var(--color-border-faint)' }}
                        >
                          <div className="flex items-center gap-3">
                            {post.publishedAt && (
                              <div className="flex items-center gap-1">
                                <Calendar size={10} strokeWidth={2} style={{ color: 'var(--color-ink-faint)' }} />
                                <span className="text-[10px]" style={{ color: 'var(--color-ink-faint)' }}>
                                  {formatDate(post.publishedAt)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock size={10} strokeWidth={2} style={{ color: 'var(--color-ink-faint)' }} />
                              <span className="text-[10px]" style={{ color: 'var(--color-ink-faint)' }}>
                                {readingTime(post.content ?? '')} min
                              </span>
                            </div>
                          </div>

                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold transition-transform group-hover:translate-x-0.5"
                            style={{ color: 'var(--color-amber)' }}
                          >
                            Citește
                            <ArrowRight size={11} strokeWidth={2.5} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ══ BOTTOM CTA — forest green, same as single post ════════════════════ */}
        <section
          style={{
            backgroundColor: 'var(--color-forest)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="space-y-2">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: '#F0B860' }}
                >
                  pentrumomente.ro
                </p>
                <h2
                  className="font-extrabold tracking-tight leading-tight text-white"
                  style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}
                >
                  Gata să creezi pagina ta?
                </h2>
                <p className="leading-relaxed" style={{ color: '#C4D4CB', maxWidth: '42ch', fontSize: '0.9375rem' }}>
                  Înregistrare gratuită. Nicio taxă din donații. Banii ajung direct la tine.
                </p>
              </div>

              <Link
                href="/create"
                className="btn-press btn-fill inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 font-bold text-white whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--color-amber)',
                  boxShadow: 'var(--shadow-warm)',
                  fontSize: '0.9375rem',
                }}
              >
                Creează o pagină gratuită
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
        <footer
          style={{
            backgroundColor: 'var(--color-forest)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: '#5A7E72' }}>
              pentrumomente.ro · Platformă românească de strângere de fonduri
            </p>
            <div className="flex items-center gap-5">
              {[
                { href: '/', label: 'Acasă' },
                { href: '/despre-noi', label: 'Despre noi' },
                { href: '/blogs', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="link-underline text-sm font-medium"
                  style={{ color: '#7A9E90' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getBlogPostBySlug } from '@/lib/db/admin'
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageParams {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post || !post.published) return {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return {
    title: `${post.title} · Blog pentrumomente.ro`,
    description: post.summary ?? 'Articol pe blog pentrumomente.ro',
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      url: `${appUrl}/blogs/${slug}`,
      siteName: 'pentrumomente.ro',
      type: 'article',
      locale: 'ro_RO',
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImageUrl
        ? [{ url: post.coverImageUrl, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary ?? undefined,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  }
}

function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post || !post.published) notFound()

  const sections = parseMarkdownToSections(post.content)
  const minutes = readingTime(post.content)
  const tocSections = sections.filter((s) => s.heading2)

  return (
    <>
      <Nav />
      <main style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ══ HERO ═══════════════════════════════════════════════════════════════
            Full-bleed cover image with forest overlay and title anchored bottom-left.
            No cover image? Textured forest section, no gradient fade, clean cut.
        ══════════════════════════════════════════════════════════════════════ */}
        {post.coverImageUrl ? (
          <section className="relative overflow-hidden" style={{ minHeight: '560px' }}>

            {/* Cover photo — full bleed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Directional overlay: heavier at bottom, light vignette top */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(30,58,47,0.30) 0%, rgba(30,58,47,0.55) 40%, rgba(26,18,8,0.90) 100%)',
              }}
            />

            <div
              className="relative mx-auto max-w-6xl px-4 sm:px-6 flex flex-col justify-end"
              style={{ minHeight: '560px', paddingBottom: '4rem' }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs mb-6" aria-label="breadcrumb">
                <Link href="/" className="link-underline font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  Acasă
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                <Link href="/blogs" className="link-underline font-medium" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  Blog
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                <span className="line-clamp-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {post.title}
                </span>
              </nav>

              {/* Meta row */}
              <div className="flex items-center gap-5 mb-5">
                {post.publishedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} strokeWidth={2} style={{ color: '#F0B860' }} />
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: '#F0B860' }}
                    >
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock size={12} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  <span
                    className="text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {minutes} min citire
                  </span>
                </div>
              </div>

              {/* Title — bottom-anchored, large, no card wrapping */}
              <h1
                className="font-extrabold tracking-tight leading-[1.06] text-white"
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
                  maxWidth: '18ch',
                  textShadow: '0 2px 24px rgba(0,0,0,0.25)',
                }}
              >
                {post.title}
              </h1>

              {post.summary && (
                <p
                  className="mt-4 leading-relaxed"
                  style={{
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                    maxWidth: '54ch',
                  }}
                >
                  {post.summary}
                </p>
              )}
            </div>
          </section>

        ) : (

          /* ── No cover image: editorial forest header ── */
          <section
            className="relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-forest)' }}
          >
            {/* Subtle warm ambient light — top right */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `radial-gradient(ellipse 60% 55% at 75% 30%, rgba(212,136,42,0.09) 0%, transparent 65%)`,
              }}
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 md:py-28">

              <nav className="flex items-center gap-2 text-xs mb-8" aria-label="breadcrumb">
                <Link href="/" className="link-underline font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Acasă
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.22)' }}>/</span>
                <Link href="/blogs" className="link-underline font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Blog
                </Link>
              </nav>

              {/* Amber date pill */}
              <div className="flex items-center gap-5 mb-6">
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} strokeWidth={2} style={{ color: '#F0B860' }} />
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: '#F0B860' }}
                    >
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock size={12} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <span
                    className="text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {minutes} min citire
                  </span>
                </div>
              </div>

              <h1
                className="font-extrabold tracking-tight leading-[1.06] text-white"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', maxWidth: '20ch' }}
              >
                {post.title}
              </h1>

              {post.summary && (
                <p
                  className="mt-5 leading-relaxed"
                  style={{
                    color: '#C4D4CB',
                    fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                    maxWidth: '54ch',
                  }}
                >
                  {post.summary}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ══ AMBER MARQUEE STRIP — same as homepage ═══════════════════════════ */}
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

        {/* ══ BODY ══════════════════════════════════════════════════════════════
            Asymmetric: wide reading column left, sticky sidebar right.
            No card wrapping — content lives directly on the page background.
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 lg:gap-16 items-start">

            {/* ── Article column ── */}
            <article>

              {/* Back link */}
              <Link
                href="/blogs"
                className="btn-press inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-10 group"
                style={{ color: 'var(--color-ink-faint)' }}
              >
                <ArrowLeft
                  size={13}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Toate articolele
              </Link>

              {/* Content — no card, raw on bg */}
              <div className="space-y-12">
                {sections.map((section, i) => (
                  <ArticleSection key={i} section={section} isFirst={i === 0} />
                ))}
              </div>

            </article>

            {/* ── Sticky sidebar ── */}
            <aside className="space-y-5 lg:sticky lg:top-6">

              {/* Table of contents */}
              {tocSections.length > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border-faint)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4"
                    style={{ color: 'var(--color-ink-faint)' }}
                  >
                    Cuprins
                  </p>
                  <nav className="space-y-1" aria-label="Cuprins articol">
                    {tocSections.map((s, i) => (
                      <a
                        key={i}
                        href={`#${headingSlug(s.heading2!)}`}
                        className="toc-link flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors"
                        style={{ color: 'var(--color-ink-muted)' }}
                      >
                        <span
                          className="text-[10px] font-bold tabular-nums shrink-0 mt-0.5"
                          style={{ color: 'var(--color-amber)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs leading-relaxed font-medium">
                          {s.heading2}
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Platform card — forest green, matches homepage hero */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-forest)',
                  boxShadow: '0 8px 40px rgba(30,58,47,0.22)',
                }}
              >
                {/* Amber top rule */}
                <div
                  className="h-[3px]"
                  style={{ background: 'linear-gradient(90deg, var(--color-amber) 0%, #F0B860 100%)' }}
                />
                <div className="p-6 space-y-4">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2"
                      style={{ color: '#7A9E90' }}
                    >
                      Platformă românească
                    </p>
                    <h3
                      className="text-sm font-bold leading-snug text-white"
                      style={{ maxWidth: '22ch' }}
                    >
                      Strânge fonduri pentru momentele care contează
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {[
                      'Creezi pagina în 3 minute',
                      'Fără cont pentru donatori',
                      '100% direct în contul tău',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <span
                          className="shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(212,136,42,0.22)' }}
                        >
                          <span
                            className="w-1 h-1 rounded-full block"
                            style={{ backgroundColor: '#F0B860' }}
                          />
                        </span>
                        <span className="text-xs font-medium" style={{ color: '#A8BFB4' }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/create"
                    className="btn-press btn-fill block w-full text-center rounded-xl px-4 py-3 text-sm font-bold text-white"
                    style={{
                      backgroundColor: 'var(--color-amber)',
                      boxShadow: '0 4px 20px rgba(212,136,42,0.30)',
                    }}
                  >
                    Creează o pagină gratuită
                  </Link>
                </div>
              </div>

              {/* Meta pill row */}
              <div className="flex flex-col gap-3">
                {post.publishedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)' }}>
                    {minutes} {minutes === 1 ? 'minut' : 'minute'} citire
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ══ BOTTOM CTA BAND — same amber treatment as homepage marquee ════════ */}
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

              <div className="flex flex-col sm:flex-row gap-3">
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
                <Link
                  href="/blogs"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold whitespace-nowrap transition-colors"
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.65)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    fontSize: '0.9375rem',
                  }}
                >
                  <ArrowLeft size={15} strokeWidth={2.5} />
                  Toate articolele
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER STRIP ══════════════════════════════════════════════════════ */}
        <footer
          style={{
            backgroundColor: 'var(--color-forest)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="mx-auto max-w-6xl px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
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

// ─── Article Section ──────────────────────────────────────────────────────────

function ArticleSection({
  section,
  isFirst,
}: {
  section: { heading2?: string; heading3?: string; body?: string; id?: string }
  isFirst: boolean
}) {
  return (
    <section id={section.id}>
      {section.heading2 && (
        <h2
          id={headingSlug(section.heading2)}
          className="font-bold leading-snug mb-5"
          style={{
            fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
            color: 'var(--color-ink)',
          }}
        >
          {/* Amber left-rule decoration */}
          <span
            className="inline-block w-1 h-[1.1em] rounded-full mr-3 align-middle"
            style={{ backgroundColor: 'var(--color-amber)', opacity: 0.7, verticalAlign: 'middle' }}
            aria-hidden="true"
          />
          {section.heading2}
        </h2>
      )}
      {section.heading3 && (
        <h3
          className="font-semibold mb-3 mt-6"
          style={{ fontSize: '1rem', color: 'var(--color-ink)' }}
        >
          {section.heading3}
        </h3>
      )}
      {section.body && (
        <div className="space-y-5">
          {section.body
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((line, j) => {
              const isDropcap = isFirst && j === 0 && !section.heading2 && !section.heading3
              return (
                <p
                  key={j}
                  className="text-base"
                  style={{
                    color: 'var(--color-ink-muted)',
                    lineHeight: '1.9',
                  }}
                >
                  {isDropcap ? (
                    <>
                      <span
                        className="float-left font-extrabold mr-2"
                        style={{
                          fontSize: '3.8rem',
                          lineHeight: '0.80',
                          marginTop: '6px',
                          color: 'var(--color-amber)',
                        }}
                      >
                        {line.charAt(0)}
                      </span>
                      {line.slice(1)}
                    </>
                  ) : (
                    line
                  )}
                </p>
              )
            })}
        </div>
      )}
    </section>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Markdown parser ──────────────────────────────────────────────────────────

function parseMarkdownToSections(
  md: string
): Array<{ heading2?: string; heading3?: string; body?: string; id?: string }> {
  const lines = md.split('\n')
  const sections: Array<{ heading2?: string; heading3?: string; body?: string; id?: string }> = []
  let current: { heading2?: string; heading3?: string; bodyLines: string[]; index: number } = {
    bodyLines: [],
    index: 0,
  }
  let sectionIndex = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current.bodyLines.length || current.heading2 || current.heading3) {
        sections.push({
          heading2: current.heading2,
          heading3: current.heading3,
          body: current.bodyLines.join('\n'),
          id: current.heading2 ? `section-${current.index}` : undefined,
        })
      }
      current = { heading2: line.replace('## ', ''), bodyLines: [], index: sectionIndex++ }
    } else if (line.startsWith('### ')) {
      if (current.bodyLines.length) {
        sections.push({
          heading2: current.heading2,
          heading3: current.heading3,
          body: current.bodyLines.join('\n'),
          id: current.heading2 ? `section-${current.index}` : undefined,
        })
        current = { heading2: current.heading2, heading3: undefined, bodyLines: [], index: current.index }
      }
      current.heading3 = line.replace('### ', '')
    } else if (!line.startsWith('#')) {
      current.bodyLines.push(line)
    }
  }

  if (current.bodyLines.length || current.heading2 || current.heading3) {
    sections.push({
      heading2: current.heading2,
      heading3: current.heading3,
      body: current.bodyLines.join('\n'),
      id: current.heading2 ? `section-${current.index}` : undefined,
    })
  }

  return sections
}

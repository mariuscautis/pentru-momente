import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { getBlogPostBySlug } from '@/lib/db/admin'

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

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post || !post.published) notFound()

  const sections = parseMarkdownToSections(post.content)
  const minutes = readingTime(post.content)

  return (
    <>
      <Nav />
      <main className="min-h-screen" style={{ backgroundColor: '#FDFAF7' }}>

        {/* Hero — full-width image with gradient overlay and title on top */}
        {post.coverImageUrl ? (
          <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark gradient overlay so text is always readable */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(20,10,5,0.35) 0%, rgba(20,10,5,0.72) 100%)' }}
            />
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col justify-end" style={{ minHeight: '420px' }}>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <Link href="/" className="hover:underline" style={{ color: 'rgba(255,255,255,0.65)' }}>Acasă</Link>
                <span>/</span>
                <Link href="/blogs" className="hover:underline" style={{ color: 'rgba(255,255,255,0.65)' }}>Blog</Link>
                <span>/</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }} className="line-clamp-1">{post.title}</span>
              </nav>

              {post.publishedAt && (
                <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#C4956A' }}>
                  {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {' · '}
                  {minutes} min citire
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                {post.title}
              </h1>
            </div>
          </section>
        ) : (
          /* No image — gradient hero like the other pages */
          <section
            className="relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #2D1A0E 0%, #5A3420 50%, #8B5A3A 100%)' }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C4956A 1px, transparent 0)', backgroundSize: '32px 32px' }}
            />
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-28">
              <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <Link href="/" className="hover:underline" style={{ color: 'rgba(255,255,255,0.55)' }}>Acasă</Link>
                <span>/</span>
                <Link href="/blogs" className="hover:underline" style={{ color: 'rgba(255,255,255,0.55)' }}>Blog</Link>
              </nav>
              {post.publishedAt && (
                <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#C4956A' }}>
                  {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {' · '}
                  {minutes} min citire
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                {post.title}
              </h1>
            </div>
          </section>
        )}

        {/* Article body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <article>
            <div className="rounded-2xl p-6 md:p-10 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EBE3' }}>
              <div className="space-y-8">
                {sections.map((section, i) => (
                  <section key={i}>
                    {section.heading2 && (
                      <h2
                        className="text-xl sm:text-2xl font-bold mb-4 pb-2"
                        style={{ color: '#2D1A0E', borderBottom: '2px solid #F5EDE3' }}
                      >
                        {section.heading2}
                      </h2>
                    )}
                    {section.heading3 && (
                      <h3 className="text-base font-semibold mb-3 mt-5" style={{ color: '#2D1A0E' }}>
                        {section.heading3}
                      </h3>
                    )}
                    {section.body && (
                      <div className="space-y-4">
                        {section.body
                          .split('\n')
                          .filter((line) => line.trim().length > 0)
                          .map((line, j) => (
                            <p key={j} className="text-base leading-relaxed" style={{ color: '#5A4030' }}>
                              {line}
                            </p>
                          ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: '#9A7B60' }}
              >
                ← Înapoi la Blog
              </Link>
              <Link
                href="/create"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C4956A' }}
              >
                Creează o pagină gratuită
              </Link>
            </div>
          </article>
        </div>

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

// ─── Markdown parser ──────────────────────────────────────────────────────────

function parseMarkdownToSections(
  md: string
): Array<{ heading2?: string; heading3?: string; body?: string }> {
  const lines = md.split('\n')
  const sections: Array<{ heading2?: string; heading3?: string; body?: string }> = []
  let current: { heading2?: string; heading3?: string; bodyLines: string[] } = { bodyLines: [] }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current.bodyLines.length || current.heading2 || current.heading3) {
        sections.push({ heading2: current.heading2, heading3: current.heading3, body: current.bodyLines.join('\n') })
      }
      current = { heading2: line.replace('## ', ''), bodyLines: [] }
    } else if (line.startsWith('### ')) {
      if (current.bodyLines.length) {
        sections.push({ heading2: current.heading2, heading3: current.heading3, body: current.bodyLines.join('\n') })
        current = { heading2: current.heading2, heading3: undefined, bodyLines: [] }
      }
      current.heading3 = line.replace('### ', '')
    } else if (!line.startsWith('#')) {
      current.bodyLines.push(line)
    }
  }

  if (current.bodyLines.length || current.heading2 || current.heading3) {
    sections.push({ heading2: current.heading2, heading3: current.heading3, body: current.bodyLines.join('\n') })
  }

  return sections
}

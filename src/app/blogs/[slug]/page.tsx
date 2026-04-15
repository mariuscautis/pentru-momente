import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    description: post.summary ?? `Articol pe blog pentrumomente.ro`,
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

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post || !post.published) notFound()

  const sections = parseMarkdownToSections(post.content)

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F9FC' }}>
      {/* Hero image */}
      {post.coverImageUrl && (
        <div className="w-full overflow-hidden" style={{ maxHeight: '420px', backgroundColor: '#1A1D2E' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full object-cover"
            style={{ maxHeight: '420px', opacity: 0.95 }}
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#8B92A8' }}>
          <Link href="/" style={{ color: '#8B92A8' }}>pentrumomente.ro</Link>
          <span>/</span>
          <Link href="/blogs" style={{ color: '#8B92A8' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: '#4A5068' }}>{post.title}</span>
        </nav>

        {/* Article header */}
        <article>
          <header className="mb-8">
            {/* Published date */}
            {post.publishedAt && (
              <p className="text-sm mb-3" style={{ color: '#8B92A8' }}>
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('ro-RO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </p>
            )}

            {/* H1 */}
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: '#1A1D2E' }}>
              {post.title}
            </h1>

            {/* Lead / summary */}
            {post.summary && (
              <p
                className="mt-4 text-lg leading-relaxed pb-6"
                style={{ color: '#4A5068', borderBottom: '1px solid #E2E6EF' }}
              >
                {post.summary}
              </p>
            )}
          </header>

          {/* Body content */}
          <div className="space-y-8">
            {sections.map((section, i) => (
              <section key={i}>
                {section.heading2 && (
                  <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#1A1D2E' }}>
                    {section.heading2}
                  </h2>
                )}
                {section.heading3 && (
                  <h3 className="text-base font-semibold mb-3" style={{ color: '#1A1D2E' }}>
                    {section.heading3}
                  </h3>
                )}
                {section.body && (
                  <div className="space-y-3">
                    {section.body
                      .split('\n')
                      .filter((line) => line.trim().length > 0)
                      .map((line, j) => (
                        <p key={j} className="text-base leading-relaxed" style={{ color: '#4A5068' }}>
                          {line}
                        </p>
                      ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6" style={{ borderTop: '1px solid #E2E6EF' }}>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: '#4F6EF5' }}
            >
              ← Înapoi la Blog
            </Link>
          </footer>
        </article>
      </div>
    </main>
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
        sections.push({
          heading2: current.heading2,
          heading3: current.heading3,
          body: current.bodyLines.join('\n'),
        })
      }
      current = { heading2: line.replace('## ', ''), bodyLines: [] }
    } else if (line.startsWith('### ')) {
      if (current.bodyLines.length) {
        sections.push({
          heading2: current.heading2,
          heading3: current.heading3,
          body: current.bodyLines.join('\n'),
        })
        current = { heading2: current.heading2, heading3: undefined, bodyLines: [] }
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
    })
  }

  return sections
}

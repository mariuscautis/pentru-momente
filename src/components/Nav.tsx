'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface NavPage {
  id: string
  title: string
  slug: string
  parentId: string | null
  menuPosition: number
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pages, setPages] = useState<NavPage[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/pages')
      .then(r => r.ok ? r.json() : { pages: [] })
      .then((j: { pages: NavPage[] }) => setPages(j.pages ?? []))
      .catch(() => {})
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const topLevel = pages.filter(p => !p.parentId).sort((a, b) => a.menuPosition - b.menuPosition)
  const childrenOf = (id: string) => pages.filter(p => p.parentId === id).sort((a, b) => a.menuPosition - b.menuPosition)

  // Panel item count for height animation
  const panelItemCount = 2 + pages.length
  const panelMaxHeight = panelItemCount * 60 + 80

  return (
    <nav style={{ borderBottom: '1px solid #F0EBE3', backgroundColor: '#FDFAF7' }}>
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
          pentru<span style={{ color: '#C4956A' }}>momente</span>
        </Link>

        {/* Desktop CTA links + hamburger (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white"
            style={{ color: '#7A6652' }}
          >
            Intră în cont
          </Link>
          <Link
            href="/create"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C4956A' }}
          >
            Creează pagina
          </Link>

          {/* Hamburger — right side of desktop nav */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg transition-colors hover:bg-white"
              aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
              style={{ border: '1px solid #F0EBE3' }}
            >
              <span className="block rounded-full transition-all duration-300 ease-in-out origin-center"
                style={{ height: 2, width: 18, backgroundColor: '#5A4030', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span className="block rounded-full transition-all duration-300 ease-in-out"
                style={{ height: 2, width: 18, backgroundColor: '#5A4030', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)' }} />
              <span className="block rounded-full transition-all duration-300 ease-in-out origin-center"
                style={{ height: 2, width: 18, backgroundColor: '#5A4030', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>

            {/* Desktop pages panel */}
            {menuOpen && (
              <div
                className="absolute top-full right-0 mt-1 rounded-xl shadow-lg overflow-hidden z-50 min-w-[220px]"
                style={{ backgroundColor: '#FDFAF7', border: '1px solid #F0EBE3' }}
              >
                {topLevel.length > 0 ? (
                  topLevel.map(page => {
                    const children = childrenOf(page.id)
                    return (
                      <div key={page.id}>
                        <Link
                          href={`/${page.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white"
                          style={{ color: '#2D2016', fontWeight: children.length > 0 ? 600 : 400 }}
                        >
                          {page.title}
                          {children.length > 0 && (
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#C4956A' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </Link>
                        {children.map(child => (
                          <Link
                            key={child.id}
                            href={`/${child.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 pl-7 pr-4 py-2 text-sm transition-colors hover:bg-white"
                            style={{ color: '#7A6652' }}
                          >
                            <span style={{ color: '#C4956A' }}>↳</span>
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )
                  })
                ) : (
                  <p className="px-4 py-3 text-sm" style={{ color: '#9A7B60' }}>Nicio pagină.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger (hidden on desktop) */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
        >
          <span className="block rounded-full transition-all duration-300 ease-in-out origin-center"
            style={{ height: 3, width: 22, backgroundColor: '#5A4030', transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none' }} />
          <span className="block rounded-full transition-all duration-300 ease-in-out"
            style={{ height: 3, width: 22, backgroundColor: '#5A4030', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)' }} />
          <span className="block rounded-full transition-all duration-300 ease-in-out origin-center"
            style={{ height: 3, width: 22, backgroundColor: '#5A4030', transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className="sm:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: menuOpen ? panelMaxHeight : 0, opacity: menuOpen ? 1 : 0 }}
      >
        <div className="px-4 pb-4 pt-2 space-y-2" style={{ borderTop: '1px solid #F0EBE3' }}>
          {/* CTA links at top */}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: '#7A6652', backgroundColor: '#F5EDE3' }}
          >
            Intră în cont
          </Link>
          <Link
            href="/create"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C4956A' }}
          >
            Creează o pagină gratuită
          </Link>

          {/* Dynamic pages */}
          {topLevel.length > 0 && (
            <div className="pt-1 space-y-1" style={{ borderTop: '1px solid #F0EBE3' }}>
              {topLevel.map(page => {
                const children = childrenOf(page.id)
                return (
                  <div key={page.id}>
                    <Link
                      href={`/${page.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: '#2D2016', backgroundColor: '#F5EDE3' }}
                    >
                      {page.title}
                    </Link>
                    {children.map(child => (
                      <Link
                        key={child.id}
                        href={`/${child.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl ml-4 px-4 py-2 text-sm transition-colors"
                        style={{ color: '#7A6652', backgroundColor: '#FAF5EF' }}
                      >
                        <span style={{ color: '#C4956A' }}>↳</span>
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

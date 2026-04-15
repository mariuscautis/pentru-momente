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
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetch('/api/pages')
      .then(r => r.ok ? r.json() : { pages: [] })
      .then((j: { pages: NavPage[] }) => setPages(j.pages ?? []))
      .catch(() => {})
  }, [])

  // Close on outside click — exclude mobile button to avoid race
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node
      const inDesktop = desktopMenuRef.current?.contains(target)
      const inMobileMenu = mobileMenuRef.current?.contains(target)
      const inMobileButton = mobileButtonRef.current?.contains(target)
      if (!inDesktop && !inMobileMenu && !inMobileButton) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const topLevel = pages.filter(p => !p.parentId).sort((a, b) => a.menuPosition - b.menuPosition)
  const childrenOf = (id: string) => pages.filter(p => p.parentId === id).sort((a, b) => a.menuPosition - b.menuPosition)

  // Mobile panel height for CSS transition
  const panelItemCount = 2 + pages.length
  const panelMaxHeight = panelItemCount * 60 + 80

  return (
    <nav style={{ borderBottom: '1px solid #F0EBE3', backgroundColor: '#FDFAF7' }}>
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
          pentru<span style={{ color: '#C4956A' }}>momente</span>
        </Link>

        {/* Desktop: CTA links + hamburger */}
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

          {/* Desktop hamburger + animated dropdown */}
          <div className="relative ml-1" ref={desktopMenuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
              aria-expanded={menuOpen}
              className="flex flex-col justify-center items-center w-9 h-9 rounded-lg transition-colors hover:bg-white"
              style={{ border: '1px solid #E8DDD4', gap: '5px' }}
            >
              {/* Top line */}
              <span style={{
                display: 'block', height: '2px', width: '16px',
                backgroundColor: '#5A4030', borderRadius: '2px',
                transition: 'transform 0.25s ease',
                transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              }} />
              {/* Middle line */}
              <span style={{
                display: 'block', height: '2px', width: '16px',
                backgroundColor: '#5A4030', borderRadius: '2px',
                transition: 'opacity 0.15s ease, transform 0.25s ease',
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
              }} />
              {/* Bottom line */}
              <span style={{
                display: 'block', height: '2px', width: '16px',
                backgroundColor: '#5A4030', borderRadius: '2px',
                transition: 'transform 0.25s ease',
                transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
              }} />
            </button>

            {/* Animated dropdown panel */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '220px',
                backgroundColor: '#FDFAF7',
                border: '1px solid #F0EBE3',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(45,26,14,0.12)',
                overflow: 'hidden',
                transformOrigin: 'top right',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-6px)',
                pointerEvents: menuOpen ? 'auto' : 'none',
                zIndex: 50,
              }}
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
                <p className="px-4 py-3 text-sm" style={{ color: '#9A7B60' }}>Nicio pagină adăugată.</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile hamburger — same icon as desktop */}
        <button
          ref={mobileButtonRef}
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
          aria-expanded={menuOpen}
          style={{ border: '1px solid #E8DDD4', gap: '5px' }}
        >
          <span style={{
            display: 'block', height: '2px', width: '16px',
            backgroundColor: '#5A4030', borderRadius: '2px',
            transition: 'transform 0.25s ease',
            transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            display: 'block', height: '2px', width: '16px',
            backgroundColor: '#5A4030', borderRadius: '2px',
            transition: 'opacity 0.15s ease, transform 0.25s ease',
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
          }} />
          <span style={{
            display: 'block', height: '2px', width: '16px',
            backgroundColor: '#5A4030', borderRadius: '2px',
            transition: 'transform 0.25s ease',
            transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </div>

      {/* Mobile dropdown — slide down */}
      <div
        ref={mobileMenuRef}
        className="sm:hidden overflow-hidden"
        style={{
          maxHeight: menuOpen ? `${panelMaxHeight}px` : '0px',
          opacity: menuOpen ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.2s ease',
        }}
      >
        <div className="px-4 pb-4 pt-2 space-y-2" style={{ borderTop: '1px solid #F0EBE3' }}>
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

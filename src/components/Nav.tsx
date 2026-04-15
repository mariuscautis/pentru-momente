'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/db/supabase'
import type { User } from '@supabase/supabase-js'

interface NavPage {
  id: string
  title: string
  slug: string
  parentId: string | null
  menuPosition: number
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [pages, setPages] = useState<NavPage[]>([])
  const [user, setUser] = useState<User | null>(null)

  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Load pages
  useEffect(() => {
    fetch('/api/pages')
      .then(r => r.ok ? r.json() : { pages: [] })
      .then((j: { pages: NavPage[] }) => setPages(j.pages ?? []))
      .catch(() => {})
  }, [])

  // Load auth state and subscribe to changes
  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close pages menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node
      const inDesktop = desktopMenuRef.current?.contains(target)
      const inMobileMenu = mobileMenuRef.current?.contains(target)
      const inMobileButton = mobileButtonRef.current?.contains(target)
      const inUserMenu = userMenuRef.current?.contains(target)
      if (!inDesktop && !inMobileMenu && !inMobileButton && !inUserMenu) {
        setMenuOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function signOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  // Derive display name and initial from user object
  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? 'Cont'
  const initial = displayName.charAt(0).toUpperCase()

  const topLevel = pages.filter(p => !p.parentId).sort((a, b) => a.menuPosition - b.menuPosition)
  const childrenOf = (id: string) => pages.filter(p => p.parentId === id).sort((a, b) => a.menuPosition - b.menuPosition)

  const panelItemCount = 2 + pages.length
  const panelMaxHeight = panelItemCount * 60 + 80

  // Reusable hamburger lines
  const HamburgerLines = () => (
    <>
      <span style={{ display: 'block', height: '2px', width: '16px', backgroundColor: '#5A4030', borderRadius: '2px', transition: 'transform 0.25s ease', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
      <span style={{ display: 'block', height: '2px', width: '16px', backgroundColor: '#5A4030', borderRadius: '2px', transition: 'opacity 0.15s ease, transform 0.25s ease', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)' }} />
      <span style={{ display: 'block', height: '2px', width: '16px', backgroundColor: '#5A4030', borderRadius: '2px', transition: 'transform 0.25s ease', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
    </>
  )

  return (
    <nav style={{ borderBottom: '1px solid #F0EBE3', backgroundColor: '#FDFAF7' }}>
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
          pentru<span style={{ color: '#C4956A' }}>momente</span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-2">

          {user ? (
            /* ── Logged in: avatar + user dropdown ── */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors hover:bg-white"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#E8DDD4')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {/* Avatar circle */}
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: '#C4956A', color: '#fff' }}
                >
                  {initial}
                </span>
                <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: '#2D2016' }}>
                  {displayName}
                </span>
                <svg
                  width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  style={{ color: '#9A7B60', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User dropdown */}
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: '200px', backgroundColor: '#FDFAF7',
                border: '1px solid #F0EBE3', borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(45,26,14,0.12)', overflow: 'hidden',
                transformOrigin: 'top right',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
                opacity: userMenuOpen ? 1 : 0,
                transform: userMenuOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-6px)',
                pointerEvents: userMenuOpen ? 'auto' : 'none',
                zIndex: 50,
              }}>
                {/* User info header */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0EBE3' }}>
                  <p className="text-xs font-semibold truncate" style={{ color: '#2D2016' }}>{displayName}</p>
                  {user.email && (
                    <p className="text-xs truncate mt-0.5" style={{ color: '#9A7B60' }}>{user.email}</p>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white"
                  style={{ color: '#2D2016' }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Contul meu
                </Link>
                <Link
                  href="/create"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white"
                  style={{ color: '#2D2016' }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Pagină nouă
                </Link>
                <div style={{ borderTop: '1px solid #F0EBE3' }}>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                    style={{ color: '#DC2626' }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Deconectare
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Logged out: login + create buttons ── */
            <>
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
            </>
          )}

          {/* Pages hamburger */}
          <div className="relative ml-1" ref={desktopMenuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
              aria-expanded={menuOpen}
              className="flex flex-col justify-center items-center w-9 h-9 rounded-lg transition-colors hover:bg-white"
              style={{ border: '1px solid #E8DDD4', gap: '5px' }}
            >
              <HamburgerLines />
            </button>

            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: '220px', backgroundColor: '#FDFAF7',
              border: '1px solid #F0EBE3', borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(45,26,14,0.12)', overflow: 'hidden',
              transformOrigin: 'top right',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-6px)',
              pointerEvents: menuOpen ? 'auto' : 'none',
              zIndex: 50,
            }}>
              {topLevel.length > 0 ? topLevel.map(page => {
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
                      <Link key={child.id} href={`/${child.slug}`} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 pl-7 pr-4 py-2 text-sm transition-colors hover:bg-white"
                        style={{ color: '#7A6652' }}
                      >
                        <span style={{ color: '#C4956A' }}>↳</span>{child.title}
                      </Link>
                    ))}
                  </div>
                )
              }) : (
                <p className="px-4 py-3 text-sm" style={{ color: '#9A7B60' }}>Nicio pagină adăugată.</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={mobileButtonRef}
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
          aria-expanded={menuOpen}
          style={{ border: '1px solid #E8DDD4', gap: '5px' }}
        >
          <HamburgerLines />
        </button>
      </div>

      {/* Mobile dropdown */}
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
          {user ? (
            /* Logged in mobile */
            <>
              {/* User info pill */}
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: '#F5EDE3' }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: '#C4956A', color: '#fff' }}>
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#2D2016' }}>{displayName}</p>
                  {user.email && <p className="text-xs truncate" style={{ color: '#9A7B60' }}>{user.email}</p>}
                </div>
              </div>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: '#2D2016', backgroundColor: '#F5EDE3' }}
              >
                Contul meu
              </Link>
              <Link href="/create" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: '#C4956A' }}
              >
                Pagină nouă
              </Link>
              <button onClick={signOut}
                className="w-full flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
              >
                Deconectare
              </button>
            </>
          ) : (
            /* Logged out mobile */
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: '#7A6652', backgroundColor: '#F5EDE3' }}
              >
                Intră în cont
              </Link>
              <Link href="/create" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C4956A' }}
              >
                Creează o pagină gratuită
              </Link>
            </>
          )}

          {topLevel.length > 0 && (
            <div className="pt-1 space-y-1" style={{ borderTop: '1px solid #F0EBE3' }}>
              {topLevel.map(page => {
                const children = childrenOf(page.id)
                return (
                  <div key={page.id}>
                    <Link href={`/${page.slug}`} onClick={() => setMenuOpen(false)}
                      className="flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: '#2D2016', backgroundColor: '#F5EDE3' }}
                    >
                      {page.title}
                    </Link>
                    {children.map(child => (
                      <Link key={child.id} href={`/${child.slug}`} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl ml-4 px-4 py-2 text-sm transition-colors"
                        style={{ color: '#7A6652', backgroundColor: '#FAF5EF' }}
                      >
                        <span style={{ color: '#C4956A' }}>↳</span>{child.title}
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

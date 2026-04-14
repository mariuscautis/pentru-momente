'use client'

import { useState } from 'react'
import Link from 'next/link'

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ borderBottom: '1px solid #F0EBE3', backgroundColor: '#FDFAF7' }}>
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight" style={{ color: '#2D2016' }}>
          pentru<span style={{ color: '#C4956A' }}>momente</span>
        </Link>

        {/* Desktop links */}
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
        </div>

        {/* Mobile hamburger — thick bars morphing to X */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Închide meniu' : 'Deschide meniu'}
        >
          <span
            className="block rounded-full transition-all duration-300 ease-in-out origin-center"
            style={{
              height: 3,
              width: 22,
              backgroundColor: '#5A4030',
              transform: open ? 'translateY(8px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="block rounded-full transition-all duration-300 ease-in-out"
            style={{
              height: 3,
              width: 22,
              backgroundColor: '#5A4030',
              opacity: open ? 0 : 1,
              transform: open ? 'scaleX(0)' : 'scaleX(1)',
            }}
          />
          <span
            className="block rounded-full transition-all duration-300 ease-in-out origin-center"
            style={{
              height: 3,
              width: 22,
              backgroundColor: '#5A4030',
              transform: open ? 'translateY(-8px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown — slides down with opacity fade */}
      <div
        className="sm:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? 200 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 pt-2 space-y-2" style={{ borderTop: '1px solid #F0EBE3' }}>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: '#7A6652', backgroundColor: '#F5EDE3' }}
          >
            Intră în cont
          </Link>
          <Link
            href="/create"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C4956A' }}
          >
            Creează o pagină gratuită
          </Link>
        </div>
      </div>
    </nav>
  )
}

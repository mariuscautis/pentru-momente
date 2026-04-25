'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface EventPhoto {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

interface PhotoSliderProps {
  photos: EventPhoto[]
  primary: string        // palette primary colour for tinting captions
  background: string     // palette background colour
}

// Subtle fixed rotations so each polaroid looks hand-placed
const ROTATIONS = [-2.8, 1.6, -1.2, 2.4, -0.8, 3.1, -2.1, 1.0, -3.4, 2.0]

export function PhotoSlider({ photos, primary, background }: PhotoSliderProps) {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  if (photos.length === 0) return null

  const prev = () => setActive((a) => (a - 1 + photos.length) % photos.length)
  const next = () => setActive((a) => (a + 1) % photos.length)

  // Parse primary hex to get a very light tint for caption bg
  function hexToRgba(hex: string, alpha: number) {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.slice(0, 2), 16)
    const g = parseInt(clean.slice(2, 4), 16)
    const b = parseInt(clean.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  const captionBg = hexToRgba(primary, 0.07)
  const captionBorder = hexToRgba(primary, 0.15)

  return (
    <section aria-label="Galerie foto" className="space-y-4">
      {/* ── Polaroid strip ── */}
      <div className="relative" style={{ height: 300 }}>

        {/* Background scattered cards — peek-a-boo effect */}
        {photos.length > 1 && [-1, 1].map((offset) => {
          const idx = (active + offset + photos.length) % photos.length
          const photo = photos[idx]
          const rot = ROTATIONS[idx % ROTATIONS.length]
          const isNext = offset === 1
          return (
            <div
              key={`peek-${idx}`}
              onClick={isNext ? next : prev}
              className="absolute cursor-pointer select-none"
              style={{
                left: isNext ? '58%' : '8%',
                top: '50%',
                transform: `translateY(-50%) rotate(${rot}deg)`,
                width: 180,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                opacity: 0.55,
                zIndex: 1,
              }}
            >
              <Polaroid photo={photo} captionBg={captionBg} captionBorder={captionBorder} background={background} />
            </div>
          )
        })}

        {/* Active / front card */}
        <div
          className="absolute select-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${ROTATIONS[active % ROTATIONS.length] * 0.3}deg)`,
            width: 220,
            zIndex: 10,
            transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1)',
            filter: 'drop-shadow(0 8px 28px rgba(28,18,9,0.18))',
          }}
        >
          <Polaroid photo={photos[active]} captionBg={captionBg} captionBorder={captionBorder} background={background} large />
        </div>

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Foto anterioară"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
              style={{ width: 36, height: 36, backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0', boxShadow: '0 2px 8px rgba(28,18,9,0.10)' }}
            >
              <ChevronLeft size={16} strokeWidth={2} style={{ color: '#7A6652' }} />
            </button>
            <button
              onClick={next}
              aria-label="Foto următoare"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
              style={{ width: 36, height: 36, backgroundColor: '#FFFDFB', border: '1px solid #EDE0D0', boxShadow: '0 2px 8px rgba(28,18,9,0.10)' }}
            >
              <ChevronRight size={16} strokeWidth={2} style={{ color: '#7A6652' }} />
            </button>
          </>
        )}
      </div>

      {/* ── Dot indicators ── */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-1.5" ref={trackRef}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1}`}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                backgroundColor: i === active ? primary : '#D4C4B0',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Polaroid({
  photo,
  captionBg,
  captionBorder,
  background,
  large = false,
}: {
  photo: EventPhoto
  captionBg: string
  captionBorder: string
  background: string
  large?: boolean
}) {
  const pad = large ? 10 : 8
  const imgH = large ? 160 : 128
  const bottomPad = large ? 14 : 10

  return (
    <div
      style={{
        backgroundColor: '#FFFEFB',
        padding: pad,
        paddingBottom: bottomPad,
        borderRadius: 4,
        boxShadow: '0 2px 6px rgba(28,18,9,0.10), 0 1px 2px rgba(28,18,9,0.06)',
        border: '1px solid rgba(212,196,176,0.6)',
      }}
    >
      {/* Photo */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: imgH,
          backgroundColor: background,
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <Image
          src={photo.imageUrl}
          alt={photo.caption ?? 'Foto'}
          fill
          className="object-cover"
          sizes="220px"
          unoptimized
        />
      </div>

      {/* Caption area — always present so polaroid bottom feels consistent */}
      <div
        style={{
          marginTop: large ? 10 : 8,
          minHeight: large ? 32 : 24,
          textAlign: 'center',
        }}
      >
        {photo.caption && (
          <p
            style={{
              fontSize: large ? 12 : 10,
              color: '#5A3D25',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              lineHeight: 1.45,
              padding: '4px 6px',
              borderRadius: 4,
              backgroundColor: captionBg,
              border: `1px solid ${captionBorder}`,
              display: 'inline-block',
              maxWidth: '100%',
              wordBreak: 'break-word',
            }}
          >
            {photo.caption}
          </p>
        )}
      </div>
    </div>
  )
}

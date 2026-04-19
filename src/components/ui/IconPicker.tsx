'use client'

import { useState } from 'react'

export interface IconDef {
  id: string
  label: string
  svg: React.ReactNode
}

// ── Icon library ────────────────────────────────────────────────────────────────
// General / universal
const Heart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
)

const Gift = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)

const Home = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const Flower = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/>
    <path d="M12 16a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/>
    <path d="M2 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/>
    <path d="M16 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/>
  </svg>
)

const Candle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <path d="M9 6h6l1 14H8L9 6z"/>
    <path d="M12 2c0 0-2 1.5-2 3s2 2 2 2 2-.5 2-2-2-3-2-3z" fill="currentColor"/>
  </svg>
)

const Ring = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="14" r="7"/>
    <path d="M9 14a3 3 0 0 1 6 0"/>
    <path d="M9 7l1.5-5h3L15 7"/>
  </svg>
)

const Champagne = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M8 22l2-7H6l2-7h8l2 7h-4l2 7"/>
    <line x1="6" y1="11" x2="18" y2="11"/>
    <path d="M12 8V2M9 5l3-3 3 3"/>
  </svg>
)

const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const Baby = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="8" r="4"/>
    <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
    <path d="M12 4V2"/>
    <path d="M9 11c0 0 1 2 3 2s3-2 3-2"/>
  </svg>
)

const Bottle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M9 2h6v3l2 3v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-3V2z"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
)

const Car = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <rect x="7" y="14" width="10" height="6" rx="1"/>
    <path d="M5 9l2-4h10l2 4"/>
  </svg>
)

const Stroller = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M4 4h2l3 9h8l2-7H7"/>
    <circle cx="9" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>
)

const Medical = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)

const Pill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/>
    <line x1="8.5" y1="11.5" x2="15.5" y2="11.5"/>
  </svg>
)

const Leaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 3-9.5 4"/>
    <line x1="3.82" y1="21.34" x2="9" y2="16"/>
  </svg>
)

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const Music = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
)

const Camera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const Plane = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
)

const Cake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/>
    <line x1="2" y1="21" x2="22" y2="21"/>
    <path d="M7 11V6M12 11V4M17 11V6"/>
    <path d="M7 4c0-1.1.9-2 2-2"/><path d="M12 2c0-1.1.9-2 2-2"/><path d="M17 4c0-1.1.9-2 2-2"/>
  </svg>
)

const Hands = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/>
    <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
)

const Sparkles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M12 3l1.88 5.76L20 10l-5.76 1.88L12 18l-1.88-5.76L4 10l5.76-1.88z"/>
    <path d="M5 3l.94 2.88L9 7l-2.88.94L5 11l-.94-2.88L1 7l2.88-.94z"/>
    <path d="M19 13l.94 2.88L23 17l-2.88.94L19 21l-.94-2.88L15 17l2.88-.94z"/>
  </svg>
)

const Ribbon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="8" r="6"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12" y2="22"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
  </svg>
)

export const ALL_ICONS: IconDef[] = [
  { id: 'heart', label: 'Inimă', svg: <Heart /> },
  { id: 'star', label: 'Stea', svg: <Star /> },
  { id: 'gift', label: 'Cadou', svg: <Gift /> },
  { id: 'sparkles', label: 'Sclipire', svg: <Sparkles /> },
  { id: 'hands', label: 'Mâini', svg: <Hands /> },
  { id: 'ribbon', label: 'Panglică', svg: <Ribbon /> },
  { id: 'home', label: 'Casă', svg: <Home /> },
  { id: 'flower', label: 'Floare', svg: <Flower /> },
  { id: 'candle', label: 'Lumânare', svg: <Candle /> },
  { id: 'leaf', label: 'Frunză', svg: <Leaf /> },
  { id: 'sun', label: 'Soare', svg: <Sun /> },
  { id: 'ring', label: 'Inel', svg: <Ring /> },
  { id: 'champagne', label: 'Șampanie', svg: <Champagne /> },
  { id: 'moon', label: 'Lună', svg: <Moon /> },
  { id: 'music', label: 'Muzică', svg: <Music /> },
  { id: 'camera', label: 'Cameră', svg: <Camera /> },
  { id: 'plane', label: 'Avion', svg: <Plane /> },
  { id: 'cake', label: 'Tort', svg: <Cake /> },
  { id: 'baby', label: 'Bebe', svg: <Baby /> },
  { id: 'bottle', label: 'Biberon', svg: <Bottle /> },
  { id: 'stroller', label: 'Cărucior', svg: <Stroller /> },
  { id: 'car', label: 'Mașină', svg: <Car /> },
  { id: 'medical', label: 'Medical', svg: <Medical /> },
  { id: 'pill', label: 'Pastilă', svg: <Pill /> },
]

function getIconById(id: string): IconDef | undefined {
  return ALL_ICONS.find((i) => i.id === id)
}

interface IconDisplayProps {
  iconId?: string
  size?: number
  color?: string
}

// Renders just the SVG for a given icon id — use this inline in item rows
export function IconDisplay({ iconId, size = 20, color = 'currentColor' }: IconDisplayProps) {
  const icon = iconId ? getIconById(iconId) : undefined
  if (!icon) {
    return (
      <span style={{ fontSize: size * 0.9, lineHeight: 1, color }}>✦</span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color }}>
      {icon.svg}
    </span>
  )
}

interface IconPickerProps {
  value?: string        // current icon id
  onChange: (id: string) => void
  primaryColor?: string
}

export function IconPicker({ value, onChange, primaryColor = '#C4956A' }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const current = value ? getIconById(value) : undefined

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Alege pictogramă"
        className="flex items-center justify-center rounded-xl transition-all"
        style={{
          width: 40,
          height: 40,
          border: `1.5px solid ${value ? primaryColor : '#EDE0D0'}`,
          backgroundColor: value ? '#FFF8F2' : '#FDFAF7',
          color: value ? primaryColor : '#B09070',
          flexShrink: 0,
        }}
      >
        {current ? <span style={{ display: 'inline-flex' }}>{current.svg}</span> : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'rgba(45,32,22,0.45)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: '#FFFDFB', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: '#2D2016' }}>Alege pictograma</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm transition-opacity hover:opacity-60"
                style={{ color: '#9A7B60' }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {ALL_ICONS.map((icon) => {
                const isSelected = value === icon.id
                return (
                  <button
                    key={icon.id}
                    type="button"
                    title={icon.label}
                    onClick={() => { onChange(icon.id); setOpen(false) }}
                    className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all"
                    style={{
                      border: `1.5px solid ${isSelected ? primaryColor : '#EDE0D0'}`,
                      backgroundColor: isSelected ? '#FFF8F2' : '#FDFAF7',
                      color: isSelected ? primaryColor : '#7A6652',
                    }}
                  >
                    {icon.svg}
                    <span className="text-xs leading-tight text-center" style={{ fontSize: 10 }}>
                      {icon.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false) }}
                className="w-full text-xs py-2 rounded-xl transition-colors"
                style={{ border: '1px solid #EDE0D0', color: '#9A7B60' }}
              >
                Elimină pictograma
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

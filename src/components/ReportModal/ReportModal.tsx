'use client'

import { useState } from 'react'
import { X, Flag, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Event, EventTypeConfig } from '@/types'

interface ReportModalProps {
  event: Event
  config: EventTypeConfig
  onClose: () => void
}

const REASONS = [
  { value: 'fraud',     label: 'Fraudă sau înșelătorie' },
  { value: 'fake',      label: 'Eveniment fals' },
  { value: 'offensive', label: 'Conținut ofensator' },
  { value: 'spam',      label: 'Spam' },
  { value: 'other',     label: 'Alt motiv' },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ReportModal({ event, config, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!reason) { setErrorMsg('Alege un motiv.'); return }
    if (details.trim().length < 10) { setErrorMsg('Descrie problema în cel puțin 10 caractere.'); return }
    if (!reporterEmail.trim()) { setErrorMsg('Adaugă adresa ta de email.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) { setErrorMsg('Adresa de email nu este validă.'); return }

    setStatus('submitting')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug,
          eventType: event.eventType,
          eventName: event.name,
          reason,
          details,
          reporterEmail: reporterEmail.trim() || undefined,
        }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const j = await res.json() as { error?: string }
        setErrorMsg(j.error ?? 'Eroare la trimitere. Încearcă din nou.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Eroare de rețea. Încearcă din nou.')
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(28,18,9,0.48)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Raportează pagina"
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#FFFDFB',
          border: '1px solid #EDE0D0',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #F0E8DC' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FEF2F2' }}
            >
              <Flag size={14} strokeWidth={2} style={{ color: '#B91C1C' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: '#1C1209' }}>
              Raportează această pagină
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
            style={{ color: '#9A7B60' }}
            aria-label="Închide"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {status === 'success' ? (
            <SuccessState onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Reason selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold" style={{ color: '#5A3D25' }}>
                  Motivul raportului <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <div className="space-y-1.5">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 cursor-pointer transition-colors"
                      style={{
                        border: `1.5px solid ${reason === r.value ? config.palette.primary : '#EDE0D0'}`,
                        backgroundColor: reason === r.value ? hexToRgba(config.palette.primary, 0.05) : '#FDFAF7',
                      }}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="sr-only"
                      />
                      <span
                        className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors"
                        style={{
                          borderColor: reason === r.value ? config.palette.primary : '#C8B8A8',
                          backgroundColor: reason === r.value ? config.palette.primary : 'transparent',
                        }}
                      >
                        {reason === r.value && (
                          <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-sm" style={{ color: '#2D2016' }}>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <label htmlFor="report-details" className="block text-xs font-semibold" style={{ color: '#5A3D25' }}>
                  Descrie problema <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explică pe scurt de ce raportezi această pagină..."
                  rows={3}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none transition-colors"
                  style={{ border: '1.5px solid #EDE0D0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                  onFocus={(e) => (e.target.style.borderColor = config.palette.primary)}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE0D0')}
                />
              </div>

              {/* Optional reporter email */}
              <div className="space-y-1.5">
                <label htmlFor="report-email" className="block text-xs font-semibold" style={{ color: '#5A3D25' }}>
                  Email-ul tău <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <input
                  id="report-email"
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="adresa@exemplu.ro"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{ border: '1.5px solid #EDE0D0', color: '#2D2016', backgroundColor: '#FDFAF7' }}
                  onFocus={(e) => (e.target.style.borderColor = config.palette.primary)}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE0D0')}
                />
              </div>

              {/* Error */}
              {(status === 'error' || errorMsg) && (
                <div
                  className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs"
                  style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
                >
                  <AlertTriangle size={13} strokeWidth={2} className="shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: '#B91C1C',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  boxShadow: status === 'submitting' ? 'none' : '0 4px 16px rgba(185,28,28,0.22)',
                }}
              >
                {status === 'submitting' ? (
                  <><Loader2 size={15} className="animate-spin" /> Se trimite...</>
                ) : (
                  <><Flag size={14} strokeWidth={2} /> Trimite raportul</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: '#F0FDF4' }}
      >
        <CheckCircle2 size={24} strokeWidth={1.5} style={{ color: '#166534' }} />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm" style={{ color: '#1C1209' }}>Raport trimis</p>
        <p className="text-sm leading-relaxed" style={{ color: '#7A6652' }}>
          Mulțumim. Am primit raportul tău și îl vom analiza în cel mai scurt timp.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
        style={{ border: '1.5px solid #EDE0D0', color: '#5A3D25' }}
      >
        Închide
      </button>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, MessageCircle, ChevronLeft, Send, Plus, Loader2, CheckCircle2,
} from 'lucide-react'
import { getSupabase } from '@/lib/db/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  hasUnreadUser: boolean
  createdAt: string
  updatedAt: string
}

interface TicketMessage {
  id: string
  senderRole: 'user' | 'admin'
  senderName: string
  body: string
  createdAt: string
}

interface Props {
  accessToken: string
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const d = {
  bg: '#FDFAF7',
  surface: '#FFFDFB',
  border: '#EDE0D0',
  borderFaint: '#F5EDE3',
  accent: '#C4956A',
  accentHover: '#A87750',
  accentLight: '#FAF0E6',
  text: '#2D2016',
  textMid: '#6B4F35',
  textSoft: '#9A7B60',
  textFaint: '#C4A882',
  success: '#166534',
  successBg: '#F0FDF4',
  danger: '#B91C1C',
  dangerBg: '#FEF2F2',
  bubble_user: '#C4956A',
  bubble_admin: '#F5EDE3',
  shadow: '0 8px 32px rgba(45,32,22,0.14), 0 2px 8px rgba(45,32,22,0.08)',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Deschis',
  in_progress: 'În lucru',
  completed: 'Rezolvat',
  cancelled: 'Anulat',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  open:        { bg: d.accentLight, color: d.accent },
  in_progress: { bg: '#EFF6FF', color: '#1D4ED8' },
  completed:   { bg: d.successBg, color: d.success },
  cancelled:   { bg: '#F1F5F9', color: '#64748B' },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupportModal({ accessToken }: Props) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'list' | 'thread' | 'new'>('list')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [reply, setReply] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeTicketRef = useRef<Ticket | null>(null)
  activeTicketRef.current = activeTicket

  const totalUnread = tickets.filter(t => t.hasUnreadUser).length

  const authFetch = useCallback((path: string, opts?: RequestInit) =>
    fetch(path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(opts?.headers ?? {}),
      },
    }), [accessToken])

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const res = await authFetch('/api/tickets')
      if (res.ok) {
        const j = await res.json() as { tickets: Ticket[] }
        setTickets(j.tickets)
      }
    } finally {
      setLoadingTickets(false)
    }
  }, [authFetch])

  const loadMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true)
    try {
      const res = await authFetch(`/api/tickets/${ticketId}/messages`)
      if (res.ok) {
        const j = await res.json() as { messages: TicketMessage[] }
        setMessages(j.messages)
        // Mark as read locally
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, hasUnreadUser: false } : t))
      }
    } finally {
      setLoadingMessages(false)
    }
  }, [authFetch])

  // ── Load tickets on mount (so the unread badge is populated immediately) ──
  useEffect(() => {
    if (accessToken) loadTickets()
  }, [accessToken, loadTickets])

  // ── Reload list every time the modal is opened or navigated back to list ──
  useEffect(() => {
    if (open && view === 'list') loadTickets()
  }, [open, view, loadTickets])

  // ── Scroll to bottom when messages change ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Realtime: new messages arriving ──────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase
      .channel('user-ticket-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages' },
        (payload) => {
          const row = payload.new as {
            id: string; ticket_id: string; sender_role: string
            sender_name: string; body: string; created_at: string
          }
          // If the admin replied and this thread is currently open, append it live
          if (activeTicketRef.current?.id === row.ticket_id && row.sender_role === 'admin') {
            const msg: TicketMessage = {
              id: row.id,
              senderRole: 'admin',
              senderName: row.sender_name,
              body: row.body,
              createdAt: row.created_at,
            }
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
            // Mark read immediately since the thread is open
            authFetch(`/api/tickets/${row.ticket_id}/messages`).catch(() => null)
          }
          // Always refresh the ticket list so unread dots + timestamps stay current
          loadTickets()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [authFetch, loadTickets])

  // ── Realtime: ticket status / unread flag changes ─────────────────────────
  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase
      .channel('user-ticket-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets' },
        (payload) => {
          const row = payload.new as {
            id: string; status: string; has_unread_user: boolean; updated_at: string
          }
          setTickets(prev => prev.map(t =>
            t.id === row.id
              ? { ...t, status: row.status as Ticket['status'], hasUnreadUser: row.has_unread_user, updatedAt: row.updated_at }
              : t
          ))
          if (activeTicketRef.current?.id === row.id) {
            setActiveTicket(prev => prev ? { ...prev, status: row.status as Ticket['status'] } : null)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  function openThread(ticket: Ticket) {
    setActiveTicket(ticket)
    setMessages([])
    setReply('')
    setView('thread')
    loadMessages(ticket.id)
  }

  function goBack() {
    setView('list')
    setActiveTicket(null)
    loadTickets()
  }

  async function sendReply() {
    if (!reply.trim() || !activeTicket) return
    setSending(true)
    const optimistic: TicketMessage = {
      id: `opt-${Date.now()}`,
      senderRole: 'user',
      senderName: 'Tu',
      body: reply.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    const text = reply.trim()
    setReply('')
    try {
      const res = await authFetch(`/api/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const j = await res.json() as { message: TicketMessage }
        setMessages(prev => prev.map(m => m.id === optimistic.id ? j.message : m))
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
        setReply(text)
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setReply(text)
    } finally {
      setSending(false)
    }
  }

  async function submitNewTicket() {
    setFormErr('')
    if (!newSubject.trim()) { setFormErr('Adaugă un subiect.'); return }
    if (!newMessage.trim()) { setFormErr('Descrie problema ta.'); return }
    setSubmitting(true)
    try {
      const res = await authFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject: newSubject.trim(), message: newMessage.trim() }),
      })
      if (res.ok) {
        const j = await res.json() as { ticket: Ticket }
        setTickets(prev => [j.ticket, ...prev])
        setNewSubject('')
        setNewMessage('')
        // Navigate straight into the new thread
        openThread(j.ticket)
      } else {
        setFormErr('Eroare la trimitere. Încearcă din nou.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isClosed = activeTicket?.status === 'completed' || activeTicket?.status === 'cancelled'

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating trigger button ───────────────────────────────────────── */}
      <button
        onClick={() => { setOpen(true); setView('list') }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: d.accent, boxShadow: `0 4px 18px rgba(196,149,106,0.45)` }}
        aria-label="Suport"
      >
        <MessageCircle size={18} strokeWidth={2} />
        <span>Suport</span>
        {totalUnread > 0 && (
          <span
            className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: '#fff', color: d.accent }}
          >
            {totalUnread}
          </span>
        )}
      </button>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end sm:justify-end" style={{ pointerEvents: 'none' }}>
          {/* Mobile backdrop */}
          <div
            className="absolute inset-0 sm:hidden"
            style={{ backgroundColor: 'rgba(45,32,22,0.35)', pointerEvents: 'auto' }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative flex flex-col w-full sm:w-96 sm:mr-6 sm:mb-20 rounded-t-3xl sm:rounded-2xl overflow-hidden"
            style={{
              backgroundColor: d.surface,
              border: `1px solid ${d.border}`,
              boxShadow: d.shadow,
              height: 'min(600px, 85vh)',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: `1px solid ${d.border}`, backgroundColor: d.bg }}
            >
              <div className="flex items-center gap-2.5">
                {view !== 'list' && (
                  <button
                    onClick={goBack}
                    className="p-1 -ml-1 rounded-lg transition-colors"
                    style={{ color: d.textSoft }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = d.borderFaint)}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <div>
                  <p className="text-sm font-bold" style={{ color: d.text }}>
                    {view === 'list' && 'Suport'}
                    {view === 'thread' && (activeTicket?.subject ?? '')}
                    {view === 'new' && 'Tichet nou'}
                  </p>
                  {view === 'thread' && activeTicket && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={STATUS_STYLES[activeTicket.status]}
                    >
                      {STATUS_LABELS[activeTicket.status]}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: d.textSoft }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = d.borderFaint)}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                aria-label="Închide"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col">

              {/* ── LIST ─────────────────────────────────────────────────── */}
              {view === 'list' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto">
                    {loadingTickets && tickets.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 size={20} className="animate-spin" style={{ color: d.textFaint }} />
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 gap-3 px-6 text-center">
                        <MessageCircle size={32} style={{ color: d.textFaint }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: d.textMid }}>Niciun tichet încă</p>
                          <p className="text-xs mt-1" style={{ color: d.textSoft }}>
                            Deschide un tichet dacă ai nevoie de ajutor.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y" style={{ borderColor: d.borderFaint }}>
                        {tickets.map(t => (
                          <li key={t.id}>
                            <button
                              onClick={() => openThread(t)}
                              className="w-full text-left px-5 py-4 transition-colors"
                              onMouseOver={e => (e.currentTarget.style.backgroundColor = d.borderFaint)}
                              onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    {t.hasUnreadUser && (
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                                        style={{ backgroundColor: d.accent }}
                                      />
                                    )}
                                    <p className="text-sm font-semibold truncate" style={{ color: d.text }}>
                                      {t.subject}
                                    </p>
                                  </div>
                                  <p className="text-xs" style={{ color: d.textSoft }}>{fmtShort(t.updatedAt)}</p>
                                </div>
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                                  style={STATUS_STYLES[t.status]}
                                >
                                  {STATUS_LABELS[t.status]}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer: new ticket button */}
                  <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${d.border}` }}>
                    <button
                      onClick={() => { setView('new'); setFormErr(''); setNewSubject(''); setNewMessage('') }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
                      style={{ backgroundColor: d.accent }}
                      onMouseOver={e => (e.currentTarget.style.backgroundColor = d.accentHover)}
                      onMouseOut={e => (e.currentTarget.style.backgroundColor = d.accent)}
                    >
                      <Plus size={16} />
                      Deschide tichet nou
                    </button>
                  </div>
                </div>
              )}

              {/* ── NEW TICKET FORM ──────────────────────────────────────── */}
              {view === 'new' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: d.textMid }}>
                        Subiect *
                      </label>
                      <input
                        type="text"
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                        placeholder="ex. Nu pot activa pagina"
                        maxLength={120}
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                        style={{ backgroundColor: d.bg, border: `1px solid ${d.border}`, color: d.text }}
                        onFocus={e => { e.currentTarget.style.borderColor = d.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${d.accent}22` }}
                        onBlur={e => { e.currentTarget.style.borderColor = d.border; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: d.textMid }}>
                        Descrie problema *
                      </label>
                      <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Explică în detaliu cu ce ai nevoie de ajutor..."
                        rows={6}
                        className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                        style={{ backgroundColor: d.bg, border: `1px solid ${d.border}`, color: d.text }}
                        onFocus={e => { e.currentTarget.style.borderColor = d.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${d.accent}22` }}
                        onBlur={e => { e.currentTarget.style.borderColor = d.border; e.currentTarget.style.boxShadow = 'none' }}
                      />
                    </div>
                    {formErr && (
                      <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: d.dangerBg, color: d.danger }}>
                        {formErr}
                      </p>
                    )}
                  </div>

                  <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${d.border}` }}>
                    <button
                      onClick={submitNewTicket}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
                      style={{ backgroundColor: d.accent, opacity: submitting ? 0.7 : 1 }}
                      onMouseOver={e => { if (!submitting) e.currentTarget.style.backgroundColor = d.accentHover }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = d.accent }}
                    >
                      {submitting
                        ? <><Loader2 size={15} className="animate-spin" /> Se trimite...</>
                        : <><Send size={15} /> Trimite tichet</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* ── THREAD ───────────────────────────────────────────────── */}
              {view === 'thread' && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-24">
                        <Loader2 size={18} className="animate-spin" style={{ color: d.textFaint }} />
                      </div>
                    ) : messages.map(m => {
                      const isUser = m.senderRole === 'user'
                      return (
                        <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                            style={{
                              backgroundColor: isUser ? d.bubble_user : d.bubble_admin,
                              color: isUser ? '#fff' : d.text,
                            }}
                          >
                            {!isUser && (
                              <p className="text-xs font-semibold mb-1" style={{ color: d.accent }}>
                                {m.senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                            <p
                              className="text-xs mt-1.5 text-right"
                              style={{ color: isUser ? 'rgba(255,255,255,0.65)' : d.textFaint }}
                            >
                              {fmt(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply or closed notice */}
                  {isClosed ? (
                    <div
                      className="px-5 py-4 shrink-0 flex items-center gap-2"
                      style={{ borderTop: `1px solid ${d.border}`, backgroundColor: d.bg }}
                    >
                      <CheckCircle2 size={16} style={{ color: d.textSoft }} />
                      <p className="text-xs" style={{ color: d.textSoft }}>
                        Acest tichet este {activeTicket?.status === 'completed' ? 'rezolvat' : 'anulat'}.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="px-4 py-3 shrink-0"
                      style={{ borderTop: `1px solid ${d.border}`, backgroundColor: d.bg }}
                    >
                      <div
                        className="flex items-end gap-2 rounded-2xl px-3 py-2"
                        style={{ border: `1px solid ${d.border}`, backgroundColor: d.surface }}
                      >
                        <textarea
                          value={reply}
                          onChange={e => setReply(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
                          }}
                          placeholder="Scrie un mesaj..."
                          rows={1}
                          className="flex-1 text-sm outline-none resize-none bg-transparent"
                          style={{ color: d.text, lineHeight: '1.5', maxHeight: 96, overflowY: 'auto' }}
                        />
                        <button
                          onClick={sendReply}
                          disabled={sending || !reply.trim()}
                          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            backgroundColor: reply.trim() ? d.accent : d.borderFaint,
                            color: reply.trim() ? '#fff' : d.textFaint,
                            opacity: sending ? 0.6 : 1,
                          }}
                          aria-label="Trimite"
                        >
                          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                      </div>
                      <p className="text-xs mt-1.5 text-right" style={{ color: d.textFaint }}>
                        Enter pentru trimitere · Shift+Enter pentru rând nou
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}

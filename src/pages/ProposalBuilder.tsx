import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, Zap, Send, Copy, Check, X, ExternalLink, MessageCircle, Mail, ShieldCheck, RefreshCw, FileDown } from 'lucide-react'
import { useProposalStore } from '../stores/useProposalStore'
import { useAuthStore } from '../stores/useAuthStore'
import { usePresenceStore } from '../stores/usePresenceStore'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { EditorPanel } from '../components/builder/EditorPanel'
import { LivePreview } from '../components/builder/LivePreview'
import { BottomSheet } from '../components/dashboard/BottomSheet'
import type { Proposal, ProposalInsert } from '../types/proposal'
import { generateProposalPdf } from '../lib/pdfEngine'

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved'

// ─── Send Modal ───────────────────────────────────────────────────────────────

function SendModal({
  open,
  onClose,
  shareUrl,
  clientName,
  clientEmail,
  locale,
}: {
  open: boolean
  onClose: () => void
  shareUrl: string
  clientName: string
  clientEmail?: string
  locale: string
}) {
  const [copied, setCopied] = useState(false)
  const isHe = locale === 'he'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const whatsappMsg = isHe
    ? `שלום${clientName ? ` ${clientName}` : ''}! הכנתי עבורך הצעת מחיר. לצפייה ואישור: ${shareUrl}`
    : `Hi${clientName ? ` ${clientName}` : ''}! I've prepared a proposal for you. View and approve here: ${shareUrl}`

  const mailtoHref = `mailto:${clientEmail ?? ''}?subject=${encodeURIComponent(isHe ? 'הצעת מחיר עבורך' : 'Your Proposal')}&body=${encodeURIComponent(whatsappMsg)}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl p-7"
              style={{
                background:
                  'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(40px)',
                boxShadow:
                  '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              initial={{ scale: 0.88, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              dir={isHe ? 'rtl' : 'ltr'}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 end-4 flex h-7 w-7 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white/70"
              >
                <X size={14} />
              </button>

              {/* Success icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 0 30px rgba(99,102,241,0.2)',
                  }}
                >
                  🚀
                </div>
              </div>

              <h2 className="text-xl font-black text-white text-center mb-1">
                {isHe ? 'חדר העסקה פעיל!' : 'Deal Room is Live!'}
              </h2>
              <p className="text-sm text-white/45 text-center mb-6">
                {isHe
                  ? `שתף את הקישור עם ${clientName || 'הלקוח'} — הם יוכלו לצפות ולאשר מיידית.`
                  : `Share this link with ${clientName || 'your client'} — they can view and approve instantly.`}
              </p>

              {/* Link box */}
              <div
                className="flex items-center gap-2 rounded-xl p-3 mb-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <ExternalLink size={12} className="flex-none text-white/30" />
                <p className="flex-1 text-xs font-mono text-white/50 truncate">
                  {shareUrl}
                </p>
              </div>

              {/* Copy button */}
              <motion.button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white mb-3"
                style={{
                  background: copied
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                  boxShadow: copied
                    ? '0 0 24px rgba(34,197,94,0.4)'
                    : '0 0 24px rgba(99,102,241,0.4)',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {copied ? (
                  <>
                    <Check size={15} strokeWidth={3} />
                    {isHe ? 'הועתק!' : 'Copied!'}
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {isHe ? 'העתק קישור' : 'Copy Link'}
                  </>
                )}
              </motion.button>

              {/* Share via WhatsApp / Email */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition hover:opacity-90"
                  style={{
                    background: 'rgba(37,211,102,0.12)',
                    border: '1px solid rgba(37,211,102,0.25)',
                    color: '#25d366',
                  }}
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </a>
                <a
                  href={mailtoHref}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition hover:opacity-90"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#818cf8',
                  }}
                >
                  <Mail size={13} />
                  {isHe ? 'אימייל' : 'Email'}
                </a>
              </div>

              <p className="mt-3 text-center text-[10px] text-white/20">
                {isHe
                  ? 'תראה כשהלקוח פתח את הקישור ואישר'
                  : "You'll see when your client views and approves"}
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const BLANK_DRAFT: ProposalInsert = {
  client_name: '',
  client_email: '',
  project_title: '',
  description: '',
  base_price: 0,
  currency: 'ILS',
  add_ons: [],
  payment_milestones: [],
  status: 'draft',
  expires_at: null,
  last_viewed_at: null,
  include_vat: false,
}

// ─── ProposalBuilder ──────────────────────────────────────────────────────────

export default function ProposalBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { locale } = useI18n()
  const { proposals, fetchProposals, createProposal, updateProposal } = useProposalStore()

  const [proposalId, setProposalId] = useState<string | null>(id ?? null)
  const [draft, setDraft] = useState<ProposalInsert>(BLANK_DRAFT)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  const { user } = useAuthStore()
  const { markActive, markInactive, activeViewers } = usePresenceStore()

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftRef = useRef<ProposalInsert>(BLANK_DRAFT)
  const proposalIdRef = useRef<string | null>(id ?? null)
  // Prevent double-create in StrictMode/concurrent renders
  const creatingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { draftRef.current = draft }, [draft])
  useEffect(() => { proposalIdRef.current = proposalId }, [proposalId])

  // ── Mount: load existing ─────────────────────────────────────────────────────
  // For NEW proposals (no id): do NOT touch Supabase. We stay in local state
  // until the user actually types something (lazy creation via handleChange).
  useEffect(() => {
    const init = async () => {
      if (id) {
        let found = useProposalStore.getState().proposals.find(p => p.id === id)
        if (!found) {
          await fetchProposals()
          found = useProposalStore.getState().proposals.find(p => p.id === id)
        }
        if (found) {
          const {
            id: _id, user_id: _uid, public_token: _pt,
            view_count: _vc, time_spent_seconds: _ts,
            created_at: _ca, updated_at: _ua,
            ...rest
          } = found
          setDraft(rest)
          draftRef.current = rest
          setProposalId(found.id)
          proposalIdRef.current = found.id
        } else {
          navigate('/dashboard', { replace: true })
          return
        }
      }
      // No `id` → brand-new proposal, leave local state as BLANK_DRAFT
      setInitializing(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // ── Live presence — subscribe to user-activity channel ───────────────────────
  useEffect(() => {
    if (!user?.id) return
    const offlineTimers: Record<string, ReturnType<typeof setTimeout>> = {}

    const channel = supabase
      .channel(`user-activity:${user.id}`)
      .on('broadcast', { event: 'heartbeat' }, (msg) => {
        const token: string | undefined = msg.payload?.token
        if (!token) return
        markActive(token)
        if (offlineTimers[token]) clearTimeout(offlineTimers[token])
        offlineTimers[token] = setTimeout(() => {
          markInactive(token)
          delete offlineTimers[token]
        }, 10_000)
      })
      .subscribe()

    return () => {
      Object.values(offlineTimers).forEach(clearTimeout)
      supabase.removeChannel(channel)
    }
  }, [user?.id, markActive, markInactive])

  // ── Debounced autosave (lazy DB creation for new proposals) ───────────────────
  const handleChange = useCallback((patch: Partial<ProposalInsert>) => {
    setDraft(prev => {
      const next = { ...prev, ...patch }
      draftRef.current = next
      return next
    })
    setSaveStatus('saving')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(async () => {
      const current = draftRef.current

      if (!proposalIdRef.current) {
        // Only create if there's meaningful content — no ghost drafts
        if (!current.project_title?.trim() && !current.client_name?.trim()) {
          setSaveStatus('idle')
          return
        }
        if (creatingRef.current) return
        creatingRef.current = true
        const created = await createProposal(current)
        creatingRef.current = false
        if (created) {
          setProposalId(created.id)
          proposalIdRef.current = created.id
          window.history.replaceState(null, '', `/proposals/${created.id}`)
        }
      } else {
        await updateProposal(proposalIdRef.current, current)
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }, 1500)
  }, [createProposal, updateProposal])

  // ── Send to client ───────────────────────────────────────────────────────────
  const currentProposal = proposals.find(p => p.id === proposalId)
  const shareUrl = currentProposal
    ? `${window.location.origin}/deal/${currentProposal.public_token}`
    : ''

  // Derive the current real status (prefer live proposal over draft state)
  const currentStatus = currentProposal?.status ?? draft.status ?? 'draft'
  const isAccepted = currentStatus === 'accepted'
  const isNeedsRevision = currentStatus === 'needs_revision'
  const isAlreadySent = currentStatus === 'sent' || currentStatus === 'viewed'

  const handleSend = useCallback(async () => {
    // If already accepted → navigate to deal room (read-only view)
    if (isAccepted && shareUrl) {
      window.open(shareUrl, '_blank')
      return
    }

    // If needs revision → flush, clear notes, set status back to sent, open modal
    if (isNeedsRevision && proposalIdRef.current) {
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null }
      await updateProposal(proposalIdRef.current, {
        ...draftRef.current,
        status: 'sent',
        revision_notes: null,
      })
      setDraft(prev => ({ ...prev, status: 'sent' }))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      setSendOpen(true)
      return
    }

    // If already sent/viewed → just open the share modal without re-updating status
    if (isAlreadySent && shareUrl) {
      setSendOpen(true)
      return
    }

    // Flush debounce + ensure proposal exists in DB
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    let pid = proposalIdRef.current

    if (!pid) {
      // Create now if still unsaved
      if (creatingRef.current) return
      creatingRef.current = true
      const created = await createProposal(draftRef.current)
      creatingRef.current = false
      if (!created) return
      setProposalId(created.id)
      proposalIdRef.current = created.id
      window.history.replaceState(null, '', `/proposals/${created.id}`)
      pid = created.id
    }

    await updateProposal(pid, { ...draftRef.current, status: 'sent' })
    setDraft(prev => ({ ...prev, status: 'sent' }))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
    setSendOpen(true)
  }, [createProposal, updateProposal, isAccepted, isNeedsRevision, isAlreadySent, shareUrl])

  const canSend = Boolean(draft.project_title?.trim()) || isNeedsRevision

  // ── Download signed PDF (builder, accepted state) ────────────────────────────
  const handleDownloadSignedPdf = useCallback(async () => {
    if (!currentProposal || pdfGenerating) return
    setPdfGenerating(true)
    const enabledIds = currentProposal.add_ons.filter(a => a.enabled).map(a => a.id)
    const total = currentProposal.base_price + currentProposal.add_ons.filter(a => a.enabled).reduce((s, a) => s + a.price, 0)
    await generateProposalPdf({
      proposal: currentProposal,
      totalAmount: total,
      enabledAddOnIds: enabledIds,
      signatureDataUrl: '',
      locale,
    })
    setPdfGenerating(false)
  }, [currentProposal, pdfGenerating, locale])

  // ── Build a synthetic Proposal for LivePreview ───────────────────────────────
  const previewProposal: Proposal = {
    ...draft,
    id: proposalId ?? 'preview',
    user_id: '',
    public_token: '',
    view_count: 0,
    time_spent_seconds: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div
        style={{
          background: '#030305',
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '2px solid rgba(99,102,241,0.2)',
            borderTopColor: '#818cf8',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col"
      style={{ background: '#030305', height: '100dvh', overflow: 'hidden' }}
      dir={locale === 'he' ? 'rtl' : 'ltr'}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes ds-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes builder-ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header
        className="flex-none flex items-center justify-between px-4 py-3 z-20"
        style={{
          background: 'rgba(3,3,5,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-none flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white/80"
            aria-label={locale === 'he' ? 'חזרה' : 'Back'}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex-none flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}
            >
              <Zap size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80 truncate max-w-[180px]">
              {draft.project_title || (locale === 'he' ? 'הצעה חדשה' : 'New Proposal')}
            </span>
          </div>
        </div>

        {/* Center: save status */}
        <AnimatePresence mode="wait">
          {saveStatus !== 'idle' && (
            <motion.span
              key={saveStatus}
              className="absolute left-1/2 -translate-x-1/2 text-[11px] font-medium tabular-nums"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              style={{ color: saveStatus === 'saved' ? '#22c55e' : 'rgba(255,255,255,0.35)' }}
            >
              {saveStatus === 'saving'
                ? (locale === 'he' ? 'שומר…' : 'Saving…')
                : (locale === 'he' ? '✓ נשמר' : '✓ Saved')}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Live presence badge — visible when client is viewing the deal room */}
          {currentProposal?.public_token && activeViewers[currentProposal.public_token] && (
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.22)',
              }}
            >
              <span className="relative flex h-2 w-2 flex-none">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#22c55e', animation: 'builder-ping 1.2s ease-in-out infinite' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
              </span>
              <span className="text-[11px] font-semibold" style={{ color: '#4ade80' }}>
                {locale === 'he' ? 'לקוח צופה עכשיו' : 'Client viewing now'}
              </span>
            </div>
          )}

          {/* Download signed PDF — only when accepted */}
          {isAccepted && (
            <motion.button
              onClick={handleDownloadSignedPdf}
              disabled={pdfGenerating}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.25)',
                color: '#4ade80',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <FileDown size={14} className={pdfGenerating ? 'animate-bounce' : ''} />
              <span>
                {pdfGenerating
                  ? (locale === 'he' ? 'יוצר…' : 'Generating…')
                  : (locale === 'he' ? 'הורד PDF' : 'Download PDF')}
              </span>
            </motion.button>
          )}

          {/* Mobile: preview toggle — with text label for clarity */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
          >
            <Eye size={13} />
            <span>{locale === 'he' ? 'תצוגה מקדימה' : 'Preview'}</span>
          </button>

          {/* Send / Status button — adapts to proposal status */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend && !isAccepted && !isAlreadySent}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
            style={{
              background: isAccepted
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : isNeedsRevision
                  ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                  : isAlreadySent
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))'
                    : canSend
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.06)',
              boxShadow: isAccepted
                ? '0 0 18px rgba(34,197,94,0.4)'
                : isNeedsRevision
                  ? '0 0 18px rgba(245,158,11,0.4)'
                  : isAlreadySent
                    ? '0 0 12px rgba(99,102,241,0.25)'
                    : canSend
                      ? '0 0 18px rgba(99,102,241,0.4)'
                      : 'none',
              border: isAlreadySent && !isAccepted && !isNeedsRevision ? '1px solid rgba(99,102,241,0.4)' : 'none',
            }}
            whileHover={canSend || isAccepted || isAlreadySent || isNeedsRevision ? { scale: 1.03 } : {}}
            whileTap={canSend || isAccepted || isAlreadySent || isNeedsRevision ? { scale: 0.96 } : {}}
          >
            {isAccepted
              ? <ShieldCheck size={12} />
              : isNeedsRevision
                ? <RefreshCw size={12} />
                : isAlreadySent
                  ? <RefreshCw size={12} />
                  : <Send size={12} />}
            <span className="hidden sm:inline">
              {isAccepted
                ? (locale === 'he' ? '✓ חתום ואושר' : '✓ Signed & Accepted')
                : isNeedsRevision
                  ? (locale === 'he' ? '↑ עדכן ושלח חזרה' : '↑ Update & Resend')
                  : isAlreadySent
                    ? (locale === 'he' ? 'שלח שוב' : 'Resend Link')
                    : (locale === 'he' ? 'שלח ללקוח' : 'Send to Client')}
            </span>
            <span className="sm:hidden">
              {isAccepted ? '✓' : isNeedsRevision ? '↑' : isAlreadySent ? (locale === 'he' ? 'שלח' : 'Resend') : (locale === 'he' ? 'שלח' : 'Send')}
            </span>
          </motion.button>
        </div>
      </header>

      {/* ── Split-screen body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Editor Panel (full on mobile, 35% on desktop) */}
        <div
          className="w-full lg:w-[35%] flex-none overflow-y-auto"
          style={{ borderInlineEnd: '1px solid rgba(255,255,255,0.04)' }}
        >
          <EditorPanel
            draft={draft}
            onChange={handleChange}
            locale={locale}
            isLocked={isAccepted}
            needsRevision={isNeedsRevision}
            revisionNotes={currentProposal?.revision_notes}
          />
        </div>

        {/* Right — Live Preview (65%, desktop only) */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          <LivePreview proposal={previewProposal} locale={locale} />
        </div>
      </div>

      {/* ── Mobile preview BottomSheet ─────────────────────────────────────── */}
      <BottomSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={locale === 'he' ? 'תצוגת לקוח' : 'Client Preview'}
      >
        <div style={{ height: '62vh', overflowY: 'auto', margin: '0 -16px' }}>
          <LivePreview proposal={previewProposal} locale={locale} compact />
        </div>
      </BottomSheet>

      {/* ── Send Modal ────────────────────────────────────────────────────── */}
      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        shareUrl={shareUrl}
        clientName={draft.client_name}
        clientEmail={draft.client_email}
        locale={locale}
      />
    </div>
  )
}

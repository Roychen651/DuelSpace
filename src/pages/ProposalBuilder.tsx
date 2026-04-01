import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, Zap, Send, ShieldCheck, RefreshCw, FileDown } from 'lucide-react'
import { useProposalStore } from '../stores/useProposalStore'
import { useAuthStore } from '../stores/useAuthStore'
import { usePresenceStore } from '../stores/usePresenceStore'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { EditorPanel } from '../components/builder/EditorPanel'
import { LivePreview } from '../components/builder/LivePreview'
import { SendModal } from '../components/builder/SendModal'
import { BottomSheet } from '../components/dashboard/BottomSheet'
import type { Proposal, ProposalInsert } from '../types/proposal'
import { generateProposalPdf } from '../lib/pdfEngine'
import { calculateFinancials, ISRAELI_VAT_RATE } from '../lib/financialMath'

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved'

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
  // Always re-fetch from DB when loading an existing proposal — never rely on the
  // Zustand cache alone. The cache may be stale (e.g. client just accepted the
  // deal, but the store still shows status='sent' from before the sign event).
  useEffect(() => {
    const init = async () => {
      if (id) {
        // Always fetch fresh from DB to avoid stale status in Zustand cache
        await fetchProposals()
        const found = useProposalStore.getState().proposals.find(p => p.id === id)
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

  // ── Sync: re-fetch when tab becomes visible (cross-device: client signs on mobile,
  // creator is on desktop with this tab in the background — visibilitychange fires
  // when they switch back, and we get fresh status from DB immediately).
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchProposals() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── BroadcastChannel: refresh when client accepts in the same browser ─────────
  useEffect(() => {
    if (!id) return
    let ch: BroadcastChannel
    try {
      ch = new BroadcastChannel('dealspace:proposals')
      ch.onmessage = () => {
        // Any deal-room event (accepted, revision_requested, declined) → re-fetch
        fetchProposals()
      }
    } catch (_) { /* BroadcastChannel not supported */ }
    return () => { try { ch?.close() } catch (_) {} }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
        // Strip server-managed fields — autosave must NEVER overwrite status,
        // accepted_at, signer_ip/ua, delivery data, or signature_data_url.
        // Without this, the autosave fires with status:'sent' from the initial
        // draft state and overwrites an 'accepted' status set by accept_proposal.
        const {
          status: _s, accepted_at: _aa, sent_at: _sa,
          signer_ip: _ip, signer_user_agent: _ua,
          delivery_email: _de, email_sent_at: _es, email_opened_at: _eo,
          signature_data_url: _sig,
          ...autosaveFields
        } = current
        await updateProposal(proposalIdRef.current, autosaveFields)
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
  const isFinanciallyLocked = isAccepted || isAlreadySent

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

  // ── Download PDF (draft watermark for non-accepted, clean for accepted) ─────────
  const handleDownloadSignedPdf = useCallback(async () => {
    if (!currentProposal || pdfGenerating) return
    setPdfGenerating(true)
    const vatRate = (() => {
      const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? '')
      return isNaN(v) ? ISRAELI_VAT_RATE : v
    })()

    // Always fetch the FULL proposal row fresh from DB before generating PDF.
    // The local store may have stale signature_data_url or accepted_at.
    // A fresh SELECT * guarantees both fields reflect the actual signed record.
    const { data: freshRow } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', currentProposal.id)
      .single()
    const liveProposal = (freshRow as typeof currentProposal | null) ?? currentProposal

    const fin = calculateFinancials(liveProposal, undefined, vatRate)
    const enabledIds = liveProposal.add_ons.filter(a => a.enabled).map(a => a.id)

    // Resolve signature: fresh DB value → localStorage fallback (same-browser only)
    let signatureDataUrl = liveProposal.signature_data_url ?? ''
    if (!signatureDataUrl) {
      try { signatureDataUrl = localStorage.getItem(`dealspace:sig:${liveProposal.public_token}`) ?? '' } catch { /* */ }
    }
    // Pass accepted_at explicitly; pdfEngine also reads it from proposal as safety net
    const sigTimestamp = liveProposal.accepted_at ? new Date(liveProposal.accepted_at) : undefined

    await generateProposalPdf({
      proposal: liveProposal,
      totalAmount: fin.grandTotal,
      enabledAddOnIds: enabledIds,
      signatureDataUrl,
      locale,
      isDraft: liveProposal.status !== 'accepted',
      signatureTimestamp: sigTimestamp,
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
    is_archived: false,
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
            <span className="text-sm font-semibold text-white/80 truncate max-w-[90px] sm:max-w-[200px]">
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

        {/* Right: actions — all buttons h-9, icon-only on mobile, text on sm+ */}
        <div className="flex items-center gap-1.5">
          {/* Live presence badge — desktop only */}
          {currentProposal?.public_token && activeViewers[currentProposal.public_token] && (
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-2.5 h-9"
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
              <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: '#4ade80' }}>
                {locale === 'he' ? 'לקוח צופה עכשיו' : 'Client viewing now'}
              </span>
            </div>
          )}

          {/* Download PDF — always available; draft watermark for non-accepted */}
          {currentProposal && (
            <motion.button
              onClick={handleDownloadSignedPdf}
              disabled={pdfGenerating}
              className="flex-none flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 h-9 text-xs font-bold transition disabled:opacity-50"
              style={isAccepted ? {
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.25)',
                color: '#4ade80',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <FileDown size={14} className={pdfGenerating ? 'animate-bounce' : ''} />
              <span className="hidden sm:inline whitespace-nowrap">
                {pdfGenerating
                  ? (locale === 'he' ? 'יוצר…' : 'Generating…')
                  : isAccepted
                    ? (locale === 'he' ? 'הורד PDF' : 'Download PDF')
                    : (locale === 'he' ? 'טיוטת PDF' : 'Draft PDF')}
              </span>
            </motion.button>
          )}

          {/* Preview — icon on mobile, text on sm+ */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="lg:hidden flex-none flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 h-9 text-xs font-semibold transition"
            style={{
              border: '1px solid rgba(99,102,241,0.3)',
              background: 'rgba(99,102,241,0.08)',
              color: '#818cf8',
            }}
          >
            <Eye size={14} />
            <span className="hidden sm:inline whitespace-nowrap">
              {locale === 'he' ? 'תצוגה מקדימה' : 'Preview'}
            </span>
          </button>

          {/* Send / Status — icon + short text on mobile, full label on sm+ */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend && !isAccepted && !isAlreadySent}
            className="flex-none flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 h-9 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
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
            whileHover={canSend || isAccepted || isAlreadySent || isNeedsRevision ? { scale: 1.02 } : {}}
            whileTap={canSend || isAccepted || isAlreadySent || isNeedsRevision ? { scale: 0.96 } : {}}
          >
            {isAccepted
              ? <ShieldCheck size={13} />
              : isNeedsRevision
                ? <RefreshCw size={13} />
                : isAlreadySent
                  ? <RefreshCw size={13} />
                  : <Send size={13} />}
            <span className="sm:hidden whitespace-nowrap">
              {isAccepted ? '✓' : isNeedsRevision ? (locale === 'he' ? 'עדכן' : 'Update') : (locale === 'he' ? 'שלח' : 'Send')}
            </span>
            <span className="hidden sm:inline whitespace-nowrap">
              {isAccepted
                ? (locale === 'he' ? '✓ חתום ואושר' : '✓ Signed & Accepted')
                : isNeedsRevision
                  ? (locale === 'he' ? 'עדכן ושלח חזרה' : 'Update & Resend')
                  : isAlreadySent
                    ? (locale === 'he' ? 'שלח שוב' : 'Resend Link')
                    : (locale === 'he' ? 'שלח ללקוח' : 'Send to Client')}
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
            isFinanciallyLocked={isFinanciallyLocked}
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
        projectTitle={draft.project_title}
        locale={locale}
        proposalId={proposalId}
      />
    </div>
  )
}

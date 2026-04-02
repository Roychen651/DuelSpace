import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion } from 'framer-motion'
import { MoreVertical, Eye, Copy, Archive, ArchiveRestore, Trash2, Edit3, ExternalLink, Clock, Timer, FileDown, MessageSquarePlus, MailCheck, MessageCircle } from 'lucide-react'
import { useProposalStore } from '../../stores/useProposalStore'
import { useTier, FREE_PROPOSAL_LIMIT } from '../../stores/useAuthStore'
import { usePresenceStore } from '../../stores/usePresenceStore'
import { useI18n } from '../../lib/i18n'
import type { Proposal } from '../../types/proposal'
import { formatCurrency, STATUS_META } from '../../types/proposal'
import { calculateFinancials, ISRAELI_VAT_RATE } from '../../lib/financialMath'
import { generateProposalPdf } from '../../lib/pdfEngine'

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, locale }: { status: Proposal['status']; locale: string }) {
  const meta = STATUS_META[status]
  const isActionable = status === 'needs_revision'
  return (
    <>
      {isActionable && (
        <style>{`
          @keyframes pc-badge-pulse {
            0%, 100% { box-shadow: 0 0 8px rgba(245,158,11,0.35), 0 0 0 0 rgba(245,158,11,0.0); }
            50%       { box-shadow: 0 0 18px rgba(245,158,11,0.65), 0 0 0 3px rgba(245,158,11,0.12); }
          }
          @keyframes pc-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        `}</style>
      )}
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{
          color: meta.color,
          background: isActionable
            ? 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(217,119,6,0.12) 100%)'
            : meta.glow.replace('0.4', '0.12').replace('0.3', '0.1'),
          border: `1px solid ${meta.color}${isActionable ? '50' : '30'}`,
          animation: isActionable ? 'pc-badge-pulse 2.2s ease-in-out infinite' : undefined,
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: meta.color,
            animation: isActionable ? 'pc-dot-pulse 1.1s ease-in-out infinite' : undefined,
          }}
        />
        {locale === 'he' ? meta.label_he : meta.label_en}
      </span>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  const isHe  = locale === 'he'

  if (mins < 2)   return isHe ? 'הרגע'      : 'just now'
  if (mins < 60)  return isHe ? `לפני ${mins} דק'` : `${mins}m ago`
  if (hours < 24) return isHe ? `לפני ${hours} שע'` : `${hours}h ago`
  if (days < 30)  return isHe ? `לפני ${days} ימים`  : `${days}d ago`
  return new Date(dateStr).toLocaleDateString(isHe ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })
}

// ─── Status Timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ proposal, locale }: { proposal: Proposal; locale: string }) {
  const isHe = locale === 'he'

  type TimelineEvent = { labelEn: string; labelHe: string; time: string | null; done: boolean }
  const events: TimelineEvent[] = [
    { labelEn: 'Created', labelHe: 'נוצרה', time: proposal.created_at,                                                                       done: true },
    { labelEn: 'Sent',    labelHe: 'נשלח',  time: proposal.sent_at ?? null,                                                                   done: proposal.status !== 'draft' },
    { labelEn: 'Viewed',  labelHe: 'נצפה',  time: proposal.last_viewed_at ?? null,                                                            done: !!proposal.last_viewed_at },
    { labelEn: 'Accepted',labelHe: 'אושר',  time: proposal.status === 'accepted' ? (proposal.accepted_at ?? null) : null, done: proposal.status === 'accepted' },
  ]

  return (
    <div className="flex items-center gap-0 mt-3">
      {events.map((ev, i) => (
        <div key={ev.labelEn} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center gap-0.5 flex-none">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: ev.done ? '#6366f1' : 'rgba(255,255,255,0.1)',
                boxShadow: ev.done ? '0 0 4px rgba(99,102,241,0.8)' : 'none',
              }}
            />
            <span
              className="text-[8px] font-semibold leading-none"
              style={{ color: ev.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}
            >
              {isHe ? ev.labelHe : ev.labelEn}
            </span>
            {ev.time && ev.done && (
              <span className="text-[7px] text-slate-300 dark:text-white/25 leading-none">
                {timeAgo(ev.time, locale)}
              </span>
            )}
          </div>
          {i < events.length - 1 && (
            <div
              className="h-px flex-1 mx-0.5"
              style={{ background: events[i + 1].done ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Radix dropdown item ──────────────────────────────────────────────────────

function DropItem({
  icon, label, onClick, variant = 'default',
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}) {
  return (
    <DropdownMenu.Item
      onSelect={onClick}
      className="flex items-center gap-3 outline-none cursor-pointer rounded-xl mx-1.5 select-none
        hover:bg-slate-50 dark:hover:bg-white/[0.06]"
      style={{
        color: variant === 'danger' ? '#f87171' : 'var(--text-primary)',
        padding: '10px 10px',          /* tall row → easy 44 px touch target */
        minHeight: 44,
      }}
      onPointerEnter={e => {
        (e.currentTarget as HTMLElement).style.background = variant === 'danger' ? 'rgba(239,68,68,0.09)' : ''
      }}
      onPointerLeave={e => {
        (e.currentTarget as HTMLElement).style.background = ''
      }}
    >
      <span
        className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
        style={{ background: variant === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.07)' }}
      >
        {icon}
      </span>
      <span className="font-semibold text-[14px] flex-1">{label}</span>
    </DropdownMenu.Item>
  )
}

// ─── Proposal Card ────────────────────────────────────────────────────────────

interface ProposalCardProps {
  proposal: Proposal
  onEdit: (id: string) => void
  onDownload?: (id: string) => void
  onUpgradeRequired?: () => void
}

export function ProposalCard({ proposal, onEdit, onDownload, onUpgradeRequired }: ProposalCardProps) {
  const { locale } = useI18n()
  const { archiveProposal, unarchiveProposal, deleteProposal, duplicateProposal, proposals } = useProposalStore()
  const tier = useTier()
  const { activeViewers } = usePresenceStore()
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const isArchived = proposal.is_archived
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Live presence — fed by the single ProtectedLayout channel, no per-card subscription
  const clientViewing = Boolean(activeViewers[proposal.public_token])

  const vatRate = (() => { const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? ''); return isNaN(v) ? ISRAELI_VAT_RATE : v })()
  const total = calculateFinancials(proposal, undefined, vatRate).grandTotal
  const formatted = formatCurrency(total, proposal.currency)
  const meta = STATUS_META[proposal.status]
  const date = new Date(proposal.created_at).toLocaleDateString(
    locale === 'he' ? 'he-IL' : 'en-US',
    { day: 'numeric', month: 'short' }
  )

  const shareUrl = `${window.location.origin}/deal/${proposal.public_token}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
  }

  const handleFollowUp = () => {
    const client = proposal.client_name || (locale === 'he' ? 'שם הלקוח' : 'there')
    const text = locale === 'he'
      ? `היי ${client}, רק רציתי לוודא שיצא לך לעבור על ההצעה / המסמך ששלחתי. \nאפשר לצפות ולאשר אותה מכל מכשיר ממש כאן:\n${shareUrl}\n\nאני זמין לכל שאלה!`
      : `Hi ${client}, just checking in to see if you had a chance to review the document. \nYou can view and approve it securely right here:\n${shareUrl}\n\nLet me know if you have any questions!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const handleDuplicate = async () => {
    const activeCount = proposals.filter(p => !p.is_archived).length
    if (tier === 'free' && activeCount >= FREE_PROPOSAL_LIMIT) {
      onUpgradeRequired?.()
      return
    }
    await duplicateProposal(proposal.id)
  }

  const handleUnarchive = async () => {
    await unarchiveProposal(proposal.id)
  }

  // In active view: moves to archive. In archive view: permanently deletes.
  const handleDelete = async () => {
    setDeleting(true)
    setArchiveError(null)
    const result = isArchived
      ? await deleteProposal(proposal.id)
      : await archiveProposal(proposal.id)
    if (!result.ok) {
      setDeleting(false)
      setArchiveError(result.message)
      setTimeout(() => setArchiveError(null), 6000)
    }
  }

  const handleDownloadPdf = async () => {
    if (pdfGenerating) return
    // Delegate to parent's handler which does a fresh SELECT * before generating.
    // Never call generateProposalPdf directly with the stale proposal prop —
    // it won't have signature_data_url unless fetched fresh from the DB.
    if (onDownload) {
      onDownload(proposal.id)
      return
    }
    // Fallback (should not happen in practice — Dashboard always provides onDownload)
    setPdfGenerating(true)
    await generateProposalPdf({
      proposal,
      totalAmount: total,
      enabledAddOnIds: proposal.add_ons.filter(a => a.enabled).map(a => a.id),
      signatureDataUrl: proposal.signature_data_url ?? '',
      locale,
    })
    setPdfGenerating(false)
  }

  return (
    <>
      <motion.div
        className="group relative rounded-2xl overflow-hidden cursor-pointer select-none h-full"
        style={{ padding: '1px' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        animate={deleting ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button,[data-radix-dropdown-menu-trigger]')) return
          onEdit(proposal.id)
        }}
      >
        {/* Desktop: spinning conic gradient border on hover */}
        <div
          className="pointer-events-none absolute inset-0 hidden sm:block"
          style={{ borderRadius: 'inherit', overflow: 'hidden' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              inset: '-80%',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.4s ease',
              background: `conic-gradient(from 0deg, transparent 30%, ${meta.color}88 45%, ${meta.color} 50%, ${meta.color}88 55%, transparent 70%)`,
              animation: 'pc-border-spin 2.5s linear infinite',
            }}
          />
        </div>

        {/* Mobile: status-colored breathing border */}
        <div
          className="pointer-events-none absolute inset-0 sm:hidden"
          style={{
            border: `1px solid ${meta.color}`,
            borderRadius: 'inherit',
            animation: 'pc-mobile-breathe 3.5s ease-in-out infinite',
          }}
        />

        {/* Card background */}
        <div
          className="relative p-5 h-full flex flex-col
            bg-white dark:bg-[linear-gradient(135deg,#0e0e1c_0%,#07070f_100%)]
            border border-slate-200 dark:border-transparent rounded-[0.9375rem]"
          style={{
            borderRadius: '0.9375rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Status glow accent line at top */}
          <div
            className="absolute top-0 left-6 right-6 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${meta.color}80, transparent)`,
              boxShadow: `0 0 12px ${meta.glow}`,
            }}
          />

          {/* Hover shimmer */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
          />

          {/* Top row: status + live badge + menu trigger */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={proposal.status} locale={locale} />
              {clientViewing && (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.28)',
                    color: '#4ade80',
                    boxShadow: '0 0 10px rgba(34,197,94,0.15)',
                  }}
                >
                  {/* Ping dot */}
                  <span className="relative flex h-2 w-2 flex-none">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full"
                      style={{ background: '#22c55e', opacity: 0.7, animation: 'card-ping 1.2s ease-in-out infinite' }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
                  </span>
                  {locale === 'he' ? 'צופה עכשיו' : 'Viewing Now'}
                </span>
              )}
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)', touchAction: 'manipulation' }}
                  onClick={e => e.stopPropagation()}
                  onPointerEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)' }}
                  onPointerLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  aria-label={locale === 'he' ? 'פעולות' : 'Options'}
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={6}
                  align="end"
                  collisionPadding={12}
                  avoidCollisions
                  className="z-[9997] rounded-2xl py-1.5 outline-none
                    bg-white border border-slate-200 shadow-xl
                    dark:bg-[rgba(10,10,20,0.97)] dark:border-white/10 dark:shadow-[0_24px_64px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]"
                  style={{
                    width: 'min(72vw, 224px)',
                    backdropFilter: 'blur(64px)',
                    WebkitBackdropFilter: 'blur(64px)',
                  }}
                  onCloseAutoFocus={e => e.preventDefault()}
                  onClick={e => e.stopPropagation()}
                >
                  <DropItem
                    icon={<Edit3 size={15} />}
                    label={locale === 'he' ? 'ערוך הצעה' : 'Edit Proposal'}
                    onClick={() => onEdit(proposal.id)}
                  />
                  <DropItem
                    icon={<Copy size={15} />}
                    label={locale === 'he' ? 'שכפל' : 'Duplicate'}
                    onClick={handleDuplicate}
                  />
                  <DropItem
                    icon={<ExternalLink size={15} />}
                    label={locale === 'he' ? 'העתק קישור' : 'Copy Link'}
                    onClick={handleCopyLink}
                  />
                  {proposal.status === 'accepted' && (
                    <DropItem
                      icon={<FileDown size={15} />}
                      label={locale === 'he' ? 'הורד חוזה' : 'Download PDF'}
                      onClick={handleDownloadPdf}
                    />
                  )}
                  {(proposal.status === 'sent' || proposal.status === 'viewed') && (
                    <DropItem
                      icon={<MessageCircle size={15} style={{ color: '#25D366' }} />}
                      label={locale === 'he' ? 'מעקב ב-WhatsApp' : 'Follow Up via WhatsApp'}
                      onClick={handleFollowUp}
                    />
                  )}
                  <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-white/[0.07] mx-3.5 my-1" />
                  {isArchived ? (
                    // ── Archive view actions ───────────────────────────────
                    <>
                      <DropItem
                        icon={<ArchiveRestore size={15} />}
                        label={locale === 'he' ? 'הסר מארכיון' : 'Unarchive'}
                        onClick={handleUnarchive}
                      />
                      <DropItem
                        icon={<Trash2 size={15} />}
                        label={locale === 'he' ? 'מחק לצמיתות' : 'Delete permanently'}
                        onClick={() => setConfirmingDelete(true)}
                        variant="danger"
                      />
                    </>
                  ) : (
                    // ── Active view actions ────────────────────────────────
                    <DropItem
                      icon={<Archive size={15} />}
                      label={locale === 'he' ? 'העבר לארכיון' : 'Archive'}
                      onClick={() => setConfirmingDelete(true)}
                      variant="danger"
                    />
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Client + title */}
          <div className="mb-4">
            <p className="text-xs text-slate-400 dark:text-white/35 mb-0.5 font-medium uppercase tracking-widest truncate">
              {proposal.client_name || (locale === 'he' ? 'לקוח' : 'Client')}
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {proposal.project_title || (locale === 'he' ? 'הצעה חדשה' : 'New Proposal')}
            </h3>
          </div>

          {/* ── Optional middle content (revision panel + X-Ray) ──────── */}
          <div className="flex-1 min-h-0 flex flex-col justify-end">

            {/* Revision request panel */}
            {proposal.status === 'needs_revision' && (
              <div
                className="mt-3 mb-1 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.06) 100%)',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5">
                  <MessageSquarePlus size={11} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                    {locale === 'he' ? 'הלקוח ביקש שינויים' : 'Client Requested Changes'}
                  </span>
                </div>
                {proposal.revision_notes ? (
                  <div className="mx-3 mb-2.5 rounded-lg px-3 py-2"
                    dir={locale === 'he' ? 'rtl' : 'ltr'}
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      borderInlineStart: '3px solid rgba(245,158,11,0.5)',
                    }}
                  >
                    <p className="text-xs font-medium leading-relaxed"
                      style={{
                        color: 'rgba(255,255,255,0.85)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {proposal.revision_notes}
                    </p>
                  </div>
                ) : (
                  <p className="px-3 pb-2 text-[11px] italic" style={{ color: 'rgba(245,158,11,0.4)' }}>
                    {locale === 'he' ? 'ללא הערות' : 'No notes provided'}
                  </p>
                )}
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold transition-colors"
                  style={{ borderTop: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b', background: 'transparent' }}
                  onClick={e => { e.stopPropagation(); onEdit(proposal.id) }}
                  onPointerEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)' }}
                  onPointerLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <Edit3 size={11} />
                  {locale === 'he' ? 'ערוך ושלח שוב' : 'Edit & Resend'}
                </button>
              </div>
            )}

            {/* X-Ray: per-section time breakdown */}
            {proposal.section_time && Object.keys(proposal.section_time).filter(k => (proposal.section_time![k] ?? 0) > 0).length > 0 && (() => {
              const LABELS: Record<string, { he: string; en: string }> = {
                pricing:    { he: 'תמחור',   en: 'Pricing'    },
                addons:     { he: 'תוספות',  en: 'Add-ons'    },
                milestones: { he: 'תשלומים', en: 'Milestones' },
                contract:   { he: 'חוזה',    en: 'Contract'   },
              }
              const sections = Object.entries(proposal.section_time!)
                .filter(([, t]) => t > 0)
                .sort(([, a], [, b]) => b - a)
              const total = sections.reduce((s, [, t]) => s + t, 0)
              return (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2 flex items-center gap-1">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    {locale === 'he' ? 'X-RAY — זמן לפי קטע' : 'X-RAY — Time Per Section'}
                  </p>
                  <div className="space-y-1.5">
                    {sections.map(([name, time]) => {
                      const pct = Math.round((time / total) * 100)
                      const label = (LABELS[name]?.[locale as 'he' | 'en']) ?? name
                      return (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/35 font-medium flex-none" style={{ width: 52, direction: 'ltr' }}>
                            {label}
                          </span>
                          <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div
                              className="h-1 rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                                transition: 'width 0.6s ease',
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-white/30 font-medium flex-none text-end" style={{ width: 28 }}>
                            {pct}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* ── Footer — always pinned to bottom of card ──────────────── */}
          <div className="mt-3">

            {/* Price + meta row */}
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="text-xl font-bold tabular-nums"
                  style={{ color: meta.color, textShadow: `0 0 20px ${meta.glow}` }}
                >
                  {formatted}
                </p>
                {proposal.add_ons.filter(a => a.enabled).length > 0 && (
                  <p className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5">
                    {locale === 'he'
                      ? `כולל ${proposal.add_ons.filter(a => a.enabled).length} תוספות`
                      : `+${proposal.add_ons.filter(a => a.enabled).length} add-ons`}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                {proposal.email_opened_at && (
                  <div
                    className="flex items-center gap-1 rounded-full px-1.5 py-0.5"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                    title={locale === 'he' ? 'הלקוח פתח את האימייל' : 'Client opened the email'}
                  >
                    <MailCheck size={9} style={{ color: '#818cf8' }} />
                    <span className="text-[9px] font-semibold" style={{ color: '#818cf8' }}>
                      {locale === 'he' ? 'נפתח' : 'Opened'}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-white/30">
                  <Eye size={10} />
                  <span>{proposal.view_count}</span>
                </div>
                {proposal.time_spent_seconds > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-300 dark:text-white/25">
                    <Timer size={10} />
                    <span>{formatTimeSpent(proposal.time_spent_seconds)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[10px] text-slate-300 dark:text-white/25">
                  <Clock size={10} />
                  <span>{date}</span>
                </div>
              </div>
            </div>

            {/* Download signed contract (accepted only) */}
            {proposal.status === 'accepted' && (
              <button
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold transition-all"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80' }}
                onClick={e => { e.stopPropagation(); handleDownloadPdf() }}
                disabled={pdfGenerating}
              >
                {pdfGenerating
                  ? <div className="h-3 w-3 rounded-full border border-emerald-400/40 border-t-emerald-400 animate-spin" />
                  : <FileDown size={12} />}
                {locale === 'he' ? 'הורד חוזה חתום' : 'Download Signed Contract'}
              </button>
            )}

            {/* Archive error banner */}
            {archiveError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 rounded-xl px-3 py-2.5 overflow-hidden"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <p className="text-[11px] font-bold mb-0.5" style={{ color: '#f87171' }}>
                  {isArchived
                    ? (locale === 'he' ? 'שגיאה במחיקה' : 'Delete failed')
                    : (locale === 'he' ? 'שגיאה בהעברה לארכיון' : 'Archive failed')}
                </p>
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(239,68,68,0.7)' }}>{archiveError}</p>
                <p className="text-[9px] mt-1" style={{ color: 'rgba(239,68,68,0.45)' }}>
                  {locale === 'he' ? 'פתח את כלי המפתח (F12) → Console לפרטים נוספים' : 'Open DevTools (F12) → Console for full details'}
                </p>
              </motion.div>
            )}

            {/* Inline delete / archive confirmation */}
            {confirmingDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                {isArchived && proposal.status === 'accepted' ? (
                  // ── Signed-contract deletion — serious warning ──────────
                  <div
                    className="mt-3 rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(185,28,28,0.07) 100%)',
                      border: '1px solid rgba(239,68,68,0.35)',
                      boxShadow: '0 0 24px rgba(239,68,68,0.08), inset 0 1px 0 rgba(239,68,68,0.12)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                      <div
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <Trash2 size={12} style={{ color: '#f87171' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#f87171' }}>
                          {locale === 'he' ? 'מחיקת חוזה חתום' : 'Delete Signed Contract'}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: 'rgba(239,68,68,0.6)' }}>
                          {proposal.client_name || '—'} · {proposal.project_title || '—'}
                        </p>
                      </div>
                    </div>

                    {/* Warning body */}
                    <div className="px-3 pb-2.5">
                      <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {locale === 'he'
                          ? 'פעולה זו בלתי הפיכה לחלוטין. ההסכם החתום, נתוני הלקוח וכל הנתונים הפיננסיים יימחקו לצמיתות.'
                          : 'This is completely irreversible. The signed agreement, client data, and all financial records will be permanently erased.'}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5"
                      style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}
                    >
                      <button
                        className="flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
                        onClick={e => { e.stopPropagation(); setConfirmingDelete(false) }}
                      >
                        {locale === 'he' ? 'ביטול' : 'Cancel'}
                      </button>
                      <button
                        className="flex-1 rounded-lg py-1.5 text-[11px] font-black transition-colors"
                        style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
                        onClick={e => { e.stopPropagation(); setConfirmingDelete(false); handleDelete() }}
                        onPointerEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.28)' }}
                        onPointerLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)' }}
                      >
                        {locale === 'he' ? 'מחק לצמיתות' : 'Delete Forever'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Standard archive / delete confirmation ──────────────
                  <div className="mt-3 flex items-center gap-2">
                    <p className="flex-1 text-[11px] font-semibold" style={{ color: '#f87171' }}>
                      {isArchived
                        ? (locale === 'he' ? 'למחוק לצמיתות? לא ניתן לשחזר' : 'Delete permanently? Cannot undo.')
                        : (locale === 'he' ? 'להעביר לארכיון?' : 'Archive this proposal?')}
                    </p>
                    <button
                      className="rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
                      onClick={e => { e.stopPropagation(); setConfirmingDelete(false) }}
                    >
                      {locale === 'he' ? 'ביטול' : 'Cancel'}
                    </button>
                    <button
                      className="rounded-lg px-3 py-1 text-[11px] font-bold transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', color: '#f87171' }}
                      onClick={e => { e.stopPropagation(); setConfirmingDelete(false); handleDelete() }}
                    >
                      {isArchived ? (locale === 'he' ? 'מחק' : 'Delete') : (locale === 'he' ? 'ארכיון' : 'Archive')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Status timeline — always at very bottom */}
            <StatusTimeline proposal={proposal} locale={locale} />
          </div>

          {/* Keyframes */}
          <style>{`
            @keyframes card-ping {
              0%, 100% { transform: scale(1); opacity: 0.7; }
              50%       { transform: scale(2.2); opacity: 0; }
            }
            @keyframes pc-border-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes pc-mobile-breathe {
              0%, 100% { opacity: 0.2; }
              50%       { opacity: 0.65; }
            }
          `}</style>
        </div>
      </motion.div>

    </>
  )
}

// ─── Skeleton card for loading state ─────────────────────────────────────────

export function ProposalCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 h-[180px]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        animation: 'ds-pulse 2s ease-in-out infinite',
      }}
    >
      <div className="h-4 w-20 rounded-full bg-white/8 mb-4" />
      <div className="h-3 w-24 rounded bg-white/5 mb-2" />
      <div className="h-5 w-40 rounded bg-white/8 mb-1" />
      <div className="h-3 w-32 rounded bg-white/4 mt-auto" />
    </div>
  )
}

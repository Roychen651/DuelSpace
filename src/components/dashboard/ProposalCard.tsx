import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MoreVertical, Eye, Copy, Trash2, Edit3, ExternalLink, Clock, Timer, FileDown } from 'lucide-react'
import { useProposalStore } from '../../stores/useProposalStore'
import { useI18n } from '../../lib/i18n'
import { BottomSheet, SheetAction } from './BottomSheet'
import type { Proposal } from '../../types/proposal'
import { proposalTotal, formatCurrency, STATUS_META } from '../../types/proposal'
import { generateProposalPdf } from '../../lib/pdfEngine'

// ─── Magnetic tilt hook ───────────────────────────────────────────────────────

function useMagneticTilt() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-60, 60], [4, -4]), { stiffness: 280, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-80, 80], [-4, 4]), { stiffness: 280, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, locale }: { status: Proposal['status']; locale: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color: meta.color,
        background: meta.glow.replace('0.4', '0.12').replace('0.3', '0.1'),
        border: `1px solid ${meta.color}30`,
        boxShadow: `0 0 8px ${meta.glow}`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {locale === 'he' ? meta.label_he : meta.label_en}
    </span>
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
    {
      labelEn: 'Created',
      labelHe: 'נוצרה',
      time: proposal.created_at,
      done: true,
    },
    {
      labelEn: 'Sent',
      labelHe: 'נשלח',
      time: proposal.status !== 'draft' ? proposal.updated_at : null,
      done: proposal.status !== 'draft',
    },
    {
      labelEn: 'Viewed',
      labelHe: 'נצפה',
      time: proposal.last_viewed_at ?? null,
      done: !!proposal.last_viewed_at,
    },
    {
      labelEn: 'Accepted',
      labelHe: 'אושר',
      time: proposal.status === 'accepted' ? proposal.updated_at : null,
      done: proposal.status === 'accepted',
    },
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
              style={{ color: ev.done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }}
            >
              {isHe ? ev.labelHe : ev.labelEn}
            </span>
            {ev.time && ev.done && (
              <span className="text-[7px] text-white/25 leading-none">
                {timeAgo(ev.time, locale)}
              </span>
            )}
          </div>
          {i < events.length - 1 && (
            <div
              className="h-px flex-1 mx-0.5"
              style={{
                background: events[i + 1].done
                  ? 'rgba(99,102,241,0.4)'
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Desktop Dropdown Menu ────────────────────────────────────────────────────

interface DesktopMenuProps {
  open: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
  children: React.ReactNode
}

function DesktopMenu({ open, anchorRef, onClose, children }: DesktopMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open || !anchorRef.current) return

    const rect = anchorRef.current.getBoundingClientRect()
    const MENU_W = 220
    const MENU_H = 300 // rough max height

    const top = rect.bottom + 6
    const safeTop = top + MENU_H > window.innerHeight
      ? Math.max(8, rect.top - MENU_H - 4)
      : top

    // Align to the button's right edge, but stay within viewport
    let right = window.innerWidth - rect.right
    if (right < 8) right = 8

    setStyle({
      position: 'fixed',
      top: safeTop,
      right,
      width: MENU_W,
      zIndex: 60,
    })
  }, [open, anchorRef])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    // Use setTimeout to avoid the same click that opened the menu from closing it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [open, onClose, anchorRef])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.12, ease: 'easeOut' as const }}
          className="overflow-hidden rounded-2xl py-1.5"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          aria-modal="true"
          role="menu"
          style={{
            ...style,
            background: 'rgba(14,14,22,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface DesktopMenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  separator?: boolean
}

function DesktopMenuItem({ icon, label, onClick, variant = 'default', separator }: DesktopMenuItemProps) {
  return (
    <>
      {separator && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />}
      <button
        role="menuitem"
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm transition-colors"
        style={{ color: variant === 'danger' ? '#f87171' : 'rgba(255,255,255,0.78)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = variant === 'danger'
            ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <span
          className="flex h-7 w-7 flex-none items-center justify-center rounded-lg"
          style={{ background: variant === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)' }}
        >
          {icon}
        </span>
        <span className="font-medium text-[13px]">{label}</span>
      </button>
    </>
  )
}

// ─── Proposal Card ────────────────────────────────────────────────────────────

interface ProposalCardProps {
  proposal: Proposal
  onEdit: (id: string) => void
}

export function ProposalCard({ proposal, onEdit }: ProposalCardProps) {
  const { locale } = useI18n()
  const { deleteProposal, duplicateProposal } = useProposalStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useMagneticTilt()
  const menuRef = useRef<HTMLButtonElement>(null)

  const total = proposalTotal(proposal)
  const formatted = formatCurrency(total, proposal.currency)
  const meta = STATUS_META[proposal.status]
  const date = new Date(proposal.created_at).toLocaleDateString(
    locale === 'he' ? 'he-IL' : 'en-US',
    { day: 'numeric', month: 'short' }
  )

  const shareUrl = `${window.location.origin}/deal/${proposal.public_token}`
  const isMobile = () => window.innerWidth < 768

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setMenuOpen(false)
  }

  const handleDuplicate = async () => {
    setMenuOpen(false)
    await duplicateProposal(proposal.id)
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    setDeleting(true)
    await deleteProposal(proposal.id)
  }

  const handleDownloadPdf = async () => {
    if (pdfGenerating) return
    setMenuOpen(false)
    setPdfGenerating(true)
    await generateProposalPdf({
      proposal,
      totalAmount: total,
      enabledAddOnIds: proposal.add_ons.filter(a => a.enabled).map(a => a.id),
      signatureDataUrl: '',
      locale,
    })
    setPdfGenerating(false)
  }

  const menuActions = (
    <>
      <DesktopMenuItem
        icon={<Edit3 size={14} />}
        label={locale === 'he' ? 'ערוך הצעה' : 'Edit Proposal'}
        onClick={() => { setMenuOpen(false); onEdit(proposal.id) }}
      />
      <DesktopMenuItem
        icon={<Copy size={14} />}
        label={locale === 'he' ? 'שכפל' : 'Duplicate'}
        onClick={handleDuplicate}
      />
      <DesktopMenuItem
        icon={<ExternalLink size={14} />}
        label={locale === 'he' ? 'העתק קישור ללקוח' : 'Copy Client Link'}
        onClick={handleCopyLink}
      />
      {proposal.status === 'accepted' && (
        <DesktopMenuItem
          icon={<FileDown size={14} />}
          label={locale === 'he' ? 'הורד חוזה חתום' : 'Download Signed Contract'}
          onClick={handleDownloadPdf}
        />
      )}
      <DesktopMenuItem
        icon={<Trash2 size={14} />}
        label={locale === 'he' ? 'מחק הצעה' : 'Delete Proposal'}
        onClick={handleDelete}
        variant="danger"
        separator
      />
    </>
  )

  return (
    <>
      <motion.div
        className="group relative rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          transformPerspective: 1000,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        animate={deleting ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          // Don't navigate if the click originated inside a button (menu trigger, download, etc.)
          if ((e.target as HTMLElement).closest('button')) return
          onEdit(proposal.id)
        }}
      >
        {/* Card background */}
        <div
          className="relative p-5 h-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
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
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Top row: status + menu */}
          <div className="flex items-start justify-between mb-4">
            <StatusBadge status={proposal.status} locale={locale} />
            <button
              ref={menuRef}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/70"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(v => !v)
              }}
              aria-label="Options"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={15} />
            </button>
          </div>

          {/* Client + title */}
          <div className="mb-4">
            <p className="text-xs text-white/35 mb-0.5 font-medium uppercase tracking-widest truncate">
              {proposal.client_name || (locale === 'he' ? 'לקוח' : 'Client')}
            </p>
            <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">
              {proposal.project_title || (locale === 'he' ? 'הצעה חדשה' : 'New Proposal')}
            </h3>
          </div>

          {/* Footer: price + meta */}
          <div className="flex items-end justify-between">
            <div>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: meta.color, textShadow: `0 0 20px ${meta.glow}` }}
              >
                {formatted}
              </p>
              {proposal.add_ons.filter(a => a.enabled).length > 0 && (
                <p className="text-[10px] text-white/30 mt-0.5">
                  {locale === 'he'
                    ? `כולל ${proposal.add_ons.filter(a => a.enabled).length} תוספות`
                    : `+${proposal.add_ons.filter(a => a.enabled).length} add-ons`}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Eye size={10} />
                <span>{proposal.view_count}</span>
              </div>
              {proposal.time_spent_seconds > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-white/25">
                  <Timer size={10} />
                  <span>{formatTimeSpent(proposal.time_spent_seconds)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-white/25">
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

          {/* Status timeline */}
          <StatusTimeline proposal={proposal} locale={locale} />
        </div>
      </motion.div>

      {/* Desktop dropdown — rendered into document body via fixed positioning */}
      <DesktopMenu
        open={menuOpen && !isMobile()}
        anchorRef={menuRef}
        onClose={() => setMenuOpen(false)}
      >
        {menuActions}
      </DesktopMenu>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        open={menuOpen && isMobile()}
        onClose={() => setMenuOpen(false)}
        title={proposal.project_title || (locale === 'he' ? 'פעולות' : 'Actions')}
      >
        <SheetAction
          icon={<Edit3 size={16} />}
          label={locale === 'he' ? 'ערוך הצעה' : 'Edit Proposal'}
          onClick={() => { setMenuOpen(false); onEdit(proposal.id) }}
        />
        <SheetAction
          icon={<Copy size={16} />}
          label={locale === 'he' ? 'שכפל' : 'Duplicate'}
          onClick={handleDuplicate}
        />
        <SheetAction
          icon={<ExternalLink size={16} />}
          label={locale === 'he' ? 'העתק קישור ללקוח' : 'Copy Client Link'}
          onClick={handleCopyLink}
        />
        {proposal.status === 'accepted' && (
          <SheetAction
            icon={<FileDown size={16} />}
            label={locale === 'he' ? 'הורד חוזה חתום' : 'Download Signed Contract'}
            onClick={handleDownloadPdf}
          />
        )}
        <div className="h-px bg-white/5 my-1" />
        <SheetAction
          icon={<Trash2 size={16} />}
          label={locale === 'he' ? 'מחק הצעה' : 'Delete Proposal'}
          onClick={handleDelete}
          variant="danger"
        />
      </BottomSheet>
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

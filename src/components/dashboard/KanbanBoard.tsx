import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Clock, GripVertical, CheckCircle2, Send, FileText, AlertCircle, RotateCcw } from 'lucide-react'
import { useProposalStore } from '../../stores/useProposalStore'
import type { Proposal, ProposalStatus } from '../../types/proposal'
import { proposalTotal, formatCurrency, STATUS_META } from '../../types/proposal'

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColumnDef {
  status: ProposalStatus
  labelEn: string
  labelHe: string
  icon: React.ReactNode
  accent: string
}

const COLUMNS: ColumnDef[] = [
  { status: 'draft',          labelEn: 'Drafts',        labelHe: 'טיוטות',  icon: <FileText    size={13} />, accent: '#6b7280' },
  { status: 'sent',           labelEn: 'Sent',          labelHe: 'נשלחו',   icon: <Send        size={13} />, accent: '#d4af37' },
  { status: 'viewed',         labelEn: 'Viewed',        labelHe: 'נצפו',    icon: <Eye         size={13} />, accent: '#6366f1' },
  { status: 'needs_revision', labelEn: 'Needs Revision',labelHe: 'בעריכה', icon: <RotateCcw   size={13} />, accent: '#f59e0b' },
  { status: 'accepted',       labelEn: 'Signed',        labelHe: 'חתומים',  icon: <CheckCircle2 size={13} />, accent: '#22c55e' },
  { status: 'rejected',       labelEn: 'Rejected',      labelHe: 'נדחו',    icon: <AlertCircle size={13} />, accent: '#ef4444' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeInColumn(updatedAt: string, locale: string): string {
  const diff = Date.now() - new Date(updatedAt).getTime()
  const isHe = locale === 'he'
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  const weeks = Math.floor(diff / 604_800_000)
  if (hours < 2) return isHe ? 'רגע' : 'just now'
  if (hours < 24) return isHe ? `${hours} שע'` : `${hours}h`
  if (days < 7) return isHe ? `${days} ימים` : `${days}d`
  return isHe ? `${weeks} שב'` : `${weeks}w`
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

interface KanbanCardProps {
  proposal: Proposal
  locale: string
  isDragging: boolean
  onEdit: (id: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
}

function KanbanCard({ proposal, locale, isDragging, onEdit, onDragStart, onDragEnd }: KanbanCardProps) {
  const isHe = locale === 'he'
  const total = proposalTotal(proposal)
  const meta = STATUS_META[proposal.status]

  return (
    <motion.div
      layout
      draggable
      onDragStart={() => onDragStart(proposal.id)}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(proposal.id)}
      animate={isDragging ? { opacity: 0.45, scale: 0.96, rotate: 2 } : { opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative rounded-xl p-3.5 cursor-grab active:cursor-grabbing select-none group"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        boxShadow: isDragging
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${meta.glow}`
          : 'none',
      }}
    >
      {/* Status accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }}
      />

      {/* Drag handle */}
      <div className="absolute top-3 start-2 opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical size={12} className="text-white" />
      </div>

      {/* Client name */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 truncate mb-0.5 ps-1">
        {proposal.client_name || (isHe ? 'לקוח' : 'Client')}
      </p>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 ps-1 mb-2.5">
        {proposal.project_title || (isHe ? 'הצעה חדשה' : 'New Proposal')}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between ps-1">
        <span
          className="text-sm font-black tabular-nums"
          style={{ color: meta.color }}
        >
          {formatCurrency(total, proposal.currency)}
        </span>
        <div className="flex items-center gap-2 text-[9px] text-white/25">
          <span className="flex items-center gap-0.5">
            <Eye size={9} />
            {proposal.view_count}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock size={9} />
            {timeInColumn(proposal.updated_at, locale)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  col: ColumnDef
  proposals: Proposal[]
  locale: string
  draggedId: string | null
  onEdit: (id: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (status: ProposalStatus) => void
}

function KanbanColumn({ col, proposals, locale, draggedId, onEdit, onDragStart, onDragEnd, onDrop }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)
  const isHe = locale === 'he'

  return (
    <div
      className="flex flex-col min-w-0"
      style={{ minWidth: 220, flex: 1 }}
      onDragOver={e => { e.preventDefault(); setIsOver(true) }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop(col.status) }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3"
        style={{
          background: isOver
            ? `${col.accent}14`
            : 'rgba(255,255,255,0.04)',
          border: isOver
            ? `1px solid ${col.accent}40`
            : '1px solid rgba(255,255,255,0.06)',
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: col.accent }}>{col.icon}</span>
          <span className="text-xs font-bold text-white/70">
            {isHe ? col.labelHe : col.labelEn}
          </span>
        </div>
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
          style={{ background: `${col.accent}18`, color: col.accent }}
        >
          {proposals.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        className="flex-1 rounded-xl transition-all min-h-[120px]"
        style={{
          background: isOver ? `${col.accent}06` : 'transparent',
          border: isOver ? `2px dashed ${col.accent}35` : '2px dashed transparent',
          transition: 'all 0.15s',
        }}
      >
        {/* Cards */}
        <AnimatePresence>
          {proposals.map(proposal => (
            <div key={proposal.id} className="mb-2">
              <KanbanCard
                proposal={proposal}
                locale={locale}
                isDragging={draggedId === proposal.id}
                onEdit={onEdit}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          ))}
        </AnimatePresence>

        {proposals.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-20 rounded-xl">
            <span className="text-[11px] text-white/15">
              {isHe ? 'אין הצעות' : 'Empty'}
            </span>
          </div>
        )}

        {isOver && draggedId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center h-12 rounded-xl"
            style={{ border: `2px dashed ${col.accent}50` }}
          >
            <span className="text-[11px] font-semibold" style={{ color: col.accent }}>
              {isHe ? 'שחרר כאן' : 'Drop here'}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── KanbanBoard ──────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  proposals: Proposal[]
  locale: string
  onEdit: (id: string) => void
}

export function KanbanBoard({ proposals, locale, onEdit }: KanbanBoardProps) {
  const { updateProposal } = useProposalStore()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const draggedIdRef = useRef<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
    draggedIdRef.current = id
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    draggedIdRef.current = null
  }

  const handleDrop = async (targetStatus: ProposalStatus) => {
    const id = draggedIdRef.current
    if (!id) return
    const proposal = proposals.find(p => p.id === id)
    if (!proposal || proposal.status === targetStatus) return
    await updateProposal(id, { status: targetStatus })
    setDraggedId(null)
    draggedIdRef.current = null
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-4"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}
    >
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.status}
          col={col}
          proposals={proposals.filter(p => p.status === col.status)}
          locale={locale}
          draggedId={draggedId}
          onEdit={onEdit}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Reorder, motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Briefcase, FileText, DollarSign,
  Plus, Minus, GripVertical, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, Receipt, Lock, Milestone, ShieldCheck, Sparkles, SlidersHorizontal, Info,
  Quote, MessageSquarePlus, Percent, Tag, Library, Settings2,
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { ProposalInsert, AddOn, PaymentMilestone, Testimonial } from '../../types/proposal'
import { DEFAULT_VAT_RATE, formatCurrency, milestonesValid } from '../../types/proposal'
import { calculateFinancials } from '../../lib/financialMath'
import { useAuthStore } from '../../stores/useAuthStore'
import { PremiumDatePicker, PremiumSlider } from '../ui/PremiumInputs'
import { ReusableServices } from './ReusableServices'
import { AIGhostwriter } from './AIGhostwriter'
import { RichTextEditor } from './RichTextEditor'
import { SUCCESS_TEMPLATES, DEFAULT_TEMPLATE_ID } from '../../lib/successTemplates'

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  draft: ProposalInsert
  onChange: (patch: Partial<ProposalInsert>) => void
  locale: string
  /** When true (status === 'accepted'), the editor is read-only */
  isLocked?: boolean
  /** When true (status === 'viewed' | 'accepted'), financial fields are locked */
  isFinanciallyLocked?: boolean
  /** When true (status === 'needs_revision'), show the negotiation thread panel */
  needsRevision?: boolean
  /** The client's revision request text */
  revisionNotes?: string | null
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tip({ content, children }: { content: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip.Provider delayDuration={200} skipDelayDuration={0}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild onClick={() => setOpen(o => !o)}>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-[200] max-w-[240px] rounded-xl px-3.5 py-2.5 text-[11px] leading-relaxed text-white/75 select-none"
            style={{
              background: '#030305',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {content}
            <Tooltip.Arrow style={{ fill: '#030305' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVatRate(): number {
  const stored = localStorage.getItem('dealspace:vat-rate')
  return stored ? parseFloat(stored) : DEFAULT_VAT_RATE
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title, icon, children, defaultOpen = true, badge,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-2xl overflow-hidden bg-card border border-[color:var(--border)]"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between p-5 text-left transition-all duration-200"
        style={{
          background: open
            ? 'linear-gradient(90deg, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.03) 50%, transparent 100%)'
            : 'transparent',
          borderBottom: open
            ? '1px solid var(--border)'
            : '1px solid transparent',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.18)' }}
          >
            <span className="text-indigo-400">{icon}</span>
          </div>
          <span className="text-base font-semibold text-main">{title}</span>
          {badge && (
            <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              {badge}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-dim"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-6 space-y-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, icon, required, children,
}: {
  label: string
  icon?: React.ReactNode
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-subtle">
        {icon && <span className="text-dim">{icon}</span>}
        {label}
        {required && <span className="text-indigo-400 ms-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = [
  'w-full bg-[var(--input-bg)] border border-[color:var(--border)] rounded-xl px-4 py-3.5 text-base text-main placeholder-dim',
  'outline-none transition-all duration-200',
  'shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  'focus:bg-[var(--input-bg)] focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/[0.12]',
].join(' ')


// ─── Currency selector ────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: 'ILS', label: '₪ ILS' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
]

// ─── Add-on row (draggable) ───────────────────────────────────────────────────

function AddOnRow({
  addOn, locale, onChange, onDelete, showVat, vatRate, currency, isFinanciallyLocked,
}: {
  addOn: AddOn
  locale: string
  onChange: (updated: AddOn) => void
  onDelete: () => void
  showVat: boolean
  vatRate: number
  currency: string
  isFinanciallyLocked?: boolean
}) {
  const isHe = locale === 'he'
  // Prices are always VAT-inclusive — extract the VAT component from within
  const vatComponent = addOn.price > 0 ? Math.round(addOn.price - addOn.price / (1 + vatRate)) : 0

  return (
    <Reorder.Item
      value={addOn}
      id={addOn.id}
      className="rounded-xl overflow-hidden"
      style={{
        background: addOn.enabled
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)'
          : 'var(--card-bg)',
        border: addOn.enabled
          ? '1px solid rgba(99,102,241,0.2)'
          : '1px solid var(--border)',
        cursor: 'default',
      }}
      whileDrag={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 10 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <button
          type="button"
          className="mt-1 flex-none cursor-grab active:cursor-grabbing text-dim hover:text-subtle transition-colors"
          aria-label="Drag to reorder"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={14} />
        </button>

        {/* Fields */}
        <div className="flex-1 space-y-2 min-w-0">
          {/* Name + price — stack vertically on narrow screens */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className={inputClass + ' flex-1'}
              placeholder={isHe ? 'שם השירות' : 'Service name'}
              value={addOn.label}
              onChange={e => onChange({ ...addOn, label: e.target.value })}
              maxLength={150}
            />
            <div className="flex gap-2 items-start">
              <div className="flex flex-col gap-0.5 flex-1 sm:flex-none">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  className={inputClass + ' sm:w-24' + (isFinanciallyLocked ? ' opacity-50 cursor-not-allowed' : '')}
                  placeholder="0"
                  value={addOn.price || ''}
                  onChange={e => onChange({ ...addOn, price: Number(e.target.value) || 0 })}
                  title={isHe ? 'מחיר כולל מע"מ' : 'Price incl. VAT'}
                  disabled={isFinanciallyLocked}
                />
                {showVat && addOn.price > 0 && (
                  <div
                    className="rounded-lg px-2 py-0.5 text-[11px] text-center font-semibold tabular-nums"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                  >
                    {isHe ? 'מתוכם מע"מ' : 'VAT incl.'} {formatCurrency(vatComponent, currency)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <input
            className={inputClass}
            placeholder={isHe ? 'תיאור קצר (אופציונלי)' : 'Short description (optional)'}
            value={addOn.description ?? ''}
            onChange={e => onChange({ ...addOn, description: e.target.value })}
          />
          {/* Per-item discount row */}
          <div className="flex items-center gap-2">
            <Tag size={11} className="text-emerald-400/60 flex-none" />
            <span className="text-xs font-semibold text-dim flex-none">
              {isHe ? 'הנחה' : 'Discount'}
            </span>
            <div className="relative flex-none">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                className="w-14 rounded-lg border bg-[var(--input-bg)] px-2 py-1 text-[11px] text-center text-main placeholder-dim outline-none transition-all duration-200"
                style={{
                  border: (addOn.discount_pct ?? 0) > 0 ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border)',
                  color: (addOn.discount_pct ?? 0) > 0 ? '#4ade80' : undefined,
                }}
                placeholder="0"
                value={addOn.discount_pct || ''}
                onChange={e => {
                  const v = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                  onChange({ ...addOn, discount_pct: v || undefined })
                }}
              />
            </div>
            <span className="text-[10px] text-dim">%</span>
            {(addOn.discount_pct ?? 0) > 0 && addOn.price > 0 && (
              <span className="text-xs font-semibold text-emerald-400">
                → {formatCurrency(Math.round(addOn.price * (1 - (addOn.discount_pct ?? 0) / 100)), currency)}
              </span>
            )}
          </div>

          {/* Quantity stepper — business sets the quantity */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={11} className="text-indigo-400/50 flex-none" />
            <span className="text-xs font-semibold text-dim flex-none">
              {isHe ? 'כמות' : 'Quantity'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isFinanciallyLocked || (addOn.default_quantity ?? 1) <= 1}
                onClick={() => onChange({ ...addOn, default_quantity: Math.max(1, (addOn.default_quantity ?? 1) - 1) })}
                className="flex h-5 w-5 items-center justify-center rounded-full text-dim transition hover:bg-[var(--bg-card-hover)] hover:text-main disabled:opacity-25"
              >
                <Minus size={9} />
              </button>
              <span className="w-5 text-center text-xs font-bold text-main tabular-nums">
                {addOn.default_quantity ?? 1}
              </span>
              <button
                type="button"
                disabled={isFinanciallyLocked || (addOn.default_quantity ?? 1) >= 10}
                onClick={() => onChange({ ...addOn, default_quantity: Math.min(10, (addOn.default_quantity ?? 1) + 1) })}
                className="flex h-5 w-5 items-center justify-center rounded-full text-dim transition hover:bg-[var(--bg-card-hover)] hover:text-main disabled:opacity-25"
              >
                <Plus size={9} />
              </button>
            </div>
            {(addOn.default_quantity ?? 1) > 1 && addOn.price > 0 && (
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: '#818cf8' }}>
                = {formatCurrency(Math.round(addOn.price * (addOn.default_quantity ?? 1)), currency)}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-none flex flex-col items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onChange({ ...addOn, enabled: !addOn.enabled })}
            className={`transition-colors ${addOn.enabled ? '' : 'text-slate-300 dark:text-white/20'}`}
            style={{ color: addOn.enabled ? '#6366f1' : undefined }}
            aria-label={addOn.enabled ? 'Disable' : 'Enable'}
          >
            {addOn.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-slate-300 dark:text-white/20 transition-colors hover:text-red-400"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  )
}

// ─── Main EditorPanel ─────────────────────────────────────────────────────────

export function EditorPanel({ draft, onChange, locale, isLocked = false, isFinanciallyLocked = false, needsRevision = false, revisionNotes }: EditorPanelProps) {
  const isHe = locale === 'he'
  const vatRate = getVatRate()
  const showVat = draft.include_vat

  // Discount-aware totals via unified engine
  const fin         = calculateFinancials(draft as Parameters<typeof calculateFinancials>[0], undefined, vatRate)
  const grandTotal  = fin.grandTotal
  const totalSavings = fin.totalSavings
  const globalDisc  = draft.global_discount_pct || 0

  // ── Add-on helpers ──────────────────────────────────────────────────────────
  const handleAddOnChange = (index: number, updated: AddOn) => {
    onChange({ add_ons: draft.add_ons.map((a, i) => i === index ? updated : a) })
  }
  const handleAddOnDelete = (index: number) => {
    onChange({ add_ons: draft.add_ons.filter((_, i) => i !== index) })
  }
  const handleAddNew = () => {
    onChange({
      add_ons: [...draft.add_ons, {
        id: crypto.randomUUID(), label: '', description: '', price: 0, enabled: true,
      }],
    })
  }
  const [libraryOpen, setLibraryOpen] = useState(false)

  const handleInjectServices = (addOns: AddOn[]) => {
    onChange({ add_ons: [...draft.add_ons, ...addOns] })
  }

  // ── Auto-inject creator info from user profile ──────────────────────────────
  const { user } = useAuthStore()
  useEffect(() => {
    if (!user) return
    const m = user.user_metadata as Record<string, string | undefined> | null
    if (!m) return
    const info = {
      full_name:      m['full_name']      ?? '',
      company_name:   m['company_name']   ?? '',
      tax_id:         m['tax_id']         ?? '',
      address:        m['address']        ?? '',
      phone:          m['phone']          ?? '',
      signatory_name: m['signatory_name'] ?? '',
      logo_url:       m['logo_url']       ?? '',
      webhook_url:    m['webhook_url']    ?? '',
    }
    const brandColor = m['brand_color'] ?? null
    onChange({ creator_info: info, brand_color: brandColor, business_terms: m['business_terms'] ?? '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Milestone helpers ───────────────────────────────────────────────────────
  const milestones: PaymentMilestone[] = draft.payment_milestones ?? []
  const milestoneSum = Math.round(milestones.reduce((s, m) => s + m.percentage, 0))
  const milestonesOk = milestonesValid(milestones)

  const addMilestone = () => {
    const remaining = Math.max(0, 100 - milestoneSum)
    onChange({
      payment_milestones: [
        ...milestones,
        { id: crypto.randomUUID(), name: '', percentage: remaining },
      ],
    })
  }

  const updateMilestone = (id: string, patch: Partial<PaymentMilestone>) => {
    onChange({
      payment_milestones: milestones.map(m => m.id === id ? { ...m, ...patch } : m),
    })
  }

  const deleteMilestone = (id: string) => {
    onChange({ payment_milestones: milestones.filter(m => m.id !== id) })
  }

  const activeTemplateId = draft.success_template ?? DEFAULT_TEMPLATE_ID

  return (
    <div className="relative p-4 space-y-5" style={{ animation: 'ds-fade-up 0.35s ease-out both' }}>
      {/* Hide browser number-input spinners globally within the builder */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { display: none; }
        input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        @keyframes ds-fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Immutability Banner ─────────────────────────────────────────── */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.05) 100%)',
            border: '1px solid rgba(34,197,94,0.25)',
            boxShadow: '0 0 24px rgba(34,197,94,0.08), inset 0 1px 0 rgba(34,197,94,0.1)',
          }}
        >
          <div
            className="flex-none flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              boxShadow: '0 0 12px rgba(34,197,94,0.3)',
            }}
          >
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-400">
              {isHe ? '🔒 הסכם חתום — נעול' : '🔒 Signed Agreement — Locked'}
            </p>
            <p className="text-xs text-emerald-400/60 mt-1">
              {isHe
                ? 'לא ניתן לערוך הצעה חתומה. לשינויים, יש לשכפל ולצור טיוטה חדשה.'
                : 'Signed proposals are immutable. To make changes, duplicate and create a new draft.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Financial Lock Banner ──────────────────────────────────────── */}
      {isFinanciallyLocked && !isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{
            background: 'rgba(245,158,11,0.10)',
            border: '1px solid rgba(245,158,11,0.30)',
            boxShadow: '0 0 20px rgba(245,158,11,0.07), inset 0 1px 0 rgba(245,158,11,0.1)',
          }}
        >
          <div
            className="flex-none flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            <Lock size={16} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-400">
              {isHe
                ? '🔒 ההצעה נצפתה — שדות התמחור נעולים'
                : '🔒 Proposal is live — Financial fields are locked'}
            </p>
            <p className="text-xs text-amber-400/60 mt-1 leading-relaxed">
              {isHe
                ? 'שדות התמחור נעולים למניעת אי-התאמות משפטיות. ניתן לערוך את שם הפרויקט, תיאור ופרטי לקוח.'
                : 'Financial fields are locked to prevent legal discrepancies. You can still edit the project title, description, and client details.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Negotiation Thread Panel ────────────────────────────────────── */}
      {needsRevision && revisionNotes && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' as const }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(217,119,6,0.06) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 0 32px rgba(245,158,11,0.08), inset 0 1px 0 rgba(245,158,11,0.15)',
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <MessageSquarePlus size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: '#f59e0b' }}>
                {isHe ? '🔔 הלקוח ביקש שינויים' : '🔔 Client Requested Changes'}
              </p>
              <p className="text-xs text-amber-400/55 mt-0.5">
                {isHe
                  ? 'ערוך את ההצעה לפי הבקשה ולחץ "עדכן ושלח חזרה"'
                  : 'Edit the proposal based on the request, then click "Update & Resend"'}
              </p>
            </div>
          </div>

          {/* Notes body */}
          <div className="px-5 py-4">
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}
            >
              {revisionNotes}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Read-only overlay (intercepts all pointer events when locked) ── */}
      {isLocked && (
        <div
          className="pointer-events-auto absolute inset-0 z-10 cursor-not-allowed bg-white/50 dark:bg-[rgba(3,3,5,0.35)]"
          title={isHe ? 'ההצעה נעולה לעריכה' : 'Proposal is locked for editing'}
          onClick={e => e.preventDefault()}
        />
      )}

      {/* ── Document Mode Toggle ──────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden bg-card border border-[color:var(--border)]"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.18)' }}
            >
              <span className="text-indigo-400"><FileText size={15} /></span>
            </div>
            <span className="text-base font-semibold text-main">
              {isHe ? 'סוג מסמך' : 'Document Mode'}
            </span>
          </div>
          {/* Segmented control — locked when sent/viewed (unlocked on needs_revision) */}
          {(() => {
            const structureLocked = isFinanciallyLocked && !needsRevision
            return (
              <div
                className="relative flex rounded-xl overflow-hidden"
                style={{
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border)',
                  opacity: structureLocked ? 0.5 : 1,
                }}
              >
                <button
                  type="button"
                  onClick={() => !structureLocked && onChange({ is_document_only: false })}
                  disabled={structureLocked}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all relative z-10"
                  style={{
                    color: !draft.is_document_only ? '#c4b5fd' : 'var(--text-tertiary)',
                    background: !draft.is_document_only ? 'rgba(99,102,241,0.15)' : 'transparent',
                    cursor: structureLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <DollarSign size={12} />
                  {isHe ? 'הצעת מחיר' : 'Proposal'}
                </button>
                <button
                  type="button"
                  onClick={() => !structureLocked && onChange({ is_document_only: true })}
                  disabled={structureLocked}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all relative z-10"
                  style={{
                    color: draft.is_document_only ? '#c4b5fd' : 'var(--text-tertiary)',
                    background: draft.is_document_only ? 'rgba(99,102,241,0.15)' : 'transparent',
                    cursor: structureLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FileText size={12} />
                  {isHe ? 'מסמך משפטי' : 'Legal Document'}
                </button>
                {structureLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <Lock size={10} />
                      <span>{isHe ? 'נעול לאחר שליחה' : 'Locked after sending'}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
          <p className="text-[12px] text-dim leading-relaxed">
            {draft.is_document_only
              ? (isHe ? 'מצב מסמך — ללא תמחור, תוספות ואבני דרך. מתאים לחוזים, הסכמים והתחייבויות.' : 'Document mode — no pricing, add-ons, or milestones. Ideal for contracts, agreements, and NDAs.')
              : (isHe ? 'מצב הצעת מחיר — כולל תמחור, תוספות ולוח תשלומים אינטראקטיבי.' : 'Proposal mode — includes pricing, add-ons, and interactive payment schedule.')}
          </p>
        </div>
      </div>

      {/* ── Document Settings (BSD, Hide Total) ────────────────────────── */}
      <Section
        title={isHe ? 'הגדרות מסמך' : 'Document Settings'}
        icon={<Settings2 size={15} />}
        defaultOpen={false}
      >
        {/* B'H toggle */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-300"
          style={{
            background: draft.display_bsd
              ? 'linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 100%)'
              : 'var(--surface-sunken)',
            border: draft.display_bsd ? '1px solid rgba(212,175,55,0.25)' : '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: draft.display_bsd ? '#fbbf24' : 'var(--text-secondary)' }}>
              בס&quot;ד
            </span>
            <span className="text-xs text-slate-500 dark:text-white/40">
              {isHe ? 'הוסף בס"ד בראש המסמך' : 'Show B\'H at top of document'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ display_bsd: !draft.display_bsd })}
            className="transition-colors"
            style={{ color: draft.display_bsd ? '#d4af37' : 'var(--text-tertiary)' }}
          >
            {draft.display_bsd ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {/* Hide Grand Total toggle — only shown in Proposal mode */}
        {!draft.is_document_only && (
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-300"
            style={{
              background: draft.hide_grand_total
                ? 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(168,85,247,0.06) 100%)'
                : 'var(--surface-sunken)',
              border: draft.hide_grand_total ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--border)',
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-white/70">
                  {isHe ? 'הסתר סה"כ' : 'Hide Grand Total'}
                </p>
                <Tip content={isHe
                  ? 'הסתר את סכום הסה"כ מהלקוח. מתאים להצעות בסגנון תפריט בהם הלקוח בוחר פריטים ללא הלם מחיר.'
                  : 'Hide the grand total from the client. Ideal for menu-style proposals where clients pick items without sticker shock.'
                }>
                  <button type="button" className="text-dim hover:text-subtle transition-colors p-1.5 rounded-lg touch-manipulation" tabIndex={0}>
                    <Info size={14} />
                  </button>
                </Tip>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ hide_grand_total: !draft.hide_grand_total })}
              className="transition-colors"
              style={{ color: draft.hide_grand_total ? '#6366f1' : 'var(--text-tertiary)' }}
            >
              {draft.hide_grand_total ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        )}
      </Section>

      {/* ── Client Details ──────────────────────────────────────────────── */}
      <Section
        title={isHe ? 'פרטי לקוח' : 'Client Details'}
        icon={<User size={15} />}
      >
        {/* Name + Email — 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isHe ? 'שם הלקוח' : 'Client Name'} required>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
                <User size={14} className="text-dim" />
              </div>
              <input
                className={inputClass + ' ps-10'}
                placeholder={isHe ? 'שם מלא של הלקוח' : 'Client full name'}
                value={draft.client_name}
                onChange={e => onChange({ client_name: e.target.value })}
                maxLength={200}
                autoComplete="off"
              />
            </div>
          </Field>
          <Field label={isHe ? 'אימייל לקוח' : 'Client Email'}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
                <Mail size={14} className="text-dim" />
              </div>
              <input
                className={inputClass + ' ps-10'}
                type="email"
                placeholder="client@example.com"
                value={draft.client_email ?? ''}
                onChange={e => onChange({ client_email: e.target.value })}
                maxLength={200}
                autoComplete="off"
              />
            </div>
          </Field>
        </div>

        {/* Access code */}
        <Field label={isHe ? 'קוד גישה (אופציונלי)' : 'Access Code (optional)'}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
              <Lock size={14} className="text-slate-400 dark:text-white/25" />
            </div>
            <input
              className={inputClass + ' ps-10'}
              placeholder={isHe ? 'למשל: 1234 — הלקוח יצטרך להזין' : 'e.g. 1234 — client must enter this'}
              value={draft.access_code ?? ''}
              onChange={e => onChange({ access_code: e.target.value || null })}
              autoComplete="off"
              maxLength={8}
            />
            {draft.access_code && (
              <div
                className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg px-2 py-0.5"
                style={{ background: 'rgba(99,102,241,0.12)', pointerEvents: 'none' }}
              >
                <Lock size={9} style={{ color: '#818cf8' }} />
                <span className="text-[11px] font-bold text-indigo-400">
                  {isHe ? 'מוגן' : 'Protected'}
                </span>
              </div>
            )}
          </div>
          <p className="text-[12px] text-dim mt-2 leading-relaxed">
            {isHe
              ? 'אם מוגדר, הלקוח יצטרך להזין קוד זה לפני צפייה בהצעה'
              : 'If set, the client must enter this code before viewing the proposal'}
          </p>
        </Field>
      </Section>

      {/* ── Project Info ────────────────────────────────────────────────── */}
      <Section
        title={isHe ? 'פרטי הפרויקט' : 'Project Info'}
        icon={<Briefcase size={15} />}
      >
        <Field label={isHe ? 'שם הפרויקט' : 'Project Title'} required>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
              <Briefcase size={14} className="text-dim" />
            </div>
            <input
              className={inputClass + ' ps-10'}
              placeholder={isHe ? 'למשל: חבילת תוכן חודשית' : 'e.g. Monthly Content Package'}
              value={draft.project_title}
              onChange={e => onChange({ project_title: e.target.value })}
              maxLength={200}
            />
          </div>
        </Field>

        <Field label={isHe ? 'תיאור / מה כלול' : "Description / What's Included"} icon={<FileText size={10} />}>
          <RichTextEditor
            value={draft.description ?? ''}
            onChange={html => onChange({ description: html })}
            placeholder={
              isHe
                ? 'תארו בקצרה מה כולל הפרויקט, מה הלקוח יקבל ואיך תראה ההצלחה...'
                : "Describe what's included, what the client will receive, and what success looks like..."
            }
            locale={locale}
            disabled={isLocked}
          />
        </Field>

        {/* Testimonials */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-main">
              <Quote size={13} className="text-dim" />
              {isHe ? 'המלצות לקוחות' : 'Testimonials'}
            </label>
            {(draft.testimonials?.length ?? 0) < 3 && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    testimonials: [
                      ...(draft.testimonials ?? []),
                      { id: crypto.randomUUID(), quote: '', author: '', role: '' },
                    ],
                  })
                }
                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400/70 hover:text-indigo-400 transition-colors"
              >
                <Plus size={10} />
                {isHe ? 'הוסף המלצה' : 'Add'}
              </button>
            )}
          </div>

          {(draft.testimonials ?? []).length === 0 && (
            <p className="text-[12px] text-dim leading-relaxed">
              {isHe
                ? 'הוסף 1-3 המלצות — תוצגנה ללקוח לפני לוח התמחור להגברת אמון'
                : 'Add 1-3 testimonials — shown before pricing to build client trust'}
            </p>
          )}

          {(draft.testimonials ?? []).map((t: Testimonial, i: number) => (
            <div
              key={t.id}
              className="rounded-xl p-3 space-y-2"
              style={{
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.14)',
              }}
            >
              <textarea
                className={inputClass + ' resize-none text-sm'}
                rows={2}
                placeholder={
                  isHe
                    ? '"העבודה שינתה לנו את כל התהליך..."'
                    : '"This completely transformed our workflow..."'
                }
                value={t.quote}
                onChange={e => {
                  const updated = [...(draft.testimonials ?? [])]
                  updated[i] = { ...t, quote: e.target.value }
                  onChange({ testimonials: updated })
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass + ' text-sm'}
                  placeholder={isHe ? 'שם הלקוח' : 'Client name'}
                  value={t.author}
                  onChange={e => {
                    const updated = [...(draft.testimonials ?? [])]
                    updated[i] = { ...t, author: e.target.value }
                    onChange({ testimonials: updated })
                  }}
                />
                <input
                  className={inputClass + ' text-sm'}
                  placeholder={isHe ? 'תפקיד (אופציונלי)' : 'Role (optional)'}
                  value={t.role ?? ''}
                  onChange={e => {
                    const updated = [...(draft.testimonials ?? [])]
                    updated[i] = { ...t, role: e.target.value }
                    onChange({ testimonials: updated })
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      testimonials: (draft.testimonials ?? []).filter((_, j) => j !== i),
                    })
                  }
                  className="flex-none text-dim hover:text-red-400 transition-colors"
                  aria-label="Delete testimonial"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Expiry date */}
        <PremiumDatePicker
          value={draft.expires_at}
          onChange={iso => onChange({ expires_at: iso })}
          locale={locale}
          label={isHe ? 'תאריך תפוגה (אופציונלי)' : 'Expiry Date (optional)'}
          placeholder={isHe ? 'ללא תפוגה' : 'No expiry'}
          minDate={new Date()}
        />

      </Section>

      {/* ── Pricing (hidden in document-only mode) ──────────────────────── */}
      {!draft.is_document_only && <Section
        title={isHe ? 'תמחור בסיסי' : 'Base Pricing'}
        icon={<DollarSign size={15} />}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label={isHe ? 'מחיר בסיס' : 'Base Price'} required>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-4 flex items-center">
                <span className="text-sm font-bold text-dim">
                  {draft.currency === 'ILS' ? '₪' : draft.currency === 'EUR' ? '€' : '$'}
                </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                className={inputClass + ' ps-10' + (isFinanciallyLocked ? ' opacity-50 cursor-not-allowed' : '')}
                placeholder="0"
                value={draft.base_price || ''}
                onChange={e => onChange({ base_price: Number(e.target.value) || 0 })}
                disabled={isFinanciallyLocked}
              />
            </div>
          </Field>
          <Field label={isHe ? 'מטבע' : 'Currency'}>
            <div className="relative">
              <select
                className={inputClass + ' appearance-none cursor-pointer pe-8' + (isFinanciallyLocked ? ' opacity-50 cursor-not-allowed' : '')}
                value={draft.currency}
                onChange={e => onChange({ currency: e.target.value })}
                disabled={isFinanciallyLocked}
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value} style={{ background: 'var(--dropdown-bg)', color: 'var(--text-main)' }}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
                <ChevronDown size={13} className="text-dim" />
              </div>
            </div>
          </Field>
        </div>

        {/* VAT toggle */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-300"
          style={{
            background: showVat
              ? 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(168,85,247,0.06) 100%)'
              : 'var(--surface-sunken)',
            border: showVat ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Receipt size={13} className={showVat ? 'text-indigo-400' : 'text-slate-400 dark:text-white/30'} />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-subtle">
                  {isHe ? `כלול מע"מ (${Math.round(vatRate * 100)}%)` : `Include VAT (${Math.round(vatRate * 100)}%)`}
                </p>
                <Tip content={isHe
                  ? `הדלק אם אתה עוסק מורשה. המחירים שאתה מזין כוללים מע"מ — המערכת תפרק את הפירוט אוטומטית ותציג אותו בחדר הדיל, בחוזה ובקובץ. ניתן לשנות את השיעור בפרופיל.`
                  : `Enable if you are a VAT-registered business. Prices you enter include VAT — the system extracts and shows the breakdown in the Deal Room, contract, and PDF. Change the rate in Profile.`
                }>
                  <button type="button" className="text-dim hover:text-subtle transition-colors p-1.5 rounded-lg touch-manipulation" tabIndex={0}>
                    <Info size={14} />
                  </button>
                </Tip>
              </div>
              {showVat && draft.base_price > 0 && (
                <p className="text-xs text-indigo-400/70 mt-0.5">
                  {isHe
                    ? `סה"כ: ${formatCurrency(draft.base_price, draft.currency)} (מתוכם מע"מ: ${formatCurrency(Math.round(draft.base_price - draft.base_price / (1 + vatRate)), draft.currency)})`
                    : `Total: ${formatCurrency(draft.base_price, draft.currency)} (VAT included: ${formatCurrency(Math.round(draft.base_price - draft.base_price / (1 + vatRate)), draft.currency)})`}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isFinanciallyLocked && onChange({ include_vat: !showVat })}
            className="transition-colors"
            style={{
              color: showVat ? '#6366f1' : 'var(--text-tertiary)',
              opacity: isFinanciallyLocked ? 0.5 : 1,
              cursor: isFinanciallyLocked ? 'not-allowed' : 'pointer',
            }}
            disabled={isFinanciallyLocked}
          >
            {showVat ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {/* Global Discount slider */}
        <div
          className="rounded-xl overflow-hidden transition-all duration-300"
          style={{
            background: globalDisc > 0
              ? 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.05) 100%)'
              : 'var(--surface-sunken)',
            border: globalDisc > 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid var(--border)',
          }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Percent size={12} style={{ color: globalDisc > 0 ? '#22c55e' : 'var(--text-tertiary)' }} />
                <span className="text-sm font-semibold" style={{ color: globalDisc > 0 ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                  {isHe ? 'הנחה גלובלית' : 'Global Discount'}
                </span>
                <Tip content={isHe
                  ? 'הנחה שמוחלת על הסכום הכולל לאחר הנחות פריטים. כלי עוצמתי לסגירת עסקה בעקבות בקשת ניהול משא ומתן.'
                  : 'Discount applied to the full subtotal after per-item discounts. A powerful deal-closer after a negotiation request.'
                }>
                  <button type="button" className="text-dim hover:text-subtle transition-colors p-1 rounded-lg touch-manipulation" tabIndex={0}>
                    <Info size={12} />
                  </button>
                </Tip>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  className="w-12 rounded-lg px-2 py-1 text-[12px] text-center font-bold outline-none transition-all"
                  style={{
                    background: globalDisc > 0 ? 'rgba(34,197,94,0.15)' : 'var(--input-bg)',
                    border: globalDisc > 0 ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border)',
                    color: globalDisc > 0 ? '#4ade80' : 'var(--text-secondary)',
                    opacity: isFinanciallyLocked ? 0.5 : 1,
                    cursor: isFinanciallyLocked ? 'not-allowed' : undefined,
                  }}
                  value={globalDisc || ''}
                  placeholder="0"
                  onChange={e => onChange({ global_discount_pct: Math.min(50, Math.max(0, Number(e.target.value) || 0)) })}
                  disabled={isFinanciallyLocked}
                />
                <span className="text-[11px] font-bold" style={{ color: globalDisc > 0 ? '#4ade80' : 'var(--text-tertiary)' }}>%</span>
              </div>
            </div>
            <div style={{ opacity: isFinanciallyLocked ? 0.4 : 1, pointerEvents: isFinanciallyLocked ? 'none' : undefined }}>
              <PremiumSlider
                value={globalDisc}
                min={0}
                max={50}
                step={1}
                onChange={v => onChange({ global_discount_pct: v })}
                color={globalDisc > 0 ? '#22c55e' : '#6366f1'}
              />
            </div>
            {globalDisc > 0 && totalSavings > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400/70">
                  {isHe ? 'חיסכון ללקוח' : 'Client saves'}
                </span>
                <span className="text-sm font-black text-emerald-400 tabular-nums">
                  {formatCurrency(totalSavings, draft.currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* VAT summary when enabled */}
        {showVat && fin.beforeVat > 0 && (
          <div
            className="rounded-xl px-5 py-4 space-y-2"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div className="flex items-center justify-between text-sm text-subtle">
              <span>{isHe ? 'לפני מע"מ' : 'Before VAT'}</span>
              <span className="tabular-nums font-semibold">{formatCurrency(fin.beforeVat, draft.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-indigo-400/80">
              <span>{isHe ? `מתוכם מע"מ (${Math.round(vatRate * 100)}%)` : `Of which VAT (${Math.round(vatRate * 100)}%)`}</span>
              <span className="tabular-nums">{formatCurrency(fin.vatAmount, draft.currency)}</span>
            </div>
            <div className="h-px bg-[color:var(--border)]" />
            <div className="flex items-center justify-between text-base font-bold text-main">
              <span>{isHe ? 'סה"כ לתשלום' : 'Total (incl. VAT)'}</span>
              <span className="tabular-nums" style={{ color: '#818cf8' }}>{formatCurrency(grandTotal, draft.currency)}</span>
            </div>
          </div>
        )}
      </Section>}

      {/* ── Add-ons (hidden in document-only mode) ──────────────────────── */}
      {!draft.is_document_only && <div
        className="rounded-2xl overflow-hidden bg-card border border-[color:var(--border)]"
      >
        <div
          className="flex items-center justify-between p-5 transition-all"
          style={{
            background: 'linear-gradient(90deg, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.03) 50%, transparent 100%)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.18)' }}
            >
              <span className="text-indigo-400"><Plus size={15} /></span>
            </div>
            <span className="text-base font-semibold text-main">
              {isHe ? 'תוספות ושדרוגים' : 'Add-ons & Upgrades'}
            </span>
            {draft.add_ons.length > 0 && (
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                {draft.add_ons.filter(a => a.enabled).length}/{draft.add_ons.length}
              </span>
            )}
            <Tip content={isHe
              ? 'טיפ: השתמש בסליידר (🟢) לכמויות כמו שעות עבודה, ובמתג הדלקה/כיבוי לשירותי כן/לא. הלקוח יכול להתאים בחדר הדיל.'
              : 'Tip: Use the slider (🟢) for quantities like hours, and the on/off toggle for yes/no services. The client can adjust in the Deal Room.'
            }>
              <button type="button" className="text-dim hover:text-subtle transition-colors p-1.5 rounded-lg touch-manipulation" tabIndex={0}>
                <Info size={14} />
              </button>
            </Tip>
          </div>
          {showVat && (
            <span className="text-xs font-semibold text-indigo-400/60">
              {isHe ? 'לפני מע"מ' : 'ex. VAT'}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <Reorder.Group
            axis="y"
            values={draft.add_ons}
            onReorder={(newOrder) => onChange({ add_ons: newOrder })}
            className="space-y-2"
            as="div"
          >
            <AnimatePresence>
              {draft.add_ons.map((addOn, i) => (
                <AddOnRow
                  key={addOn.id}
                  addOn={addOn}
                  locale={locale}
                  onChange={(updated) => handleAddOnChange(i, updated)}
                  onDelete={() => handleAddOnDelete(i)}
                  showVat={!!showVat}
                  vatRate={vatRate}
                  currency={draft.currency}
                  isFinanciallyLocked={isFinanciallyLocked}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {draft.add_ons.length === 0 && (
            <p className="text-center text-sm text-dim py-5">
              {isHe
                ? 'אין תוספות עדיין — הוסף שירותים אופציונליים ללקוח'
                : 'No add-ons yet — add optional services for your client'}
            </p>
          )}

          {!isFinanciallyLocked && (
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={handleAddNew}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border h-9 text-xs font-semibold text-indigo-400 transition-all duration-200 whitespace-nowrap"
                style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
              >
                <Plus size={13} />
                <span className="whitespace-nowrap">{isHe ? 'הוסף תוספת חדשה' : 'Add New Add-on'}</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="flex-none flex items-center gap-1.5 rounded-xl border h-9 px-3 text-xs font-semibold text-amber-400 transition-all duration-200 whitespace-nowrap"
                style={{ borderColor: 'rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                title={isHe ? 'משוך מהספרייה' : 'Pull from Library'}
              >
                <Library size={13} />
                <span className="hidden sm:inline whitespace-nowrap">
                  {isHe ? '✨ ספרייה' : '✨ Library'}
                </span>
              </motion.button>
            </div>
          )}
        </div>
      </div>}

      {/* ── Payment Milestones (hidden in document-only mode) ──────────── */}
      {!draft.is_document_only && <Section
        title={isHe ? 'אבני דרך לתשלום' : 'Payment Milestones'}
        icon={<Milestone size={15} />}
        defaultOpen={false}
        badge={milestones.length > 0 ? `${milestones.length}` : undefined}
      >
        {/* Explanation */}
        <div className="flex items-start gap-2">
          <p className="text-[13px] text-slate-500 dark:text-zinc-400 leading-relaxed flex-1">
            {isHe
              ? 'חלק את התשלום לשלבים. לחץ "הוסף אבן דרך" כדי להתחיל. הסכום חייב להגיע בדיוק ל-100%.'
              : 'Split the payment into stages. Click "Add Milestone" to start. All percentages must total exactly 100%.'}
          </p>
          <Tip content={isHe
            ? 'חלוקת תשלומים מפחיתה סיכון לשני הצדדים. למשל: 30% מקדמה בחתימה, 40% באמצע הפרויקט, 30% במסירה הסופית. הלקוח רואה את לוח התשלומים בחדר הדיל.'
            : 'Splitting payments reduces risk for both parties. Example: 30% deposit at signing, 40% mid-project, 30% at final delivery. The client sees the schedule in the Deal Room.'
          }>
            <button type="button" className="flex-none text-dim hover:text-subtle transition-colors p-1.5 rounded-lg touch-manipulation" tabIndex={0}>
              <Info size={14} />
            </button>
          </Tip>
        </div>

        {/* Quick presets — only shown when no milestones yet and not financially locked */}
        {milestones.length === 0 && !isFinanciallyLocked && (
          <div className="flex flex-wrap gap-2">
            <p className="w-full text-xs font-bold uppercase tracking-widest text-muted">
              {isHe ? 'תבניות מהירות' : 'Quick presets'}
            </p>
            {[
              { label: isHe ? '50 / 50' : '50 / 50', splits: [50, 50], names: isHe ? ['מקדמה', 'סיום'] : ['Deposit', 'Final'] },
              { label: isHe ? '30 / 70' : '30 / 70', splits: [30, 70], names: isHe ? ['מקדמה', 'סיום'] : ['Deposit', 'Final'] },
              { label: isHe ? '33 / 33 / 34' : '33 / 33 / 34', splits: [33, 33, 34], names: isHe ? ['שלב א׳', 'שלב ב׳', 'סיום'] : ['Phase 1', 'Phase 2', 'Final'] },
              { label: isHe ? '25 / 25 / 50' : '25 / 25 / 50', splits: [25, 25, 50], names: isHe ? ['פתיחה', 'אמצע', 'סיום'] : ['Kickoff', 'Midpoint', 'Final'] },
            ].map(preset => (
              <motion.button
                key={preset.label}
                type="button"
                onClick={() => onChange({
                  payment_milestones: preset.splits.map((pct, i) => ({
                    id: crypto.randomUUID(),
                    name: preset.names[i],
                    percentage: pct,
                  })),
                })}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all bg-indigo-50 dark:bg-indigo-500/[0.08] border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Visual distribution bar */}
        {milestones.length > 0 && milestoneSum > 0 && (
          <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5" style={{ height: 8 }}>
            <div className="flex h-full">
              {milestones.map((m, i) => {
                const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9']
                return (
                  <div
                    key={m.id}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(m.percentage, 100)}%`,
                      background: COLORS[i % COLORS.length],
                      borderRight: i < milestones.length - 1 ? '2px solid rgba(0,0,0,0.4)' : 'none',
                    }}
                    title={`${m.name || (isHe ? `שלב ${i + 1}` : `Stage ${i + 1}`)}: ${m.percentage}%`}
                  />
                )
              })}
              {/* Remaining (unfilled) */}
              {milestoneSum < 100 && (
                <div
                  className="h-full"
                  style={{ width: `${100 - milestoneSum}%`, background: 'rgba(212,175,55,0.25)' }}
                />
              )}
            </div>
          </div>
        )}

        {/* Milestone rows */}
        <div className="space-y-2">
          <AnimatePresence>
            {milestones.map((m, i) => {
              const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9']
              const color = COLORS[i % COLORS.length]
              const milestoneAmt = Math.round((draft.base_price ?? 0) * m.percentage / 100)
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="flex items-center gap-2 rounded-xl p-3.5"
                    style={{
                      background: 'var(--surface-sunken)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Color dot */}
                    <div
                      className="h-2 w-2 rounded-full flex-none"
                      style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                    />
                    <input
                      className={inputClass + ' flex-1 text-sm' + (isFinanciallyLocked ? ' opacity-50 cursor-not-allowed' : '')}
                      placeholder={isHe ? `שם שלב ${i + 1}` : `Stage ${i + 1} name`}
                      value={m.name}
                      onChange={e => updateMilestone(m.id, { name: e.target.value })}
                      disabled={isFinanciallyLocked}
                    />
                    {/* Amount preview */}
                    {milestoneAmt > 0 && (
                      <span className="text-xs tabular-nums text-slate-400 dark:text-white/45 flex-none font-medium">
                        {formatCurrency(milestoneAmt, draft.currency)}
                      </span>
                    )}
                    <div className="relative flex-none w-16">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        className={inputClass + ' text-sm text-center pe-5' + (isFinanciallyLocked ? ' opacity-50 cursor-not-allowed' : '')}
                        value={m.percentage || ''}
                        onChange={e => updateMilestone(m.id, { percentage: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                        disabled={isFinanciallyLocked}
                      />
                      <span className="absolute inset-y-0 end-2 flex items-center text-[10px] text-dim pointer-events-none">%</span>
                    </div>
                    {!isFinanciallyLocked && (
                      <button
                        type="button"
                        onClick={() => deleteMilestone(m.id)}
                        className="text-slate-300 dark:text-white/20 hover:text-red-400 transition-colors flex-none"
                        aria-label="Delete milestone"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Sum indicator — shown when there are milestones */}
        {milestones.length > 0 && (
          <div
            className="flex items-center justify-between rounded-xl px-3.5 py-2"
            style={{
              background: milestonesOk
                ? 'rgba(34,197,94,0.07)'
                : milestoneSum > 100
                ? 'rgba(239,68,68,0.07)'
                : 'rgba(212,175,55,0.07)',
              border: `1px solid ${milestonesOk ? 'rgba(34,197,94,0.2)' : milestoneSum > 100 ? 'rgba(239,68,68,0.2)' : 'rgba(212,175,55,0.2)'}`,
            }}
          >
            <span className="text-sm font-bold tabular-nums" style={{ color: milestonesOk ? '#22c55e' : milestoneSum > 100 ? '#f87171' : '#d4af37' }}>
              {milestoneSum}% / 100%
            </span>
            <span className="text-xs font-medium" style={{ color: milestonesOk ? 'rgba(34,197,94,0.7)' : milestoneSum > 100 ? '#f87171' : '#d4af37' }}>
              {milestonesOk
                ? (isHe ? '✓ מאוזן — מוכן לשליחה' : '✓ Balanced — ready to send')
                : milestoneSum > 100
                ? (isHe ? `חריגה של ${milestoneSum - 100}%` : `${milestoneSum - 100}% over`)
                : (isHe ? `חסר עוד ${100 - milestoneSum}%` : `${100 - milestoneSum}% remaining`)}
            </span>
          </div>
        )}

        {!isFinanciallyLocked && (
          <motion.button
            type="button"
            onClick={addMilestone}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 bg-indigo-50 dark:bg-indigo-500/[0.08] border border-indigo-200 dark:border-indigo-500/25 text-indigo-600 dark:text-indigo-400"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
          >
            <Plus size={13} />
            {isHe ? 'הוסף אבן דרך' : 'Add Milestone'}
          </motion.button>
        )}
      </Section>}

      {/* ── AI Ghostwriter ───────────────────────────────────────────────── */}
      <AIGhostwriter
        locale={locale}
        onGenerate={onChange}
      />

      {/* ── Success Template Selector ────────────────────────────────────── */}
      <Section
        title={isHe ? 'הודעת סגירת עסקה' : 'Post-Signature Message'}
        icon={<Sparkles size={15} />}
        defaultOpen={false}
        badge={isHe
          ? (SUCCESS_TEMPLATES.find(t => t.id === activeTemplateId)?.label_he ?? '')
          : (SUCCESS_TEMPLATES.find(t => t.id === activeTemplateId)?.label_en ?? '')}
      >
        <p className="text-[12px] text-dim leading-relaxed mb-3">
          {isHe
            ? 'בחר את ההודעה שתוצג ללקוח לאחר החתימה.'
            : 'Choose the message shown to the client after they sign.'}
        </p>
        <div className="space-y-2">
          {SUCCESS_TEMPLATES.map(tmpl => {
            const selected = activeTemplateId === tmpl.id
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onChange({ success_template: tmpl.id })}
                className={`w-full text-start rounded-xl px-3.5 py-3 transition-all ${selected ? '' : 'bg-[var(--surface-sunken)]'}`}
                style={{
                  background: selected ? 'rgba(99,102,241,0.12)' : undefined,
                  border: selected ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
                  boxShadow: selected ? '0 0 12px rgba(99,102,241,0.12)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-bold ${selected ? 'text-indigo-400 dark:text-indigo-300' : 'text-slate-700 dark:text-white/65'}`}>
                    {isHe ? tmpl.label_he : tmpl.label_en}
                  </span>
                  {selected && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                      {isHe ? '✓ נבחר' : '✓ Selected'}
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed line-clamp-2 ${selected ? 'text-indigo-400/60 dark:text-indigo-300/60' : 'text-slate-500 dark:text-white/35'}`}
                >
                  {isHe ? tmpl.message_he : tmpl.message_en}
                </p>
              </button>
            )
          })}
        </div>
      </Section>

      <div className="h-8" />

      {/* ── Services injection modal ─────────────────────────────────────── */}
      <ReusableServices
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        currency={draft.currency}
        locale={locale}
        onInject={handleInjectServices}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Reorder, motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Briefcase, FileText, DollarSign,
  Plus, GripVertical, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, FileCheck, Receipt, Lock, Milestone, ShieldCheck, Sparkles, SlidersHorizontal,
} from 'lucide-react'
import type { ProposalInsert, AddOn, PaymentMilestone } from '../../types/proposal'
import { DEFAULT_VAT_RATE, applyVat, vatAmount, formatCurrency, milestonesValid } from '../../types/proposal'
import { useAuthStore } from '../../stores/useAuthStore'
import { PremiumDatePicker } from '../ui/PremiumInputs'
import { ReusableServices } from './ReusableServices'
import { AIGhostwriter } from './AIGhostwriter'
import { RichTextEditor } from './RichTextEditor'
import {
  CONTRACT_TEMPLATES, CATEGORY_LABELS, interpolateTemplate,
  type ContractTemplate,
} from '../../lib/contractTemplates'
import { SUCCESS_TEMPLATES, DEFAULT_TEMPLATE_ID } from '../../lib/successTemplates'

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  draft: ProposalInsert
  onChange: (patch: Partial<ProposalInsert>) => void
  locale: string
  /** When true (status === 'accepted'), the editor is read-only */
  isLocked?: boolean
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
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-indigo-400/80">{icon}</span>
          <span className="text-sm font-semibold text-white/80">{title}</span>
          {badge && (
            <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
              {badge}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30"
        >
          <ChevronDown size={15} />
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
            <div className="px-5 pb-5 space-y-4">{children}</div>
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
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {icon && <span>{icon}</span>}
        {label}
        {required && <span className="text-indigo-400/60">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = [
  'w-full rounded-2xl border bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/20',
  'outline-none transition-all duration-200',
  'border-white/[0.1] focus:border-indigo-400/60',
  'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
].join(' ')


// ─── Currency selector ────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: 'ILS', label: '₪ ILS' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
]

// ─── Add-on row (draggable) ───────────────────────────────────────────────────

function AddOnRow({
  addOn, locale, onChange, onDelete, showVat, vatRate, currency,
}: {
  addOn: AddOn
  locale: string
  onChange: (updated: AddOn) => void
  onDelete: () => void
  showVat: boolean
  vatRate: number
  currency: string
}) {
  const isHe = locale === 'he'
  const vatTotal = addOn.price > 0 ? applyVat(addOn.price, vatRate) : 0

  return (
    <Reorder.Item
      value={addOn}
      id={addOn.id}
      className="rounded-xl overflow-hidden"
      style={{
        background: addOn.enabled
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)'
          : 'rgba(255,255,255,0.025)',
        border: addOn.enabled
          ? '1px solid rgba(99,102,241,0.2)'
          : '1px solid rgba(255,255,255,0.06)',
        cursor: 'default',
      }}
      whileDrag={{ scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 10 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Drag handle */}
        <button
          type="button"
          className="mt-1 flex-none cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors"
          aria-label="Drag to reorder"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={14} />
        </button>

        {/* Fields */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex gap-2">
            <input
              className={inputClass + ' flex-1'}
              placeholder={isHe ? 'שם השירות' : 'Service name'}
              value={addOn.label}
              onChange={e => onChange({ ...addOn, label: e.target.value })}
            />
            <div className="flex flex-col gap-0.5">
              <input
                type="number"
                min={0}
                className={inputClass + ' w-24'}
                placeholder="0"
                value={addOn.price || ''}
                onChange={e => onChange({ ...addOn, price: Number(e.target.value) || 0 })}
                title={isHe ? 'מחיר לפני מע"מ' : 'Price before VAT'}
              />
              {showVat && addOn.price > 0 && (
                <div
                  className="rounded-lg px-2 py-0.5 text-[9px] text-center font-semibold tabular-nums"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                >
                  +{isHe ? 'מע"מ' : 'VAT'} = {formatCurrency(vatTotal, currency)}
                </div>
              )}
            </div>
          </div>
          <input
            className={inputClass + ' text-xs'}
            placeholder={isHe ? 'תיאור קצר (אופציונלי)' : 'Short description (optional)'}
            value={addOn.description ?? ''}
            onChange={e => onChange({ ...addOn, description: e.target.value })}
          />
        </div>

        {/* Controls */}
        <div className="flex-none flex flex-col items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onChange({ ...addOn, enabled: !addOn.enabled })}
            className="transition-colors"
            style={{ color: addOn.enabled ? '#6366f1' : 'rgba(255,255,255,0.2)' }}
            aria-label={addOn.enabled ? 'Disable' : 'Enable'}
          >
            {addOn.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
          {/* Client-adjustable quantity toggle */}
          <button
            type="button"
            onClick={() => onChange({ ...addOn, clientAdjustable: !(addOn.clientAdjustable ?? true) })}
            className="transition-colors"
            title={isHe
              ? (addOn.clientAdjustable !== false ? 'לקוח יכול לשנות כמות — לחץ לנעילה' : 'כמות נעולה — לחץ לאפשר שינוי')
              : (addOn.clientAdjustable !== false ? 'Client can adjust qty — click to lock' : 'Qty locked — click to allow')}
            style={{ color: addOn.clientAdjustable !== false ? '#22c55e' : 'rgba(255,255,255,0.18)' }}
            aria-label="Toggle client quantity adjustment"
          >
            <SlidersHorizontal size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-white/20 transition-colors hover:text-red-400"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  )
}

// ─── Contract Template Picker ─────────────────────────────────────────────────

function ContractTemplatePicker({
  locale,
  onSelect,
}: {
  locale: string
  onSelect: (body: string) => void
}) {
  const isHe = locale === 'he'
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ContractTemplate['category'] | 'all'>('all')
  const [activeTemplate, setActiveTemplate] = useState<ContractTemplate | null>(null)
  const [vars, setVars] = useState<Record<string, string>>({})

  const categories = Array.from(new Set(CONTRACT_TEMPLATES.map(t => t.category)))
  const filtered = activeCategory === 'all'
    ? CONTRACT_TEMPLATES
    : CONTRACT_TEMPLATES.filter(t => t.category === activeCategory)

  const handleSelectTemplate = (tmpl: ContractTemplate) => {
    setActiveTemplate(tmpl)
    const defaults: Record<string, string> = {}
    tmpl.variables.forEach(v => { defaults[v.key] = v.defaultValue ?? '' })
    setVars(defaults)
  }

  const handleInsert = () => {
    if (!activeTemplate) return
    const body = interpolateTemplate(activeTemplate.bodyHe, vars)
    onSelect(body)
    setOpen(false)
    setActiveTemplate(null)
    setVars({})
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all"
        style={{
          background: open ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: '#818cf8',
        }}
      >
        <div className="flex items-center gap-2">
          <FileCheck size={13} />
          {isHe ? 'בחר תבנית חוזה מקצועי' : 'Attach Contract Template'}
        </div>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="mt-2 rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {!activeTemplate ? (
                <>
                  {/* Category tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-bold transition"
                      style={{
                        background: activeCategory === 'all' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                        color: activeCategory === 'all' ? '#818cf8' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {isHe ? 'הכל' : 'All'}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold transition"
                        style={{
                          background: activeCategory === cat ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                          color: activeCategory === cat ? '#818cf8' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {isHe ? CATEGORY_LABELS[cat].he : CATEGORY_LABELS[cat].en}
                      </button>
                    ))}
                  </div>

                  {/* Template list */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}>
                    {filtered.map(tmpl => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl)}
                        className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-start transition"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                      >
                        <span className="text-xs font-semibold text-white/80">{tmpl.titleHe}</span>
                        <span className="text-[10px] text-white/35">{tmpl.descHe}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Variable fill form */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70">{activeTemplate.titleHe}</span>
                    <button type="button" onClick={() => setActiveTemplate(null)} className="text-[10px] text-white/30 hover:text-white/60">
                      {isHe ? '← חזור' : '← Back'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {activeTemplate.variables.map(v => (
                      <div key={v.key} className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                          {isHe ? v.labelHe : v.labelEn}
                        </label>
                        <input
                          className={inputClass + ' py-2 text-xs'}
                          placeholder={v.defaultValue ?? ''}
                          value={vars[v.key] ?? ''}
                          onChange={e => setVars(prev => ({ ...prev, [v.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleInsert}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    <FileCheck size={12} />
                    {isHe ? 'הוסף חוזה להצעה' : 'Add Contract to Proposal'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main EditorPanel ─────────────────────────────────────────────────────────

export function EditorPanel({ draft, onChange, locale, isLocked = false }: EditorPanelProps) {
  const isHe = locale === 'he'
  const vatRate = getVatRate()
  const showVat = draft.include_vat

  // Totals with VAT
  const baseVat = showVat ? applyVat(draft.base_price, vatRate) : draft.base_price
  const totalAddOns = draft.add_ons.filter(a => a.enabled).reduce((s, a) => s + a.price, 0)
  const totalNet = draft.base_price + totalAddOns
  const totalVat = showVat ? vatAmount(totalNet, vatRate) : 0
  const grandTotal = totalNet + totalVat

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
  const handleAddSavedService = (addOn: AddOn) => {
    onChange({ add_ons: [...draft.add_ons, addOn] })
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
    }
    const brandColor = m['brand_color'] ?? null
    onChange({ creator_info: info, brand_color: brandColor })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Milestone helpers ───────────────────────────────────────────────────────
  const milestones: PaymentMilestone[] = draft.payment_milestones ?? []
  const milestoneSum = milestones.reduce((s, m) => s + m.percentage, 0)
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
    <div className="relative p-4 space-y-4" style={{ animation: 'ds-fade-up 0.35s ease-out both' }}>
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
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
              {isHe ? '🔒 הסכם חתום — נעול' : '🔒 Signed Agreement — Locked'}
            </p>
            <p className="text-[10px] text-emerald-400/60 mt-0.5">
              {isHe
                ? 'לא ניתן לערוך הצעה חתומה. לשינויים, יש לשכפל ולצור טיוטה חדשה.'
                : 'Signed proposals are immutable. To make changes, duplicate and create a new draft.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Read-only overlay (intercepts all pointer events when locked) ── */}
      {isLocked && (
        <div
          className="pointer-events-auto absolute inset-0 z-10 cursor-not-allowed"
          style={{ background: 'rgba(3,3,5,0.35)' }}
          title={isHe ? 'ההצעה נעולה לעריכה' : 'Proposal is locked for editing'}
          onClick={e => e.preventDefault()}
        />
      )}

      {/* ── Client Details ──────────────────────────────────────────────── */}
      <Section
        title={isHe ? 'פרטי לקוח' : 'Client Details'}
        icon={<User size={15} />}
      >
        <Field label={isHe ? 'שם הלקוח' : 'Client Name'} required>
          <input
            className={inputClass}
            placeholder={isHe ? 'שם מלא של הלקוח' : 'Client full name'}
            value={draft.client_name}
            onChange={e => onChange({ client_name: e.target.value })}
            autoComplete="off"
          />
        </Field>
        <Field label={isHe ? 'אימייל לקוח' : 'Client Email'} icon={<Mail size={10} />}>
          <input
            className={inputClass}
            type="email"
            placeholder="client@example.com"
            value={draft.client_email ?? ''}
            onChange={e => onChange({ client_email: e.target.value })}
            autoComplete="off"
          />
        </Field>

        {/* Access code */}
        <Field label={isHe ? 'קוד גישה (אופציונלי)' : 'Access Code (optional)'} icon={<Lock size={10} />}>
          <div className="relative">
            <input
              className={inputClass}
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
                <span className="text-[9px] font-bold text-indigo-400">
                  {isHe ? 'מוגן' : 'Protected'}
                </span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-white/25 mt-1">
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
          <input
            className={inputClass}
            placeholder={isHe ? 'למשל: חבילת תוכן חודשית' : 'e.g. Monthly Content Package'}
            value={draft.project_title}
            onChange={e => onChange({ project_title: e.target.value })}
          />
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

        {/* Expiry date */}
        <PremiumDatePicker
          value={draft.expires_at}
          onChange={iso => onChange({ expires_at: iso })}
          locale={locale}
          label={isHe ? 'תאריך תפוגה (אופציונלי)' : 'Expiry Date (optional)'}
          placeholder={isHe ? 'ללא תפוגה' : 'No expiry'}
          minDate={new Date()}
        />

        {/* Contract template */}
        <ContractTemplatePicker
          locale={locale}
          onSelect={body => {
            const existing = draft.description ?? ''
            onChange({ description: existing ? `${existing}\n\n---\n${body}` : body })
          }}
        />
      </Section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <Section
        title={isHe ? 'תמחור בסיסי' : 'Base Pricing'}
        icon={<DollarSign size={15} />}
      >
        <div className="flex gap-3">
          <Field label={isHe ? 'מחיר בסיס' : 'Base Price'} required>
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={draft.base_price || ''}
              onChange={e => onChange({ base_price: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label={isHe ? 'מטבע' : 'Currency'}>
            <select
              className={inputClass + ' appearance-none cursor-pointer'}
              value={draft.currency}
              onChange={e => onChange({ currency: e.target.value })}
            >
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value} style={{ background: '#0f0f18', color: 'white' }}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* VAT toggle */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: showVat ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
            border: showVat ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2">
            <Receipt size={13} className={showVat ? 'text-indigo-400' : 'text-white/30'} />
            <div>
              <p className="text-xs font-semibold text-white/70">
                {isHe ? `כלול מע"מ (${Math.round(vatRate * 100)}%)` : `Include VAT (${Math.round(vatRate * 100)}%)`}
              </p>
              {showVat && draft.base_price > 0 && (
                <p className="text-[10px] text-indigo-400/70">
                  {isHe
                    ? `בסיס: ${formatCurrency(draft.base_price, draft.currency)} → כולל מע"מ: ${formatCurrency(baseVat, draft.currency)}`
                    : `Base: ${formatCurrency(draft.base_price, draft.currency)} → with VAT: ${formatCurrency(baseVat, draft.currency)}`}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ include_vat: !showVat })}
            className="transition-colors"
            style={{ color: showVat ? '#6366f1' : 'rgba(255,255,255,0.2)' }}
          >
            {showVat ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {/* VAT summary when enabled */}
        {showVat && totalNet > 0 && (
          <div
            className="rounded-xl px-4 py-3 space-y-1.5"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{isHe ? 'לפני מע"מ' : 'Before VAT'}</span>
              <span className="tabular-nums font-semibold">{formatCurrency(totalNet, draft.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-indigo-400/70">
              <span>{isHe ? `מע"מ ${Math.round(vatRate * 100)}%` : `VAT ${Math.round(vatRate * 100)}%`}</span>
              <span className="tabular-nums">{formatCurrency(totalVat, draft.currency)}</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between text-sm font-bold text-white/90">
              <span>{isHe ? 'סה"כ לתשלום' : 'Total (incl. VAT)'}</span>
              <span className="tabular-nums" style={{ color: '#818cf8' }}>{formatCurrency(grandTotal, draft.currency)}</span>
            </div>
          </div>
        )}
      </Section>

      {/* ── Add-ons ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-indigo-400/80"><Plus size={15} /></span>
            <span className="text-sm font-semibold text-white/80">
              {isHe ? 'תוספות ושדרוגים' : 'Add-ons & Upgrades'}
            </span>
            {draft.add_ons.length > 0 && (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                {draft.add_ons.filter(a => a.enabled).length}/{draft.add_ons.length}
              </span>
            )}
          </div>
          {showVat && (
            <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-wider">
              {isHe ? 'מחיר לפני מע"מ' : 'Prices ex. VAT'}
            </span>
          )}
        </div>

        <div className="px-5 pb-5 space-y-3">
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
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {draft.add_ons.length === 0 && (
            <p className="text-center text-xs text-white/25 py-4">
              {isHe
                ? 'אין תוספות עדיין — הוסף שירותים אופציונליים ללקוח'
                : 'No add-ons yet — add optional services for your client'}
            </p>
          )}

          <motion.button
            type="button"
            onClick={handleAddNew}
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold text-indigo-400 transition-all duration-200"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={13} />
            {isHe ? 'הוסף תוספת חדשה' : 'Add New Add-on'}
          </motion.button>
        </div>
      </div>

      {/* ── Payment Milestones ──────────────────────────────────────────── */}
      <Section
        title={isHe ? 'אבני דרך לתשלום' : 'Payment Milestones'}
        icon={<Milestone size={15} />}
        defaultOpen={false}
        badge={milestones.length > 0 ? `${milestones.length}` : undefined}
      >
        {/* Explanation */}
        <p className="text-[11px] text-white/35 leading-relaxed">
          {isHe
            ? 'חלק את התשלום לשלבים. לחץ "הוסף אבן דרך" כדי להתחיל. הסכום חייב להגיע בדיוק ל-100%.'
            : 'Split the payment into stages. Click "Add Milestone" to start. All percentages must total exactly 100%.'}
        </p>

        {/* Quick presets — only shown when no milestones yet */}
        {milestones.length === 0 && (
          <div className="flex flex-wrap gap-2">
            <p className="w-full text-[10px] font-bold uppercase tracking-widest text-white/20">
              {isHe ? 'תבניות מהירות' : 'Quick presets'}
            </p>
            {[
              { label: isHe ? '50 / 50' : '50 / 50', splits: [50, 50], names: isHe ? ['מקדמה', 'סיום'] : ['Deposit', 'Final'] },
              { label: isHe ? '30 / 70' : '30 / 70', splits: [30, 70], names: isHe ? ['מקדמה', 'סיום'] : ['Deposit', 'Final'] },
              { label: isHe ? '33 / 33 / 34' : '33 / 33 / 34', splits: [33, 33, 34], names: isHe ? ['שלב א׳', 'שלב ב׳', 'סיום'] : ['Phase 1', 'Phase 2', 'Final'] },
              { label: isHe ? '25 / 25 / 50' : '25 / 25 / 50', splits: [25, 25, 50], names: isHe ? ['פתיחה', 'אמצע', 'סיום'] : ['Kickoff', 'Midpoint', 'Final'] },
            ].map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({
                  payment_milestones: preset.splits.map((pct, i) => ({
                    id: crypto.randomUUID(),
                    name: preset.names[i],
                    percentage: pct,
                  })),
                })}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Visual distribution bar */}
        {milestones.length > 0 && milestoneSum > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.05)' }}>
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
                    className="flex items-center gap-2 rounded-xl p-2.5"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Color dot */}
                    <div
                      className="h-2 w-2 rounded-full flex-none"
                      style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                    />
                    <input
                      className={inputClass + ' flex-1 py-2 text-xs'}
                      placeholder={isHe ? `שם שלב ${i + 1}` : `Stage ${i + 1} name`}
                      value={m.name}
                      onChange={e => updateMilestone(m.id, { name: e.target.value })}
                    />
                    {/* Amount preview */}
                    {milestoneAmt > 0 && (
                      <span className="text-[10px] tabular-nums text-white/30 flex-none">
                        {formatCurrency(milestoneAmt, draft.currency)}
                      </span>
                    )}
                    <div className="relative flex-none w-16">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className={inputClass + ' py-2 text-xs text-center pe-5'}
                        value={m.percentage || ''}
                        onChange={e => updateMilestone(m.id, { percentage: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                      />
                      <span className="absolute inset-y-0 end-2 flex items-center text-[10px] text-white/30 pointer-events-none">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMilestone(m.id)}
                      className="text-white/20 hover:text-red-400 transition-colors flex-none"
                      aria-label="Delete milestone"
                    >
                      <Trash2 size={13} />
                    </button>
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
            <span className="text-[11px] font-bold tabular-nums" style={{ color: milestonesOk ? '#22c55e' : milestoneSum > 100 ? '#f87171' : '#d4af37' }}>
              {milestoneSum}% / 100%
            </span>
            <span className="text-[10px]" style={{ color: milestonesOk ? 'rgba(34,197,94,0.7)' : milestoneSum > 100 ? '#f87171' : '#d4af37' }}>
              {milestonesOk
                ? (isHe ? '✓ מאוזן — מוכן לשליחה' : '✓ Balanced — ready to send')
                : milestoneSum > 100
                ? (isHe ? `חריגה של ${milestoneSum - 100}%` : `${milestoneSum - 100}% over`)
                : (isHe ? `חסר עוד ${100 - milestoneSum}%` : `${100 - milestoneSum}% remaining`)}
            </span>
          </div>
        )}

        <motion.button
          type="button"
          onClick={addMilestone}
          className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold text-indigo-400 transition-all duration-200"
          style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={13} />
          {isHe ? 'הוסף אבן דרך' : 'Add Milestone'}
        </motion.button>
      </Section>

      {/* ── AI Ghostwriter ───────────────────────────────────────────────── */}
      <AIGhostwriter
        locale={locale}
        onGenerate={onChange}
      />

      {/* ── Saved Services library ──────────────────────────────────────── */}
      <ReusableServices
        currency={draft.currency}
        locale={locale}
        onAddToProposal={handleAddSavedService}
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
        <p className="text-[11px] text-white/35 leading-relaxed mb-2">
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
                className="w-full text-start rounded-xl px-3.5 py-3 transition-all"
                style={{
                  background: selected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                  border: selected ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: selected ? '0 0 12px rgba(99,102,241,0.12)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-xs font-bold"
                    style={{ color: selected ? '#c4b5fd' : 'rgba(255,255,255,0.65)' }}
                  >
                    {isHe ? tmpl.label_he : tmpl.label_en}
                  </span>
                  {selected && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                      {isHe ? '✓ נבחר' : '✓ Selected'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] leading-relaxed line-clamp-2"
                  style={{ color: selected ? 'rgba(196,181,253,0.55)' : 'rgba(255,255,255,0.28)' }}
                >
                  {isHe ? tmpl.message_he : tmpl.message_en}
                </p>
              </button>
            )
          })}
        </div>
      </Section>

      <div className="h-8" />
    </div>
  )
}

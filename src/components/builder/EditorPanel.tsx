import { useState } from 'react'
import { Reorder, motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Briefcase, FileText, DollarSign,
  Plus, GripVertical, Trash2, ToggleLeft, ToggleRight,
  ChevronDown,
} from 'lucide-react'
import type { ProposalInsert, AddOn } from '../../types/proposal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  draft: ProposalInsert
  onChange: (patch: Partial<ProposalInsert>) => void
  locale: string
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title, icon, children, defaultOpen = true,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
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

const textareaClass = [
  inputClass, 'resize-none leading-relaxed',
].join(' ')

// ─── Currency selector ────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: 'ILS', label: '₪ ILS' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
]

// ─── Add-on row (draggable) ───────────────────────────────────────────────────

function AddOnRow({
  addOn,
  locale,
  onChange,
  onDelete,
}: {
  addOn: AddOn
  locale: string
  onChange: (updated: AddOn) => void
  onDelete: () => void
}) {
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
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        zIndex: 10,
      }}
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
              placeholder={locale === 'he' ? 'שם השירות' : 'Service name'}
              value={addOn.label}
              onChange={e => onChange({ ...addOn, label: e.target.value })}
            />
            <input
              type="number"
              min={0}
              className={inputClass + ' w-24'}
              placeholder="0"
              value={addOn.price || ''}
              onChange={e => onChange({ ...addOn, price: Number(e.target.value) || 0 })}
            />
          </div>
          {/* Optional description */}
          <input
            className={inputClass + ' text-xs'}
            placeholder={locale === 'he' ? 'תיאור קצר (אופציונלי)' : 'Short description (optional)'}
            value={addOn.description ?? ''}
            onChange={e => onChange({ ...addOn, description: e.target.value })}
          />
        </div>

        {/* Right controls: toggle + delete */}
        <div className="flex-none flex flex-col items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onChange({ ...addOn, enabled: !addOn.enabled })}
            className="transition-colors"
            style={{ color: addOn.enabled ? '#6366f1' : 'rgba(255,255,255,0.2)' }}
            aria-label={addOn.enabled ? 'Disable add-on' : 'Enable add-on'}
          >
            {addOn.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-white/20 transition-colors hover:text-red-400"
            aria-label="Delete add-on"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  )
}

// ─── Main EditorPanel ─────────────────────────────────────────────────────────

export function EditorPanel({ draft, onChange, locale }: EditorPanelProps) {
  // ── Add-on helpers ────────────────────────────────────────────────────────
  const handleAddOnChange = (index: number, updated: AddOn) => {
    const next = draft.add_ons.map((a, i) => i === index ? updated : a)
    onChange({ add_ons: next })
  }

  const handleAddOnDelete = (index: number) => {
    const next = draft.add_ons.filter((_, i) => i !== index)
    onChange({ add_ons: next })
  }

  const handleAddNew = () => {
    const newAddOn: AddOn = {
      id: crypto.randomUUID(),
      label: '',
      description: '',
      price: 0,
      enabled: true,
    }
    onChange({ add_ons: [...draft.add_ons, newAddOn] })
  }

  return (
    <div className="p-4 space-y-4" style={{ animation: 'ds-fade-up 0.35s ease-out both' }}>

      {/* ── Client Details ─────────────────────────────────────────────── */}
      <Section
        title={locale === 'he' ? 'פרטי לקוח' : 'Client Details'}
        icon={<User size={15} />}
      >
        <Field label={locale === 'he' ? 'שם הלקוח' : 'Client Name'} required>
          <input
            className={inputClass}
            placeholder={locale === 'he' ? 'שם מלא של הלקוח' : 'Client full name'}
            value={draft.client_name}
            onChange={e => onChange({ client_name: e.target.value })}
            autoComplete="off"
          />
        </Field>

        <Field label={locale === 'he' ? 'אימייל לקוח' : 'Client Email'} icon={<Mail size={10} />}>
          <input
            className={inputClass}
            type="email"
            placeholder={locale === 'he' ? 'client@example.com' : 'client@example.com'}
            value={draft.client_email ?? ''}
            onChange={e => onChange({ client_email: e.target.value })}
            autoComplete="off"
          />
        </Field>
      </Section>

      {/* ── Project Info ───────────────────────────────────────────────── */}
      <Section
        title={locale === 'he' ? 'פרטי הפרויקט' : 'Project Info'}
        icon={<Briefcase size={15} />}
      >
        <Field label={locale === 'he' ? 'שם הפרויקט' : 'Project Title'} required>
          <input
            className={inputClass}
            placeholder={locale === 'he' ? 'למשל: חבילת תוכן חודשית' : 'e.g. Monthly Content Package'}
            value={draft.project_title}
            onChange={e => onChange({ project_title: e.target.value })}
          />
        </Field>

        <Field label={locale === 'he' ? 'תיאור / מה כלול' : 'Description / What\'s Included'} icon={<FileText size={10} />}>
          <textarea
            className={textareaClass}
            rows={4}
            placeholder={
              locale === 'he'
                ? 'תארו בקצרה מה כולל הפרויקט, מה הלקוח יקבל ואיך תראה ההצלחה...'
                : 'Describe what\'s included, what the client will receive, and what success looks like...'
            }
            value={draft.description ?? ''}
            onChange={e => onChange({ description: e.target.value })}
          />
        </Field>
      </Section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <Section
        title={locale === 'he' ? 'תמחור בסיסי' : 'Base Pricing'}
        icon={<DollarSign size={15} />}
      >
        <div className="flex gap-3">
          <Field label={locale === 'he' ? 'מחיר בסיס' : 'Base Price'} required>
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={draft.base_price || ''}
              onChange={e => onChange({ base_price: Number(e.target.value) || 0 })}
            />
          </Field>

          <Field label={locale === 'he' ? 'מטבע' : 'Currency'}>
            <select
              className={inputClass + ' appearance-none cursor-pointer'}
              value={draft.currency}
              onChange={e => onChange({ currency: e.target.value })}
            >
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value}
                  style={{ background: '#0f0f18', color: 'white' }}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
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
              {locale === 'he' ? 'תוספות ושדרוגים' : 'Add-ons & Upgrades'}
            </span>
            {draft.add_ons.length > 0 && (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                {draft.add_ons.filter(a => a.enabled).length}/{draft.add_ons.length}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {/* Draggable list */}
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
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {/* Empty state */}
          {draft.add_ons.length === 0 && (
            <p className="text-center text-xs text-white/25 py-4">
              {locale === 'he'
                ? 'אין תוספות עדיין — הוסף שירותים אופציונליים ללקוח'
                : 'No add-ons yet — add optional services for your client'}
            </p>
          )}

          {/* Add new button */}
          <motion.button
            type="button"
            onClick={handleAddNew}
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold text-indigo-400 transition-all duration-200"
            style={{
              borderColor: 'rgba(99,102,241,0.25)',
              background: 'rgba(99,102,241,0.06)',
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={13} />
            {locale === 'he' ? 'הוסף תוספת חדשה' : 'Add New Add-on'}
          </motion.button>
        </div>
      </div>

      {/* Bottom padding for scrollable area */}
      <div className="h-8" />
    </div>
  )
}

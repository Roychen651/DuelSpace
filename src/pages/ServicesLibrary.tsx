import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit3, Save, Percent } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { DEFAULT_VAT_RATE, applyVat, vatAmount, formatCurrency } from '../types/proposal'
import type { SavedService } from '../components/builder/ReusableServices'

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dealspace:saved-services'

function load(): SavedService[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function save(s: SavedService[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}
function getVatRate(): number {
  const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? '')
  return isNaN(v) ? DEFAULT_VAT_RATE : v
}

// ─── Input style helper ───────────────────────────────────────────────────────

const inputBase = [
  'w-full rounded-xl border bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-white/20',
  'outline-none transition-all border-white/[0.1]',
].join(' ')

// ─── Service Form ─────────────────────────────────────────────────────────────

interface ServiceFormProps {
  initial?: SavedService
  currency: string
  locale: string
  vatRate: number
  onSave: (s: SavedService) => void
  onCancel: () => void
}

function ServiceForm({ initial, currency, locale, vatRate, onSave, onCancel }: ServiceFormProps) {
  const isHe = locale === 'he'
  const [label, setLabel] = useState(initial?.label ?? '')
  const [desc, setDesc] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')

  const priceNum = Number(price)
  const canSave = label.trim() && price && priceNum > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      label: label.trim(),
      description: desc.trim(),
      price: priceNum,
      currency,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 space-y-3"
      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.18)' }}
    >
      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
        {isHe ? (initial ? 'ערוך שירות' : 'שירות חדש') : (initial ? 'Edit Service' : 'New Service')}
      </p>

      <input
        className={inputBase}
        placeholder={isHe ? 'שם השירות *' : 'Service name *'}
        value={label}
        onChange={e => setLabel(e.target.value)}
        autoFocus
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
      />
      <input
        className={inputBase}
        placeholder={isHe ? 'תיאור (אופציונלי)' : 'Description (optional)'}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
      />

      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            type="number"
            min={0}
            className={inputBase}
            style={{ appearance: 'textfield', WebkitAppearance: 'none', MozAppearance: 'textfield' } as React.CSSProperties}
            placeholder={isHe ? `מחיר לפני מע"מ` : 'Price (excl. VAT)'}
            value={price}
            onChange={e => setPrice(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {price && priceNum > 0 && (
          <div
            className="rounded-xl px-3 py-2.5 text-[10px] flex flex-col gap-0.5 flex-none"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <span className="text-indigo-400 font-bold">
              {formatCurrency(applyVat(priceNum, vatRate), currency)}
            </span>
            <span className="text-white/35">
              {isHe ? `מע"מ` : 'VAT'}: +{formatCurrency(vatAmount(priceNum, vatRate), currency)}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSave}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Save size={12} />
          {isHe ? 'שמור שירות' : 'Save Service'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-3 py-2 text-xs text-white/40 transition hover:text-white/70"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {isHe ? 'ביטול' : 'Cancel'}
        </button>
      </div>
    </motion.form>
  )
}

// ─── Service Row ──────────────────────────────────────────────────────────────

interface ServiceRowProps {
  service: SavedService
  vatRate: number
  locale: string
  onEdit: () => void
  onDelete: () => void
}

function ServiceRow({ service, vatRate, locale, onEdit, onDelete }: ServiceRowProps) {
  const isHe = locale === 'he'
  const [showVat, setShowVat] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-4 rounded-2xl px-5 py-4"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{service.label}</p>
        {service.description && (
          <p className="text-xs text-white/35 truncate mt-0.5">{service.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-sm font-black text-indigo-300 tabular-nums">
            {formatCurrency(service.price, service.currency)}
          </span>
          <button
            type="button"
            onClick={() => setShowVat(v => !v)}
            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold transition"
            style={{
              background: showVat ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: showVat ? '#818cf8' : 'rgba(255,255,255,0.3)',
            }}
          >
            <Percent size={9} />
            {isHe ? `כולל מע"מ` : 'incl. VAT'}
          </button>
          {showVat && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-bold text-white/50 tabular-nums"
            >
              {formatCurrency(applyVat(service.price, vatRate), service.currency)}
            </motion.span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-none">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/8 hover:text-indigo-400"
          title={isHe ? 'ערוך' : 'Edit'}
        >
          <Edit3 size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
          title={isHe ? 'מחק' : 'Delete'}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── ServicesLibrary page ─────────────────────────────────────────────────────

export default function ServicesLibrary() {
  const { locale } = useI18n()
  const isHe = locale === 'he'

  const [services, setServices] = useState<SavedService[]>(load)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const vatRate = getVatRate()
  const currency = 'ILS'

  useEffect(() => { save(services) }, [services])

  const totalValue = services.reduce((sum, s) => sum + s.price, 0)

  const handleSave = (s: SavedService) => {
    setServices(prev => {
      const idx = prev.findIndex(x => x.id === s.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = s
        return next
      }
      return [s, ...prev]
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const editingService = services.find(s => s.id === editingId)

  return (
    <div
      className="min-h-dvh"
      style={{ background: '#030305' }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <style>{`@keyframes ds-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} } input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{display:none}`}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Page heading */}
        <div className="flex items-center justify-between" style={{ animation: 'ds-fade-up 0.4s ease-out both' }}>
          <div>
            <h1 className="text-xl font-black text-white">{isHe ? 'ספריית שירותים' : 'Services Library'}</h1>
            <p className="text-xs text-white/35 mt-0.5">{isHe ? 'ניהול שירותים שמורים לשימוש חוזר בהצעות' : 'Manage saved services for reuse in proposals'}</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition"
            style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)', boxShadow: '0 0 12px rgba(212,175,55,0.3)' }}
          >
            <Plus size={13} />
            {isHe ? 'שירות חדש' : 'New Service'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3" style={{ animation: 'ds-fade-up 0.4s ease-out 0.05s both' }}>
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/35 mb-1">{isHe ? 'שירותים שמורים' : 'Saved services'}</p>
            <p className="text-2xl font-black text-white">{services.length}</p>
          </div>
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/35 mb-1">{isHe ? 'שווי קטלוג' : 'Catalog value'}</p>
            <p className="text-xl font-black text-amber-400 tabular-nums">{formatCurrency(totalValue, currency)}</p>
          </div>
        </div>

        {/* Form */}
        <AnimatePresence>
          {(showForm || editingId) && (
            <div style={{ animation: 'ds-fade-up 0.3s ease-out both' }}>
              <ServiceForm
                key={editingId ?? 'new'}
                initial={editingService}
                currency={currency}
                locale={locale}
                vatRate={vatRate}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingId(null) }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="space-y-3" style={{ animation: 'ds-fade-up 0.4s ease-out 0.1s both' }}>
          {services.length === 0 && !showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <div className="text-4xl">📦</div>
              <div>
                <p className="text-sm font-semibold text-white/40 mb-1">
                  {isHe ? 'אין שירותים שמורים' : 'No saved services'}
                </p>
                <p className="text-xs text-white/25">
                  {isHe
                    ? 'שמור שירותים שאתה מוסיף לעתים קרובות להצעות המחיר'
                    : 'Save services you frequently add to proposals'}
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f59e0b)' }}
              >
                <Plus size={13} />
                {isHe ? 'הוסף שירות ראשון' : 'Add first service'}
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {services.map(service => (
              editingId === service.id ? null : (
                <ServiceRow
                  key={service.id}
                  service={service}
                  vatRate={vatRate}
                  locale={locale}
                  onEdit={() => { setEditingId(service.id); setShowForm(false) }}
                  onDelete={() => handleDelete(service.id)}
                />
              )
            ))}
          </AnimatePresence>
        </div>
      </main>
      <GlobalFooter />
    </div>
  )
}

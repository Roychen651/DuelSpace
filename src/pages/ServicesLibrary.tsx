import { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Plus, Trash2, Edit3, Save, Percent, Layers, X } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { DEFAULT_VAT_RATE, formatCurrency } from '../types/proposal'
import { useServicesStore, type Service, type ServiceInsert } from '../stores/useServicesStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVatRate(): number {
  const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? '')
  return isNaN(v) ? DEFAULT_VAT_RATE : v
}

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
}
function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
  e.currentTarget.style.boxShadow = 'none'
}

const inputBase = [
  'w-full rounded-xl border bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-white/20',
  'outline-none transition-all border-white/[0.1]',
].join(' ')

// ─── Service Form Modal ───────────────────────────────────────────────────────

interface ServiceFormProps {
  initial?: Service
  currency: string
  locale: string
  vatRate: number
  saving: boolean
  onSave: (d: ServiceInsert) => void
  onCancel: () => void
}

function ServiceForm({ initial, currency, locale, vatRate, saving, onSave, onCancel }: ServiceFormProps) {
  const isHe = locale === 'he'
  const [label, setLabel] = useState(initial?.label ?? '')
  const [desc, setDesc] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')

  const priceNum = Number(price)
  const canSave = label.trim() && priceNum > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || saving) return
    onSave({ label: label.trim(), description: desc.trim() || null, price: priceNum })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring' as const, stiffness: 380, damping: 28 }}
        className="w-full max-w-md rounded-3xl p-6 space-y-4"
        style={{
          background: 'linear-gradient(160deg, rgba(22,22,36,0.99) 0%, rgba(12,12,22,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-white">
            {isHe ? (initial ? 'עריכת שירות' : 'שירות חדש') : (initial ? 'Edit Service' : 'New Service')}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-white/30 transition hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <X size={13} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className={inputBase}
            placeholder={isHe ? 'שם השירות *' : 'Service name *'}
            value={label}
            onChange={e => setLabel(e.target.value)}
            autoFocus
            onFocus={focusInput}
            onBlur={blurInput}
          />
          <textarea
            rows={2}
            className={inputBase + ' resize-none'}
            placeholder={isHe ? 'תיאור (אופציונלי)' : 'Description (optional)'}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
          />

          <input
            type="number"
            min={0}
            inputMode="decimal"
            className={inputBase}
            placeholder={isHe ? `מחיר לפני מע"מ *` : 'Price (excl. VAT) *'}
            value={price}
            onChange={e => setPrice(e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
          />

          {/* VAT summary row — appears only when price is entered */}
          {priceNum > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-xl px-3 py-2"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <span className="text-[10px] text-white/35">
                {isHe ? `מתוכם מע"מ (${Math.round(vatRate * 100)}%)` : `Of which VAT (${Math.round(vatRate * 100)}%)`}
              </span>
              <span className="text-[10px] text-white/30 tabular-nums">
                {formatCurrency(Math.round(priceNum - priceNum / (1 + vatRate)), currency)}
              </span>
            </motion.div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="flex flex-1 items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold text-white transition disabled:opacity-40 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {saving
                ? <span className="animate-pulse">{isHe ? 'שומר…' : 'Saving…'}</span>
                : <><Save size={12} /><span>{isHe ? 'שמור שירות' : 'Save Service'}</span></>
              }
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-none h-9 rounded-xl px-4 text-xs text-white/40 transition hover:text-white/70 whitespace-nowrap"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {isHe ? 'ביטול' : 'Cancel'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Service Row ──────────────────────────────────────────────────────────────

function ServiceRow({ service, vatRate, locale, onEdit, onDelete }: {
  service: Service
  vatRate: number
  locale: string
  onEdit: () => void
  onDelete: () => void
}) {
  const isHe = locale === 'he'
  const [showVat, setShowVat] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' as const }}
      className="flex items-center gap-4 rounded-2xl px-5 py-4"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">{service.label}</p>
        {service.description && (
          <p className="text-xs text-white/35 truncate mt-0.5">{service.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowVat(v => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-0.5 transition-all"
            style={{
              background: showVat ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <span
              className="text-sm font-black tabular-nums"
              style={{ color: '#a5b4fc' }}
            >
              {formatCurrency(service.price, 'ILS')}
            </span>
            <span className="text-[9px] font-semibold" style={{ color: showVat ? '#818cf8' : 'rgba(255,255,255,0.3)' }}>
              {showVat
                ? (isHe ? `כולל מע"מ` : 'incl. VAT')
                : (isHe ? `ללא מע"מ` : 'no VAT')}
            </span>
            <Percent size={8} style={{ color: showVat ? '#818cf8' : 'rgba(255,255,255,0.2)' }} />
          </button>
          {showVat && (
            <span className="text-[10px] text-white/25 tabular-nums">
              {isHe ? 'מתוכם מע"מ' : 'VAT incl.'}: {formatCurrency(Math.round(service.price - service.price / (1 + vatRate)), 'ILS')}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-none">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/[0.08] hover:text-indigo-400"
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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ locale, onAdd }: { locale: string; onAdd: () => void }) {
  const isHe = locale === 'he'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' as const }}
      className="flex flex-col items-center gap-6 py-20 text-center"
    >
      <style>{`
        @keyframes svc-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes svc-orbit  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes svc-shimmer{ 0%{transform:translateX(-140%)} 60%,100%{transform:translateX(140%)} }
      `}</style>

      <div className="relative">
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(212,175,55,0.12) 0%, rgba(245,158,11,0.07) 100%)',
            border: '1px solid rgba(212,175,55,0.25)',
            boxShadow: '0 0 48px rgba(212,175,55,0.12)',
            animation: 'svc-float 5s ease-in-out infinite',
          }}
        >
          <Layers size={36} className="text-amber-400/70" />
        </div>
        <div
          className="absolute rounded-full"
          style={{
            width: 8, height: 8, top: -4, left: '50%', marginLeft: -4,
            background: '#d4af37', boxShadow: '0 0 10px #d4af37',
            animation: 'svc-orbit 8s linear infinite',
            transformOrigin: '4px 56px',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.18) 0%, transparent 65%)',
            filter: 'blur(16px)',
            transform: 'scale(1.4)',
          }}
        />
      </div>

      <div className="space-y-2">
        <h3
          className="text-xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          dir={isHe ? 'rtl' : 'ltr'}
        >
          {isHe ? 'הקטלוג שלך מחכה' : 'Your catalog awaits'}
        </h3>
        <p className="text-sm text-white/35 max-w-xs mx-auto leading-relaxed" dir={isHe ? 'rtl' : 'ltr'}>
          {isHe
            ? 'שמור שירותים חוזרים פעם אחת — הזרק אותם להצעות בשתי לחיצות. חסוך זמן, שמור על אחידות.'
            : 'Save recurring services once — inject them into proposals in two clicks. Save time, stay consistent.'}
        </p>
      </div>

      <motion.button
        onClick={onAdd}
        className="relative flex items-center gap-2 rounded-xl px-6 h-9 text-sm font-bold text-white overflow-hidden whitespace-nowrap"
        style={{
          background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
          boxShadow: '0 0 28px rgba(212,175,55,0.35)',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
      >
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.2) 50%, transparent 62%)',
            animation: 'svc-shimmer 3s ease-in-out infinite',
          }}
        />
        <Plus size={15} />
        {isHe ? 'הוסף שירות ראשון' : 'Add first service'}
      </motion.button>
    </motion.div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-[72px] rounded-2xl animate-pulse"
          style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  )
}

// ─── ServicesLibrary page ─────────────────────────────────────────────────────

export default function ServicesLibrary() {
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const vatRate = getVatRate()

  const { services, loading, fetchServices, createService, updateService, deleteService } = useServicesStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchServices() }, [fetchServices])

  const totalValue = services.reduce((sum, s) => sum + s.price, 0)
  const editingService = services.find(s => s.id === editingId)

  const handleSave = async (data: ServiceInsert) => {
    setSaving(true)
    if (editingId) {
      await updateService(editingId, data)
      setEditingId(null)
    } else {
      await createService(data)
      setShowForm(false)
    }
    setSaving(false)
  }

  const cardIn: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' as const } }),
  }

  return (
    <div className="min-h-dvh" style={{ background: '#030305' }} dir={isHe ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes ds-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { display: none; }
      `}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* ── Page heading ── */}
        <motion.div
          custom={0} variants={cardIn} initial="hidden" animate="visible"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-black text-white">
              {isHe ? 'ספריית שירותים' : 'Services Library'}
            </h1>
            <p className="text-xs text-white/35 mt-0.5">
              {isHe
                ? 'ניהול שירותים שמורים לשימוש חוזר בהצעות'
                : 'Manage saved services for reuse in proposals'}
            </p>
          </div>
          <motion.button
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="flex-none flex items-center gap-1.5 rounded-xl px-3 h-9 text-xs font-bold text-white transition"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
              boxShadow: '0 0 12px rgba(212,175,55,0.3)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
          >
            <Plus size={13} />
            <span className="whitespace-nowrap">{isHe ? 'שירות חדש' : 'New Service'}</span>
          </motion.button>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          custom={1} variants={cardIn} initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-3"
        >
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs text-white/35 mb-1">{isHe ? 'שירותים שמורים' : 'Saved services'}</p>
            {loading && services.length === 0
              ? <div className="h-8 w-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
              : <p className="text-2xl font-black text-white">{services.length}</p>
            }
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs text-white/35 mb-1">{isHe ? 'שווי קטלוג' : 'Catalog value'}</p>
            {loading && services.length === 0
              ? <div className="h-8 w-24 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
              : <p className="text-xl font-black text-amber-400 tabular-nums">{formatCurrency(totalValue, 'ILS')}</p>
            }
          </div>
        </motion.div>

        {/* ── Loading skeleton ── */}
        {loading && services.length === 0 && <SkeletonRows />}

        {/* ── Empty state ── */}
        {!loading && services.length === 0 && !showForm && (
          <EmptyState locale={locale} onAdd={() => setShowForm(true)} />
        )}

        {/* ── Service list ── */}
        {services.length > 0 && (
          <motion.div
            custom={2} variants={cardIn} initial="hidden" animate="visible"
            className="space-y-3"
          >
            <AnimatePresence>
              {services.map(service =>
                editingId === service.id ? null : (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    vatRate={vatRate}
                    locale={locale}
                    onEdit={() => { setEditingId(service.id); setShowForm(false) }}
                    onDelete={() => deleteService(service.id)}
                  />
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="h-4" />
      </main>

      <GlobalFooter />

      {/* ── Form modal ── */}
      <AnimatePresence>
        {(showForm || editingId) && (
          <ServiceForm
            key={editingId ?? 'new'}
            initial={editingService}
            currency="ILS"
            locale={locale}
            vatRate={vatRate}
            saving={saving}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingId(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Plus, Trash2, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { DEFAULT_VAT_RATE, applyVat, vatAmount, formatCurrency } from '../../types/proposal'
import type { AddOn } from '../../types/proposal'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SavedService {
  id: string
  label: string
  description: string
  price: number
  currency: string
  createdAt: string
}

const STORAGE_KEY = 'dealspace:saved-services'

function loadServices(): SavedService[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedService[]) : []
  } catch {
    return []
  }
}

function saveServices(services: SavedService[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
}

function getVatRate(): number {
  const stored = localStorage.getItem('dealspace:vat-rate')
  return stored ? parseFloat(stored) : DEFAULT_VAT_RATE
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReusableServicesProps {
  currency: string
  locale: string
  onAddToProposal: (addOn: AddOn) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReusableServices({ currency, locale, onAddToProposal }: ReusableServicesProps) {
  const isHe = locale === 'he'
  const vatRate = getVatRate()

  const [services, setServices] = useState<SavedService[]>(loadServices)
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [showVat, setShowVat] = useState(false)

  useEffect(() => {
    saveServices(services)
  }, [services])

  const handleSaveService = () => {
    if (!newLabel.trim() || !newPrice) return
    const price = Number(newPrice)
    const service: SavedService = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      description: newDesc.trim(),
      price,
      currency,
      createdAt: new Date().toISOString(),
    }
    setServices(prev => [service, ...prev])
    setNewLabel('')
    setNewDesc('')
    setNewPrice('')
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const handleAdd = (service: SavedService) => {
    const addOn: AddOn = {
      id: crypto.randomUUID(),
      label: service.label,
      description: service.description,
      price: service.price,
      enabled: true,
    }
    onAddToProposal(addOn)
  }

  const inputCls = [
    'w-full rounded-xl border bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/20',
    'outline-none transition-all border-white/[0.1] focus:border-indigo-400/60',
    'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]',
  ].join(' ')

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-amber-400/80"><Bookmark size={15} /></span>
          <span className="text-sm font-semibold text-white/80">
            {isHe ? 'שירותים שמורים' : 'Saved Services'}
          </span>
          {services.length > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              {services.length}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 space-y-3">

              {/* VAT display toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowVat(v => !v)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition"
                  style={{
                    background: showVat ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                    border: showVat ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: showVat ? '#818cf8' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {showVat
                    ? (isHe ? `כולל מע"מ (${Math.round(vatRate * 100)}%)` : `Incl. VAT (${Math.round(vatRate * 100)}%)`)
                    : (isHe ? `הצג כולל מע"מ` : 'Show with VAT')}
                </button>
              </div>

              {/* Service list */}
              {services.length === 0 && !showForm && (
                <p className="text-center text-xs text-white/25 py-3">
                  {isHe
                    ? 'שמור שירותים שאתה מוסיף לעתים קרובות'
                    : 'Save services you frequently add to proposals'}
                </p>
              )}

              <AnimatePresence>
                {services.map(service => {
                  const displayPrice = showVat
                    ? applyVat(service.price, vatRate)
                    : service.price
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/85 truncate">{service.label}</p>
                        {service.description && (
                          <p className="text-xs text-white/35 truncate">{service.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-indigo-300">
                            {formatCurrency(displayPrice, service.currency || currency)}
                          </span>
                          {showVat && (
                            <span className="text-[9px] text-white/30">
                              ({isHe ? 'לפני מע"מ' : 'ex. VAT'}: {formatCurrency(service.price, service.currency || currency)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-none">
                        <button
                          type="button"
                          onClick={() => handleAdd(service)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-indigo-400 transition hover:bg-indigo-500/15"
                          style={{ border: '1px solid rgba(99,102,241,0.25)' }}
                          title={isHe ? 'הוסף להצעה' : 'Add to proposal'}
                        >
                          <Zap size={10} />
                          {isHe ? 'הוסף' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 transition hover:text-red-400"
                          title={isHe ? 'מחק' : 'Delete'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* New service form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2 rounded-xl p-3"
                    style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}
                  >
                    <input
                      className={inputCls}
                      placeholder={isHe ? 'שם השירות *' : 'Service name *'}
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      autoFocus
                    />
                    <input
                      className={inputCls}
                      placeholder={isHe ? 'תיאור (אופציונלי)' : 'Description (optional)'}
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        className={inputCls + ' flex-1'}
                        placeholder={isHe ? `מחיר (לפני מע"מ)` : 'Price (before VAT)'}
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                      />
                      {newPrice && (
                        <div
                          className="flex flex-col justify-center rounded-xl px-3 text-[10px] font-bold flex-none"
                          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                        >
                          <span>{isHe ? `כולל מע"מ` : 'with VAT'}</span>
                          <span>{formatCurrency(applyVat(Number(newPrice), vatRate), currency)}</span>
                          <span className="text-white/30 font-normal">
                            {isHe ? `מע"מ` : 'VAT'}: {formatCurrency(vatAmount(Number(newPrice), vatRate), currency)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveService}
                        disabled={!newLabel.trim() || !newPrice}
                        className="flex-1 rounded-xl py-2 text-xs font-bold text-white transition disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                      >
                        {isHe ? 'שמור שירות' : 'Save Service'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="rounded-xl px-3 py-2 text-xs text-white/40 transition hover:text-white/70"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {isHe ? 'ביטול' : 'Cancel'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add new service button */}
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold text-amber-400 transition-all"
                  style={{
                    borderColor: 'rgba(212,175,55,0.25)',
                    background: 'rgba(212,175,55,0.06)',
                  }}
                >
                  <Plus size={13} />
                  {isHe ? 'שמור שירות חדש' : 'Save New Service'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { X, Check, Search, Layers, Zap } from 'lucide-react'
import { useServicesStore } from '../../stores/useServicesStore'
import { formatCurrency } from '../../types/proposal'
import type { AddOn } from '../../types/proposal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReusableServicesProps {
  open: boolean
  onClose: () => void
  currency: string
  locale: string
  onInject: (addOns: AddOn[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReusableServices({ open, onClose, currency, locale, onInject }: ReusableServicesProps) {
  const isHe = locale === 'he'
  const { services, loading, fetchServices } = useServicesStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')

  // Fetch on open (no-op if data already loaded); reset selection every open
  useEffect(() => {
    if (open) {
      fetchServices()
      setSelected(new Set())
      setQuery('')
    }
  }, [open, fetchServices])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const filtered = services.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase()) ||
    (s.description ?? '').toLowerCase().includes(query.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleInject = () => {
    const addOns: AddOn[] = services
      .filter(s => selected.has(s.id))
      .map(s => ({
        // CRITICAL: always generate a fresh UUID for the injected add-on.
        // Using the service's DB id would mutate historical proposals if the
        // library entry is ever edited or deleted.
        id: crypto.randomUUID(),
        label: s.label,
        description: s.description ?? '',
        price: s.price,
        enabled: true,
      }))
    onInject(addOns)
    onClose()
  }

  // ── Animation variants ────────────────────────────────────────────────────

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18, delay: 0.05 } },
  }

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 36, scale: 0.97 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring' as const, stiffness: 360, damping: 28, delay: 0.04 },
    },
    exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.18 } },
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <style>{`@keyframes reuse-shimmer { 0%{transform:translateX(-140%)} 60%,100%{transform:translateX(140%)} }`}</style>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
          >
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              dir={isHe ? 'rtl' : 'ltr'}
              className="w-full max-w-lg flex flex-col rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(22,22,36,0.99) 0%, rgba(12,12,22,0.99) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)',
                maxHeight: '82vh',
              }}
            >

              {/* ── Header ── */}
              <div
                className="flex items-center gap-3 px-5 py-4 flex-none"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(245,158,11,0.1))',
                    border: '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  <Layers size={14} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white">
                    {isHe ? 'ספריית שירותים' : 'Services Library'}
                  </p>
                  <p className="text-[10px] text-white/35">
                    {isHe ? 'בחר שירותים להוספה להצעה' : 'Select services to inject into the proposal'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-none flex h-7 w-7 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/[0.08] hover:text-white/70"
                >
                  <X size={14} />
                </button>
              </div>

              {/* ── Search — shown when > 3 services ── */}
              {services.length > 3 && (
                <div className="px-5 pt-3 pb-1 flex-none">
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      style={{ [isHe ? 'right' : 'left']: 12 }}
                    />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={isHe ? 'חיפוש שירות…' : 'Search services…'}
                      className="w-full rounded-xl border bg-white/[0.05] py-2 text-sm text-white placeholder-white/20 outline-none transition-all"
                      style={{
                        border: '1px solid rgba(255,255,255,0.09)',
                        paddingInlineStart: 36,
                        paddingInlineEnd: 12,
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── Service list ── */}
              <div
                className="flex-1 overflow-y-auto px-5 py-3 space-y-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.3) transparent' }}
              >
                {/* Loading skeleton */}
                {loading && (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-2xl animate-pulse"
                        style={{ background: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.06}s` }}
                      />
                    ))}
                  </div>
                )}

                {/* Empty / no results */}
                {!loading && filtered.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <Layers size={28} className="text-white/15" />
                    <p className="text-sm text-white/30">
                      {query
                        ? (isHe ? 'לא נמצאו תוצאות' : 'No results found')
                        : (isHe ? 'עדיין אין שירותים שמורים' : 'No saved services yet')}
                    </p>
                    {!query && (
                      <p className="text-xs text-white/20">
                        {isHe ? 'הוסף שירותים בדף ספריית השירותים' : 'Add services in the Services Library page'}
                      </p>
                    )}
                  </div>
                )}

                {/* Service rows */}
                <AnimatePresence initial={false}>
                  {filtered.map((service, idx) => {
                    const isChecked = selected.has(service.id)
                    return (
                      <motion.button
                        key={service.id}
                        type="button"
                        onClick={() => toggleSelect(service.id)}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03, duration: 0.18 } }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-start transition-all"
                        style={{
                          background: isChecked
                            ? 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(245,158,11,0.06) 100%)'
                            : 'rgba(255,255,255,0.03)',
                          border: isChecked
                            ? '1px solid rgba(212,175,55,0.35)'
                            : '1px solid rgba(255,255,255,0.07)',
                          boxShadow: isChecked ? '0 0 16px rgba(212,175,55,0.08)' : 'none',
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="flex-none flex h-5 w-5 items-center justify-center rounded-lg transition-all"
                          style={{
                            background: isChecked
                              ? 'linear-gradient(135deg, #d4af37, #f59e0b)'
                              : 'rgba(255,255,255,0.06)',
                            border: isChecked ? 'none' : '1px solid rgba(255,255,255,0.15)',
                            boxShadow: isChecked ? '0 0 8px rgba(212,175,55,0.45)' : 'none',
                          }}
                        >
                          {isChecked && <Check size={11} className="text-black" strokeWidth={3} />}
                        </div>

                        {/* Name + desc */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/90 truncate">{service.label}</p>
                          {service.description && (
                            <p className="text-xs text-white/35 truncate">{service.description}</p>
                          )}
                        </div>

                        {/* Price */}
                        <p
                          className="flex-none text-sm font-black tabular-nums transition-colors"
                          style={{ color: isChecked ? '#d4af37' : 'rgba(255,255,255,0.45)' }}
                        >
                          {formatCurrency(service.price, currency)}
                        </p>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* ── Sticky bottom CTA ── */}
              <div
                className="flex-none px-5 pb-5 pt-3 space-y-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
              >
                {selected.size > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-amber-400/70"
                  >
                    {isHe
                      ? `${selected.size} שירות${selected.size > 1 ? 'ים' : ''} נבחר${selected.size > 1 ? 'ו' : ''}`
                      : `${selected.size} service${selected.size > 1 ? 's' : ''} selected`}
                  </motion.p>
                )}

                <motion.button
                  type="button"
                  onClick={handleInject}
                  disabled={selected.size === 0}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl h-11 text-sm font-bold transition-all disabled:opacity-40 whitespace-nowrap"
                  style={{
                    background: selected.size > 0
                      ? 'linear-gradient(135deg, #d4af37 0%, #f59e0b 100%)'
                      : 'rgba(255,255,255,0.06)',
                    border: selected.size > 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: selected.size > 0 ? '0 0 28px rgba(212,175,55,0.35)' : 'none',
                    color: selected.size > 0 ? '#000' : 'rgba(255,255,255,0.3)',
                  }}
                  whileHover={selected.size > 0 ? { scale: 1.02 } : undefined}
                  whileTap={selected.size > 0 ? { scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } } : undefined}
                >
                  {selected.size > 0 && (
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.2) 50%, transparent 62%)',
                        animation: 'reuse-shimmer 3s ease-in-out infinite',
                      }}
                      aria-hidden
                    />
                  )}
                  <Zap size={15} />
                  <span>
                    {selected.size === 0
                      ? (isHe ? 'בחר שירותים מהרשימה' : 'Select services above')
                      : (isHe
                          ? `הוסף ${selected.size} שירות${selected.size > 1 ? 'ים' : ''} להצעה`
                          : `Add ${selected.size} service${selected.size > 1 ? 's' : ''} to proposal`)}
                  </span>
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

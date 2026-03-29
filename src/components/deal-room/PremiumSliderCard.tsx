import { motion, AnimatePresence } from 'framer-motion'
import { Check, Minus, Plus } from 'lucide-react'
import { formatCurrency } from '../../types/proposal'
import type { AddOn } from '../../types/proposal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PremiumSliderCardProps {
  addOn: AddOn
  quantity: number
  enabled: boolean
  currency: string
  locale: string
  adjustable: boolean
  onToggle: () => void
  onQuantityChange: (qty: number) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PremiumSliderCard({
  addOn, quantity, enabled, currency, locale, adjustable,
  onToggle, onQuantityChange,
}: PremiumSliderCardProps) {
  const lineTotal = addOn.price * quantity
  const fillPct = ((quantity - 1) / 9) * 100

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
      whileHover={enabled ? { y: -4, transition: { duration: 0.2 } } : {}}
      layout
    >
      <div
        className="relative rounded-2xl p-5 transition-all duration-300"
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.06) 100%)'
            : 'rgba(255,255,255,0.02)',
          border: enabled
            ? '1px solid rgba(99,102,241,0.28)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: enabled
            ? '0 8px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Top glow accent when enabled */}
        {enabled && (
          <div
            className="pointer-events-none absolute top-0 left-6 right-6 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.7) 50%, transparent 100%)',
            }}
          />
        )}

        {/* ── Row: Toggle + Label + Price ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Circle toggle */}
            <button
              type="button"
              onClick={onToggle}
              className="mt-0.5 flex-none h-[22px] w-[22px] rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: enabled
                  ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                  : 'rgba(255,255,255,0.07)',
                border: enabled ? 'none' : '1px solid rgba(255,255,255,0.12)',
                boxShadow: enabled ? '0 0 14px rgba(99,102,241,0.55)' : 'none',
              }}
              aria-pressed={enabled}
              aria-label={
                enabled
                  ? (locale === 'he' ? 'הסר תוספת' : 'Remove add-on')
                  : (locale === 'he' ? 'הוסף תוספת' : 'Add add-on')
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {enabled && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="min-w-0">
              <p
                className="text-[15px] font-semibold leading-snug transition-colors duration-200"
                style={{ color: enabled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)' }}
              >
                {addOn.label || (locale === 'he' ? 'תוספת' : 'Add-on')}
              </p>
              {addOn.description && (
                <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
                  {addOn.description}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex-none text-end">
            <motion.p
              className="text-lg font-black tabular-nums leading-none transition-colors duration-200"
              style={{ color: enabled ? '#c4b5fd' : 'rgba(255,255,255,0.18)' }}
              animate={{ scale: [1, 1.06, 1] }}
              key={lineTotal}
              transition={{ duration: 0.25 }}
            >
              {enabled ? formatCurrency(lineTotal, currency) : `+${formatCurrency(addOn.price, currency)}`}
            </motion.p>
            {quantity > 1 && enabled && (
              <p className="text-[10px] text-white/30 mt-0.5 tabular-nums">
                {quantity}× {formatCurrency(addOn.price, currency)}
              </p>
            )}
          </div>
        </div>

        {/* ── Quantity slider — only when enabled AND creator allows adjustment ── */}
        <AnimatePresence initial={false}>
          {enabled && adjustable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="mt-2 pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Label row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                    {locale === 'he' ? 'כמות' : 'Quantity'}
                  </span>

                  {/* Stepper buttons */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={10} />
                    </button>
                    <motion.span
                      key={quantity}
                      className="w-6 text-center text-sm font-bold text-white tabular-nums"
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {quantity}
                    </motion.span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20"
                      aria-label="Increase quantity"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Slider track + fill */}
                <div className="relative flex items-center">
                  {/* Filled portion overlay */}
                  <div
                    className="pointer-events-none absolute h-1 rounded-full transition-all duration-150"
                    style={{
                      width: `${fillPct}%`,
                      left: 0,
                      background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                      boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                    }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={quantity}
                    onChange={e => onQuantityChange(Number(e.target.value))}
                    className="deal-room-slider w-full"
                    aria-label={locale === 'he' ? 'כמות' : 'Quantity'}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={quantity}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] font-medium text-white/15">1</span>
                  <span className="text-[9px] font-medium text-white/15">10</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

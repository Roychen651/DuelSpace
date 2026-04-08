import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { formatCurrency } from '../../types/proposal'
import type { AddOn } from '../../types/proposal'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PremiumSliderCardProps {
  addOn: AddOn
  quantity: number
  enabled: boolean
  currency: string
  locale: string
  onToggle: () => void
  /** When true the contract is signed — all interactive controls are locked */
  sealed?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PremiumSliderCard({
  addOn, quantity, enabled, currency, locale,
  onToggle, sealed = false,
}: PremiumSliderCardProps) {
  const disc = addOn.discount_pct || 0
  const unitDiscounted = Math.round(addOn.price * (1 - disc / 100))
  const lineTotal = unitDiscounted * quantity
  const lineTotalOriginal = addOn.price * quantity
  const isDiscounted = disc > 0

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
      whileHover={enabled && !sealed ? { y: -4, transition: { duration: 0.2 } } : {}}
      layout
    >
      <div
        className={`relative rounded-2xl p-5 transition-all duration-300 ${
          enabled
            ? 'border dark:border-transparent'
            : 'border dark:border-transparent'
        }`}
        style={{
          background: enabled
            ? 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.06) 100%)'
            : 'var(--card-bg)',
          border: enabled
            ? '1px solid rgba(99,102,241,0.28)'
            : '1px solid var(--border)',
          boxShadow: enabled
            ? '0 8px 32px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
            : 'none',
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Circle toggle — pointer-events disabled once contract is sealed */}
            <button
              type="button"
              onClick={sealed ? undefined : onToggle}
              disabled={sealed}
              className="mt-0.5 flex-none h-[22px] w-[22px] rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: enabled
                  ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                  : 'var(--surface-sunken)',
                border: enabled ? 'none' : '1px solid var(--border)',
                boxShadow: enabled ? '0 0 14px rgba(99,102,241,0.55)' : 'none',
                cursor: sealed ? 'default' : 'pointer',
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
                style={{ color: enabled ? 'var(--text-main)' : 'var(--text-tertiary)' }}
              >
                {addOn.label || (locale === 'he' ? 'תוספת' : 'Add-on')}
              </p>
              {addOn.description && (
                <p className="text-xs text-dim mt-0.5 leading-relaxed">
                  {addOn.description}
                </p>
              )}
            </div>
          </div>

          {/* Price — with optional discount strikethrough */}
          <div className="flex-none text-end">
            {/* Strikethrough original price */}
            {isDiscounted && enabled && (
              <p className="text-[11px] tabular-nums leading-none text-end line-through text-slate-300 dark:text-white/25">
                {formatCurrency(lineTotalOriginal, currency)}
              </p>
            )}
            <motion.p
              className={`text-lg font-black tabular-nums leading-none transition-colors duration-200${!enabled ? ' text-slate-300 dark:text-white/[0.18]' : ''}`}
              style={{ color: enabled ? (isDiscounted ? '#4ade80' : '#c4b5fd') : undefined }}
              animate={{ scale: [1, 1.06, 1] }}
              key={lineTotal}
              transition={{ duration: 0.25 }}
            >
              {enabled ? formatCurrency(lineTotal, currency) : `+${formatCurrency(addOn.price, currency)}`}
            </motion.p>
            {/* Discount badge */}
            {isDiscounted && enabled && (
              <span
                className="inline-block mt-0.5 rounded-full px-1.5 py-px text-[9px] font-black tabular-nums"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                }}
              >
                -{disc}%
              </span>
            )}
            {quantity > 1 && enabled && (
              <p className="text-[10px] text-dim mt-0.5 tabular-nums">
                {quantity}× {formatCurrency(unitDiscounted, currency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

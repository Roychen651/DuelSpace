import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { formatCurrency } from '../../types/proposal'
import type { PaymentMilestone } from '../../types/proposal'

// ─── Animated currency span ───────────────────────────────────────────────────

function AnimatedAmount({ amount, currency }: { amount: number; currency: string }) {
  const motionVal = useMotionValue(amount)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18, mass: 1 })
  const displayed = useTransform(spring, v =>
    formatCurrency(Math.round(Math.max(0, v)), currency)
  )
  useEffect(() => { motionVal.set(amount) }, [amount, motionVal])
  return (
    <motion.span className="tabular-nums" aria-live="polite" aria-atomic="true">
      {displayed}
    </motion.span>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MilestoneTimelineProps {
  milestones: PaymentMilestone[]
  grandTotal: number
  currency: string
  locale: string
}

// ─── MilestoneTimeline ────────────────────────────────────────────────────────

export function MilestoneTimeline({ milestones, grandTotal, currency, locale }: MilestoneTimelineProps) {
  if (milestones.length === 0) return null
  const isHe = locale === 'he'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' as const }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 mb-0.5">
          {isHe ? 'לוח תשלומים' : 'Payment Schedule'}
        </p>
        <p className="text-sm font-semibold text-white/70">
          {isHe ? 'אבני דרך לתשלום' : 'Billing Milestones'}
        </p>
      </div>

      {/* Timeline */}
      <div className="px-5 py-4">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute start-[18px] top-5 bottom-5 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(168,85,247,0.15))' }}
          />

          <div className="space-y-0">
            {milestones.map((m, i) => {
              const amount = Math.round((m.percentage / 100) * grandTotal)
              const isLast = i === milestones.length - 1
              const dotColor = i === 0
                ? '#6366f1'
                : isLast
                ? '#22c55e'
                : '#8b5cf6'

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: isHe ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' as const }}
                  className="flex items-start gap-4 pb-5 last:pb-0"
                >
                  {/* Dot */}
                  <div className="relative flex-none mt-0.5">
                    <div
                      className="h-[18px] w-[18px] rounded-full border-2 border-current flex items-center justify-center"
                      style={{
                        color: dotColor,
                        background: `${dotColor}20`,
                        boxShadow: `0 0 10px ${dotColor}50`,
                        zIndex: 1,
                        position: 'relative',
                      }}
                    >
                      <div
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ background: dotColor }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 rounded-xl px-3.5 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">{m.name}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">
                          {m.percentage}%{' '}
                          {isHe ? 'מהסכום הכולל' : 'of total'}
                        </p>
                      </div>
                      <p
                        className="text-base font-black flex-none"
                        style={{
                          background: 'linear-gradient(135deg, #c4b5fd 0%, #e879f9 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        <AnimatedAmount amount={amount} currency={currency} />
                      </p>
                    </div>

                    {/* Mini progress bar */}
                    <div
                      className="mt-2 h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${dotColor}, ${dotColor}80)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${m.percentage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: 'easeOut' as const }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Total confirmation */}
        <div
          className="mt-3 flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/70">
            {isHe ? 'סה"כ' : 'Total'}
          </span>
          <span className="text-sm font-black text-indigo-400">
            <AnimatedAmount amount={grandTotal} currency={currency} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

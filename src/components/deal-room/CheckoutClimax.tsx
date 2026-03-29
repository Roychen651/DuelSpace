import { useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ShieldCheck, Loader2, CheckCircle2, Lock } from 'lucide-react'
import { formatCurrency } from '../../types/proposal'
import { SignaturePad } from './SignaturePad'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CheckoutClimaxProps {
  total: number
  currency: string
  clientName: string
  /** dataUrl from SignaturePad canvas — empty string means unsigned */
  signature: string
  onSignatureChange: (dataUrl: string) => void
  onAccept: () => void
  accepting: boolean
  accepted: boolean
  locale: string
  /** When true, shows VAT breakdown below the total */
  includeVat?: boolean
  /** VAT rate as decimal, e.g. 0.18 for 18% */
  vatRate?: number
}

// ─── Slot-machine price span ──────────────────────────────────────────────────

function AnimatedTotal({ total, currency }: { total: number; currency: string }) {
  const motionVal = useMotionValue(total)
  const spring = useSpring(motionVal, { stiffness: 55, damping: 16, mass: 1.1 })
  const displayed = useTransform(spring, v =>
    formatCurrency(Math.round(Math.max(0, v)), currency)
  )
  useEffect(() => { motionVal.set(total) }, [total, motionVal])
  return (
    <motion.span className="tabular-nums" aria-live="polite" aria-atomic="true">
      {displayed}
    </motion.span>
  )
}

// ─── CheckoutClimax ───────────────────────────────────────────────────────────

export function CheckoutClimax({
  total, currency, signature,
  onSignatureChange, onAccept, accepting, accepted, locale,
  includeVat = false, vatRate = 0.18,
}: CheckoutClimaxProps) {
  const isHe = locale === 'he'
  const canSign = signature.trim().length >= 2
  const vatAmt = Math.round(total * vatRate)
  const totalWithVat = total + vatAmt
  const displayTotal = includeVat ? totalWithVat : total

  return (
    <>
      <style>{`
        @keyframes checkout-glow-pulse {
          0%, 100% { box-shadow: 0 0 24px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 52px rgba(99,102,241,0.7), 0 0 90px rgba(168,85,247,0.3); }
        }
        @keyframes checkout-shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(220%) skewX(-12deg); }
        }
      `}</style>

      {/* Fade-in gradient above the bar (visual separator) */}
      <div
        className="pointer-events-none h-24 -mb-24 relative z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,10,1) 0%, rgba(5,5,10,0.8) 50%, transparent 100%)',
        }}
      />

      <div
        className="sticky bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="mx-auto max-w-2xl px-4 pb-4">
          {/* ── Glass card ────────────────────────────────────────────────── */}
          <motion.div
            className="relative overflow-hidden rounded-2xl px-5 pt-4 pb-5"
            style={{
              background:
                'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow:
                '0 -16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32, delay: 0.5 }}
          >
            {/* Inner top highlight */}
            <div
              className="pointer-events-none absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              }}
            />

            {/* ── Total row ───────────────────────────────────────────────── */}
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-0.5">
                  {isHe
                    ? (includeVat ? 'סה״כ כולל מע״מ' : 'סה״כ להשקעה')
                    : (includeVat ? 'Total incl. VAT' : 'Total Investment')}
                </p>
                <p className="text-3xl font-black leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #e879f9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.4))',
                  }}
                >
                  <AnimatedTotal total={displayTotal} currency={currency} />
                </p>
              </div>
              {/* Lock badge */}
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <Lock size={10} className="text-indigo-400" />
                <span className="text-[10px] font-semibold text-indigo-400">
                  {isHe ? 'מאובטח' : 'Secured'}
                </span>
              </div>
            </div>

            {/* ── VAT breakdown ───────────────────────────────────────────── */}
            {includeVat && (
              <div
                className="mb-3 rounded-xl px-3 py-2.5 space-y-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex justify-between text-[11px] text-white/35">
                  <span>{isHe ? 'לפני מע״מ' : 'Before VAT'}</span>
                  <span className="tabular-nums">{formatCurrency(total, currency)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-white/35">
                  <span>{isHe ? `מע״מ (${Math.round(vatRate * 100)}%)` : `VAT (${Math.round(vatRate * 100)}%)`}</span>
                  <span className="tabular-nums">{formatCurrency(vatAmt, currency)}</span>
                </div>
                <div
                  className="flex justify-between text-[11px] font-bold text-white/60 pt-1"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span>{isHe ? 'סה״כ כולל מע״מ' : 'Total incl. VAT'}</span>
                  <span className="tabular-nums">{formatCurrency(totalWithVat, currency)}</span>
                </div>
              </div>
            )}

            {/* ── Signature pad ────────────────────────────────────────────── */}
            <AnimatePresence>
              {!accepted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-3"
                  style={{ overflow: 'hidden' }}
                >
                  <SignaturePad
                    locale={locale}
                    onConfirm={dataUrl => onSignatureChange(dataUrl)}
                    onClear={() => onSignatureChange('')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CTA button ───────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {accepted ? (
                <motion.div
                  key="accepted"
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex items-center justify-center gap-3 rounded-xl py-3.5"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">
                    {isHe
                      ? '🎉 ההצעה אושרה! נהיה בקשר בקרוב.'
                      : '🎉 Deal accepted! We\'ll be in touch.'}
                  </span>
                </motion.div>
              ) : (
                <motion.button
                  key="cta"
                  type="button"
                  onClick={onAccept}
                  disabled={!canSign || accepting}
                  className="relative w-full overflow-hidden rounded-xl py-4 text-sm font-bold text-white disabled:cursor-not-allowed"
                  style={{
                    background: canSign
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'
                      : 'rgba(255,255,255,0.06)',
                    border: canSign
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.08)',
                    animation:
                      canSign && !accepting
                        ? 'checkout-glow-pulse 2.5s ease-in-out infinite'
                        : 'none',
                    opacity: !canSign ? 0.45 : 1,
                    transition: 'opacity 0.2s, background 0.3s',
                  }}
                  whileHover={canSign ? { scale: 1.015 } : {}}
                  whileTap={canSign ? { scale: 0.975 } : {}}
                >
                  {/* Shimmer on hover */}
                  {canSign && !accepting && (
                    <span
                      className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/10"
                      style={{ animation: 'checkout-shimmer 2s ease-out 1.2s infinite' }}
                      aria-hidden
                    />
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {accepting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        {isHe ? '✓ אשר וחתום על ההצעה' : '✓ Approve & Sign Proposal'}
                      </>
                    )}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Fine print */}
            {canSign && !accepted && (
              <motion.p
                className="mt-2.5 text-center text-[10px] leading-relaxed text-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {isHe
                  ? `החתימה מהווה קבלה אלקטרונית מחייבת של תנאי הצעה זו.`
                  : `Your signature constitutes a legally binding electronic acceptance of this proposal.`}
              </motion.p>
            )}

            {/* DealSpace legal disclaimer */}
            <div
              className="mt-3 rounded-xl px-3 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-[9px] leading-relaxed text-white/18">
                {isHe
                  ? 'DealSpace מספקת תשתית טכנולוגית בלבד ואינה צד להסכם זה, לאיכות השירות הניתן, או לכל מחלוקת בין הצדדים.'
                  : 'DealSpace provides technology infrastructure only and is not a party to this agreement, the quality of services rendered, or any dispute between the parties.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

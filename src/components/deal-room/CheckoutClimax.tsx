import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ShieldCheck, Loader2, CheckCircle2, Lock, MessageSquarePlus, X, Send as SendIcon, CheckCheck, ArrowUp } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
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
  legalConsent: boolean
  onLegalConsentChange: (v: boolean) => void
  /** When provided, shows "Request Changes" button and calls this on submit */
  onRequestRevision?: (notes: string) => Promise<void>
  /** Must be true before signature is unlocked — gates the entire sign flow */
  clientDetailsConfirmed?: boolean
  /** Called when user taps "fill details first" locked state — scrolls form into view */
  onScrollToDetails?: () => void
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
  includeVat = false, vatRate = 0.18, legalConsent, onLegalConsentChange,
  onRequestRevision, clientDetailsConfirmed = false, onScrollToDetails,
}: CheckoutClimaxProps) {
  const isHe = locale === 'he'
  const signatureConfirmed = signature.trim().length >= 2
  const canSign = clientDetailsConfirmed && signatureConfirmed && legalConsent

  // Revision request state
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [revisionText, setRevisionText] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [revisionDone, setRevisionDone] = useState(false)

  const handleRevisionSubmit = async () => {
    if (!revisionText.trim() || requesting || !onRequestRevision) return
    setRequesting(true)
    await onRequestRevision(revisionText.trim())
    setRequesting(false)
    setRevisionDone(true)
  }
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
        @keyframes checkout-dialog-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkout-revision-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.25), inset 0 1px 0 rgba(245,158,11,0.12); }
          50%       { box-shadow: 0 0 44px rgba(245,158,11,0.45), inset 0 1px 0 rgba(245,158,11,0.18); }
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

            {/* ── Revision done: replace entire signing flow with success state ─ */}
            <AnimatePresence mode="wait">
              {revisionDone ? (
                <motion.div
                  key="revision-success"
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="rounded-2xl overflow-hidden mb-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(217,119,6,0.06) 100%)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    animation: 'checkout-revision-glow 2.8s ease-in-out infinite',
                  }}
                >
                  {/* Icon + title */}
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
                    <div
                      className="flex-none flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}
                    >
                      <CheckCheck size={15} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#f59e0b' }} dir={isHe ? 'rtl' : 'ltr'}>
                        {isHe ? 'בקשתך נשלחה בהצלחה' : 'Request Submitted Successfully'}
                      </p>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="px-4 py-3">
                    <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }} dir={isHe ? 'rtl' : 'ltr'}>
                      {isHe
                        ? 'בקשת השינוי נשלחה לבעל העסק. נעדכן אותך ברגע שההצעה תתוקן ותישלח מחדש.'
                        : 'Your change request was sent to the creator. We\'ll notify you as soon as the proposal is updated and resent.'}
                    </p>
                    <p className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }} dir={isHe ? 'rtl' : 'ltr'}>
                      {isHe
                        ? '⚠️ לא ניתן לחתום על ההצעה בעוד הבקשה ממתינה לטיפול.'
                        : '⚠️ Signing is locked while your change request is pending.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="signing-flow" initial={false} animate={{ opacity: 1 }}>
                  {/* ── Signature section ──────────────────────────────────── */}
                  <AnimatePresence mode="wait">
                    {!accepted && !clientDetailsConfirmed && (
                      <motion.button
                        key="locked"
                        type="button"
                        onClick={onScrollToDetails}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full mb-3 rounded-xl px-4 py-4 flex flex-col items-center gap-2 cursor-pointer transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px dashed rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget
                          el.style.borderColor = 'rgba(99,102,241,0.35)'
                          el.style.background = 'rgba(99,102,241,0.05)'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget
                          el.style.borderColor = 'rgba(255,255,255,0.1)'
                          el.style.background = 'rgba(255,255,255,0.025)'
                        }}
                      >
                        <div className="flex items-center gap-2 text-white/30">
                          <Lock size={14} />
                          <span className="text-xs font-semibold">
                            {isHe ? 'חתימה אלקטרונית' : 'Electronic Signature'}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/22 text-center leading-relaxed">
                          {isHe
                            ? 'מלא את פרטי הזהות למעלה כדי לפתוח את החתימה'
                            : 'Fill in your identity details above to unlock signing'}
                        </p>
                        {onScrollToDetails && (
                          <div className="flex items-center gap-1 mt-0.5" style={{ color: '#818cf8' }}>
                            <ArrowUp size={11} />
                            <span className="text-[10px] font-bold">
                              {isHe ? 'מלא פרטים' : 'Fill details'}
                            </span>
                          </div>
                        )}
                      </motion.button>
                    )}
                    {!accepted && clientDetailsConfirmed && (
                      <motion.div
                        key="unlocked"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' as const }}
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

                  {/* ── Legal consent (shown once signature is drawn) ──────── */}
                  <AnimatePresence>
                    {signatureConfirmed && !accepted && (
                      <motion.label
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-3 cursor-pointer mb-3 rounded-xl px-3 py-2.5"
                        style={{
                          background: legalConsent ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.025)',
                          border: legalConsent ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.07)',
                          transition: 'background 0.2s, border-color 0.2s',
                        }}
                      >
                        <div className="flex-none mt-0.5">
                          <input
                            type="checkbox"
                            checked={legalConsent}
                            onChange={e => onLegalConsentChange(e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className="flex h-4 w-4 items-center justify-center rounded-md border transition-all"
                            style={{
                              background: legalConsent ? '#22c55e' : 'rgba(255,255,255,0.05)',
                              borderColor: legalConsent ? '#22c55e' : 'rgba(255,255,255,0.15)',
                              boxShadow: legalConsent ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
                            }}
                          >
                            {legalConsent && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: legalConsent ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>
                          {isHe
                            ? 'אני מאשר/ת שקראתי את תנאי ההצעה ומסכים/ה לביצועה כהסכם מחייב.'
                            : 'I confirm I have read the proposal terms and agree to its execution as a binding agreement.'}
                        </p>
                      </motion.label>
                    )}
                  </AnimatePresence>

                  {/* ── CTA button ──────────────────────────────────────────── */}
                  <AnimatePresence mode="wait">
                    {accepted ? (
                      <motion.div
                        key="accepted"
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 rounded-xl py-3.5"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))',
                          border: '1px solid rgba(34,197,94,0.3)',
                        }}
                      >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">
                          {isHe ? '🎉 ההצעה אושרה! נהיה בקשר בקרוב.' : '🎉 Deal accepted! We\'ll be in touch.'}
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
                          border: canSign ? 'none' : '1px solid rgba(255,255,255,0.08)',
                          animation: canSign && !accepting ? 'checkout-glow-pulse 2.5s ease-in-out infinite' : 'none',
                          opacity: !canSign ? 0.45 : 1,
                          transition: 'opacity 0.2s, background 0.3s',
                        }}
                        whileHover={canSign ? { scale: 1.015 } : {}}
                        whileTap={canSign ? { scale: 0.975 } : {}}
                      >
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
                        ? 'החתימה מהווה קבלה אלקטרונית מחייבת של תנאי הצעה זו.'
                        : 'Your signature constitutes a legally binding electronic acceptance of this proposal.'}
                    </motion.p>
                  )}

                  {/* ── Request Changes button ─────────────────────────────── */}
                  {onRequestRevision && !accepted && (
                    <div className="mt-3">
                      <Dialog.Root open={revisionOpen} onOpenChange={setRevisionOpen}>
                        <Dialog.Trigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold transition-all"
                            style={{
                              color: 'rgba(255,255,255,0.35)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.025)',
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget
                              el.style.color = '#fbbf24'
                              el.style.borderColor = 'rgba(245,158,11,0.3)'
                              el.style.background = 'rgba(245,158,11,0.06)'
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget
                              el.style.color = 'rgba(255,255,255,0.35)'
                              el.style.borderColor = 'rgba(255,255,255,0.08)'
                              el.style.background = 'rgba(255,255,255,0.025)'
                            }}
                          >
                            <MessageSquarePlus size={12} />
                            {isHe ? 'בקשת שינוי בהצעה' : 'Request Changes'}
                          </button>
                        </Dialog.Trigger>

                        <Dialog.Portal>
                          <Dialog.Overlay
                            className="fixed inset-0 z-[9999]"
                            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                          />
                          <Dialog.Content
                            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
                            style={{ outline: 'none' }}
                          >
                            <div
                              className="w-full max-w-md rounded-3xl p-6"
                              style={{
                                background: 'linear-gradient(160deg, rgba(12,12,24,0.98) 0%, rgba(6,6,14,0.99) 100%)',
                                border: '1px solid rgba(245,158,11,0.2)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
                                animation: 'checkout-dialog-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
                              }}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                                  >
                                    <MessageSquarePlus size={16} style={{ color: '#f59e0b' }} />
                                  </div>
                                  <div>
                                    <Dialog.Title className="text-sm font-black text-white">
                                      {isHe ? 'מה תרצו לשנות?' : 'What Would You Like to Change?'}
                                    </Dialog.Title>
                                    <Dialog.Description className="text-[10px] text-white/35 mt-0.5" dir={isHe ? 'rtl' : 'ltr'}>
                                      {isHe
                                        ? 'כתבו לנו מה תרצו להתאים ונחזור עם גרסה מעודכנת'
                                        : 'Describe what to adjust and we\'ll send an updated version'}
                                    </Dialog.Description>
                                  </div>
                                </div>
                                <Dialog.Close asChild>
                                  <button className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white/70">
                                    <X size={14} />
                                  </button>
                                </Dialog.Close>
                              </div>

                              {/* Textarea */}
                              <textarea
                                className="w-full resize-none rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                                rows={4}
                                dir={isHe ? 'rtl' : 'ltr'}
                                placeholder={
                                  isHe
                                    ? 'למשל: "האם ניתן להוריד את תוספת עריכת הוידאו ולקבל הנחה בהתאם?"'
                                    : 'e.g. "Can we remove the video editing add-on for a proportional discount?"'
                                }
                                value={revisionText}
                                onChange={e => setRevisionText(e.target.value)}
                                style={{
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                                }}
                                onFocus={e => {
                                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.06)'
                                }}
                                onBlur={e => {
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)'
                                }}
                              />

                              {/* Actions */}
                              <div className="mt-4 flex gap-2">
                                <Dialog.Close asChild>
                                  <button
                                    className="flex-1 rounded-xl py-2.5 text-xs font-semibold text-white/40 transition hover:text-white/70"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}
                                  >
                                    {isHe ? 'ביטול' : 'Cancel'}
                                  </button>
                                </Dialog.Close>
                                <motion.button
                                  type="button"
                                  onClick={handleRevisionSubmit}
                                  disabled={!revisionText.trim() || requesting}
                                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                                    boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                                  }}
                                  whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                                >
                                  {requesting ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <>
                                      <SendIcon size={12} />
                                      {isHe ? 'שלח בקשה' : 'Send Request'}
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      </Dialog.Root>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* DealSpace legal disclaimer — always visible */}
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

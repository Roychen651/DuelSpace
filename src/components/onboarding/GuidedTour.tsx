import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X } from 'lucide-react'

// ─── Storage key ─────────────────────────────────────────────────────────────

export const TOUR_STORAGE_KEY = 'dealspace:tour-completed'

// ─── Props ────────────────────────────────────────────────────────────────────

interface GuidedTourProps {
  locale: 'he' | 'en'
  /** Pass false while OnboardingWizard is showing to suppress the tour */
  enabled?: boolean
}

// ─── GuidedTour ───────────────────────────────────────────────────────────────

export function GuidedTour({ locale, enabled = true }: GuidedTourProps) {
  const isHe = locale === 'he'
  const [active, setActive] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  // Show after 1.2 s if not yet dismissed
  useEffect(() => {
    if (!enabled) return
    if (localStorage.getItem(TOUR_STORAGE_KEY) === 'true') return
    const t = setTimeout(() => {
      const el = document.querySelector<HTMLElement>('[data-tour="new-proposal"]')
      if (el) {
        setRect(el.getBoundingClientRect())
        setActive(true)
      }
    }, 1200)
    return () => clearTimeout(t)
  }, [enabled])

  // Re-measure on resize so the spotlight stays aligned
  useEffect(() => {
    if (!active) return
    const onResize = () => {
      const el = document.querySelector<HTMLElement>('[data-tour="new-proposal"]')
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active])

  const dismiss = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setActive(false)
  }

  if (!rect) return null

  // Spotlight padding
  const PAD = 7
  const spotTop    = rect.top    - PAD
  const spotLeft   = rect.left   - PAD
  const spotWidth  = rect.width  + PAD * 2
  const spotHeight = rect.height + PAD * 2

  // Tooltip — below the button, horizontally centred on it
  // Clamp so it never overflows the viewport
  const TIP_W = 296
  let tipLeft = rect.left + rect.width / 2 - TIP_W / 2
  tipLeft = Math.max(12, Math.min(tipLeft, window.innerWidth - TIP_W - 12))
  const tipTop = rect.bottom + 14

  // Arrow left offset relative to tooltip card
  const arrowLeft = rect.left + rect.width / 2 - tipLeft - 8

  return (
    <>
      {/* Keyframes — outside AnimatePresence so they survive exit animation */}
      <style>{`
        @keyframes gt-pulse {
          0%, 100% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.72), 0 0 0 2px rgba(99,102,241,0.9), 0 0 20px 4px rgba(99,102,241,0.35); }
          50%       { box-shadow: 0 0 0 4000px rgba(0,0,0,0.72), 0 0 0 2px rgba(168,85,247,0.9), 0 0 32px 8px rgba(168,85,247,0.5); }
        }
      `}</style>

      <AnimatePresence>
        {active && (
          <>
            {/* Dark backdrop — clicking anywhere dismisses */}
            <motion.div
              key="gt-backdrop"
              className="fixed inset-0 z-[9996]"
              style={{ cursor: 'pointer' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={dismiss}
            />

            {/* Spotlight ring — pointer-events-none so backdrop click passes through */}
            <motion.div
              key="gt-spot"
              className="pointer-events-none fixed z-[9997] rounded-xl"
              style={{
                top:    spotTop,
                left:   spotLeft,
                width:  spotWidth,
                height: spotHeight,
                border: '1.5px solid rgba(99,102,241,0.6)',
                animation: 'gt-pulse 2s ease-in-out infinite',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            />

            {/* Tooltip card */}
            <motion.div
              key="gt-tooltip"
              className="fixed z-[9998] rounded-2xl bg-white dark:bg-[#0f0f1a] shadow-2xl dark:shadow-none"
              style={{
                top:    tipTop,
                left:   tipLeft,
                width:  TIP_W,
                border: '1px solid rgba(99,102,241,0.35)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.12), 0 0 40px rgba(99,102,241,0.18)',
              }}
              dir={isHe ? 'rtl' : 'ltr'}
              initial={{ opacity: 0, y: -8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.94 }}
              transition={{ type: 'spring' as const, stiffness: 340, damping: 28 }}
            >
              {/* Arrow pointing up */}
              <div
                className="absolute -top-[7px]"
                style={{
                  left: arrowLeft,
                  width: 14,
                  height: 7,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(99,102,241,0.35)',
                    transform: 'rotate(45deg)',
                    margin: '4px auto 0',
                  }}
                />
              </div>

              <div className="p-4 pt-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 14px rgba(99,102,241,0.5)' }}
                    >
                      <Zap size={13} className="text-white" />
                    </div>
                    <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-snug">
                      {isHe ? 'ברוכים הבאים ל-DealSpace!' : 'Welcome to DealSpace!'}
                    </p>
                  </div>
                  <button
                    onClick={dismiss}
                    className="flex h-5 w-5 flex-none items-center justify-center rounded-md text-slate-400 dark:text-white/30 transition-colors hover:text-slate-600 dark:hover:text-white/70"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Body */}
                <p className="text-[12px] leading-relaxed text-slate-600 dark:text-white/[0.58] mb-4">
                  {isHe
                    ? 'העסקה הראשונה שלך מתחילה כאן. לחץ כדי לבנות את ההצעה הראשונה שלך תוך שתי דקות.'
                    : 'Your first deal starts here. Click to build your first proposal in 2 minutes.'}
                </p>

                {/* CTA */}
                <button
                  onClick={dismiss}
                  className="w-full rounded-xl py-2 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                  }}
                >
                  {isHe ? 'הבנתי!' : 'Got it!'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

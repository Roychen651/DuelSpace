import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Zap } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
  /** CSS selector for the element to highlight */
  target: string
  titleEn: string
  titleHe: string
  bodyEn: string
  bodyHe: string
  /** Tooltip placement relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface GuidedTourProps {
  steps: TourStep[]
  locale: 'he' | 'en'
  onComplete: () => void
  onSkip: () => void
}

// ─── Storage key ─────────────────────────────────────────────────────────────

export const TOUR_STORAGE_KEY = 'dealspace:tour-completed'

// ─── Default steps ────────────────────────────────────────────────────────────

export const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="new-proposal"]',
    titleEn: 'Create Your First Proposal',
    titleHe: 'צור את ההצעה הראשונה שלך',
    bodyEn: 'Click here to open the proposal builder. Set your price, add services, and send a stunning interactive deal room to your client.',
    bodyHe: 'לחץ כאן לפתיחת עורך ההצעות. הגדר מחיר, הוסף שירותים, ושלח חדר עסקה מרשים ללקוח.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="proposals-list"]',
    titleEn: 'Track All Your Proposals',
    titleHe: 'עקוב אחרי כל ההצעות שלך',
    bodyEn: 'Every proposal you create appears here with live status — draft, sent, viewed, or accepted. Click a card to continue editing.',
    bodyHe: 'כל הצעה שתיצור תופיע כאן עם סטטוס חי — טיוטה, נשלח, נצפה, או אושר. לחץ על כרטיסיה לעריכה.',
    placement: 'top',
  },
  {
    target: '[data-tour="profile-avatar"]',
    titleEn: 'Your Profile',
    titleHe: 'הפרופיל שלך',
    bodyEn: 'Upload a logo, set your display name, and manage account settings — all from the profile menu.',
    bodyHe: 'העלה לוגו, הגדר שם תצוגה, ונהל הגדרות חשבון — הכל מתפריט הפרופיל.',
    placement: 'bottom',
  },
]

// ─── Tooltip position calculator ─────────────────────────────────────────────

function getTooltipPosition(
  targetRect: DOMRect,
  placement: TourStep['placement'] = 'bottom',
  tooltipW = 300,
  tooltipH = 180
) {
  const GAP = 16
  const VW = window.innerWidth
  const VH = window.innerHeight

  let top = 0
  let left = 0

  switch (placement) {
    case 'bottom':
      top = targetRect.bottom + GAP
      left = targetRect.left + targetRect.width / 2 - tooltipW / 2
      break
    case 'top':
      top = targetRect.top - tooltipH - GAP
      left = targetRect.left + targetRect.width / 2 - tooltipW / 2
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipH / 2
      left = targetRect.right + GAP
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipH / 2
      left = targetRect.left - tooltipW - GAP
      break
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, VW - tooltipW - 12))
  top  = Math.max(12, Math.min(top,  VH - tooltipH - 12))

  return { top, left }
}

// ─── Highlight box ────────────────────────────────────────────────────────────

function HighlightBox({ rect }: { rect: DOMRect }) {
  const PAD = 6
  return (
    <motion.div
      className="pointer-events-none fixed z-[9998] rounded-xl"
      style={{
        top:    rect.top    - PAD,
        left:   rect.left   - PAD,
        width:  rect.width  + PAD * 2,
        height: rect.height + PAD * 2,
        boxShadow: '0 0 0 4000px rgba(0,0,0,0.72), 0 0 0 2px rgba(99,102,241,0.8)',
        border: '1.5px solid rgba(99,102,241,0.6)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  )
}

// ─── Tooltip card ─────────────────────────────────────────────────────────────

interface TooltipProps {
  step: TourStep
  stepIndex: number
  totalSteps: number
  locale: 'he' | 'en'
  targetRect: DOMRect
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

function TooltipCard({
  step, stepIndex, totalSteps, locale,
  targetRect, onNext, onBack, onSkip,
}: TooltipProps) {
  const isHe = locale === 'he'
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  const TOOLTIP_W = 300
  const TOOLTIP_H = 190
  const pos = getTooltipPosition(targetRect, step.placement, TOOLTIP_W, TOOLTIP_H)

  return (
    <motion.div
      className="fixed z-[9999] rounded-2xl p-5 shadow-2xl"
      style={{
        width: TOOLTIP_W,
        top: pos.top,
        left: pos.left,
        background: 'linear-gradient(135deg, rgba(20,20,35,0.98) 0%, rgba(15,15,28,0.98) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        backdropFilter: 'blur(40px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)',
      }}
      dir={isHe ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg flex-none"
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <Zap size={11} className="text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">
            {isHe ? step.titleHe : step.titleEn}
          </h3>
        </div>
        <button
          onClick={onSkip}
          className="flex h-5 w-5 flex-none items-center justify-center rounded-md text-white/30 transition hover:text-white/70"
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <p className="text-xs leading-relaxed text-white/55 mb-4">
        {isHe ? step.bodyHe : step.bodyEn}
      </p>

      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width:  i === stepIndex ? 16 : 5,
                height: 5,
                background: i === stepIndex
                  ? 'rgba(99,102,241,1)'
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {!isFirst && (
            <button
              onClick={onBack}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/8 hover:text-white/70"
            >
              {isHe ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
            </button>
          )}
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {isLast
              ? (isHe ? 'סיום' : 'Done')
              : (isHe ? 'הבא' : 'Next')}
            {!isLast && (isHe
              ? <ArrowLeft size={11} />
              : <ArrowRight size={11} />)}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── GuidedTour ───────────────────────────────────────────────────────────────

export function GuidedTour({ steps, locale, onComplete, onSkip }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const rafRef = useRef<number>(0)

  const measureTarget = useCallback(() => {
    const step = steps[stepIndex]
    if (!step) return
    const el = document.querySelector<HTMLElement>(step.target)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
    } else {
      setTargetRect(null)
    }
  }, [steps, stepIndex])

  // Measure on step change + scroll/resize
  useEffect(() => {
    measureTarget()
    const onUpdate = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(measureTarget)
    }
    window.addEventListener('scroll', onUpdate, true)
    window.addEventListener('resize', onUpdate)
    return () => {
      window.removeEventListener('scroll', onUpdate, true)
      window.removeEventListener('resize', onUpdate)
      cancelAnimationFrame(rafRef.current)
    }
  }, [measureTarget])

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  if (!targetRect) return null

  return (
    <AnimatePresence>
      <HighlightBox rect={targetRect} />
      <TooltipCard
        step={steps[stepIndex]}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        locale={locale}
        targetRect={targetRect}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={onSkip}
      />
    </AnimatePresence>
  )
}

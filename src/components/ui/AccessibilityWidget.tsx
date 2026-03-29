import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Accessibility, X, Plus, Minus,
  SunMedium, Contrast, Glasses, Zap, Link2, RotateCcw, FileText,
  CircleSlash,
} from 'lucide-react'
import { useAccessibilityStore } from '../../stores/useAccessibilityStore'
import { useI18n } from '../../lib/i18n'

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  icon, labelHe, labelEn, active, onToggle,
}: {
  icon: React.ReactNode
  labelHe: string
  labelEn: string
  active: boolean
  onToggle: () => void
}) {
  const { locale } = useI18n()
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition-all"
      style={{
        background: active ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ color: active ? '#a5b4fc' : 'rgba(255,255,255,0.35)' }}>{icon}</span>
        <span className="text-[12px] font-medium" style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.55)' }}>
          {locale === 'he' ? labelHe : labelEn}
        </span>
      </div>
      {/* Toggle pill */}
      <div
        className="relative h-5 w-9 flex-none rounded-full transition-all"
        style={{
          background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
          boxShadow: active ? '0 0 8px rgba(99,102,241,0.45)' : 'none',
        }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
          style={{ transform: active ? 'translateX(16px)' : 'translateX(2px)', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        />
      </div>
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ he, en }: { he: string; en: string }) {
  const { locale } = useI18n()
  return (
    <p className="text-[9px] font-black uppercase tracking-[0.18em] px-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
      {locale === 'he' ? he : en}
    </p>
  )
}

// ─── AccessibilityWidget ──────────────────────────────────────────────────────

export function AccessibilityWidget() {
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const {
    textSize, highContrast, monochrome, highlightLinks, readableFont, stopAnimations,
    setTextSize, toggle, reset,
  } = useAccessibilityStore()

  const isDefault = textSize === 1 && !highContrast && !monochrome && !highlightLinks && !readableFont && !stopAnimations
  const activeCount = [highContrast, monochrome, highlightLinks, readableFont, stopAnimations].filter(Boolean).length
    + (textSize !== 1 ? 1 : 0)

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        className="fixed z-[999] select-none"
        style={{ bottom: 24, right: 20 }}
        onDragStart={() => setOpen(false)}
      >
        {/* Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute bottom-14 right-0 w-72 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{
                background: 'linear-gradient(180deg, rgba(12,12,20,0.98) 0%, rgba(8,8,14,0.99) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(48px) saturate(200%)',
                WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                boxShadow: '0 24px 72px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Inner top highlight */}
              <div
                className="pointer-events-none absolute top-0 left-8 right-8 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
              />

              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    <Accessibility size={12} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white/85">{isHe ? 'נגישות' : 'Accessibility'}</p>
                    <p className="text-[9px] text-white/30">{isHe ? 'WCAG 2.2 Level AA' : 'WCAG 2.2 Level AA'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={reset}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition hover:bg-white/5"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      title={isHe ? 'איפוס הגדרות' : 'Reset all'}
                    >
                      <RotateCcw size={10} />
                      {isHe ? 'איפוס' : 'Reset'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/8 hover:text-white/60"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-3 py-3 space-y-3 max-h-[calc(100dvh-180px)] overflow-y-auto">

                {/* ── Vision ─────────────────────────────────────── */}
                <SectionLabel he="ראייה" en="Vision" />

                {/* Text size */}
                <div
                  className="rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SunMedium size={13} style={{ color: textSize !== 1 ? '#a5b4fc' : 'rgba(255,255,255,0.35)' }} />
                      <span className="text-[12px] font-medium" style={{ color: textSize !== 1 ? '#c4b5fd' : 'rgba(255,255,255,0.55)' }}>
                        {isHe ? 'גודל טקסט' : 'Text Size'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTextSize(textSize - 0.1)}
                        disabled={textSize <= 1}
                        className="flex h-6 w-6 items-center justify-center rounded-lg transition disabled:opacity-25"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        aria-label={isHe ? 'הקטן טקסט' : 'Decrease text size'}
                      >
                        <Minus size={10} className="text-white/60" />
                      </button>
                      <span className="w-9 text-center text-[11px] font-black tabular-nums" style={{ color: textSize !== 1 ? '#a5b4fc' : 'rgba(255,255,255,0.55)' }}>
                        {Math.round(textSize * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setTextSize(textSize + 0.1)}
                        disabled={textSize >= 1.5}
                        className="flex h-6 w-6 items-center justify-center rounded-lg transition disabled:opacity-25"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        aria-label={isHe ? 'הגדל טקסט' : 'Increase text size'}
                      >
                        <Plus size={10} className="text-white/60" />
                      </button>
                    </div>
                  </div>
                  {/* Size bar */}
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((textSize - 1) / 0.5) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                      }}
                    />
                  </div>
                </div>

                <ToggleRow
                  icon={<Contrast size={13} />}
                  labelHe="ניגודיות גבוהה"
                  labelEn="High Contrast"
                  active={highContrast}
                  onToggle={() => toggle('highContrast')}
                />
                <ToggleRow
                  icon={<CircleSlash size={13} />}
                  labelHe="מונוכרום (גווני אפור)"
                  labelEn="Monochrome (Greyscale)"
                  active={monochrome}
                  onToggle={() => toggle('monochrome')}
                />
                <ToggleRow
                  icon={<Glasses size={13} />}
                  labelHe="פונט קריא (Arial)"
                  labelEn="Readable Font (Arial)"
                  active={readableFont}
                  onToggle={() => toggle('readableFont')}
                />

                {/* ── Cognitive ──────────────────────────────────── */}
                <SectionLabel he="קוגניטיבי" en="Cognitive" />

                <ToggleRow
                  icon={<Zap size={13} />}
                  labelHe="עצור אנימציות"
                  labelEn="Stop Animations"
                  active={stopAnimations}
                  onToggle={() => toggle('stopAnimations')}
                />

                {/* ── Navigation ─────────────────────────────────── */}
                <SectionLabel he="ניווט" en="Navigation" />

                <ToggleRow
                  icon={<Link2 size={13} />}
                  labelHe="הדגש קישורים וכפתורים"
                  labelEn="Highlight Links & Buttons"
                  active={highlightLinks}
                  onToggle={() => toggle('highlightLinks')}
                />
              </div>

              {/* Footer — Accessibility Statement link */}
              <div
                className="px-3 pb-3 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  type="button"
                  onClick={() => { setOpen(false); navigate('/accessibility') }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc',
                  }}
                >
                  <FileText size={12} />
                  {isHe ? 'הצהרת נגישות' : 'Accessibility Statement'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          style={{
            background: open
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
            border: open ? 'none' : '1px solid rgba(255,255,255,0.12)',
            boxShadow: open
              ? '0 0 28px rgba(99,102,241,0.55), 0 8px 24px rgba(0,0,0,0.6)'
              : '0 8px 24px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(20px)',
          }}
          aria-label={isHe ? 'תפריט נגישות' : 'Accessibility Menu'}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={18} className="text-white" />
              </motion.span>
            ) : (
              <motion.span key="a" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Accessibility size={18} style={{ color: 'rgba(255,255,255,0.75)' }} />
              </motion.span>
            )}
          </AnimatePresence>
          {/* Active-settings badge */}
          {activeCount > 0 && !open && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 8px rgba(99,102,241,0.6)' }}
            >
              {activeCount}
            </span>
          )}
        </motion.button>
      </motion.div>
    </>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Accessibility, X, Plus, Minus,
  SunMedium, Contrast, Glasses, Zap, Link2, RotateCcw, FileText,
  CircleSlash, FlipHorizontal, BookOpen, AlignJustify, LetterText,
  Eye, MousePointer2, ScanLine, Type,
} from 'lucide-react'
import { useAccessibilityStore, type ColorBlindMode } from '../../stores/useAccessibilityStore'
import { useI18n } from '../../lib/i18n'

// ─── Reading Mask overlay ─────────────────────────────────────────────────────

function ReadingMask() {
  const [mouseY, setMouseY] = useState(0)
  const STRIP = 80

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouseY(e.clientY)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const top = mouseY - STRIP / 2

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9990]"
      style={{
        background: `linear-gradient(
          to bottom,
          rgba(0,0,0,0.78) 0px,
          rgba(0,0,0,0.78) ${top}px,
          transparent ${top}px,
          transparent ${top + STRIP}px,
          rgba(0,0,0,0.78) ${top + STRIP}px,
          rgba(0,0,0,0.78) 100%
        )`,
      }}
    />
  )
}

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
  const isRTL = locale === 'he'

  // Pill: w-9 = 36px, dot: w-4 = 16px. Flush positions: left=2px, right=18px.
  // In RTL the toggle flips: ON=dot at physical left (2px), OFF=dot at physical right (18px).
  // In LTR: ON=dot at physical right (18px), OFF=dot at physical left (2px).
  const dotX = active
    ? (isRTL ? 'translateX(2px)'  : 'translateX(18px)')
    : (isRTL ? 'translateX(18px)' : 'translateX(2px)')

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition-all"
      style={{
        background: active ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
        direction: 'inherit',
      }}
    >
      {/* Icon + label — always first in DOM; flex direction follows dir="rtl" on html */}
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
          style={{ transform: dotX, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        />
      </div>
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ he, en }: { he: string; en: string }) {
  const { locale } = useI18n()
  return (
    <p className="text-[9px] font-black uppercase tracking-[0.18em] px-1 pt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
      {locale === 'he' ? he : en}
    </p>
  )
}

// ─── Color blind selector ─────────────────────────────────────────────────────

const CB_MODES: { mode: ColorBlindMode; labelHe: string; labelEn: string; color: string }[] = [
  { mode: 'none',         labelHe: 'רגיל',          labelEn: 'Normal',      color: 'rgba(255,255,255,0.25)' },
  { mode: 'protanopia',   labelHe: 'פרוטנופיה',     labelEn: 'Protan',      color: '#f87171' },
  { mode: 'deuteranopia', labelHe: 'דאוטרנופיה',    labelEn: 'Deutan',      color: '#4ade80' },
  { mode: 'tritanopia',   labelHe: 'טריטנופיה',     labelEn: 'Tritan',      color: '#60a5fa' },
]

function ColorBlindRow() {
  const { locale } = useI18n()
  const { colorBlindMode, setColorBlindMode } = useAccessibilityStore()
  return (
    <div
      className="rounded-xl px-3 py-2.5 space-y-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <Eye size={13} style={{ color: colorBlindMode !== 'none' ? '#a5b4fc' : 'rgba(255,255,255,0.35)' }} />
        <span className="text-[12px] font-medium" style={{ color: colorBlindMode !== 'none' ? '#c4b5fd' : 'rgba(255,255,255,0.55)' }}>
          {locale === 'he' ? 'עיוורון צבעים' : 'Color Blind Mode'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {CB_MODES.map(({ mode, labelHe, labelEn, color }) => {
          const active = colorBlindMode === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setColorBlindMode(mode)}
              className="rounded-lg py-1.5 text-[9px] font-bold transition-all"
              style={{
                background: active ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
                border: active ? '1px solid rgba(99,102,241,0.45)' : `1px solid ${color}44`,
                color: active ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
              }}
            >
              <span
                className="block mx-auto mb-0.5 h-2 w-2 rounded-full"
                style={{ background: active ? '#a5b4fc' : color }}
              />
              {locale === 'he' ? labelHe : labelEn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── AccessibilityWidget ──────────────────────────────────────────────────────

export function AccessibilityWidget() {
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLDivElement>(null)

  // Drag constraints — keep FAB within viewport
  // FAB starts at bottom:24 right:20, size 48×48. Constraints are relative offsets from initial position.
  const [dragBounds, setDragBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })
  useEffect(() => {
    const compute = () => setDragBounds({
      left:   -(window.innerWidth  - 48 - 20),
      top:    -(window.innerHeight - 48 - 24),
      right:  0,
      bottom: 0,
    })
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  // Panel height: fill available space above the FAB
  const panelH = Math.min(window.innerHeight - 112, 580)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        fabRef.current && !fabRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const {
    textSize, highContrast, monochrome, invertColors,
    dyslexiaFont, readableFont, lineHeightBoost, letterSpacing, readingMask,
    stopAnimations, highlightLinks, focusHighlight, bigCursor,
    setTextSize, toggle, reset,
  } = useAccessibilityStore()

  const activeCount = [
    highContrast, monochrome, invertColors, dyslexiaFont, readableFont,
    lineHeightBoost, letterSpacing, readingMask, stopAnimations,
    highlightLinks, focusHighlight, bigCursor,
  ].filter(Boolean).length
    + (textSize !== 1 ? 1 : 0)
    + (useAccessibilityStore.getState().colorBlindMode !== 'none' ? 1 : 0)

  const isDefault = activeCount === 0

  return (
    <>
      {/* Reading mask — rendered outside widget container so it covers full viewport */}
      {readingMask && <ReadingMask />}

      {/* Fixed panel — always anchored bottom-right, 16px from edges, above the FAB */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            className="fixed z-[9998] w-72 rounded-2xl flex flex-col"
            style={{
              bottom: 88,
              right: 16,
              height: panelH,
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(10,10,20,0.99) 0%, rgba(6,6,14,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
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
                  className="flex h-7 w-7 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)' }}
                >
                  <Accessibility size={13} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white/85">{isHe ? 'נגישות' : 'Accessibility'}</p>
                  <p className="text-[9px] text-white/30">WCAG 2.2 AA · IS 5568</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
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

            {/* Scrollable content */}
            <div
              className="px-3 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0"
              onPointerDownCapture={e => e.stopPropagation()}
            >

              {/* ── Vision ────────────────────────────────────── */}
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

              <ToggleRow icon={<Contrast size={13} />}        labelHe="ניגודיות גבוהה"       labelEn="High Contrast"        active={highContrast}   onToggle={() => toggle('highContrast')} />
              <ToggleRow icon={<CircleSlash size={13} />}     labelHe="גווני אפור"            labelEn="Greyscale"            active={monochrome}     onToggle={() => toggle('monochrome')} />
              <ToggleRow icon={<FlipHorizontal size={13} />}  labelHe="היפוך צבעים"           labelEn="Invert Colors"        active={invertColors}   onToggle={() => toggle('invertColors')} />

              <ColorBlindRow />

              {/* ── Reading & Cognitive ───────────────────── */}
              <SectionLabel he="קריאה וקוגניציה" en="Reading & Cognitive" />

              <ToggleRow icon={<Type size={13} />}            labelHe="פונט לדיסלקציה (Atkinson)" labelEn="Dyslexia Font (Atkinson)" active={dyslexiaFont}    onToggle={() => toggle('dyslexiaFont')} />
              <ToggleRow icon={<Glasses size={13} />}         labelHe="פונט קריא (Arial)"     labelEn="Readable Font (Arial)"  active={readableFont}   onToggle={() => toggle('readableFont')} />
              <ToggleRow icon={<AlignJustify size={13} />}    labelHe="גובה שורה מוגבר"       labelEn="Increased Line Height"  active={lineHeightBoost} onToggle={() => toggle('lineHeightBoost')} />
              <ToggleRow icon={<LetterText size={13} />}      labelHe="ריווח אותיות"          labelEn="Letter Spacing"         active={letterSpacing}  onToggle={() => toggle('letterSpacing')} />
              <ToggleRow icon={<ScanLine size={13} />}        labelHe="מסכת קריאה"            labelEn="Reading Mask"           active={readingMask}    onToggle={() => toggle('readingMask')} />
              <ToggleRow icon={<Zap size={13} />}             labelHe="עצור אנימציות"         labelEn="Stop Animations"        active={stopAnimations} onToggle={() => toggle('stopAnimations')} />

              {/* ── Navigation & Motor ───────────────────── */}
              <SectionLabel he="ניווט ומוטוריקה" en="Navigation & Motor" />

              <ToggleRow icon={<Link2 size={13} />}           labelHe="הדגש קישורים וכפתורים" labelEn="Highlight Links & Buttons" active={highlightLinks}  onToggle={() => toggle('highlightLinks')} />
              <ToggleRow icon={<BookOpen size={13} />}        labelHe="הדגש פוקוס"            labelEn="Focus Highlight"           active={focusHighlight} onToggle={() => toggle('focusHighlight')} />
              <ToggleRow icon={<MousePointer2 size={13} />}   labelHe="סמן עכבר גדול"         labelEn="Large Cursor"              active={bigCursor}      onToggle={() => toggle('bigCursor')} />

            </div>

            {/* Footer */}
            <div
              className="px-3 pb-3 pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/accessibility') }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold transition-all hover:bg-indigo-500/10"
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

      {/* Draggable FAB — always starts bottom-right, draggable within viewport */}
      <motion.div
        ref={fabRef}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={dragBounds}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        className="fixed z-[9999] select-none"
        style={{ bottom: 24, right: 20 }}
        onDragStart={() => setOpen(false)}
      >
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

          {/* Active count badge */}
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

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Accessibility, Type, Eye, Link, X, Plus, Minus } from 'lucide-react'

// ─── Persistence keys ─────────────────────────────────────────────────────────

const KEY_SIZE = 'ds:a11y:textSize'
const KEY_CONTRAST = 'ds:a11y:contrast'
const KEY_LINKS = 'ds:a11y:links'

// ─── CSS injection ────────────────────────────────────────────────────────────

function applyA11y(textSize: number, contrast: boolean, highlightLinks: boolean) {
  const root = document.documentElement
  root.style.setProperty('--a11y-scale', String(textSize))
  root.classList.toggle('a11y-high-contrast', contrast)
  root.classList.toggle('a11y-highlight-links', highlightLinks)
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: active ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ color: active ? '#818cf8' : 'rgba(255,255,255,0.4)' }}>{icon}</span>
        <span
          className="text-xs font-semibold"
          style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.55)' }}
        >
          {label}
        </span>
      </div>
      <div
        className="h-5 w-9 rounded-full transition-all relative"
        style={{
          background: active ? '#6366f1' : 'rgba(255,255,255,0.1)',
          boxShadow: active ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
        }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: active ? 'translateX(16px)' : 'translateX(2px)' }}
        />
      </div>
    </button>
  )
}

// ─── AccessibilityWidget ──────────────────────────────────────────────────────

export function AccessibilityWidget({ locale = 'he' }: { locale?: string }) {
  const isHe = locale === 'he'
  const [open, setOpen] = useState(false)
  const [textSize, setTextSize] = useState<number>(() => {
    const s = localStorage.getItem(KEY_SIZE)
    return s ? parseFloat(s) : 1
  })
  const [contrast, setContrast] = useState<boolean>(() => localStorage.getItem(KEY_CONTRAST) === 'true')
  const [highlightLinks, setHighlightLinks] = useState<boolean>(() => localStorage.getItem(KEY_LINKS) === 'true')

  const dragControls = useDragControls()

  // Apply on mount and on change
  useEffect(() => {
    applyA11y(textSize, contrast, highlightLinks)
    localStorage.setItem(KEY_SIZE, String(textSize))
    localStorage.setItem(KEY_CONTRAST, String(contrast))
    localStorage.setItem(KEY_LINKS, String(highlightLinks))
  }, [textSize, contrast, highlightLinks])

  const adjustSize = (delta: number) => {
    setTextSize(prev => Math.round(Math.min(1.4, Math.max(0.8, prev + delta)) * 10) / 10)
  }

  const reset = () => {
    setTextSize(1)
    setContrast(false)
    setHighlightLinks(false)
  }

  const isDefault = textSize === 1 && !contrast && !highlightLinks

  return (
    <>
      {/* Global CSS classes injected once */}
      <style>{`
        .a11y-high-contrast { filter: contrast(1.5) brightness(1.1) !important; }
        .a11y-highlight-links a { text-decoration: underline !important; outline: 2px solid #818cf8 !important; outline-offset: 2px !important; }
        html { font-size: calc(16px * var(--a11y-scale, 1)); }
      `}</style>

      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        className="fixed z-[999] select-none"
        style={{ bottom: 88, right: 20 }}
      >
        {/* Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute bottom-14 right-0 w-64 rounded-2xl p-4 space-y-3"
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Accessibility size={14} className="text-indigo-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/60">
                    {isHe ? 'נגישות' : 'Accessibility'}
                  </span>
                </div>
                {!isDefault && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-[10px] font-semibold text-white/30 hover:text-white/70 transition"
                  >
                    {isHe ? 'איפוס' : 'Reset'}
                  </button>
                )}
              </div>

              {/* Text size */}
              <div
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type size={13} className="text-white/40" />
                    <span className="text-xs font-semibold text-white/55">
                      {isHe ? 'גודל טקסט' : 'Text Size'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustSize(-0.1)}
                      disabled={textSize <= 0.8}
                      className="flex h-6 w-6 items-center justify-center rounded-lg transition disabled:opacity-30"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <Minus size={10} className="text-white/60" />
                    </button>
                    <span className="text-[11px] font-black tabular-nums text-white/70 w-8 text-center">
                      {Math.round(textSize * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustSize(0.1)}
                      disabled={textSize >= 1.4}
                      className="flex h-6 w-6 items-center justify-center rounded-lg transition disabled:opacity-30"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <Plus size={10} className="text-white/60" />
                    </button>
                  </div>
                </div>
              </div>

              {/* High contrast */}
              <ToggleRow
                icon={<Eye size={13} />}
                label={isHe ? 'ניגודיות גבוהה' : 'High Contrast'}
                active={contrast}
                onToggle={() => setContrast(v => !v)}
              />

              {/* Highlight links */}
              <ToggleRow
                icon={<Link size={13} />}
                label={isHe ? 'הדגש קישורים' : 'Highlight Links'}
                active={highlightLinks}
                onToggle={() => setHighlightLinks(v => !v)}
              />

              <p className="text-[9px] text-white/20 text-center pt-1">
                {isHe ? 'נגישות לפי חוק שוויון זכויות לאנשים עם מוגבלות' : 'WCAG 2.1 Level AA compliance'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB button — draggable */}
        <motion.button
          type="button"
          onPointerDown={e => dragControls.start(e)}
          onClick={() => setOpen(v => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          style={{
            background: open
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            border: open ? 'none' : '1px solid rgba(255,255,255,0.12)',
            boxShadow: open
              ? '0 0 24px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.5)'
              : '0 8px 24px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)',
          }}
          aria-label={isHe ? 'תפריט נגישות' : 'Accessibility Menu'}
          aria-expanded={open}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={18} className="text-white" />
              </motion.span>
            ) : (
              <motion.span key="a" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Accessibility size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </>
  )
}

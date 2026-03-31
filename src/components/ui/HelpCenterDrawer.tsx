import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, ChevronDown, BookOpen, Zap, Map } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { KNOWLEDGE_BASE, KB_CATEGORIES } from '../../lib/knowledgeBase'
import { startDashboardTour } from '../../lib/tourEngine'

// ─── HelpCenterDrawer ─────────────────────────────────────────────────────────

interface HelpCenterDrawerProps {
  open?: boolean
  onClose?: () => void
}

export function HelpCenterDrawer({ open: externalOpen, onClose: externalOnClose }: HelpCenterDrawerProps = {}) {
  const { locale } = useI18n()
  const isControlled = externalOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const [expandedIdx, setExpandedIdx]   = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const isHe = locale === 'he'

  const open    = isControlled ? externalOpen! : internalOpen
  const onClose = isControlled ? externalOnClose! : () => setInternalOpen(false)

  const visible = KNOWLEDGE_BASE
    .map((g, i) => ({ ...g, idx: i }))
    .filter(g => activeCategory === 'all' || g.category === activeCategory)

  const activeCat = KB_CATEGORIES.find(c => c.key === activeCategory)

  const CATEGORY_PILLS = [
    { key: 'all', label_he: 'הכל', label_en: 'All', color: '#818cf8' },
    ...KB_CATEGORIES,
  ]

  function handleRestartTour() {
    onClose()
    setTimeout(() => startDashboardTour(locale as 'he' | 'en'), 300)
  }

  return (
    <>
      {/* Floating trigger — uncontrolled mode, desktop only */}
      {!isControlled && (
        <motion.button
          onClick={() => setInternalOpen(true)}
          className="fixed z-40 hidden sm:flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            bottom: 24, left: 20,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label={isHe ? 'מרכז עזרה' : 'Help Center'}
        >
          <HelpCircle size={16} className="text-white/45" />
        </motion.button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-0 bottom-0 z-50 w-full max-w-[360px] flex flex-col"
            style={{ [isHe ? 'left' : 'right']: 0 }}
            initial={{ x: isHe ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isHe ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          >
            <div
              className="flex flex-col h-full"
              style={{
                background: 'linear-gradient(180deg, #0c0c1e 0%, #080812 100%)',
                borderInlineStart: '1px solid rgba(255,255,255,0.07)',
                boxShadow: isHe ? '32px 0 80px rgba(0,0,0,0.8)' : '-32px 0 80px rgba(0,0,0,0.8)',
              }}
            >
              {/* ── Header ────────────────────────────────────────────────── */}
              <div
                className="flex-none px-5 py-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        boxShadow: '0 0 16px rgba(99,102,241,0.2)',
                      }}
                    >
                      <BookOpen size={15} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white/90 tracking-tight">
                        DealSpace Academy
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {isHe ? `${KNOWLEDGE_BASE.length} מדריכים ותשובות` : `${KNOWLEDGE_BASE.length} guides & answers`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 hover:bg-white/5 hover:text-white/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Restart Tour button */}
                <button
                  type="button"
                  onClick={handleRestartTour}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all hover:bg-white/5"
                  style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}
                >
                  <Map size={13} className="text-indigo-400 flex-none" />
                  <span className="text-[12px] font-bold text-indigo-300/80">
                    {isHe ? 'הפעל סיור מודרך מחדש' : 'Restart Guided Tour'}
                  </span>
                  <Zap size={10} className="text-indigo-400/50 ms-auto flex-none" />
                </button>
              </div>

              {/* ── Category pills ──────────────────────────────────────── */}
              <div
                className="flex-none flex flex-wrap gap-1.5 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                {CATEGORY_PILLS.map(cat => {
                  const isActive = activeCategory === cat.key
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => { setActiveCategory(cat.key); setExpandedIdx(null) }}
                      className="flex-none flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all whitespace-nowrap"
                      style={{
                        background: isActive ? `${cat.color}18` : 'rgba(255,255,255,0.04)',
                        color: isActive ? cat.color : 'rgba(255,255,255,0.3)',
                        border: `1px solid ${isActive ? cat.color + '35' : 'rgba(255,255,255,0.07)'}`,
                        boxShadow: isActive ? `0 0 8px ${cat.color}20` : 'none',
                      }}
                    >
                      {isHe ? ('label_he' in cat ? cat.label_he : 'הכל') : ('label_en' in cat ? cat.label_en : 'All')}
                    </button>
                  )
                })}
              </div>

              {/* ── Active category label ───────────────────────────────── */}
              {activeCategory !== 'all' && activeCat && (
                <div className="flex-none px-5 pt-3 pb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: activeCat.color + 'aa' }}>
                    {isHe ? activeCat.label_he : activeCat.label_en} — {visible.length} {isHe ? 'תוצאות' : 'results'}
                  </p>
                </div>
              )}

              {/* ── Guide list ──────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
                {visible.map(({ idx, q_he, q_en, a_he, a_en, category }) => {
                  const cat = KB_CATEGORIES.find(c => c.key === category)
                  const accentColor = cat?.color ?? '#818cf8'
                  const isExpanded = expandedIdx === idx
                  return (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden transition-all"
                      style={{
                        background: isExpanded ? `${accentColor}09` : 'rgba(255,255,255,0.025)',
                        border: `1px solid ${isExpanded ? accentColor + '28' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-start"
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div
                            className="flex-none mt-0.5 h-1.5 w-1.5 rounded-full"
                            style={{ background: accentColor, boxShadow: `0 0 4px ${accentColor}` }}
                          />
                          <span className="text-[12.5px] font-semibold text-white/80 leading-snug">
                            {isHe ? q_he : q_en}
                          </span>
                        </div>
                        <motion.span
                          className="flex-none text-white/25 mt-0.5"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <ChevronDown size={13} />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' as const }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div
                              className="mx-4 mb-4 rounded-xl px-4 py-3"
                              style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${accentColor}18` }}
                            >
                              <p className="text-[12px] leading-relaxed text-white/55">
                                {isHe ? a_he : a_en}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* ── Footer ──────────────────────────────────────────────── */}
              <div
                className="flex-none px-5 py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[9px] text-white/18">
                  {isHe ? 'DealSpace — הצעות מחיר דיגיטליות לישראל' : 'DealSpace — Digital Proposals for Israel'}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-white/20">
                  <Zap size={8} className="text-indigo-400/50" />
                  <span>v2.2</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

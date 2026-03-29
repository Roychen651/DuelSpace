import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, ChevronDown } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

// ─── FAQ content ──────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q_en: 'How do Payment Milestones work?',
    q_he: 'איך עובדים אבני דרך לתשלום?',
    a_en: 'Milestones split your total into payment stages. Add milestone rows in the Editor, assign a percentage to each — they must total 100%. The client sees the schedule in the Deal Room and it appears in the signed PDF.',
    a_he: 'אבני דרך מחלקות את התשלום לשלבים. הוסף שורות במחולל ההצעות, הגדר אחוז לכל שלב — הסכום חייב להיות 100%. הלקוח רואה את לוח הזמנים בחדר הדיל ובחוזה החתום.',
  },
  {
    q_en: 'How do I set my Brand Color?',
    q_he: 'איך מגדיר את צבע המותג שלי?',
    a_en: 'Go to Profile → Brand Color. Choose from 12 presets or enter any custom hex code. The color is auto-applied to every Deal Room you share — header accents, buttons, and milestone bars all adapt.',
    a_he: 'עבור לפרופיל ← צבע מותג. בחר מ-12 צבעים מוכנים או הזן קוד HEX מותאם. הצבע מוחל אוטומטית על כל חדר הדיל שתשלח — כותרות, כפתורים ופסי אבני דרך מתאימים אליו.',
  },
  {
    q_en: 'Are electronic signatures legally binding?',
    q_he: 'האם חתימות דיגיטליות מחייבות חוקית?',
    a_en: 'Yes. Under the Israeli Electronic Signature Law (2001), electronic signatures are legally recognized. DealSpace captures the signature image, acceptance timestamp, and client details for your records.',
    a_he: 'כן. לפי חוק חתימה אלקטרונית תשס"א-2001, חתימה אלקטרונית מוכרת חוקית בישראל. DealSpace שומרת את תמונת החתימה, חותמת הזמן ופרטי הלקוח לרשומותיך.',
  },
  {
    q_en: 'How does the Deal Room access code work?',
    q_he: 'איך קוד הגישה לחדר הדיל עובד?',
    a_en: 'In the Proposal Editor → Contract section, enter a 4-digit code. Clients must enter this code to view the Deal Room. A wrong code returns nothing — proposal existence is never revealed.',
    a_he: 'במחולל ההצעות ← חלק החוזה, הזן קוד בן 4 ספרות. הלקוח צריך להזין את הקוד כדי לצפות בחדר הדיל. קוד שגוי מחזיר תגובה ריקה — קיום ההצעה לעולם לא נחשף.',
  },
]

// ─── HelpCenterDrawer ─────────────────────────────────────────────────────────

export function HelpCenterDrawer() {
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const isHe = locale === 'he'

  return (
    <>
      {/* ── Trigger FAB ────────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed z-40 hidden sm:flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          bottom: 24,
          left: 20,
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

      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Drawer ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-0 bottom-0 z-50 w-full max-w-sm flex flex-col"
            style={{ [isHe ? 'left' : 'right']: 0 }}
            initial={{ x: isHe ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isHe ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            <div
              className="flex flex-col h-full"
              style={{
                background: 'linear-gradient(180deg, #0c0c1a 0%, #090912 100%)',
                borderInlineStart: '1px solid rgba(255,255,255,0.07)',
                boxShadow: isHe ? '24px 0 64px rgba(0,0,0,0.7)' : '-24px 0 64px rgba(0,0,0,0.7)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-none"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <HelpCircle size={13} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{isHe ? 'מרכז עזרה' : 'Help Center'}</p>
                    <p className="text-[10px] text-white/30">{isHe ? 'שאלות ותשובות' : 'Quick guides'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/5 hover:text-white/70"
                >
                  <X size={14} />
                </button>
              </div>

              {/* FAQ list */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4 px-1">
                  {isHe ? 'שאלות נפוצות' : 'Frequently Asked Questions'}
                </p>

                {FAQ_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden transition-all"
                    style={{
                      background: expandedIdx === i ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.03)',
                      border: expandedIdx === i ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
                    >
                      <span className="text-[13px] font-semibold text-white/75 leading-snug">
                        {isHe ? item.q_he : item.q_en}
                      </span>
                      <motion.span
                        className="text-white/25 flex-none"
                        animate={{ rotate: expandedIdx === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={13} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedIdx === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' as const }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p className="px-4 pb-4 pt-0.5 text-xs leading-relaxed text-white/40">
                            {isHe ? item.a_he : item.a_en}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="flex-none px-5 py-3 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[9px] text-white/18">
                  {isHe ? 'DealSpace — פלטפורמת הצעות מחיר דיגיטליות לעצמאים' : 'DealSpace — Digital Proposal Platform for Freelancers'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

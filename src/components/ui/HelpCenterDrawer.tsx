import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, ChevronDown, BookOpen, Zap } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

// ─── FAQ content ──────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q_en: 'How do I send a proposal to a client?',
    q_he: 'איך שולחים הצעת מחיר ללקוח?',
    a_en: 'Once your proposal is ready, click "Send" in the top bar of the Proposal Editor. DealSpace generates a unique Deal Room link. Copy it and send via WhatsApp, email, or any channel. The link optionally supports a 4-digit access code and tracks views automatically.',
    a_he: 'כשההצעה מוכנה, לחץ "שלח" בסרגל הכותרת של מחולל ההצעות. DealSpace מייצרת קישור ייחודי לחדר הדיל. העתק ושלח בוואטסאפ, מייל, או כל ערוץ אחר. הקישור תומך אופציונלית בקוד גישה בן 4 ספרות ועוקב אחר צפיות אוטומטית.',
  },
  {
    q_en: 'How do Payment Milestones work?',
    q_he: 'איך עובדים אבני דרך לתשלום?',
    a_en: 'Milestones split your total into payment stages. In the Editor, add milestone rows and assign a percentage to each — they must total exactly 100%. The client sees the payment schedule in the Deal Room and it appears in the signed PDF.',
    a_he: 'אבני דרך מחלקות את התשלום לשלבים. במחולל, הוסף שורות אבני דרך והגדר אחוז לכל שלב — הסכום חייב להסתכם ב-100% בדיוק. הלקוח רואה את לוח התשלומים בחדר הדיל ובחוזה החתום.',
  },
  {
    q_en: 'How do add-ons work?',
    q_he: 'איך עובדות תוספות?',
    a_en: 'Add-ons are optional extras your client can toggle on or off in the Deal Room. Add them in the Pricing section of the Editor. Each has a name, optional description, and price. Enabled add-ons are included in the total and appear in the signed PDF.',
    a_he: 'תוספות הן פריטים אופציונליים שהלקוח יכול להפעיל או לכבות בחדר הדיל. הוסף אותן בסעיף התמחור של המחולל. לכל תוספת יש שם, תיאור אופציונלי ומחיר. תוספות מופעלות נכללות בסכום ומופיעות בחוזה החתום.',
  },
  {
    q_en: 'What is VAT and how does it work?',
    q_he: 'מה זה מע"מ ואיך זה עובד?',
    a_en: 'Enable "Include VAT" in the Pricing section to add VAT to the total. The VAT rate (default 17%) is configurable in Profile → VAT Rate. The Deal Room shows a full breakdown — base + VAT = total. The signed PDF includes the VAT line item for legal records.',
    a_he: 'הפעל "כלול מע\"מ" בסעיף התמחור להוספת מע\"מ לסכום. שיעור המע\"מ (ברירת מחדל 17%) ניתן לשינוי בפרופיל ← שיעור מע\"מ. חדר הדיל מציג פירוט מלא: בסיס + מע\"מ = סכום כולל. החוזה החתום כולל שורת מע\"מ לצרכי חשבונאות.',
  },
  {
    q_en: 'How do I set my Brand Color?',
    q_he: 'איך מגדיר את צבע המותג שלי?',
    a_en: 'Go to Profile → Brand Color. Choose from 12 presets or enter any hex code. The color auto-applies to every Deal Room you share — header accents, buttons, and milestone bars all adapt to your brand identity.',
    a_he: 'עבור לפרופיל ← צבע מותג. בחר מ-12 צבעים מוכנים או הזן קוד HEX מותאם. הצבע מוחל אוטומטית על כל חדר דיל שתשלח — כותרות, כפתורים ופסי אבני דרך מתאימים לזהות המותג שלך.',
  },
  {
    q_en: 'Are electronic signatures legally binding?',
    q_he: 'האם חתימות אלקטרוניות מחייבות חוקית?',
    a_en: 'Yes. Under Israeli Electronic Signature Law (2001), electronic signatures are legally recognized. DealSpace captures the signature image, acceptance timestamp, client name, company, and tax ID for your legal records.',
    a_he: 'כן. לפי חוק חתימה אלקטרונית תשס"א-2001, חתימה אלקטרונית מוכרת חוקית בישראל. DealSpace שומרת את תמונת החתימה, חותמת הזמן, שם הלקוח, חברה ומספר עוסק לרשומותיך.',
  },
  {
    q_en: 'How does the Deal Room access code work?',
    q_he: 'איך קוד הגישה לחדר הדיל עובד?',
    a_en: 'In the Proposal Editor → Contract section, enter a 4-digit code. Clients must enter it to view the Deal Room. A wrong code returns nothing silently — proposal existence is never revealed to unauthorized users.',
    a_he: 'במחולל ← חלק החוזה, הזן קוד בן 4 ספרות. הלקוח צריך להזין אותו כדי לצפות בחדר הדיל. קוד שגוי מחזיר תגובה ריקה — קיום ההצעה לא נחשף למשתמשים לא מורשים.',
  },
  {
    q_en: 'How do I use the Services Library?',
    q_he: 'איך משתמשים בספריית השירותים?',
    a_en: 'The Services Library (menu → Saved Services) lets you define reusable service items with fixed prices. In the Proposal Editor, click "Add from Library" to insert them instantly — no need to re-type prices and descriptions for recurring packages.',
    a_he: 'ספריית השירותים (תפריט ← שירותים שמורים) מאפשרת להגדיר שירותים חוזרים עם מחירים קבועים. במחולל ההצעות, לחץ "הוסף מספרייה" להכנסתם מיידית — ללא הצורך להקליד מחירים ותיאורים מחדש לחבילות חוזרות.',
  },
  {
    q_en: 'Can clients decline a proposal?',
    q_he: 'האם לקוחות יכולים לדחות הצעה?',
    a_en: 'Yes. Clients can click "Decline" at the bottom of the Deal Room. You\'ll see the status update to "Declined" in real time on your Dashboard. You can then duplicate the proposal, adjust pricing or terms, and send a revised version.',
    a_he: 'כן. הלקוח יכול ללחוץ "דחייה" בתחתית חדר הדיל. הסטטוס יתעדכן ל"נדחתה" בזמן אמת בלוח הבקרה. לאחר מכן תוכל לשכפל את ההצעה, לשנות תמחור או תנאים, ולשלוח גרסה מחודשת.',
  },
  {
    q_en: 'How do I track client engagement?',
    q_he: 'איך עוקבים אחרי מעורבות הלקוח?',
    a_en: 'Each proposal card shows: view count (how many times the client opened the Deal Room), time spent (total seconds engaged), and the last viewed timestamp. All metrics update in real time on your Dashboard — so you know exactly when to follow up.',
    a_he: 'כל כרטיס הצעה מציג: מספר צפיות (כמה פעמים הלקוח פתח את חדר הדיל), זמן שהייה (שניות עיסוק כולל), וזמן הצפייה האחרון. כל הנתונים מתעדכנים בזמן אמת בלוח הבקרה — כדי שתדע בדיוק מתי לעקוב אחרי הלקוח.',
  },
]

// ─── Category tags ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all',      label_en: 'All',        label_he: 'הכל' },
  { key: 'sending',  label_en: 'Sending',    label_he: 'שליחה' },
  { key: 'pricing',  label_en: 'Pricing',    label_he: 'תמחור' },
  { key: 'legal',    label_en: 'Legal',      label_he: 'משפטי' },
  { key: 'settings', label_en: 'Settings',   label_he: 'הגדרות' },
]

// Map FAQ indices to categories
const FAQ_CATEGORIES: Record<number, string> = {
  0: 'sending', 1: 'pricing', 2: 'pricing', 3: 'pricing',
  4: 'settings', 5: 'legal', 6: 'settings', 7: 'settings',
  8: 'sending', 9: 'sending',
}

// ─── HelpCenterDrawer ─────────────────────────────────────────────────────────

interface HelpCenterDrawerProps {
  /** Controlled mode: pass open + onClose. In controlled mode the floating FAB is NOT rendered. */
  open?: boolean
  onClose?: () => void
}

export function HelpCenterDrawer({ open: externalOpen, onClose: externalOnClose }: HelpCenterDrawerProps = {}) {
  const { locale } = useI18n()
  const isControlled = externalOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const isHe = locale === 'he'

  const open = isControlled ? externalOpen! : internalOpen
  const onClose = isControlled ? externalOnClose! : () => setInternalOpen(false)

  const visibleItems = FAQ_ITEMS.map((item, i) => ({ ...item, idx: i })).filter(({ idx }) =>
    activeCategory === 'all' || FAQ_CATEGORIES[idx] === activeCategory
  )

  return (
    <>
      {/* ── Floating trigger — desktop only, uncontrolled mode only ─────────── */}
      {!isControlled && (
        <motion.button
          onClick={() => setInternalOpen(true)}
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
      )}

      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
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
                background: 'linear-gradient(180deg, #0d0d1c 0%, #090911 100%)',
                borderInlineStart: '1px solid rgba(255,255,255,0.07)',
                boxShadow: isHe ? '24px 0 64px rgba(0,0,0,0.7)' : '-24px 0 64px rgba(0,0,0,0.7)',
              }}
            >
              {/* ── Header ───────────────────────────────────────────────── */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-none"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    <BookOpen size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{isHe ? 'מרכז עזרה' : 'Help Center'}</p>
                    <p className="text-[10px] text-white/30">
                      {isHe ? `${FAQ_ITEMS.length} מדריכים ושאלות` : `${FAQ_ITEMS.length} guides & answers`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/5 hover:text-white/70"
                >
                  <X size={14} />
                </button>
              </div>

              {/* ── Category filter ──────────────────────────────────────── */}
              <div
                className="flex items-center gap-1.5 px-4 py-3 flex-none overflow-x-auto"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => { setActiveCategory(cat.key); setExpandedIdx(null) }}
                    className="flex-none rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap"
                    style={{
                      background: activeCategory === cat.key ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
                      color: activeCategory === cat.key ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
                      border: activeCategory === cat.key ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {isHe ? cat.label_he : cat.label_en}
                  </button>
                ))}
              </div>

              {/* ── FAQ list ─────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {visibleItems.map(({ idx, q_en, q_he, a_en, a_he }) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: expandedIdx === idx ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.03)',
                      border: expandedIdx === idx ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      transition: 'background 0.18s, border-color 0.18s',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-start"
                    >
                      <span className="text-[13px] font-semibold text-white/80 leading-snug">
                        {isHe ? q_he : q_en}
                      </span>
                      <motion.span
                        className="text-white/25 flex-none mt-0.5"
                        animate={{ rotate: expandedIdx === idx ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <ChevronDown size={13} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedIdx === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' as const }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p className="px-4 pb-4 pt-0 text-[12px] leading-relaxed text-white/45">
                            {isHe ? a_he : a_en}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* ── Footer ───────────────────────────────────────────────── */}
              <div
                className="flex-none px-5 py-3.5 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[9px] text-white/18">
                  {isHe ? 'DealSpace — הצעות מחיר דיגיטליות' : 'DealSpace — Digital Proposals'}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-white/20">
                  <Zap size={8} className="text-indigo-400/50" />
                  <span>v2.0</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

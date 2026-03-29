import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, ChevronDown, BookOpen, Zap, Lightbulb, FileText, CreditCard, Shield, Settings, Send } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

// ─── Guide content ────────────────────────────────────────────────────────────

interface GuideItem {
  q_he: string
  q_en: string
  a_he: string
  a_en: string
  category: string
}

const GUIDES: GuideItem[] = [
  // ── Sending ────────────────────────────────────────────────────────────────
  {
    category: 'sending',
    q_he: 'איך שולחים הצעת מחיר ללקוח?',
    q_en: 'How do I send a proposal to a client?',
    a_he: 'כשההצעה מוכנה, לחץ "שלח" בסרגל הכותרת. DealSpace מייצרת קישור ייחודי לחדר הדיל — שלח אותו בוואטסאפ, מייל, או כל ערוץ אחר. הקישור תומך בקוד גישה בן 4 ספרות ועוקב אחר צפיות אוטומטית.',
    a_en: 'When ready, click "Send" in the top bar. DealSpace generates a unique Deal Room link — share it via WhatsApp, email, or any channel. The link supports an optional 4-digit access code and tracks views automatically.',
  },
  {
    category: 'sending',
    q_he: 'האם הלקוח צריך חשבון כדי לצפות?',
    q_en: 'Does the client need an account to view?',
    a_he: 'לא. חדר הדיל הוא ציבורי לחלוטין — הלקוח פותח את הקישור ורואה מיד את ההצעה, ללא הרשמה. הם יכולים לחתום ישירות מהדפדפן.',
    a_en: 'No. The Deal Room is fully public — the client opens the link and sees the proposal immediately, no sign-up required. They can sign directly from the browser.',
  },
  {
    category: 'sending',
    q_he: 'איך מגדירים קוד גישה להצעה?',
    q_en: 'How do I set an access code?',
    a_he: 'בעורך ההצעה, בסעיף "פרטי לקוח", מלא את שדה "קוד גישה". הלקוח יצטרך להזין את הקוד לפני הצפייה. קוד שגוי מחזיר שגיאה שקטה — קיום ההצעה לא נחשף.',
    a_en: 'In the Proposal Editor, under "Client Details", fill in the "Access Code" field. The client must enter it before viewing. A wrong code silently fails — proposal existence is never revealed.',
  },
  {
    category: 'sending',
    q_he: 'האם לקוחות יכולים לדחות הצעה?',
    q_en: 'Can clients decline a proposal?',
    a_he: 'כן. הלקוח יכול ללחוץ "דחייה" בתחתית חדר הדיל. הסטטוס יתעדכן ל"נדחתה" בזמן אמת בלוח הבקרה. לאחר מכן תוכל לשכפל את ההצעה, לשנות תמחור, ולשלוח גרסה מחודשת.',
    a_en: "Yes. The client can click 'Decline' at the bottom of the Deal Room. Status updates to 'Declined' in real time on your Dashboard. You can then duplicate the proposal, adjust terms, and send a revised version.",
  },
  {
    category: 'sending',
    q_he: 'איך עוקבים אחרי מעורבות הלקוח?',
    q_en: 'How do I track client engagement?',
    a_he: 'כל כרטיס הצעה מציג: מספר צפיות, זמן שהייה (שניות עיסוק כולל), וזמן הצפייה האחרון. כל הנתונים מתעדכנים בזמן אמת — כדי שתדע בדיוק מתי לעקוב אחרי הלקוח.',
    a_en: 'Each proposal card shows: view count, time spent (total engagement seconds), and last viewed timestamp. All metrics update in real time — so you know exactly when to follow up.',
  },

  // ── Pricing ─────────────────────────────────────────────────────────────────
  {
    category: 'pricing',
    q_he: 'איך עובדות תוספות?',
    q_en: 'How do add-ons work?',
    a_he: 'תוספות הן פריטים אופציונליים שהלקוח יכול להפעיל/לכבות בחדר הדיל. הוסף אותן בסעיף "תוספות ושדרוגים". לכל תוספת: שם, תיאור אופציונלי ומחיר. כשמופעלת — נכללת בסכום ובחוזה החתום. אפשר גם לאפשר ללקוח לקבוע כמות עם סליידר.',
    a_en: 'Add-ons are optional extras the client can toggle in the Deal Room. Add them under "Add-ons & Upgrades". Each has a name, optional description, and price. When enabled — included in the total and signed PDF. You can also allow clients to set quantity with a slider.',
  },
  {
    category: 'pricing',
    q_he: 'איך עובדים אבני דרך לתשלום?',
    q_en: 'How do Payment Milestones work?',
    a_he: 'אבני דרך מחלקות את התשלום הכולל לשלבים. בעורך, הוסף שורות אבני דרך ותן לכל אחת שם ואחוז — הסכום חייב להגיע בדיוק ל-100%. הלקוח רואה את לוח התשלומים בחדר הדיל ובחוזה החתום. ישנן תבניות מהירות: 50/50, 30/70, וכד\'.',
    a_en: "Milestones split your total into payment stages. In the Editor, add milestone rows with name and percentage — they must total exactly 100%. The client sees the payment schedule in the Deal Room and signed PDF. Quick presets available: 50/50, 30/70, etc.",
  },
  {
    category: 'pricing',
    q_he: 'מה זה מע"מ ואיך מגדירים אותו?',
    q_en: "What is VAT and how do I configure it?",
    a_he: 'הפעל "כלול מע"מ" בסעיף התמחור אם אתה עוסק מורשה. שיעור המע"מ (ברירת מחדל 18%) ניתן לשינוי בפרופיל ← שיעור מע"מ. חדר הדיל מציג פירוט: בסיס + מע"מ = סכום כולל. החוזה החתום כולל שורת מע"מ לצרכי חשבונאות.',
    a_en: 'Enable "Include VAT" in Pricing if you are a registered VAT business. The VAT rate (default 18%) is configurable in Profile → VAT Rate. The Deal Room shows a full breakdown: base + VAT = total. The signed PDF includes the VAT line for accounting.',
  },
  {
    category: 'pricing',
    q_he: 'האם ניתן לשנות מטבע?',
    q_en: 'Can I change the currency?',
    a_he: 'כן. בסעיף "תמחור בסיסי" בחר בין ₪ ILS, $ USD, ו-€ EUR. שים לב שבחירת מטבע שאינו ₪ תציג את הסמל המתאים בחדר הדיל ובחוזה — אך לא מבצעת המרת שערים אוטומטית.',
    a_en: 'Yes. In "Base Pricing" choose between ₪ ILS, $ USD, and € EUR. Note that selecting a non-ILS currency shows the correct symbol in the Deal Room and contract, but does not perform automatic exchange rate conversion.',
  },

  // ── Features ─────────────────────────────────────────────────────────────────
  {
    category: 'features',
    q_he: 'איך עובדת החתימה הדיגיטלית?',
    q_en: 'How does the digital signature work?',
    a_he: 'הלקוח ממלא פרטים משפטיים (שם, חברה, ח.פ/ת.ז, כתובת, תפקיד), מסמן הסכמה לתנאים, ומצייר חתימה עם האצבע או עכבר. לאחר לחיצה על "אישור", המערכת שומרת את החתימה + חותמת זמן + כל הפרטים. ה-PDF שמתקבל הוא מסמך משפטי תקף לפי חוק חתימה אלקטרונית תשס"א-2001.',
    a_en: "The client fills in legal details (name, company, ID, address, role), checks terms agreement, and draws a signature with finger or mouse. After clicking 'Confirm', the system saves the signature + timestamp + all details. The generated PDF is legally valid under Israel's Electronic Signature Law 5761-2001.",
  },
  {
    category: 'features',
    q_he: 'מה כולל ה-PDF המוּפק?',
    q_en: 'What does the generated PDF include?',
    a_he: 'ה-PDF הוא מסמך עסקי בן 3 עמודים: (1) עמוד שער עם שם הפרויקט ופרטי הצדדים, (2) עמודי תוכן עם סכום, תוספות, אבני דרך, תנאים וטקסט החוזה, (3) תעודת חתימה עם תמונת החתימה, חותמת זמן מדויקת, פרטים משפטיים של הלקוח, ונתיב ביקורת מלא.',
    a_en: 'The PDF is a 3-page business document: (1) Cover page with project name and party details, (2) Content pages with total, add-ons, milestones, terms and contract text, (3) Signature certificate with signature image, precise timestamp, client legal details, and full audit trail.',
  },
  {
    category: 'features',
    q_he: 'איך עובד בונה ה-AI לתיאורים?',
    q_en: 'How does the AI description writer work?',
    a_he: 'בסעיף "פרטי הפרויקט" לחץ על כפתור ה-AI (ניצוץ). הזן תיאור קצר של הפרויקט ולחץ "יצור". ה-AI מייצר תיאור מקצועי ועשיר בעברית שמתאים ישירות לשדה. ניתן ליצור מחדש עד שהתוצאה מדויקת.',
    a_en: 'In "Project Info" click the AI button (spark icon). Enter a brief project description and click "Generate". The AI produces a professional, detailed Hebrew description that inserts directly into the field. You can regenerate until the result is perfect.',
  },
  {
    category: 'features',
    q_he: 'איך משתמשים בספריית השירותים?',
    q_en: 'How do I use the Services Library?',
    a_he: 'ספריית השירותים (תפריט ← שירותים שמורים) מאפשרת להגדיר שירותים חוזרים עם מחירים קבועים. במחולל ההצעות, לחץ "הוסף מספרייה" בסעיף התוספות — השירותים מוכנסים מיידית ללא הקלדה חוזרת.',
    a_en: 'The Services Library (menu → Saved Services) lets you define reusable service items with fixed prices. In the Proposal Editor, click "Add from Library" in the Add-ons section — services insert instantly without re-typing.',
  },
  {
    category: 'features',
    q_he: 'מה ניתן לשנות בעורך החוזה?',
    q_en: 'What can I edit in the contract editor?',
    a_he: 'בסעיף "פרטי הפרויקט" יש עורך טקסט עשיר (TipTap) המאפשר: כותרות, עיצוב מודגש/נטוי, רשימות, ועוד. ניתן להשתמש בתבנית חוזה מוכנה (לחץ "בחר תבנית חוזה מקצועי"), לערוך אותה, ולהתאים לפרויקט. החוזה מופיע בחדר הדיל ובחוזה החתום.',
    a_en: 'In "Project Info" there\'s a rich text editor (TipTap) supporting: headings, bold/italic, lists, and more. You can use a ready-made contract template (click "Attach Contract Template"), edit it, and customize for the project. The contract appears in the Deal Room and signed PDF.',
  },

  // ── Legal ────────────────────────────────────────────────────────────────────
  {
    category: 'legal',
    q_he: 'האם חתימות אלקטרוניות מחייבות חוקית?',
    q_en: 'Are electronic signatures legally binding?',
    a_he: 'כן. לפי חוק חתימה אלקטרונית תשס"א-2001, חתימה אלקטרונית מוכרת חוקית בישראל. DealSpace שומרת את תמונת החתימה, חותמת הזמן המדויקת, שם הלקוח, חברה ומספר עוסק/ת.ז. — כל המרכיבים הנדרשים לעמידה בדרישות החוק.',
    a_en: "Yes. Under Israel's Electronic Signature Law 5761-2001, electronic signatures are legally recognized. DealSpace captures the signature image, precise timestamp, client name, company, and tax ID — all components required to meet the law's requirements.",
  },
  {
    category: 'legal',
    q_he: 'כמה זמן תקפה הצעת מחיר?',
    q_en: 'How long is a proposal valid?',
    a_he: 'ניתן להגדיר "תאריך תפוגה" בסעיף פרטי הפרויקט. כשפג תוקפה, חדר הדיל מציג הודעת "פג תוקף" ומונע חתימה. ללא תאריך תפוגה — ההצעה תקפה ללא הגבלת זמן עד לשינוי סטטוס.',
    a_en: 'You can set an "Expiry Date" in the Project Info section. When expired, the Deal Room shows an "Expired" message and prevents signing. Without an expiry date — the proposal is valid indefinitely until status changes.',
  },
  {
    category: 'legal',
    q_he: 'מה קורה לאחר חתימה?',
    q_en: 'What happens after signing?',
    a_he: 'לאחר שהלקוח חותם: (1) הסטטוס משתנה ל"מאושר" בלוח הבקרה בזמן אמת, (2) ניתן להוריד PDF מלא חתום מלוח הבקרה, (3) ההצעה ננעלת לעריכה להגנה על שלמות המסמך. ניתן לשכפל כדי ליצור גרסה חדשה.',
    a_en: "After the client signs: (1) Status changes to 'Accepted' on your Dashboard in real time, (2) You can download the full signed PDF from the Dashboard, (3) The proposal locks for editing to protect document integrity. You can duplicate to create a new version.",
  },

  // ── Settings ──────────────────────────────────────────────────────────────────
  {
    category: 'settings',
    q_he: 'איך מגדיר את צבע המותג שלי?',
    q_en: 'How do I set my Brand Color?',
    a_he: 'עבור לפרופיל ← צבע מותג. בחר מ-12 צבעים מוכנים או הזן קוד HEX מותאם. הצבע מוחל אוטומטית על כל חדר דיל — כותרות, כפתורים ופסי אבני דרך מתאימים לזהות המותג שלך.',
    a_en: 'Go to Profile → Brand Color. Choose from 12 presets or enter any hex code. The color auto-applies to every Deal Room — headers, buttons, and milestone bars adapt to your brand identity.',
  },
  {
    category: 'settings',
    q_he: 'איך מעלה לוגו / תמונת פרופיל?',
    q_en: 'How do I upload a logo / profile photo?',
    a_he: 'בפרופיל, לחץ על עיגול האווטר. בחר תמונה מהמחשב — היא מועלית לאחסון מאובטח ומוצגת בניווט ובחוזה החתום. מומלץ תמונה ריבועית באיכות גבוהה.',
    a_en: 'In Profile, click the avatar circle. Select an image from your device — it uploads to secure storage and appears in the navigation and signed contract. A high-quality square image is recommended.',
  },
  {
    category: 'settings',
    q_he: 'איך שומרים פרטי עסק לחתימה?',
    q_en: 'How do I save business details for contracts?',
    a_he: 'בפרופיל ← "זהות עסקית" מלא: שם חברה, ח.פ / ע.מ, כתובת, טלפון, ושם מורשה חתימה. פרטים אלה מוזרקים אוטומטית לכל הצעה חדשה ומופיעים בחוזה המודפס.',
    a_en: 'In Profile → "Business Identity" fill in: company name, tax ID / VAT number, address, phone, and authorized signatory name. These details auto-inject into every new proposal and appear in the printed contract.',
  },
]

// ─── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all',      label_he: 'הכל',      label_en: 'All',      icon: BookOpen,  color: '#818cf8' },
  { key: 'sending',  label_he: 'שליחה',    label_en: 'Sending',  icon: Send,      color: '#34d399' },
  { key: 'pricing',  label_he: 'תמחור',    label_en: 'Pricing',  icon: CreditCard,color: '#f59e0b' },
  { key: 'features', label_he: 'תכונות',   label_en: 'Features', icon: Lightbulb, color: '#a78bfa' },
  { key: 'legal',    label_he: 'משפטי',    label_en: 'Legal',    icon: Shield,    color: '#f87171' },
  { key: 'settings', label_he: 'הגדרות',   label_en: 'Settings', icon: Settings,  color: '#60a5fa' },
]

// ─── HelpCenterDrawer ─────────────────────────────────────────────────────────

interface HelpCenterDrawerProps {
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

  const visible = GUIDES
    .map((g, i) => ({ ...g, idx: i }))
    .filter(g => activeCategory === 'all' || g.category === activeCategory)

  const activeCat = CATEGORIES.find(c => c.key === activeCategory)

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
              {/* ── Header ─────────────────────────────────────────────────── */}
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
                        {isHe ? 'DealSpace Academy' : 'DealSpace Academy'}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {isHe ? `${GUIDES.length} מדריכים ותשובות` : `${GUIDES.length} guides & answers`}
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

                {/* Search hint */}
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <FileText size={11} className="text-white/20 flex-none" />
                  <span className="text-[11px] text-white/25">
                    {isHe ? 'בחר קטגוריה למטה לסינון מהיר' : 'Select a category below to filter'}
                  </span>
                </div>
              </div>

              {/* ── Category pills ──────────────────────────────────────────── */}
              <div
                className="flex-none flex items-center gap-1.5 px-4 py-3 overflow-x-auto"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', scrollbarWidth: 'none' }}
              >
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
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
                      <Icon size={9} />
                      {isHe ? cat.label_he : cat.label_en}
                    </button>
                  )
                })}
              </div>

              {/* ── Active category label ───────────────────────────────────── */}
              {activeCategory !== 'all' && activeCat && (
                <div className="flex-none px-5 pt-3 pb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: activeCat.color + 'aa' }}>
                    {isHe ? activeCat.label_he : activeCat.label_en} — {visible.length} {isHe ? 'תוצאות' : 'results'}
                  </p>
                </div>
              )}

              {/* ── Guide list ──────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
                {visible.map(({ idx, q_he, q_en, a_he, a_en, category }) => {
                  const cat = CATEGORIES.find(c => c.key === category)
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
                          {cat && (
                            <div
                              className="flex-none mt-0.5 h-1.5 w-1.5 rounded-full"
                              style={{ background: cat.color, boxShadow: `0 0 4px ${cat.color}` }}
                            />
                          )}
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

              {/* ── Footer ──────────────────────────────────────────────────── */}
              <div
                className="flex-none px-5 py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[9px] text-white/18">
                  {isHe ? 'DealSpace — הצעות מחיר דיגיטליות לישראל' : 'DealSpace — Digital Proposals for Israel'}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-white/20">
                  <Zap size={8} className="text-indigo-400/50" />
                  <span>v2.1</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

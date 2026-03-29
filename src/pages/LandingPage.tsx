import { type Variants, motion } from 'framer-motion'
import {
  ArrowRight, Zap, Check, X, Star, Globe,
  Sparkles, Eye, Layers, FileSignature, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n'

// ─── Bilingual Copy ────────────────────────────────────────────────────────────
// Hebrew: punchy, direct, Israeli market ("Tachles"). English: global, professional.

const copy = {
  he: {
    // Navbar
    navLogin: 'כניסה',
    navCta: 'התחילו בחינם',

    // Hero
    badge: '🔥 100 המשתמשים הראשונים — בחינם לנצח',
    h1Line1: 'אל תשלחו סתם PDF.',
    h1Line2: 'תסגרו עסקאות בסטייל.',
    sub: 'הפכו כל הצעת מחיר לחדר עסקאות אינטראקטיבי — הלקוחות שלכם רואים, בוחרים, חותמים ומשלמים. ב-60 שניות.',
    cta1: 'התחילו בחינם',
    cta2: 'ראו הדגמה חיה',
    trust: ['ללא כרטיס אשראי', 'הגדרה של 2 דקות', 'ביטול בכל עת'],

    // Marquee
    marqueeItems: ['₪2.3M+ עסקאות שנחתמו', '94% אחוז אישור', 'סגירה פי 2 מהר', '500+ משתמשים', '4.9 דירוג ממוצע', 'מאובטח בתקן ISO'],

    // Problem vs Solution
    problemLabel: 'הדרך הישנה',
    solutionLabel: 'הדרך של DealSpace',
    vsHeadline: 'PDF נגד חדר עסקאות.',
    vsSub: 'אתם יודעים שה-PDF שלכם נגמר בסל המחזור. הגיע הזמן לשדרג.',
    problemItems: [
      'PDF שמאבד תשומת לב תוך 10 שניות',
      'מיילים שנקברים בתיבת הדואר',
      'אין מושג אם הלקוח בכלל פתח',
      'משא ומתן אינסופי על כל שינוי קטן',
      'חתימה? בפקס? ב-2025?',
    ],
    solutionItems: [
      'חדר עסקאות מרהיב שמרתק את הלקוח',
      'קישור אחד עם כל המידע בצורה מושלמת',
      'התראה ברגע שפתחו — פנה בדיוק אז',
      'הלקוח בוחר תוספות בעצמו, הסכום מתעדכן',
      'חתימה דיגיטלית ומקדמה — בלחיצה אחת',
    ],

    // Bento Features
    featuresLabel: 'הפיצ\'רים שיסגרו לכם עסקאות',
    featuresH2: 'כלים שמכבירים כסף, לא כאב ראש.',
    bento: [
      {
        icon: 'layers',
        tag: 'מיילסטונים',
        title: 'לוח תשלומים שהלקוח מאשר מראש',
        body: 'הגדירו מקדמה, תשלום ביניים וסגירה. הלקוח רואה ומאשר בחדר העסקה — לא בוויכוח.',
        wide: true,
      },
      {
        icon: 'eye',
        tag: 'מעקב בזמן אמת',
        title: 'דעו בדיוק מתי הם קוראים',
        body: 'התראה מיידית כשהלקוח פתח. תמיד צעד אחד קדימה.',
        wide: false,
      },
      {
        icon: 'sparkles',
        tag: 'AI Ghostwriter',
        title: 'טקסט מקצועי תוך שניות',
        body: 'בינה מלאכותית כותבת תיאורים ברמה של קופירייטר בכיר.',
        wide: false,
      },
      {
        icon: 'sign',
        tag: 'חתימה דיגיטלית',
        title: 'חתמו ושולמו — ב-60 שניות',
        body: 'הלקוח חותם על המסך, ומשלם מקדמה מיידית. ללא הדפסות, ללא פגישות.',
        wide: true,
      },
    ],

    // Testimonials
    socialsLabel: 'מה הלקוחות שלנו אומרים',
    testimonials: [
      { name: 'שרה כ.', role: 'מעצבת גרפית פרילנסרית', text: 'סגרתי עסקה של ₪24,000 תוך שעתיים מרגע השליחה. הלקוח אהב שהוא יכול לבחור תוספות בעצמו.', stars: 5 },
      { name: 'דוד ל.', role: 'סוכנות שיווק דיגיטלי', text: 'ההתראה על צפייה שינתה את המשחק. פניתי ללקוח בדיוק ברגע הנכון וסגרתי על הזוז.', stars: 5 },
      { name: 'מיה ר.', role: 'מפתחת Full Stack', text: 'ההצעות שלי נראות פי 10 יותר מקצועיות. אחוז הסגירה עלה מ-30% ל-68% תוך חודש. לא מאמינה.', stars: 5 },
      { name: 'טום ב.', role: 'יועץ מיתוג ואסטרטגיה', text: 'לקוחות באמת קוראים את ההצעה. התמחור האינטראקטיבי מושך אותם פנימה ומחייב אותם.', stars: 5 },
      { name: 'נועה ש.', role: 'מעצבת UX/UI', text: 'שלחתי הצעה ביום שני. חתמו ביום שלישי בבוקר. לא מאמינה שזה אפשרי — אבל זה קרה.', stars: 5 },
      { name: 'אמיר ה.', role: 'הפקות וידאו ומדיה', text: 'הגדרתי ב-10 דקות, שלחתי. חתמו באותו יום. זה הכלי שחיכיתי לו כל השנים.', stars: 5 },
    ],

    // Final CTA
    ctaH2a: 'העסקה הבאה שלכם',
    ctaH2b: 'מחכה בקישור אחד.',
    ctaSub: 'הצטרפו לפרילנסרים שסוגרים עסקאות מהר יותר — עם הצעות שהלקוחות אוהבים לחתום עליהן.',
    ctaBtn: 'צרו חדר עסקאות ראשון — בחינם',

    // Footer
    footerTagline: 'הצעות מחיר שהלקוחות חותמים עליהן.',
    footerLinks: ['תנאי שימוש', 'פרטיות', 'נגישות', 'אבטחה'],
    footerCopy: '© 2025 DealSpace · כל הזכויות שמורות',

    // Mockup strings
    mockupUrl: 'dealspace.app/deal/abc123',
    mockupTotal: 'סה"כ',
    mockupAccept: 'אשר וחתום ✍',
    mockupItems: ['אסטרטגיית מותג', 'ניהול סושיאל', 'דוח אנליטיקה'],
  },
  en: {
    navLogin: 'Log in',
    navCta: 'Get started free',

    badge: '🔥 First 100 users — Free forever',
    h1Line1: 'Transform Proposals into',
    h1Line2: 'Interactive Deal Rooms.',
    sub: 'Stop losing deals to static PDFs. Create breathtaking, signable agreements that clients love — and close them in 60 seconds.',
    cta1: 'Start for Free',
    cta2: 'See a live demo',
    trust: ['No credit card', '2-minute setup', 'Cancel anytime'],

    marqueeItems: ['₪2.3M+ in signed deals', '94% acceptance rate', '2× faster closing', '500+ freelancers', '4.9 avg rating', 'ISO-grade security'],

    problemLabel: 'The Old Way',
    solutionLabel: 'The DealSpace Way',
    vsHeadline: 'PDF vs. Deal Room.',
    vsSub: 'You know your PDF ends up in their trash. Time to upgrade.',
    problemItems: [
      'PDF that loses attention in 10 seconds',
      'Emails buried deep in their inbox',
      'No idea if they even opened it',
      'Endless back-and-forth over every change',
      'E-signature? "Can you fax it?" energy.',
    ],
    solutionItems: [
      'A stunning deal room that captivates clients',
      'One link with everything perfectly laid out',
      'Instant notification when they open it — follow up at the exact right moment',
      'Clients toggle add-ons themselves, total updates live',
      'One-tap e-signature + deposit collected instantly',
    ],

    featuresLabel: 'Features that close deals',
    featuresH2: 'Tools that make you money, not headaches.',
    bento: [
      {
        icon: 'layers',
        tag: 'Milestones',
        title: 'Payment schedules your client approves upfront',
        body: 'Set deposit, mid-project, and final payments. Your client sees and approves everything in the deal room.',
        wide: true,
      },
      {
        icon: 'eye',
        tag: 'Live Tracking',
        title: "Know exactly when they're reading",
        body: 'Instant notification the moment your client opens. Always one step ahead.',
        wide: false,
      },
      {
        icon: 'sparkles',
        tag: 'AI Ghostwriter',
        title: 'Senior-copywriter prose, instantly',
        body: 'AI generates proposal descriptions that sound like you hired an agency.',
        wide: false,
      },
      {
        icon: 'sign',
        tag: 'E-Signature',
        title: 'Signed and paid in 60 seconds',
        body: 'Client signs on screen and pays the deposit instantly. No printing, no meetings.',
        wide: true,
      },
    ],

    socialsLabel: 'What our users say',
    testimonials: [
      { name: 'Sarah K.', role: 'Freelance Designer', text: 'Closed a ₪24k deal within 2 hours of sending. My client loved being able to pick the add-ons themselves.', stars: 5 },
      { name: 'David L.', role: 'Digital Marketing Agency', text: 'The viewed notification is a game changer. I followed up at exactly the right moment and closed on the spot.', stars: 5 },
      { name: 'Mia R.', role: 'Full Stack Developer', text: 'My proposals look 10× more professional. Win rate went from 30% to 68% in one month. Unbelievable.', stars: 5 },
      { name: 'Tom B.', role: 'Brand & Strategy Consultant', text: 'Clients actually read these proposals now. The interactive pricing gets them engaged and committed.', stars: 5 },
      { name: 'Noa S.', role: 'UX/UI Freelancer', text: 'Sent my first proposal on Monday. Signed by Tuesday morning. Thought it was a glitch — it wasn\'t.', stars: 5 },
      { name: 'Amir H.', role: 'Video & Media Production', text: 'Set up in 10 minutes. Sent to client. They signed it the same day. This is the tool I was waiting for.', stars: 5 },
    ],

    ctaH2a: 'Your next deal is',
    ctaH2b: 'one link away.',
    ctaSub: 'Join freelancers who close faster with proposals clients actually love to sign.',
    ctaBtn: 'Create your first Deal Room — free',

    footerTagline: 'Proposals clients love to sign.',
    footerLinks: ['Terms', 'Privacy', 'Accessibility', 'Security'],
    footerCopy: '© 2025 DealSpace · All rights reserved',

    mockupUrl: 'dealspace.app/deal/abc123',
    mockupTotal: 'Total',
    mockupAccept: 'Accept & Sign ✍',
    mockupItems: ['Brand Strategy', 'Social Media Mgmt', 'Analytics Report'],
  },
}

// ─── Animation variants ────────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const itemFade: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' as const } },
}

// ─── Hero Aurora Background ────────────────────────────────────────────────────

function HeroAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: '#030305' }} />
      {/* dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.12,
        }}
      />
      {/* aurora blobs */}
      <div
        className="absolute top-[-20%] left-[15%] h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(168,85,247,0.1) 45%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'lp-aurora-1 28s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[10%] right-[-10%] h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'lp-aurora-2 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'lp-aurora-3 32s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// ─── 3-D Deal Room Mockup ──────────────────────────────────────────────────────

function DealRoomMockup({ c, isHe }: { c: typeof copy['he']; isHe: boolean }) {
  const prices = ['₪6,900', '₪3,300', '₪5,100', '₪4,200', '₪6,900']
  return (
    <div style={{ perspective: 1400, animation: 'lp-float-mockup 7s ease-in-out infinite' }}>
      <motion.div
        initial={{ opacity: 0, rotateX: 12, rotateY: -6, y: 30 }}
        animate={{ opacity: 1, rotateX: 8, rotateY: -4, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' as const, delay: 0.3 }}
        whileHover={{ rotateX: 4, rotateY: -2, scale: 1.015 }}
        style={{
          transformStyle: 'preserve-3d',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 70px 140px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07), 0 0 100px rgba(99,102,241,0.14)',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-4">
            <div
              className="mx-auto max-w-[200px] rounded-md px-3 py-1 text-[10px] text-white/20 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              dir="ltr"
            >
              {c.mockupUrl}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Animated total */}
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.07))', border: '1px solid rgba(99,102,241,0.22)' }}
          >
            <p className="text-[9px] text-white/30 mb-1 uppercase tracking-widest">{c.mockupTotal}</p>
            <div className="overflow-hidden h-8" dir="ltr">
              <motion.div
                animate={{ y: [0, -32, -64, -96, -128] }}
                transition={{ duration: 4, ease: 'easeInOut' as const, repeat: Infinity, repeatDelay: 2, times: [0, 0.2, 0.4, 0.6, 0.8] }}
                className="flex flex-col"
              >
                {prices.map((p, i) => (
                  <div
                    key={i}
                    className="h-8 flex items-center justify-center text-xl font-black"
                    style={{ background: 'linear-gradient(90deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {p}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Add-on rows */}
          {c.mockupItems.map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: isHe ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.4, ease: 'easeOut' as const }}
              className="flex items-center justify-between rounded-xl px-4 py-2.5"
              style={{
                background: i !== 1 ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))' : 'rgba(255,255,255,0.02)',
                border: i !== 1 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center"
                  style={{
                    background: i !== 1 ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    boxShadow: i !== 1 ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
                  }}
                >
                  {i !== 1 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-[11px] text-white/60">{label}</span>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: i !== 1 ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }} dir="ltr">
                {['₪2,400', '₪1,800', '₪900'][i]}
              </span>
            </motion.div>
          ))}

          {/* Accept button */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.4 }}
            className="rounded-xl py-3 text-center text-sm font-bold text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
              boxShadow: '0 0 28px rgba(99,102,241,0.45)',
            }}
          >
            {c.mockupAccept}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Marquee Trust Band ────────────────────────────────────────────────────────

function MarqueeBand({ items, isRTL }: { items: string[]; isRTL: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div
      className="overflow-hidden py-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
    >
      <div
        dir="ltr"
        style={{
          display: 'flex',
          width: 'max-content',
          animation: isRTL ? 'lp-marquee-rtl 28s linear infinite' : 'lp-marquee 28s linear infinite',
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2 px-8 text-[12px] font-semibold whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span style={{ color: '#6366f1' }}>✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Problem vs Solution ───────────────────────────────────────────────────────

function ProblemSolutionSection({ c, isHe }: { c: typeof copy['he']; isHe: boolean }) {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' as const }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: '#6366f1' }}>
            {isHe ? 'השוואה אמיתית' : 'Real comparison'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">{c.vsHeadline}</h2>
          <p className="text-white/45 text-base max-w-md mx-auto">{c.vsSub}</p>
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old way */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' as const }}
            className="rounded-3xl p-7"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <X size={14} style={{ color: '#f87171' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#f87171' }}>{c.problemLabel}</p>
            </div>
            <ul className="space-y-3.5">
              {c.problemItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X size={13} className="mt-0.5 flex-none" style={{ color: '#f87171' }} />
                  <span className="text-sm text-white/40 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* DealSpace way */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' as const, delay: 0.08 }}
            className="relative rounded-3xl p-7 overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Corner glow */}
            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)' }}>
                <Zap size={14} style={{ color: '#a5b4fc' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#a5b4fc' }}>{c.solutionLabel}</p>
            </div>
            <ul className="space-y-3.5">
              {c.solutionItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-none h-4 w-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <Check size={10} style={{ color: '#a5b4fc' }} />
                  </div>
                  <span className="text-sm text-white/75 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Bento Mini UIs ────────────────────────────────────────────────────────────

function MilestoneMini({ isHe }: { isHe: boolean }) {
  const rows = isHe
    ? [{ name: 'מקדמה',  pct: 30, done: true  }, { name: 'עיצוב',  pct: 50, done: true  }, { name: 'השקה', pct: 20, done: false }]
    : [{ name: 'Deposit', pct: 30, done: true  }, { name: 'Design',  pct: 50, done: true  }, { name: 'Launch', pct: 20, done: false }]
  return (
    <div className="space-y-3 mt-4">
      {rows.map((r, i) => (
        <div key={r.name}>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-white/45 font-medium">{r.name}</span>
            <span style={{ color: r.done ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }}>{r.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
              initial={{ width: '0%' }}
              whileInView={{ width: r.done ? '100%' : '8%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.18, ease: 'easeOut' as const }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ViewTrackingMini({ isHe }: { isHe: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="mt-4 rounded-xl p-3 flex items-center gap-3"
      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
    >
      <div className="relative flex-none">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
        >
          {isHe ? 'ד' : 'D'}
        </div>
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#030305]" />
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ animation: 'lp-ping-ring 1.8s ease-out infinite' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-white/85 leading-snug">
          {isHe ? 'דוד לוי פתח את ההצעה' : 'David L. opened your proposal'}
        </p>
        <p className="text-[9px] text-white/35 mt-0.5">
          {isHe ? 'כרגע · עמוד 2/3' : 'just now · page 2/3'}
        </p>
      </div>
    </motion.div>
  )
}

function AIGhostwriterMini({ isHe }: { isHe: boolean }) {
  const text = isHe
    ? 'פרויקט מקצועי ומרשים שיביא את המותג שלכם לשלב הבא — בגישה חדשנית ותוצאות מדידות.'
    : 'A professional, compelling project that elevates your brand to the next level — with an innovative approach and measurable results.'
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" style={{ animation: 'lp-ping-ring 1.2s ease-out infinite' }} />
        <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: '#818cf8' }}>
          {isHe ? 'AI כותב…' : 'AI writing…'}
        </span>
      </div>
      <p className="text-[11px] text-white/55 leading-relaxed">
        {text}
        <span
          className="inline-block w-0.5 h-3 ms-0.5 align-middle rounded-sm"
          style={{ background: '#a5b4fc', animation: 'lp-cursor-blink 0.9s step-end infinite' }}
        />
      </p>
    </div>
  )
}

function SignatureMini() {
  return (
    <div className="mt-4">
      <div className="rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', height: 70 }}>
        <svg viewBox="0 0 220 60" width="100%" height="60">
          <defs>
            <linearGradient id="sig-g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <path
            d="M14,40 C30,12 46,52 62,32 C78,12 86,50 108,28 C126,10 136,48 158,22 C172,8 182,46 206,18"
            fill="none"
            stroke="url(#sig-g)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="320"
            style={{ animation: 'lp-draw-sig 3.5s ease-in-out infinite' }}
          />
        </svg>
      </div>
    </div>
  )
}

// ─── Bento Grid ────────────────────────────────────────────────────────────────

const BENTO_COLORS = ['#6366f1', '#a855f7', '#22c55e', '#6366f1']
const BENTO_GLOWS  = ['rgba(99,102,241,0.35)', 'rgba(168,85,247,0.35)', 'rgba(34,197,94,0.35)', 'rgba(99,102,241,0.35)']

function BentoGridSection({ c, isHe }: { c: typeof copy['he']; isHe: boolean }) {
  const icons = [<Layers size={16} />, <Eye size={16} />, <Sparkles size={16} />, <FileSignature size={16} />]
  const minis = [
    <MilestoneMini isHe={isHe} />,
    <ViewTrackingMini isHe={isHe} />,
    <AIGhostwriterMini isHe={isHe} />,
    <SignatureMini />,
  ]

  return (
    <section className="relative py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' as const }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: '#6366f1' }}>
            {c.featuresLabel}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{c.featuresH2}</h2>
        </motion.div>

        {/* Asymmetric 3-col grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {c.bento.map((card, i) => (
            <motion.div
              key={card.tag}
              variants={itemFade}
              className={`relative rounded-3xl p-6 overflow-hidden ${card.wide ? 'md:col-span-2' : 'md:col-span-1'}`}
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
              whileHover={{ y: -4, transition: { duration: 0.22 } }}
            >
              {/* Top corner glow */}
              <div
                className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full"
                style={{ background: `radial-gradient(circle, ${BENTO_GLOWS[i]} 0%, transparent 70%)`, filter: 'blur(28px)' }}
              />
              {/* Inner top highlight */}
              <div className="pointer-events-none absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

              {/* Tag + icon */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: `${BENTO_COLORS[i]}18`, border: `1px solid ${BENTO_COLORS[i]}30`, color: BENTO_COLORS[i] }}
                >
                  {icons[i]}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BENTO_COLORS[i] }}>
                  {card.tag}
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug mb-2">{card.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{card.body}</p>

              {/* Mini interactive demo */}
              <div
                className="mt-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {minis[i]}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────────

const AVATAR_GRADS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
  'linear-gradient(135deg, #6366f1, #22c55e)',
  'linear-gradient(135deg, #d4af37, #f59e0b)',
  'linear-gradient(135deg, #22c55e, #6366f1)',
]

function TestimonialsSection({ c }: { c: typeof copy['he'] }) {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' as const }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: '#6366f1' }}>
            {c.socialsLabel}
          </p>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill="#d4af37" style={{ color: '#d4af37' }} />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {c.testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={itemFade}
              className="relative rounded-3xl p-6 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
              whileHover={{ y: -4, transition: { duration: 0.22 } }}
            >
              <div className="pointer-events-none absolute top-0 left-6 right-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} size={12} fill="#d4af37" style={{ color: '#d4af37' }} />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-white/65 leading-relaxed mb-5">"{t.text}"</p>
              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-none"
                  style={{ background: AVATAR_GRADS[i] }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white/90">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection({ c, onCta }: { c: typeof copy['he']; onCta: () => void }) {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* BG gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.14) 0%, transparent 65%)' }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />

      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: 'easeOut' as const }}
        >
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mb-2"
            style={{ background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 65%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {c.ctaH2a}
          </h2>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mb-6"
            style={{ background: 'linear-gradient(135deg, #c084fc 0%, #a5b4fc 50%, #ffffff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {c.ctaH2b}
          </h2>
          <p className="text-white/45 text-base mb-10 max-w-md mx-auto leading-relaxed">{c.ctaSub}</p>

          <div className="relative inline-block">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', filter: 'blur(20px)', opacity: 0.5, animation: 'lp-badge-pulse 2.5s ease-in-out infinite' }}
            />
            <motion.button
              onClick={onCta}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-4 rounded-2xl text-[15px] font-bold text-white"
              style={{
                background: 'linear-gradient(105deg, #6366f1 0%, #7c3aed 38%, rgba(200,190,255,0.55) 50%, #7c3aed 62%, #6366f1 100%)',
                backgroundSize: '220% 100%',
                animation: 'lp-shimmer 3s linear infinite',
                boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <span className="flex items-center gap-2">
                {c.ctaBtn}
                <ArrowRight size={15} />
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ c, isHe, onLogin, onCta, onToggleLang }: {
  c: typeof copy['he']
  isHe: boolean
  onLogin: () => void
  onCta: () => void
  onToggleLang: () => void
}) {
  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5"
      style={{
        background: 'rgba(3,3,5,0.82)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 18px rgba(99,102,241,0.45)' }}
        >
          <Zap size={15} className="text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">DealSpace</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-white/45 transition hover:text-white/75"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
        >
          <Globe size={11} />
          {isHe ? 'EN' : 'עב'}
        </button>
        <button
          onClick={onLogin}
          className="hidden sm:block px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white/55 transition hover:text-white/90"
        >
          {c.navLogin}
        </button>
        <motion.button
          onClick={onCta}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="px-4 py-2 rounded-xl text-[13px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 16px rgba(99,102,241,0.35)',
          }}
        >
          {c.navCta}
        </motion.button>
      </div>
    </nav>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer({ c, isHe, onToggleLang, onNav }: {
  c: typeof copy['he']
  isHe: boolean
  onToggleLang: () => void
  onNav: (path: string) => void
}) {
  const paths = ['/terms', '/privacy', '/accessibility', '/security']
  return (
    <footer
      className="relative z-10 px-6 py-10"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Zap size={13} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">DealSpace</span>
            <p className="text-[10px] text-white/30 leading-none mt-0.5">{c.footerTagline}</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {c.footerLinks.map((label, i) => (
            <button
              key={label}
              onClick={() => onNav(paths[i])}
              className="text-[11px] text-white/30 transition hover:text-white/65"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: lang + copyright */}
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 text-[11px] text-white/30 transition hover:text-white/60"
          >
            <Globe size={10} />
            {isHe ? 'English' : 'עברית'}
          </button>
          <p className="text-[10px] text-white/20" dir="ltr">{c.footerCopy}</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection({ c, isHe, onCta, onDemo }: {
  c: typeof copy['he']
  isHe: boolean
  onCta: () => void
  onDemo: () => void
}) {
  return (
    <section className="relative min-h-[92dvh] flex items-center pt-6 pb-20 px-6 overflow-hidden">
      <HeroAurora />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* Text block */}
          <div className="flex-1 text-center lg:text-start">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.28)',
                animation: 'lp-badge-pulse 3s ease-in-out infinite',
              }}
            >
              <span className="text-[12px] font-bold text-indigo-300">{c.badge}</span>
            </motion.div>

            {/* H1 — gradient clipped */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' as const, delay: 0.08 }}
              className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight mb-5"
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #ffffff 25%, #c4b5fd 55%, #f0f0f8 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {c.h1Line1}
              </span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {c.h1Line2}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.18 }}
              className="text-base sm:text-lg text-white/50 leading-relaxed max-w-xl mb-8"
              style={{ marginInlineStart: 0, marginInlineEnd: 'auto' }}
            >
              {c.sub}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' as const, delay: 0.28 }}
              className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mb-6"
            >
              {/* Primary shimmer CTA */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', filter: 'blur(14px)', opacity: 0.55, animation: 'lp-badge-pulse 2s ease-in-out infinite' }}
                />
                <motion.button
                  onClick={onCta}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold text-white"
                  style={{
                    background: 'linear-gradient(105deg, #6366f1 0%, #7c3aed 38%, rgba(200,190,255,0.5) 50%, #7c3aed 62%, #6366f1 100%)',
                    backgroundSize: '220% 100%',
                    animation: 'lp-shimmer 3s linear infinite',
                    boxShadow: '0 0 36px rgba(99,102,241,0.45), 0 8px 24px rgba(0,0,0,0.35)',
                  }}
                >
                  {c.cta1}
                  <ChevronRight size={16} />
                </motion.button>
              </div>

              {/* Ghost CTA */}
              <motion.button
                onClick={onDemo}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-semibold text-white/60 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
              >
                {c.cta2}
                <ArrowRight size={14} />
              </motion.button>
            </motion.div>

            {/* Trust pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
            >
              {c.trust.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[12px] text-white/35">
                  <Check size={11} style={{ color: '#22c55e' }} />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* 3D Mockup */}
          <div className="flex-1 w-full max-w-sm lg:max-w-md xl:max-w-lg flex-none">
            <DealRoomMockup c={c} isHe={isHe} />
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── LandingPage ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { locale, setLocale } = useI18n()
  const navigate = useNavigate()
  const isHe = locale === 'he'
  const c = isHe ? copy.he : copy.en

  const goAuth = () => navigate('/auth')
  const goSignup = () => navigate('/auth?tab=signup')
  const goDemo = () => navigate('/deal/abc123')

  return (
    <div
      className="relative min-h-dvh flex flex-col"
      dir={isHe ? 'rtl' : 'ltr'}
      style={{ background: '#030305', color: '#f0f0f8' }}
    >
      <Navbar
        c={c}
        isHe={isHe}
        onLogin={goAuth}
        onCta={goSignup}
        onToggleLang={() => setLocale(isHe ? 'en' : 'he')}
      />

      <main className="flex-1">
        <HeroSection c={c} isHe={isHe} onCta={goSignup} onDemo={goDemo} />
        <MarqueeBand items={c.marqueeItems} isRTL={isHe} />
        <ProblemSolutionSection c={c} isHe={isHe} />
        <BentoGridSection c={c} isHe={isHe} />
        <TestimonialsSection c={c} />
        <FinalCTASection c={c} onCta={goSignup} />
      </main>

      <Footer
        c={c}
        isHe={isHe}
        onToggleLang={() => setLocale(isHe ? 'en' : 'he')}
        onNav={(path) => navigate(path)}
      />
    </div>
  )
}

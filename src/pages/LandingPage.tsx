import {
  type Variants,
  motion, AnimatePresence,
  useScroll, useSpring, useTransform, useMotionValue, useMotionValueEvent, useInView,
} from 'framer-motion'
import {
  ArrowRight, Zap, Check, X, Star, Globe,
  Eye, FileSignature, ChevronRight,
  Clock, Shield, MessageCircle, Lock,
  Percent, FileCheck, Sun, Moon,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { ReactLenis } from 'lenis/react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'

// ─── Bilingual Copy ────────────────────────────────────────────────────────────
// Hebrew: punchy, direct, Israeli market ("Tachles"). English: global SaaS elite.

const copy = {
  he: {
    // Navbar
    navLogin: 'כניסה',
    navCta: 'התחילו בחינם',

    // Hero
    badge: '⚡ 100 המשתמשים הראשונים — חינם לנצח',
    h1Part1: 'אל תשלחו PDF',
    h1Pre2: 'שלחו ',
    h1Highlight: 'חדר עסקאות',
    h1Post2: ' שסוגר לבד.',
    sub: 'בנו הצעה ב-2 דקות. שלחו קישור אחד. הלקוח פותח, בוחר תוספות, וחותם דיגיטלית — אתם מקבלים התראה ברגע שזה קורה.',
    cta1: 'צרו חדר עסקאות עכשיו',
    cta2: 'ראו דוגמה חיה',
    trust: ['ללא כרטיס אשראי', 'הגדרה של 2 דקות', 'ביטול בכל עת'],

    // Toast notifications (hero)
    toast: [
      { emoji: '✍️', msg: 'שרה כ. חתמה על ההצעה', amount: '₪24,000' },
      { emoji: '👁️', msg: 'דוד ל. פתח את חדר העסקאות', amount: null },
      { emoji: '🎉', msg: 'אמיר ה. — עסקה נחתמה!', amount: '₪18,500' },
    ],

    // Marquee
    marqueeItems: ['94% שיעור אישור', 'סגירה מהירה פי 2', '₪2.3M+ עסקאות', '500+ עצמאיים', 'דירוג 4.9/5', 'חתימה דיגיטלית חוקית', 'PDF מאושר לכל עסקה', 'ללא כרטיס אשראי'],

    // How It Works
    howLabel: 'שלושה שלבים. עסקה אחת.',
    howH2part1: 'מ-PDF מתיש',
    howH2Highlight: 'לחדר עסקאות',
    howH2part2: 'שסוגר.',
    steps: [
      { num: '01', tag: 'בנייה', tagEn: 'Build', title: 'בנו ב-2 דקות', body: 'פרטי פרויקט, תמחור, תוספות ותבנית חוזה — הטקסט נכתב בשבילכם אוטומטית.' },
      { num: '02', tag: 'שליחה', tagEn: 'Send',  title: 'שלחו קישור אחד', body: 'הלקוח מקבל קישור שעובד על כל מכשיר — ללא התקנות, ללא כניסה לחשבון.' },
      { num: '03', tag: 'סגירה', tagEn: 'Signed', title: 'הלקוח חתם', body: 'חתימה דיגיטלית, מסמך מאומת והתראה מיידית — הכל בלחיצה אחת.' },
    ],

    // Problem vs Solution
    problemLabel: 'הדרך הישנה',
    solutionLabel: 'הדרך של DealSpace',
    vsHeadline: 'PDF vs. חדר עסקאות.',
    vsSub: 'כמה קבצי PDF ירדו לסל המחזור של הלקוח השבוע? הגיע הזמן להפסיק לשלוח קבצים.',
    problemItems: [
      'PDF שנפתח פעם אחת — ונשכח לנצח',
      'מיילים קבורים בתיבת דואר משוגעת',
      'אין מושג אם ראו, קראו, התעניינו',
      'כל שינוי קטן = עוד סבב מיילים',
      'חתימה על נייר, בפקס, או "שלח PDF חתום"',
    ],
    solutionItems: [
      'חדר עסקאות אינטראקטיבי — הלקוח נשאר ומעורב',
      'קישור אחד עם כל המידע, מושלם לכל מכשיר',
      'התראה מיידית כשנפתח — פנו בדיוק ברגע הנכון',
      'הלקוח מתאים תוספות בעצמו, הסכום מתעדכן בזמן אמת',
      'חתימה דיגיטלית ומסמך מאומת — תוך שניות',
    ],

    // Bento Features (6 cards)
    featuresLabel: 'כל מה שצריך. כלום מיותר.',
    featuresH2: 'הכלים שיסגרו לכם עסקאות.',
    bento: [
      { icon: 'lock',    tag: 'נעילת זמן',          title: 'לחץ אמיתי שמניע לסגירה',                body: 'הגדירו תאריך תפוגה. ככל שהזמן מתקצר — הלחץ עולה, הלקוח חותם.',                                   wide: true  },
      { icon: 'eye',     tag: 'מעקב חכם',            title: 'דעו ברגע שהלקוח פתח',                  body: 'קבלו התראה מיידית כשפתחו, כמה זמן בילו בהצעה — ופנו בדיוק ברגע שהעניין בשיאו.',                 wide: false },
      { icon: 'whatsapp', tag: 'מעקב ב-WhatsApp',   title: 'הודעה אחת — והם חוזרים',               body: 'לחצו שליחה — DealSpace מייצר הודעה אישית עם שם הלקוח, שם הפרויקט וקישור ישיר לחדר.',             wide: false },
      { icon: 'sign',    tag: 'חתימה דיגיטלית',     title: 'חתמו ב-60 שניות',                       body: 'חתימה ייחודית, מסמך מאומת ורשומת ביקורת מלאה. חוקי לפי חוק החתימה האלקטרונית.',                 wide: true  },
      { icon: 'terms',   tag: 'תנאי עסק קבועים',    title: 'תנאי ההתקשרות שלכם — בכל הצעה',        body: 'הגדירו תנאים פעם אחת בפרופיל. הם יצורפו לכל הצעה שתשלחו — הלקוח מאשר, ה-PDF כולל הכל.',         wide: false },
      { icon: 'vat',     tag: 'מנוע מע"מ',           title: 'הזינו מחיר סופי — לא "פלוס מע"מ"',     body: 'בישראל מדברים במחיר כולל. הזינו את הסכום הסופי — DealSpace מחשב מתוכם מע"מ אוטומטית.',            wide: false },
    ],

    // Social Proof
    socialsLabel: 'מה הלקוחות שלנו אומרים',
    testimonials: [
      { name: 'שרה כ.',  role: 'מעצבת גרפית פרילנסרית',   text: 'סגרתי עסקה של ₪24,000 תוך שעתיים מרגע השליחה. הלקוח אהב שהוא יכול לבחור תוספות בעצמו.', stars: 5 },
      { name: 'דוד ל.',  role: 'סוכנות שיווק דיגיטלי',     text: 'ההתראה על צפייה שינתה את המשחק לגמרי. פניתי ללקוח בדיוק ברגע הנכון — וסגרתי על הזוז.', stars: 5 },
      { name: 'מיה ר.',  role: 'מפתחת Full Stack',          text: 'ההצעות שלי נראות פי 10 יותר מקצועיות. אחוז הסגירה עלה מ-30% ל-68% תוך חודש. לא מאמינה.', stars: 5 },
      { name: 'טום ב.',  role: 'יועץ מיתוג ואסטרטגיה',      text: 'לקוחות באמת קוראים את ההצעה. התמחור האינטראקטיבי מושך אותם פנימה ומחייב אותם.', stars: 5 },
      { name: 'נועה ש.', role: 'מעצבת UX/UI',              text: 'שלחתי ביום שני. חתמו ביום שלישי בבוקר. חשבתי שיש תקלה — לא הייתה.', stars: 5 },
      { name: 'אמיר ה.', role: 'הפקות וידאו ומדיה',         text: 'הגדרתי ב-10 דקות, שלחתי. חתמו באותו יום. זה הכלי שחיכיתי לו כל השנים.', stars: 5 },
    ],

    // Final CTA
    ctaH2a: 'עוד לקוח יגיד',
    ctaH2b: '"אחזור אליך" —',
    ctaH2Highlight: 'או שתשלחו לו קישור?',
    ctaSub: 'הצטרפו לפרילנסרים שסוגרים עסקאות מהר יותר — עם הצעות שהלקוחות אוהבים לחתום עליהן.',
    ctaBtn: 'צרו חדר עסקאות ראשון — בחינם',
    ctaUrgency: '87 מ-100 מקומות חינם נלקחו',

    // Pricing section
    pricingLabel: 'תמחור פשוט ושקוף',
    pricingH2: 'תוכנית לכל שלב בדרך',
    pricingSub: 'בחרו. שדרגו בכל עת. ביטול ללא עלות.',
    pricingPopular: 'הכי פופולרי',
    pricingCta: 'שדרגו עכשיו',
    pricingFreeCta: 'התחילו בחינם',
    tiers: [
      {
        name: 'חינם',
        price: '₪0',
        period: '/חודש',
        sub: 'לשלב ההתחלה',
        features: [
          { text: 'עד 5 הצעות בחודש', ok: true },
          { text: 'Deal Room + חתימה דיגיטלית', ok: true },
          { text: 'יצוא PDF', ok: true },
          { text: 'אנליטיקות ומעקב פתיחות', ok: true },
          { text: 'Webhooks', ok: false },
        ],
      },
      {
        name: 'פרו',
        price: '₪19',
        period: '/חודש',
        sub: 'לפרילנסרים רציניים',
        features: [
          { text: 'עד 100 הצעות בחודש', ok: true },
          { text: 'הכל כולל חינם', ok: true },
          { text: 'Webhooks + אוטומציות', ok: true },
          { text: 'תמיכה ישירה', ok: true },
        ],
      },
      {
        name: 'פרימיום',
        price: '₪39',
        period: '/חודש',
        sub: 'לסוכנויות ועצמאיים מתקדמים',
        features: [
          { text: 'הצעות ללא הגבלה', ok: true },
          { text: 'הכל כולל פרו', ok: true },
          { text: 'תמיכה בעדיפות גבוהה', ok: true },
          { text: 'השפעה על מפת הדרכים', ok: true },
        ],
      },
    ],

    // Mockup strings
    mockupUrl: 'dealspace.app/deal/abc123',
    mockupTotal: 'סה"כ',
    mockupAccept: 'אשר וחתום ✍',
    mockupItems: ['אסטרטגיית מותג', 'ניהול סושיאל', 'דוח אנליטיקה'],

    // Theme toggle
    themeLight: 'מואר',
    themeDark: 'מקורי',
  },
  en: {
    navLogin: 'Log in',
    navCta: 'Get started free',

    badge: '⚡ First 100 users — Free forever',
    h1Part1: 'Stop sending static PDFs.',
    h1Pre2: 'Send a ',
    h1Highlight: 'Deal Room',
    h1Post2: ' that closes itself.',
    sub: 'Build a proposal in 2 minutes. Send one link. Your client opens, customizes add-ons, and signs digitally — you get notified the second it happens.',
    cta1: 'Create your Deal Room now',
    cta2: 'See a live demo',
    trust: ['No credit card', '2-minute setup', 'Cancel anytime'],

    toast: [
      { emoji: '✍️', msg: 'Sarah K. signed the proposal', amount: '₪24,000' },
      { emoji: '👁️', msg: 'David L. opened your Deal Room', amount: null },
      { emoji: '🎉', msg: "Amir H. — Deal closed!", amount: '₪18,500' },
    ],

    marqueeItems: ['94% acceptance rate', '2× faster closing', '₪2.3M+ signed', '500+ freelancers', '4.9/5 rating', 'Legally binding e-signature', 'Auto-certified PDF', 'No credit card'],

    howLabel: 'Three steps. One outcome: signed.',
    howH2part1: 'From a PDF they ignore',
    howH2Highlight: 'to a Deal Room',
    howH2part2: 'they sign.',
    steps: [
      { num: '01', tag: 'Build',  tagEn: 'Build',  title: 'Build in 2 minutes',     body: 'Project details, pricing, add-ons, contract template. AI writes the copy for you.' },
      { num: '02', tag: 'Send',   tagEn: 'Send',   title: 'Send one link',           body: 'Your client gets a link that works on any device — no app, no login required.' },
      { num: '03', tag: 'Signed', tagEn: 'Signed', title: 'Client signed',           body: 'Digital signature, certified PDF, and instant notification — all in one click.' },
    ],

    problemLabel: 'The Old Way',
    solutionLabel: 'The DealSpace Way',
    vsHeadline: 'PDF vs. Deal Room.',
    vsSub: 'How many PDFs ended up in their trash this week? Time to stop sending files.',
    problemItems: [
      'PDF opened once — then forgotten forever',
      'Emails buried deep in their overflowing inbox',
      'Zero idea if they even opened it',
      'Every small change = another email thread',
      'E-signature? "Can you fax it?" energy.',
    ],
    solutionItems: [
      'An interactive deal room that keeps clients engaged',
      'One link with everything laid out perfectly',
      'Instant notification when they open — follow up at the right second',
      'Clients customize add-ons themselves, total updates live',
      'Digital signature + certified PDF in seconds',
    ],

    featuresLabel: 'Everything you need. Nothing you don\'t.',
    featuresH2: 'Tools that close deals. Not just look pretty.',
    bento: [
      { icon: 'lock',    tag: 'Expiry Lock',        title: 'Built-in FOMO that drives signatures',             body: 'Set an expiry date. When time is up, pricing blurs and locks. Clients sign faster when urgency is real.',                     wide: true  },
      { icon: 'eye',     tag: 'Deal Intelligence',  title: 'Know exactly when — follow up at the right second', body: 'Get notified when they open it, how long they spent, and read-receipt on every email. Never follow up too late.',           wide: false },
      { icon: 'whatsapp', tag: 'WhatsApp Follow-up', title: 'One-tap follow-up that actually gets read',        body: 'Built-in WhatsApp share with smart copy — client name, project title, and a direct link to their deal room.',               wide: false },
      { icon: 'sign',    tag: 'E-Signature',         title: 'Signed and closed in 60 seconds',                  body: 'Native canvas signature, certified PDF, and full audit trail. Legally binding under E-Sign Law.',                         wide: true  },
      { icon: 'terms',   tag: 'Global Business Terms', title: 'Your T&Cs frozen into every proposal automatically', body: 'Define once in your profile. DealSpace injects them into every deal you send — client consents, PDF includes the full terms.', wide: false },
      { icon: 'vat',     tag: 'Israeli VAT Engine', title: 'Gross prices, zero surprises',                      body: 'Enter the gross amount. The system back-calculates the VAT component automatically. No "plus VAT" math for your clients.',   wide: false },
    ],

    socialsLabel: 'What our users say',
    testimonials: [
      { name: 'Sarah K.',  role: 'Freelance Designer',          text: 'Closed a ₪24k deal within 2 hours of sending. My client loved being able to pick the add-ons themselves.', stars: 5 },
      { name: 'David L.',  role: 'Digital Marketing Agency',    text: 'The viewed notification is a game changer. I followed up at exactly the right moment and closed on the spot.', stars: 5 },
      { name: 'Mia R.',    role: 'Full Stack Developer',        text: 'My proposals look 10× more professional. Win rate went from 30% to 68% in one month. Unbelievable.', stars: 5 },
      { name: 'Tom B.',    role: 'Brand & Strategy Consultant', text: 'Clients actually read these proposals now. The interactive pricing gets them engaged and committed.', stars: 5 },
      { name: 'Noa S.',    role: 'UX/UI Freelancer',            text: 'Sent Monday. Signed Tuesday morning. Thought it was a glitch — it wasn\'t.', stars: 5 },
      { name: 'Amir H.',   role: 'Video & Media Production',    text: 'Set up in 10 minutes, sent to client, they signed it the same day. The tool I was waiting for.', stars: 5 },
    ],

    ctaH2a: 'Another',
    ctaH2b: '"I\'ll get back to you" —',
    ctaH2Highlight: 'or a link they sign right now?',
    ctaSub: 'Join freelancers who close faster with proposals clients actually love to sign.',
    ctaBtn: 'Create your first Deal Room — free',
    ctaUrgency: '87 of 100 free spots claimed',

    // Pricing section
    pricingLabel: 'Simple, transparent pricing',
    pricingH2: 'A plan for every stage',
    pricingSub: 'Pick a plan. Upgrade anytime. Cancel with zero hassle.',
    pricingPopular: 'Most Popular',
    pricingCta: 'Upgrade Now',
    pricingFreeCta: 'Start for Free',
    tiers: [
      {
        name: 'Free',
        price: '₪0',
        period: '/mo',
        sub: 'Just getting started',
        features: [
          { text: 'Up to 5 proposals / month', ok: true },
          { text: 'Deal Room + e-signature', ok: true },
          { text: 'PDF export', ok: true },
          { text: 'Analytics + open tracking', ok: true },
          { text: 'Webhooks', ok: false },
        ],
      },
      {
        name: 'Pro',
        price: '₪19',
        period: '/mo',
        sub: 'For serious freelancers',
        features: [
          { text: 'Up to 100 proposals / month', ok: true },
          { text: 'Everything in Free', ok: true },
          { text: 'Webhooks + automations', ok: true },
          { text: 'Direct support', ok: true },
        ],
      },
      {
        name: 'Premium',
        price: '₪39',
        period: '/mo',
        sub: 'For agencies & power users',
        features: [
          { text: 'Unlimited proposals', ok: true },
          { text: 'Everything in Pro', ok: true },
          { text: 'Priority support', ok: true },
          { text: 'Influence the roadmap', ok: true },
        ],
      },
    ],

    mockupUrl: 'dealspace.app/deal/abc123',
    mockupTotal: 'Total',
    mockupAccept: 'Accept & Sign ✍',
    mockupItems: ['Brand Strategy', 'Social Media Mgmt', 'Analytics Report'],

    // Theme toggle
    themeLight: 'Light',
    themeDark: 'Dark',
  },
}

// ─── Animation variants ────────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const itemFade: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 150, damping: 18, mass: 0.7 } },
}

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 110, damping: 16, mass: 0.8 } },
}

// ─── Gyroscope Hook (mobile tilt) ─────────────────────────────────────────────

function useGyroscope(strength = 1) {
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springX = useSpring(rotX, { stiffness: 90, damping: 18, restDelta: 0.001 })
  const springY = useSpring(rotY, { stiffness: 90, damping: 18, restDelta: 0.001 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: coarse)').matches) return

    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DOE.requestPermission === 'function') return

    let raf: number | null = null
    function handler(e: DeviceOrientationEvent) {
      if (raf !== null) return
      const beta  = e.beta  ?? 45
      const gamma = e.gamma ?? 0
      raf = requestAnimationFrame(() => {
        raf = null
        const b = Math.max(-12, Math.min(12, beta  - 45))
        const g = Math.max(-12, Math.min(12, gamma))
        rotX.set(b * 0.45 * strength)
        rotY.set(g * 0.65 * strength)
      })
    }
    window.addEventListener('deviceorientation', handler, { passive: true })
    return () => {
      window.removeEventListener('deviceorientation', handler)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [rotX, rotY, strength])

  return { springX, springY }
}

// ─── Hero Aurora Background ────────────────────────────────────────────────────

const PARTICLES = [
  { s: 3, x: '14%', y: '22%', bg: 'rgba(99,102,241,0.75)',  a: 1, d: 15, dl: 0   },
  { s: 2, x: '71%', y: '38%', bg: 'rgba(168,85,247,0.65)',  a: 2, d: 19, dl: 2.5 },
  { s: 4, x: '37%', y: '62%', bg: 'rgba(99,102,241,0.55)',  a: 3, d: 23, dl: 1.2 },
  { s: 2, x: '85%', y: '18%', bg: 'rgba(212,175,55,0.55)',  a: 4, d: 17, dl: 3.8 },
  { s: 3, x: '22%', y: '78%', bg: 'rgba(168,85,247,0.60)',  a: 1, d: 21, dl: 5.1 },
  { s: 2, x: '58%', y: '48%', bg: 'rgba(99,102,241,0.50)',  a: 2, d: 16, dl: 1.7 },
  { s: 3, x: '44%', y: '28%', bg: 'rgba(212,175,55,0.45)',  a: 3, d: 25, dl: 4.2 },
  { s: 2, x: '8%',  y: '55%', bg: 'rgba(99,102,241,0.60)',  a: 4, d: 20, dl: 6.0 },
  { s: 5, x: '92%', y: '72%', bg: 'rgba(168,85,247,0.45)',  a: 1, d: 18, dl: 2.1 },
  { s: 2, x: '63%', y: '85%', bg: 'rgba(99,102,241,0.55)',  a: 2, d: 22, dl: 0.9 },
  { s: 3, x: '30%', y: '12%', bg: 'rgba(168,85,247,0.50)',  a: 3, d: 14, dl: 3.3 },
  { s: 2, x: '78%', y: '55%', bg: 'rgba(212,175,55,0.40)',  a: 4, d: 26, dl: 7.0 },
] as const

function HeroAurora({ isDark }: { isDark: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base background */}
      <div className="absolute inset-0" style={{ background: isDark ? '#030305' : '#f8fafc' }} />

      {/* Dot grid — lighter pattern on white bg */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(99,102,241,0.18)'} 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          opacity: isDark ? 0.12 : 0.35,
        }}
      />

      {/* Aurora orbs — opacity wrapper for light mode watercolor effect */}
      <div style={{ opacity: isDark ? 1 : 0.3 }}>
        <div
          className="absolute top-[-20%] left-[15%] h-[800px] w-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.38) 0%, rgba(168,85,247,0.18) 40%, transparent 70%)', filter: 'blur(72px)', animation: 'lp-aurora-1 28s ease-in-out infinite', willChange: 'transform' }}
        />
        <div
          className="absolute top-[10%] right-[-10%] h-[700px] w-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(99,102,241,0.12) 50%, transparent 70%)', filter: 'blur(80px)', animation: 'lp-aurora-2 22s ease-in-out infinite', willChange: 'transform' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] h-[560px] w-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)', filter: 'blur(64px)', animation: 'lp-aurora-3 32s ease-in-out infinite', willChange: 'transform' }}
        />
        <div
          className="absolute top-[40%] right-[30%] h-[400px] w-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', filter: 'blur(90px)', animation: 'lp-aurora-1 40s ease-in-out infinite reverse', willChange: 'transform' }}
        />
        <div
          className="absolute top-[60%] left-[45%] h-[300px] w-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'lp-aurora-2 36s ease-in-out infinite reverse', willChange: 'transform' }}
        />
      </div>

      {/* Particles — reduced opacity in light mode */}
      <div style={{ opacity: isDark ? 1 : 0.2 }}>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.s, height: p.s,
              left: p.x, top: p.y,
              background: p.bg,
              filter: 'blur(0.5px)',
              boxShadow: `0 0 ${p.s * 3}px ${p.bg}`,
              animation: `lp-particle-${p.a} ${p.d}s ease-in-out infinite`,
              animationDelay: `${p.dl}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── 3-D Magnetic Tilt Card ────────────────────────────────────────────────────

function Tilt3D({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20, restDelta: 0.001 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20, restDelta: 0.001 })
  const { springX: gyroX, springY: gyroY } = useGyroscope()

  const rotateX = useTransform([springX, gyroX] as const, ([m, g]: number[]) => m + g)
  const rotateY = useTransform([springY, gyroY] as const, ([m, g]: number[]) => m + g)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mouseY.set(((e.clientX - r.left) / r.width  - 0.5) * 11)
    mouseX.set(((e.clientY - r.top)  / r.height - 0.5) * -11)
  }
  function onLeave() { mouseX.set(0); mouseY.set(0) }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: 'transform', transformStyle: 'preserve-3d', rotateX, rotateY, perspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

// ─── Live Notification Toast ───────────────────────────────────────────────────

function LiveToastStack({ toasts, isDark }: { toasts: typeof copy['he']['toast']; isDark: boolean }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % toasts.length), 3600)
    return () => clearInterval(t)
  }, [toasts.length])

  const item = toasts[idx]

  return (
    <div className="relative h-14 flex items-end" style={{ minWidth: 0 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.35, ease: 'easeOut' as const }}
          className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
              : 'rgba(255,255,255,0.92)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="text-base flex-none">{item.emoji}</span>
          <span className="text-[11px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#334155' }}>{item.msg}</span>
          {item.amount && (
            <span
              className="text-[11px] font-black tabular-nums flex-none"
              style={{ background: 'linear-gradient(90deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              dir="ltr"
            >
              {item.amount}
            </span>
          )}
          <span className="relative flex h-1.5 w-1.5 flex-none">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animation: 'lp-ping-ring 1.4s ease-out infinite' }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Deal Room Mockup ──────────────────────────────────────────────────────────

function DealRoomMockup({ c, isHe, isDark }: { c: typeof copy['he']; isHe: boolean; isDark: boolean }) {
  const prices = ['₪6,900', '₪3,300', '₪5,100', '₪4,200', '₪6,900']
  const { springX: gyroX, springY: gyroY } = useGyroscope()
  const rotateX = useTransform(gyroX, (v) => 8  + v)
  const rotateY = useTransform(gyroY, (v) => -4 + v)

  return (
    <div style={{ perspective: 1400, animation: 'lp-float-mockup 7s ease-in-out infinite', willChange: 'transform' }}>
      <motion.div
        whileHover={{ rotateX: 4, rotateY: -2, scale: 1.015 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 70px 140px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07), 0 0 100px rgba(99,102,241,0.14)'
            : '0 40px 100px rgba(99,102,241,0.12), 0 0 0 1px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.08)',
          background: isDark
            ? 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
            : '#ffffff',
          backdropFilter: isDark ? 'blur(24px)' : 'none',
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <div className="flex-1 mx-4">
            <div
              className="mx-auto max-w-[200px] rounded-md px-3 py-1 text-[10px] text-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
                color: isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8',
              }}
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
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.07))'
                : 'linear-gradient(135deg, rgba(99,102,241,0.07), rgba(168,85,247,0.04))',
              border: isDark ? '1px solid rgba(99,102,241,0.22)' : '1px solid rgba(99,102,241,0.18)',
            }}
          >
            <p className="text-[9px] mb-1 uppercase tracking-widest" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>{c.mockupTotal}</p>
            <div className="overflow-hidden h-8" dir="ltr">
              <motion.div
                animate={{ y: [0, -32, -64, -96, -128] }}
                transition={{ duration: 4, ease: 'easeInOut' as const, repeat: Infinity, repeatDelay: 2, times: [0, 0.2, 0.4, 0.6, 0.8] }}
                className="flex flex-col"
              >
                {prices.map((p, i) => (
                  <div key={i} className="h-8 flex items-center justify-center text-xl font-black" style={{ background: 'linear-gradient(90deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                background: i !== 1
                  ? (isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))' : 'rgba(99,102,241,0.06)')
                  : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'),
                border: i !== 1
                  ? (isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.18)')
                  : (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)'),
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full flex items-center justify-center" style={{ background: i !== 1 ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'), boxShadow: i !== 1 ? '0 0 8px rgba(99,102,241,0.5)' : 'none' }}>
                  {i !== 1 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>{label}</span>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: i !== 1 ? '#a5b4fc' : (isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8') }} dir="ltr">
                {['₪2,400', '₪1,800', '₪900'][i]}
              </span>
            </motion.div>
          ))}

          {/* Accept button */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.4 }}
            className="rounded-xl py-3 text-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)', boxShadow: '0 0 28px rgba(99,102,241,0.45)' }}
          >
            {c.mockupAccept}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Marquee Trust Band ────────────────────────────────────────────────────────

const MARQUEE_ICONS = ['⚡', '🏆', '⚡', '🔥', '⚡', '⭐', '⚡', '✅']

function MarqueeBand({ items, isRTL, isDark }: { items: string[]; isRTL: boolean; isDark: boolean }) {
  const quad = [...items, ...items, ...items, ...items]
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(90deg, rgba(99,102,241,0.07) 0%, rgba(168,85,247,0.04) 50%, rgba(99,102,241,0.07) 100%)'
          : 'linear-gradient(90deg, rgba(99,102,241,0.04) 0%, rgba(168,85,247,0.025) 50%, rgba(99,102,241,0.04) 100%)',
        borderTop: isDark ? '1px solid rgba(99,102,241,0.14)' : '1px solid rgba(99,102,241,0.12)',
        borderBottom: isDark ? '1px solid rgba(99,102,241,0.14)' : '1px solid rgba(99,102,241,0.12)',
        padding: '16px 0',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div
        dir="ltr"
        style={{
          display: 'flex',
          width: 'max-content',
          animation: isRTL ? 'lp-marquee-rtl 40s linear infinite' : 'lp-marquee 40s linear infinite',
        }}
      >
        {quad.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 whitespace-nowrap"
            style={{ padding: '0 40px', fontSize: 13, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.62)' : '#475569', fontFamily: 'var(--font-sans)' }}
          >
            <span style={{ fontSize: 11, color: '#818cf8', opacity: 0.85 }}>{MARQUEE_ICONS[i % MARQUEE_ICONS.length]}</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── How It Works ──────────────────────────────────────────────────────────────

const STEP_COLORS = ['#6366f1', '#a855f7', '#22c55e'] as const
const STEP_GLOWS  = ['rgba(99,102,241,0.5)', 'rgba(168,85,247,0.5)', 'rgba(34,197,94,0.5)'] as const

function HowItWorksSection({ c, isHe, isDark }: { c: typeof copy['he']; isHe: boolean; isDark: boolean }) {
  return (
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: isDark ? 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(99,102,241,0.06) 0%, transparent 70%)' : 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(99,102,241,0.04) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.18), transparent)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.18), transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16 sm:mb-20"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-4" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 40%, #c084fc 60%, #6366f1 100%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'lp-shimmer 4s linear infinite' }}>
            {c.howLabel}
          </p>
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight">
            <span style={{ color: isDark ? 'white' : '#0f172a' }}>{c.howH2part1} </span>
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 55%, #f0abfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {c.howH2Highlight}
            </span>
            <span style={{ color: isDark ? 'white' : '#0f172a' }}> {c.howH2part2}</span>
          </h2>
        </motion.div>

        <div className="relative" dir="ltr">
          <div className="hidden lg:block absolute top-[52px] left-[16.66%] right-[16.66%] h-px pointer-events-none" style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)' }}>
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
              style={{ background: '#818cf8', boxShadow: '0 0 6px #818cf8' }}
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 4, ease: 'easeInOut' as const, repeat: Infinity, repeatDelay: 1 }}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-6">
            {c.steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex-1 flex flex-col items-center text-center lg:items-center"
                variants={itemFade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15 }}
              >
                {i > 0 && (
                  <div className="lg:hidden flex flex-col items-center mb-5">
                    <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.3), transparent)' }} />
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#818cf8', boxShadow: '0 0 6px #818cf8', animation: 'lp-counter-pulse 2s ease-in-out infinite' }} />
                    <div className="w-px h-4" style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), transparent)' }} />
                  </div>
                )}

                <div
                  className="relative flex h-[104px] w-[104px] items-center justify-center rounded-3xl mb-6 flex-none"
                  style={{
                    background: `linear-gradient(145deg, ${STEP_COLORS[i]}18 0%, ${STEP_COLORS[i]}08 100%)`,
                    border: `1px solid ${STEP_COLORS[i]}30`,
                    boxShadow: isDark ? `0 0 32px ${STEP_GLOWS[i]}` : `0 0 24px ${STEP_GLOWS[i].replace('0.5)', '0.25)')}`,
                  }}
                >
                  <div className="pointer-events-none absolute top-0 left-4 right-4 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${STEP_COLORS[i]}50, transparent)` }} />
                  <div>
                    <div
                      className="text-[36px] leading-none font-black tabular-nums"
                      style={{
                        background: `linear-gradient(135deg, ${STEP_COLORS[i]} 0%, rgba(255,255,255,0.7) 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'var(--font-accent)',
                      }}
                    >
                      {step.num}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-center mt-0.5" style={{ color: `${STEP_COLORS[i]}cc` }}>
                      {isHe ? step.tag : step.tagEn}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2.5" style={{ color: isDark ? 'white' : '#0f172a' }} dir={isHe ? 'rtl' : 'ltr'}>{step.title}</h3>
                <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }} dir={isHe ? 'rtl' : 'ltr'}>{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Problem vs Solution ───────────────────────────────────────────────────────

function ProblemSolutionSection({ c, isHe, isDark }: { c: typeof copy['he']; isHe: boolean; isDark: boolean }) {
  return (
    <section className="relative py-16 sm:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 40%, #c084fc 60%, #6366f1 100%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'lp-shimmer 4s linear infinite' }}>
            {isHe ? 'השוואה אמיתית' : 'Real comparison'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-5 tracking-tight flex items-center justify-center gap-3 flex-wrap" dir="ltr">
            <span style={{ color: isDark ? 'white' : '#0f172a' }}>PDF</span>
            <span
              className="rounded-xl px-3 py-1 text-[65%] font-black"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(168,85,247,0.15) 100%)', border: '1px solid rgba(99,102,241,0.32)', color: '#a5b4fc', fontFamily: 'var(--font-accent)', letterSpacing: '0.08em', boxShadow: '0 0 18px rgba(99,102,241,0.2)' }}
            >
              vs.
            </span>
            <span style={{ color: isDark ? 'white' : '#0f172a' }}>{isHe ? 'חדר עסקאות' : 'Deal Room'}</span>
          </h2>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }} className="text-base max-w-md mx-auto">{c.vsSub}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className="flex-1 rounded-3xl p-7"
            style={{
              background: isDark
                ? 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.1) 100%)'
                : '#ffffff',
              border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
              filter: 'saturate(0.7)',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <X size={16} style={{ color: '#f87171' }} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#f87171' }}>{c.problemLabel}</p>
            </div>
            <ul className="space-y-4">
              {c.problemItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-none h-5 w-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <X size={10} style={{ color: '#f87171' }} />
                  </div>
                  <span className="text-sm leading-snug" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* VS Divider */}
          <div className="flex lg:flex-col items-center justify-center py-2 lg:py-0 lg:px-5">
            <motion.div
              className="flex-1 h-px lg:h-auto lg:w-px"
              initial={{ scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: 'easeOut' as const }}
              style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)', transformOrigin: 'top center' }}
            />
            <div className="relative flex-none mx-4 lg:mx-0 lg:my-5">
              <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(99,102,241,0.25)', animation: 'lp-ping-ring 2.8s ease-out infinite' }} />
              <div className="absolute -inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(10px)' }} />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 22, delay: 0.35 }}
                style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 32px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-accent)', fontSize: 13, fontWeight: 900,
                  color: 'white', letterSpacing: '0.08em', position: 'relative', zIndex: 1,
                  textShadow: '0 1px 8px rgba(0,0,0,0.4)',
                }}
              >
                VS
              </motion.div>
            </div>
            <motion.div
              className="flex-1 h-px lg:h-auto lg:w-px"
              initial={{ scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: 'easeOut' as const, delay: 0.7 }}
              style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent)', transformOrigin: 'top center' }}
            />
          </div>

          {/* DealSpace Way */}
          <motion.div
            initial={{ opacity: 0, x: isHe ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.1 }}
            className="flex-1 relative rounded-3xl p-7 overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.07) 50%, rgba(168,85,247,0.04) 100%)'
                : 'linear-gradient(160deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 50%, rgba(168,85,247,0.02) 100%)',
              border: isDark ? '1px solid rgba(99,102,241,0.28)' : '1px solid rgba(99,102,241,0.2)',
              boxShadow: isDark
                ? '0 0 60px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.07)'
                : '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            <div className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(24px)', opacity: isDark ? 1 : 0.5 }} />
            <div className="pointer-events-none absolute -bottom-8 -start-8 h-28 w-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)', filter: 'blur(20px)', opacity: isDark ? 1 : 0.5 }} />
            <div className="pointer-events-none absolute top-0 start-8 end-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.4), transparent)' }} />
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.38)', boxShadow: '0 0 14px rgba(99,102,241,0.3)' }}>
                <Zap size={16} style={{ color: '#a5b4fc' }} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#a5b4fc' }}>{c.solutionLabel}</p>
            </div>
            <ul className="space-y-4">
              {c.solutionItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-none h-5 w-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.38)' }}>
                    <Check size={10} style={{ color: '#a5b4fc' }} />
                  </div>
                  <span className="text-sm leading-snug" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#1e293b' }}>{item}</span>
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

function ExpiryLockMini({ isHe, isDark }: { isHe: boolean; isDark: boolean }) {
  const [secs, setSecs] = useState(47 * 3600 + 23 * 60 + 11)
  useEffect(() => {
    const id = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 47 * 3600 + 23 * 60 + 11)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: 'rgba(248,113,113,0.7)' }}>
          {isHe ? 'תוקף ההצעה פג בעוד' : 'Offer expires in'}
        </p>
        <div className="flex items-center justify-center gap-1.5" dir="ltr">
          {[h, m, s].map((unit, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="rounded-lg px-2 py-1 min-w-[32px] text-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span className="text-[15px] font-black tabular-nums" style={{ color: '#fca5a5', fontFamily: 'var(--font-accent)' }}>{unit}</span>
              </div>
              {i < 2 && <span className="text-[13px] font-black" style={{ color: 'rgba(248,113,113,0.5)' }}>:</span>}
            </div>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' as const }}
        className="flex items-center justify-between rounded-xl px-3 py-2.5"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="flex items-center gap-2">
          <Lock size={11} style={{ color: '#f87171' }} />
          <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>{isHe ? 'מחיר נעול לאחר תפוגה' : 'Price locked after expiry'}</span>
        </div>
        <div className="rounded px-1.5 py-0.5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="text-[9px] font-bold" style={{ color: '#f87171' }}>{isHe ? 'נעול' : 'LOCKED'}</span>
        </div>
      </motion.div>
    </div>
  )
}

function ViewTrackingMini({ isHe, isDark }: { isHe: boolean; isDark: boolean }) {
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
        <div className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          {isHe ? 'ד' : 'D'}
        </div>
        <div
          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400"
          style={{ border: `2px solid ${isDark ? '#030305' : '#ffffff'}` }}
        />
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ animation: 'lp-ping-ring 1.8s ease-out infinite' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold leading-snug" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#1e293b' }}>{isHe ? 'דוד לוי פתח את ההצעה' : 'David L. opened your proposal'}</p>
        <p className="text-[9px] mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>{isHe ? 'כרגע · עמוד 2/3' : 'just now · page 2/3'}</p>
      </div>
    </motion.div>
  )
}

function WhatsAppMini({ isHe, isDark }: { isHe: boolean; isDark: boolean }) {
  return (
    <div className="mt-4 space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[90%]"
        style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.2)' }}
      >
        <p className="text-[10px] leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#334155' }}>
          {isHe
            ? 'היי דוד, רק רציתי לוודא שיצא לך לעבור על ההצעה ששלחתי. אפשר לצפות ולאשר מכל מכשיר:'
            : 'Hi David, just checking in on the proposal I sent. You can review & sign from any device:'}
        </p>
        <div className="mt-1.5 rounded-lg px-2 py-1" style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.15)' }}>
          <span className="text-[9px] font-semibold" style={{ color: '#4ade80' }}>dealspace.app/deal/abc123 ↗</span>
        </div>
        <p className="text-[8px] text-right mt-1" style={{ color: 'rgba(37,211,102,0.5)' }}>✓✓</p>
      </motion.div>
      <div className="flex items-center gap-1.5 ps-1">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#25D366', boxShadow: '0 0 6px #25D366', animation: 'lp-ping-ring 2s ease-out infinite' }} />
        <span className="text-[9px]" style={{ color: 'rgba(74,222,128,0.6)' }}>{isHe ? 'נשלח דרך WhatsApp' : 'Sent via WhatsApp'}</span>
      </div>
    </div>
  )
}

function SignatureMini({ isDark }: { isDark: boolean }) {
  return (
    <div className="mt-4">
      <div
        className="rounded-xl flex items-center justify-center"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
          height: 70,
        }}
      >
        <svg viewBox="0 0 220 60" width="100%" height="60">
          <defs>
            <linearGradient id="sig-g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <path
            d="M14,40 C30,12 46,52 62,32 C78,12 86,50 108,28 C126,10 136,48 158,22 C172,8 182,46 206,18"
            fill="none" stroke="url(#sig-g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="320"
            style={{ animation: 'lp-draw-sig 3.5s ease-in-out infinite' }}
          />
        </svg>
      </div>
    </div>
  )
}

function BusinessTermsMini({ isHe, isDark }: { isHe: boolean; isDark: boolean }) {
  return (
    <div className="mt-4 space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="rounded-xl p-2.5"
        style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.18)' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <FileCheck size={10} style={{ color: '#c084fc' }} />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: 'rgba(192,132,252,0.7)' }}>
            {isHe ? 'תנאי עסק גלובליים' : 'Global Business Terms'}
          </span>
        </div>
        <div className="space-y-1">
          {[isHe ? 'תנאי תשלום: 30 יום נטו' : 'Payment: Net 30 days', isHe ? 'בעלות קניין רוחני לאחר תשלום' : 'IP transfers on full payment'].map((line, i) => (
            <p key={i} className="text-[9px] leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>{line}</p>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' as const }}
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <div className="h-3.5 w-3.5 rounded flex items-center justify-center flex-none" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
          <Check size={8} style={{ color: '#4ade80' }} />
        </div>
        <span className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{isHe ? 'הלקוח אישר את התנאים' : 'Client accepted the terms'}</span>
      </motion.div>
    </div>
  )
}

function VATMini({ isHe, isDark }: { isHe: boolean; isDark: boolean }) {
  const gross = 11800
  const vatRate = 0.18
  const vat = Math.round(gross - gross / (1 + vatRate))
  const net = gross - vat
  const fmt = (n: number) => n.toLocaleString('en-US')

  return (
    <div className="mt-4 space-y-2" dir="ltr">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: 'easeOut' as const }}
        className="flex items-center justify-between rounded-xl px-3 py-2"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        <span className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{isHe ? 'מחיר שהזנתם' : 'You entered'}</span>
        <span className="text-[11px] font-black" style={{ color: '#a5b4fc' }}>₪{fmt(gross)}</span>
      </motion.div>
      {[
        { label: isHe ? 'לפני מע"מ' : 'Before VAT', val: `₪${fmt(net)}`, color: isDark ? 'rgba(255,255,255,0.45)' : '#475569' },
        { label: isHe ? 'מתוכם מע"מ (18%)' : 'Of which VAT (18%)', val: `₪${fmt(vat)}`, color: '#c084fc' },
      ].map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: 8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 + i * 0.1, ease: 'easeOut' as const }}
          className="flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-1.5">
            <Percent size={9} style={{ color: 'rgba(192,132,252,0.5)' }} />
            <span className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>{row.label}</span>
          </div>
          <span className="text-[10px] font-semibold" style={{ color: row.color }}>{row.val}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Bento Grid ────────────────────────────────────────────────────────────────

const BENTO_COLORS = ['#6366f1', '#6366f1', '#a855f7', '#22c55e', '#a855f7', '#d4af37']
const BENTO_GLOWS  = ['rgba(99,102,241,0.35)', 'rgba(99,102,241,0.3)', 'rgba(168,85,247,0.35)', 'rgba(34,197,94,0.35)', 'rgba(168,85,247,0.3)', 'rgba(212,175,55,0.3)']

function BentoGridSection({ c, isHe, isDark }: { c: typeof copy['he']; isHe: boolean; isDark: boolean }) {
  const icons = [<Lock size={16} />, <Eye size={16} />, <MessageCircle size={16} />, <FileSignature size={16} />, <FileCheck size={16} />, <Percent size={16} />]
  const minis = [
    <ExpiryLockMini isHe={isHe} isDark={isDark} />,
    <ViewTrackingMini isHe={isHe} isDark={isDark} />,
    <WhatsAppMini isHe={isHe} isDark={isDark} />,
    <SignatureMini isDark={isDark} />,
    <BusinessTermsMini isHe={isHe} isDark={isDark} />,
    <VATMini isHe={isHe} isDark={isDark} />,
  ]

  return (
    <section
      className="relative py-16 sm:py-24 px-6"
      style={{ background: isDark ? 'rgba(255,255,255,0.01)' : '#f1f5f9' }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 40%, #c084fc 60%, #6366f1 100%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'lp-shimmer 4s linear infinite' }}>
            {c.featuresLabel}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? 'white' : '#0f172a' }}>{c.featuresH2}</h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {c.bento.map((card, i) => (
            <motion.div key={card.tag} variants={itemFade} className={card.wide ? 'md:col-span-2' : 'md:col-span-1'}>
              <Tilt3D
                className="relative rounded-3xl p-6 overflow-hidden h-full"
                style={{
                  background: isDark
                    ? 'linear-gradient(160deg, rgba(255,255,255,0.058) 0%, rgba(255,255,255,0.02) 100%)'
                    : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255,255,255,0.07)'
                    : '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
                }}
              >
                <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full" style={{ background: `radial-gradient(circle, ${BENTO_GLOWS[i]} 0%, transparent 70%)`, filter: 'blur(28px)', opacity: isDark ? 1 : 0.4 }} />
                <div className="pointer-events-none absolute top-0 left-8 right-8 h-px" style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)' }} />

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${BENTO_COLORS[i]}1A`, border: `1px solid ${BENTO_COLORS[i]}38`, color: BENTO_COLORS[i], boxShadow: `0 0 12px ${BENTO_COLORS[i]}22` }}>
                    {icons[i]}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={isDark ? {
                    background: `linear-gradient(90deg, ${BENTO_COLORS[i]}, rgba(255,255,255,0.75), ${BENTO_COLORS[i]})`,
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'lp-shimmer 4s linear infinite',
                  } : { color: BENTO_COLORS[i], fontWeight: 800 }}>
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold leading-snug mb-2" style={{ color: isDark ? 'white' : '#0f172a' }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>{card.body}</p>

                <div
                  className="mt-4 rounded-2xl p-4"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {minis[i]}
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Scramble Counter ─────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = '0123456789'

function ScrambleCounter({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState(value)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!inView || hasRun.current) return
    hasRun.current = true
    let frame = 0
    const total = 18
    const id = setInterval(() => {
      frame++
      if (frame >= total) {
        setDisplay(value)
        clearInterval(id)
      } else {
        setDisplay(value.replace(/\d/g, () => SCRAMBLE_CHARS[Math.floor(Math.random() * 10)]))
      }
    }, 48)
    return () => clearInterval(id)
  }, [inView, value])

  return <>{display}</>
}

function AnimatedStat({ s, i, isHe, isDark }: { s: typeof PROOF_STATS[0]; i: number; isHe: boolean; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const darkGradients = [
    'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
    'linear-gradient(135deg, #a5b4fc 0%, #c084fc 100%)',
    'linear-gradient(135deg, #c084fc 0%, #a5b4fc 100%)',
    'linear-gradient(135deg, #d4af37 0%, #f59e0b 100%)',
  ]
  // Solid colors for light mode — gradient-clip can fail in certain browsers/RTL contexts
  const lightColors = ['#4338ca', '#7c3aed', '#6366f1', '#d4af37']

  return (
    <motion.div ref={ref} variants={itemFade} className="flex flex-col items-center text-center">
      <span
        className="text-4xl sm:text-5xl font-black tracking-tight mb-3 tabular-nums"
        style={isDark ? {
          background: darkGradients[i],
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } : {
          color: lightColors[i],
        }}
      >
        <ScrambleCounter value={s.value} inView={inView} />
      </span>
      <div className="w-8 h-0.5 rounded-full mb-2.5" style={{ background: 'rgba(99,102,241,0.35)' }} />
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : '#64748b' }}>
        {isHe ? s.label_he : s.label_en}
      </span>
    </motion.div>
  )
}

// ─── Social Proof Numbers ─────────────────────────────────────────────────────

const PROOF_STATS = [
  { value: '₪2.3M+', label_he: 'עסקאות שנחתמו', label_en: 'in Signed Deals' },
  { value: '94%',    label_he: 'אחוז אישור',      label_en: 'Acceptance Rate'  },
  { value: '2×',     label_he: 'סגירה מהר יותר',  label_en: 'Faster Closing'   },
  { value: '4.9',    label_he: 'דירוג משתמשים',   label_en: 'User Rating'      },
]

function SocialProofNumbers({ isHe, isDark }: { isHe: boolean; isDark: boolean }) {
  return (
    <section className="relative py-16 px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.18), transparent)' }} />
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {PROOF_STATS.map((s, i) => (
            <AnimatedStat key={s.value} s={s} i={i} isHe={isHe} isDark={isDark} />
          ))}
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.18), transparent)' }} />
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const AVATAR_GRADS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
  'linear-gradient(135deg, #6366f1, #22c55e)',
  'linear-gradient(135deg, #d4af37, #f59e0b)',
  'linear-gradient(135deg, #22c55e, #6366f1)',
]

const AVATAR_GLOWS = [
  'rgba(99,102,241,0.45)',
  'rgba(168,85,247,0.45)',
  'rgba(236,72,153,0.4)',
  'rgba(34,197,94,0.4)',
  'rgba(212,175,55,0.4)',
  'rgba(34,197,94,0.4)',
]

function TestimonialCard({ t, i, isDark }: { t: { name: string; role: string; text: string; stars: number }; i: number; isDark: boolean }) {
  const idx = i % AVATAR_GRADS.length
  return (
    <div
      className="relative rounded-2xl overflow-hidden w-full"
      style={{
        padding: '20px',
        background: isDark
          ? 'linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)'
          : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = isDark
          ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 16px 48px rgba(0,0,0,0.45), 0 0 32px ${AVATAR_GLOWS[idx]}`
          : `0 8px 32px rgba(0,0,0,0.1), 0 0 24px ${AVATAR_GLOWS[idx].replace('0.45)', '0.15)').replace('0.4)', '0.12)')}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.boxShadow = isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'
      }}
    >
      <div className="pointer-events-none absolute -top-4 -end-4 h-20 w-20 rounded-full" style={{ background: `radial-gradient(circle, ${AVATAR_GLOWS[idx]} 0%, transparent 70%)`, filter: 'blur(14px)', opacity: isDark ? 1 : 0.4 }} />
      <div className="pointer-events-none absolute top-0 inset-x-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${AVATAR_GLOWS[idx]}, transparent)`, opacity: isDark ? 1 : 0.5 }} />

      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-[14px] font-black text-white flex-none"
          style={{
            background: AVATAR_GRADS[idx],
            boxShadow: `0 0 0 2px ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)'}, 0 0 16px ${AVATAR_GLOWS[idx]}`,
          }}
        >
          {t.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold leading-tight" style={{ color: isDark ? 'white' : '#0f172a' }}>{t.name}</p>
          <p className="text-[11px] leading-tight mt-0.5 truncate" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{t.role}</p>
        </div>
        <div className="flex gap-px flex-none">
          {Array.from({ length: t.stars }).map((_, s) => (
            <Star key={s} size={11} fill="#d4af37" style={{ color: '#d4af37', filter: 'drop-shadow(0 0 3px rgba(212,175,55,0.7))' }} />
          ))}
        </div>
      </div>

      <p className="relative z-10 text-[13px] leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.68)' : '#334155' }} dir="auto">"{t.text}"</p>
    </div>
  )
}

function TestimonialsSection({ c, isDark }: { c: typeof copy['he']; isDark: boolean }) {
  return (
    <section className="relative py-16 sm:py-24 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: isDark ? 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)' : 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.03) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.18), transparent)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.18), transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 40%, #c084fc 60%, #6366f1 100%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'lp-shimmer 4s linear infinite' }}>
            {c.socialsLabel}
          </p>
          <div className="flex items-center justify-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} fill="#d4af37" style={{ color: '#d4af37', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.7))' }} />
            ))}
          </div>
          <p className="text-[12px] mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>4.9 / 5 &nbsp;·&nbsp; 500+ {c.socialsLabel.includes('משתמש') ? 'עצמאיים ואנשי מכירות' : 'freelancers & agencies'}</p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
        >
          {c.testimonials.map((t, i) => (
            <motion.div key={i} variants={itemFade}>
              <TestimonialCard t={t} i={i} isDark={isDark} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Pricing Section ───────────────────────────────────────────────────────────

const TIER_BORDER = [
  'rgba(99,102,241,0.18)',
  'rgba(168,85,247,0.5)',
  'rgba(212,175,55,0.2)',
]
const TIER_ACCENT = ['#818cf8', '#c084fc', '#d4af37']

function PricingSection({ c, isHe, onCta, isDark }: { c: typeof copy['he']; isHe: boolean; onCta: () => void; isDark: boolean }) {
  return (
    <section
      className="relative py-10 sm:py-28 px-4 sm:px-6 overflow-hidden"
      style={{ background: isDark ? undefined : '#f1f5f9' }}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: isDark ? 'radial-gradient(ellipse 60% 60% at 60% 50%, rgba(168,85,247,0.1) 0%, transparent 70%)' : 'radial-gradient(ellipse 60% 60% at 60% 50%, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-14"
          variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-3" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 40%, #c084fc 60%, #6366f1 100%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'lp-shimmer 4s linear infinite' }}>
            {c.pricingLabel}
          </p>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3" style={{ color: isDark ? 'white' : '#0f172a' }}>{c.pricingH2}</h2>
          <p className="text-[13px] sm:text-[14px]" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>{c.pricingSub}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start"
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
        >
          {c.tiers.map((tier, i) => {
            const isPro = i === 1
            const isFree = i === 0

            return (
              <motion.div
                key={tier.name}
                variants={itemFade}
                className={`relative rounded-[22px]${isPro ? ' md:-top-3' : ''}`}
                style={{ position: 'relative' as const }}
              >
                {isPro && (
                  <div
                    className="pointer-events-none absolute -inset-6 rounded-[2rem]"
                    style={{ background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.38) 0%, rgba(99,102,241,0.2) 45%, transparent 70%)', filter: 'blur(32px)' }}
                  />
                )}

                <div style={{ position: 'relative', padding: isPro ? '1.5px' : '0', borderRadius: '22px', overflow: 'hidden', zIndex: 1 }}>
                  {isPro && (
                    <div style={{ position: 'absolute', inset: '-80%', background: 'conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1)', animation: 'lp-spin-border 4s linear infinite' }} />
                  )}

                  {/* Card body — Pro always dark (intentional, stands out on white bg too) */}
                  <div
                    className="relative rounded-[21px] p-5 sm:p-6 h-full flex flex-col"
                    style={{
                      background: isPro
                        ? 'linear-gradient(150deg, rgba(30,12,55,0.98) 0%, rgba(14,6,30,0.99) 100%)'
                        : isDark
                          ? 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)'
                          : i === 0
                            ? 'linear-gradient(160deg, #f0f4ff 0%, #ffffff 100%)'  // Free — light indigo tint
                            : 'linear-gradient(160deg, #fffbf0 0%, #ffffff 100%)',  // Premium — light amber tint
                      border: isPro ? 'none' : isDark
                        ? `1px solid ${TIER_BORDER[i]}`
                        : `1px solid ${i === 2 ? 'rgba(212,175,55,0.35)' : 'rgba(99,102,241,0.22)'}`,
                      boxShadow: isPro
                        ? '0 0 50px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
                        : isDark
                          ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
                          : '0 2px 8px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="pointer-events-none absolute top-0 inset-x-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${TIER_ACCENT[i]}60, transparent)` }} />

                    {isPro && (
                      <div className="flex justify-center mb-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black"
                          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.22))', border: '1px solid rgba(168,85,247,0.5)', color: '#e9d5ff', boxShadow: '0 0 20px rgba(168,85,247,0.35)' }}
                        >
                          <Star size={9} fill="#c084fc" style={{ color: '#c084fc' }} />
                          {c.pricingPopular}
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: TIER_ACCENT[i] }}>{tier.name}</p>
                      <div className="flex items-end gap-1 mb-1" dir="ltr">
                        <span
                          className={`${isPro ? 'text-[44px] sm:text-[52px]' : 'text-[32px] sm:text-[40px]'} font-black leading-none tracking-tight`}
                          style={{ color: isPro ? 'white' : (isDark ? 'white' : '#0f172a') }}
                        >
                          {tier.price}
                        </span>
                        <span className="text-[12px] pb-1" style={{ color: isPro ? 'rgba(255,255,255,0.35)' : (isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8') }}>{tier.period}</span>
                      </div>
                      {!isFree && (
                        <p className="text-[10px] font-semibold mb-1" style={{ color: `${TIER_ACCENT[i]}99` }}>
                          {isHe ? 'כולל מע"מ' : 'VAT incl.'}
                        </p>
                      )}
                      <p className="text-[11px]" style={{ color: isPro ? 'rgba(255,255,255,0.38)' : (isDark ? 'rgba(255,255,255,0.38)' : '#94a3b8') }}>{tier.sub}</p>
                    </div>

                    <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${TIER_ACCENT[i]}28, transparent)` }} />

                    <ul className="space-y-2.5 flex-1 mb-5">
                      {tier.features.map((f) => (
                        <li key={f.text} className="flex items-center gap-2.5">
                          <div
                            className="flex-none h-4 w-4 rounded-full flex items-center justify-center"
                            style={{
                              background: f.ok ? `${TIER_ACCENT[i]}20` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                              border: `1px solid ${f.ok ? `${TIER_ACCENT[i]}40` : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                            }}
                          >
                            {f.ok
                              ? <Check size={9} style={{ color: TIER_ACCENT[i] }} />
                              : <X size={9} style={{ color: isDark ? 'rgba(255,255,255,0.18)' : '#94a3b8' }} />
                            }
                          </div>
                          <span
                            className="text-[12px] leading-snug"
                            style={{ color: f.ok
                              ? (isPro ? 'rgba(255,255,255,0.72)' : (isDark ? 'rgba(255,255,255,0.72)' : '#334155'))
                              : (isDark ? 'rgba(255,255,255,0.22)' : '#94a3b8')
                            }}
                          >
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {isPro ? (
                      <motion.button
                        onClick={onCta}
                        className="w-full py-3 rounded-xl text-[13px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #5b5de8 0%, #7b35e8 50%, #9f40e8 100%)', boxShadow: '0 2px 18px rgba(99,102,241,0.28)', transition: 'box-shadow 0.2s ease, transform 0.15s ease' }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLButtonElement
                          el.style.boxShadow = '0 4px 32px rgba(99,102,241,0.52), 0 0 0 1px rgba(168,85,247,0.4)'
                          el.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLButtonElement
                          el.style.boxShadow = '0 2px 18px rgba(99,102,241,0.28)'
                          el.style.transform = ''
                        }}
                        whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 600, damping: 22 } }}
                      >
                        {c.pricingCta} →
                      </motion.button>
                    ) : isFree ? (
                      <motion.button
                        onClick={onCta}
                        className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
                        style={{
                          border: isDark ? '1px solid rgba(99,102,241,0.22)' : '1px solid rgba(99,102,241,0.3)',
                          color: isDark ? 'rgba(165,180,252,0.8)' : '#6366f1',
                          background: 'transparent',
                          transition: 'border-color 0.2s, color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLButtonElement
                          el.style.borderColor = 'rgba(99,102,241,0.5)'
                          el.style.color = '#a5b4fc'
                          el.style.boxShadow = '0 2px 16px rgba(99,102,241,0.12)'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLButtonElement
                          el.style.borderColor = isDark ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.3)'
                          el.style.color = isDark ? 'rgba(165,180,252,0.8)' : '#6366f1'
                          el.style.boxShadow = ''
                        }}
                        whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 600, damping: 22 } }}
                      >
                        {c.pricingFreeCta}
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={onCta}
                        className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
                        style={{
                          border: isDark ? '1px solid rgba(212,175,55,0.22)' : '1px solid rgba(212,175,55,0.35)',
                          color: isDark ? 'rgba(212,175,55,0.8)' : '#b45309',
                          background: 'transparent',
                          transition: 'border-color 0.2s, color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLButtonElement
                          el.style.borderColor = 'rgba(212,175,55,0.45)'
                          el.style.color = '#d4af37'
                          el.style.boxShadow = '0 2px 16px rgba(212,175,55,0.1)'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLButtonElement
                          el.style.borderColor = isDark ? 'rgba(212,175,55,0.22)' : 'rgba(212,175,55,0.35)'
                          el.style.color = isDark ? 'rgba(212,175,55,0.8)' : '#b45309'
                          el.style.boxShadow = ''
                        }}
                        whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 600, damping: 22 } }}
                      >
                        {c.pricingCta} →
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection({ c, isHe, onCta, isDark }: { c: typeof copy['he']; isHe: boolean; onCta: () => void; isDark: boolean }) {
  return (
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 80%, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 80%, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.03) 40%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(99,102,241,0.12)'} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: isDark ? 0.18 : 0.25,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(168,85,247,0.4), transparent)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

      <div className="max-w-2xl mx-auto text-center">
        <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
            style={{
              background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(21,128,61,0.08)',
              border: isDark ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(21,128,61,0.25)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring' as const, stiffness: 280, damping: 20, delay: 0.1 }}
          >
            <Shield size={12} style={{ color: isDark ? '#4ade80' : '#15803d' }} />
            <span className="text-[11px] font-bold" style={{ color: isDark ? '#4ade80' : '#15803d' }}>{c.ctaUrgency}</span>
          </motion.div>

          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mb-2"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 65%, #c084fc 100%)'
                : 'linear-gradient(135deg, #0f172a 30%, #4338ca 65%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {c.ctaH2a}
          </h2>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mb-3"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #c084fc 0%, #a5b4fc 50%, #ffffff 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #4338ca 50%, #0f172a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {c.ctaH2b}
          </h2>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-8">
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 55%, #f0abfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {c.ctaH2Highlight}
            </span>
          </h2>

          <p className="text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#475569' }}>{c.ctaSub}</p>

          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', filter: 'blur(20px)', opacity: 0.5, animation: 'lp-badge-pulse 2.5s ease-in-out infinite', willChange: 'transform' }} />
            <motion.button
              onClick={onCta}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
              className="relative px-8 py-4 rounded-2xl text-[15px] font-bold text-white"
              style={{ background: 'linear-gradient(105deg, #6366f1 0%, #7c3aed 38%, rgba(200,190,255,0.55) 50%, #7c3aed 62%, #6366f1 100%)', backgroundSize: '220% 100%', animation: 'lp-shimmer 3s linear infinite', boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.4)' }}
            >
              <span className="flex items-center gap-2">
                {c.ctaBtn}
                <ArrowRight size={15} />
              </span>
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-8">
            {[
              { icon: <Shield size={11} />, text: isHe ? 'SSL מאובטח' : 'SSL Secured' },
              { icon: <Check size={11} />,  text: isHe ? 'חתימה חוקית' : 'Legally Binding' },
              { icon: <Clock size={11} />,  text: isHe ? 'הגדרה של 2 דקות' : '2-min setup' },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>
                <span style={{ color: 'rgba(165,180,252,0.5)' }}>{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
// Apple-style pill with sliding thumb. No whileHover to prevent navbar flicker.

function ThemeToggle({ isDark, onToggle, c }: { isDark: boolean; onToggle: () => void; c: typeof copy['he'] }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      dir="ltr"
      className="relative flex items-center rounded-full select-none"
      style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
        padding: '3px',
        gap: 0,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {/* Sliding background thumb */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          width: 'calc(50% - 3px)',
          left: isDark ? 'calc(50%)' : '3px',
          borderRadius: '999px',
          background: isDark ? 'rgba(255,255,255,0.12)' : '#ffffff',
          boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1), background 0.22s ease',
        }}
      />

      {/* Light option */}
      <div
        className="relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-full"
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: !isDark ? '#6366f1' : 'rgba(255,255,255,0.3)',
          transition: 'color 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <Sun size={10} />
        <span>{c.themeLight}</span>
      </div>

      {/* Dark option */}
      <div
        className="relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-full"
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)',
          transition: 'color 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <Moon size={10} />
        <span>{c.themeDark}</span>
      </div>
    </button>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ c, isHe, onLogin, onCta, onToggleLang, isDark, onToggleTheme }: {
  c: typeof copy['he']
  isHe: boolean
  onLogin: () => void
  onCta: () => void
  onToggleLang: () => void
  isDark: boolean
  onToggleTheme: () => void
}) {
  const { scrollY } = useScroll()
  const [isPill, setIsPill] = useState(false)
  const pillRef = useRef(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v > 80
    if (next !== pillRef.current) { pillRef.current = next; setIsPill(next) }
  })

  const logoMark = (size: number, radius: number) => (
    <div
      className="flex items-center justify-center flex-none text-white"
      style={{ width: size, height: size, borderRadius: radius, background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}
    >
      <Zap size={Math.round(size * 0.58)} />
    </div>
  )

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" style={{ paddingTop: isPill ? 10 : 0 }}>
      <AnimatePresence mode="wait">
        {/* ── PILL STATE ── */}
        {isPill ? (
          <motion.nav
            key="pill"
            className="pointer-events-auto mx-auto w-fit"
            initial={{ opacity: 0, y: -18, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring' as const, stiffness: 320, damping: 28 }}
          >
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-full"
              style={{
                background: isDark ? 'rgba(8,8,18,0.88)' : 'rgba(248,250,252,0.95)',
                backdropFilter: 'blur(44px) saturate(200%)',
                border: isDark ? '1px solid rgba(255,255,255,0.11)' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: isDark
                  ? '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.07)'
                  : '0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(99,102,241,0.1)',
              }}
            >
              {logoMark(26, 8)}
              <span
                className="text-[13px] font-bold tracking-tight"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #ffffff, #c4b5fd)'
                    : 'linear-gradient(135deg, #0f172a, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                DealSpace
              </span>
              <div className="h-3 w-px mx-0.5" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />
              <button
                onClick={onToggleLang}
                className="text-[11px] transition-colors px-1"
                style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#64748b' }}
              >
                {isHe ? 'EN' : 'עב'}
              </button>
              {/* Compact theme toggle in pill — icon only */}
              <button
                onClick={onToggleTheme}
                aria-label={isDark ? 'Light mode' : 'Dark mode'}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: 24, height: 24,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
                  color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                {isDark ? <Sun size={11} /> : <Moon size={11} />}
              </button>
              <motion.button
                onClick={onCta}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 14px rgba(99,102,241,0.45)' }}
              >
                {c.navCta}
              </motion.button>
            </div>
          </motion.nav>
        ) : (
          /* ── FULL NAVBAR STATE ── */
          <motion.nav
            key="full"
            className="pointer-events-auto flex items-center px-6 py-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              background: isDark ? 'rgba(3,3,5,0.92)' : 'rgba(248,250,252,0.96)',
              backdropFilter: 'blur(32px) saturate(180%)',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark
                ? '0 1px 0 rgba(99,102,241,0.14), 0 8px 48px rgba(0,0,0,0.28)'
                : '0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 40%, rgba(168,85,247,0.4) 60%, transparent 100%)' }} />

            {/* Left — Logo */}
            <div className="flex items-center gap-2.5 flex-1">
              {logoMark(32, 10)}
              <span
                className="text-[15px] font-bold tracking-tight"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #ffffff 30%, #c4b5fd 80%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #6366f1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                DealSpace
              </span>
            </div>

            {/* Center — Theme Toggle */}
            <div className="flex items-center justify-center">
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} c={c} />
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={onToggleLang}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors"
                style={{
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.1)',
                  background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)',
                  color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b',
                }}
              >
                <Globe size={11} />
                {isHe ? 'EN' : 'עב'}
              </button>

              <button
                onClick={onLogin}
                className="hidden sm:flex items-center px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                style={{
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
                  color: isDark ? 'rgba(255,255,255,0.6)' : '#475569',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = isDark ? 'rgba(255,255,255,0.9)' : '#0f172a'
                  el.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.color = isDark ? 'rgba(255,255,255,0.6)' : '#475569'
                  el.style.background = 'transparent'
                }}
              >
                {c.navLogin}
              </button>

              <motion.button
                onClick={onCta}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed, #a855f7)', boxShadow: '0 0 22px rgba(99,102,241,0.45), 0 2px 10px rgba(0,0,0,0.3)' }}
              >
                {c.navCta}
                <ChevronRight size={13} />
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection({ c, isHe, onCta, onDemo, isDark }: {
  c: typeof copy['he']
  isHe: boolean
  onCta: () => void
  onDemo: () => void
  isDark: boolean
}) {
  return (
    <section className="relative min-h-[92dvh] flex items-center pt-6 pb-20 px-6 overflow-hidden">
      <HeroAurora isDark={isDark} />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* ── Text block ── */}
          <div className="flex-1 text-center lg:text-start">

            {/* Brand lockup */}
            <div className="flex items-center gap-3.5 justify-center lg:justify-start mb-8" style={{ animation: 'lp-fade-up 0.55s ease-out both' }}>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-[14px] flex-none" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)', boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 0 48px rgba(99,102,241,0.6), 0 8px 24px rgba(0,0,0,0.4)' }}>
                <Zap size={22} className="text-white" />
                <div className="pointer-events-none absolute top-0 inset-x-0 h-px rounded-t-[14px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
              </div>
              <div className="text-start">
                <div
                  className="text-[26px] font-black tracking-[-0.02em] leading-none"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, #ffffff 20%, #c4b5fd 55%, #e0d9ff 85%)'
                      : 'linear-gradient(135deg, #0f172a 0%, #6366f1 60%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  DealSpace
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] mt-1" style={{ color: isDark ? 'rgba(165,180,252,0.55)' : '#818cf8' }}>
                  {isHe ? 'פלטפורמת עסקאות B2B' : 'B2B Deal Closing Platform'}
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.28)', animation: 'lp-fade-up 0.5s ease-out 0.1s both, lp-badge-pulse 3s ease-in-out 2s infinite' }}>
              <span className="text-[12px] font-bold text-indigo-300">{c.badge}</span>
            </div>

            {/* H1 */}
            <h1
              className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight mb-5"
              style={{ animation: 'lp-fade-up 0.65s ease-out 0.18s both' }}
            >
              <span style={{
                background: isDark
                  ? 'linear-gradient(135deg, #ffffff 25%, #c4b5fd 55%, #f0f0f8 80%)'
                  : 'linear-gradient(135deg, #0f172a 0%, #4338ca 65%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {c.h1Part1}
              </span>
              <br />
              <span style={{ color: isDark ? 'rgba(255,255,255,0.88)' : '#1e293b' }}>{c.h1Pre2}</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f0abfc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(129,140,248,0.35)',
                  textUnderlineOffset: '6px',
                  textDecorationThickness: '2px',
                }}
              >
                {c.h1Highlight}
              </span>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.88)' : '#1e293b' }}>{c.h1Post2}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-base sm:text-lg leading-relaxed max-w-xl mb-8"
              style={{ marginInlineStart: 0, marginInlineEnd: 'auto', animation: 'lp-fade-up 0.6s ease-out 0.28s both', color: isDark ? 'rgba(255,255,255,0.5)' : '#475569' }}
            >
              {c.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mb-6" style={{ animation: 'lp-fade-up 0.55s ease-out 0.38s both' }}>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', filter: 'blur(14px)', opacity: 0.55, animation: 'lp-badge-pulse 2s ease-in-out infinite', willChange: 'transform' }} />
                <motion.button
                  onClick={onCta}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                  className="relative flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[15px] font-bold text-white"
                  style={{ background: 'linear-gradient(105deg, #6366f1 0%, #7c3aed 38%, rgba(200,190,255,0.5) 50%, #7c3aed 62%, #6366f1 100%)', backgroundSize: '220% 100%', animation: 'lp-shimmer 3s linear infinite', boxShadow: '0 0 36px rgba(99,102,241,0.45), 0 8px 24px rgba(0,0,0,0.35)' }}
                >
                  {c.cta1}
                  <ChevronRight size={16} />
                </motion.button>
              </div>

              <motion.button
                onClick={onDemo}
                whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-semibold transition-colors"
                style={{
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
                  background: 'transparent',
                  color: isDark ? 'rgba(255,255,255,0.6)' : '#475569',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
                  el.style.color = isDark ? 'rgba(255,255,255,0.9)' : '#0f172a'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = 'transparent'
                  el.style.color = isDark ? 'rgba(255,255,255,0.6)' : '#475569'
                }}
              >
                {c.cta2}
                <ArrowRight size={14} />
              </motion.button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start" style={{ animation: 'lp-fade-in 0.5s ease-out 0.52s both' }}>
              {c.trust.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[12px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
                  <Check size={11} style={{ color: '#22c55e' }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── 3D Mockup + live toasts ── */}
          <div className="flex-1 w-full max-w-sm lg:max-w-md xl:max-w-lg flex-none" style={{ animation: 'lp-fade-up 0.8s ease-out 0.22s both' }}>
            <DealRoomMockup c={c} isHe={isHe} isDark={isDark} />
            <div className="mt-4 flex justify-center">
              <LiveToastStack toasts={c.toast} isDark={isDark} />
            </div>
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

  // Theme state — defaults to dark (preserves the original experience).
  // Persisted in localStorage so the user's preference survives navigation.
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('dealspace:lp-theme') !== 'light'
  })

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('dealspace:lp-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Sync LandingPage theme with document dark class so GlobalFooter + Tailwind dark: variants match
  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    // Restore dark on unmount (all other pages expect dark mode)
    return () => { html.classList.add('dark') }
  }, [isDark])

  const goAuth   = () => navigate('/auth')
  const goSignup = () => navigate('/auth?tab=signup')
  const goDemo   = () => navigate('/deal/abc123')

  return (
    <ReactLenis root options={{ lerp: 0.085, duration: 1.4, syncTouch: false }}>
      <div
        className="relative min-h-dvh flex flex-col"
        dir={isHe ? 'rtl' : 'ltr'}
        style={{
          background: isDark ? '#030305' : '#f8fafc',
          color: isDark ? '#f0f0f8' : '#0f172a',
        }}
      >
        {/* Navbar spacer */}
        <div className="h-[52px] flex-none" aria-hidden />

        <Navbar
          c={c}
          isHe={isHe}
          onLogin={goAuth}
          onCta={goSignup}
          onToggleLang={() => setLocale(isHe ? 'en' : 'he')}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1" key={locale}>
          <HeroSection       c={c} isHe={isHe} onCta={goSignup} onDemo={goDemo} isDark={isDark} />
          <MarqueeBand       items={c.marqueeItems} isRTL={isHe} isDark={isDark} />
          <HowItWorksSection c={c} isHe={isHe} isDark={isDark} />
          <ProblemSolutionSection c={c} isHe={isHe} isDark={isDark} />
          <BentoGridSection  c={c} isHe={isHe} isDark={isDark} />
          <SocialProofNumbers isHe={isHe} isDark={isDark} />
          <TestimonialsSection c={c} isDark={isDark} />
          <PricingSection    c={c} isHe={isHe} onCta={goSignup} isDark={isDark} />
          <FinalCTASection   c={c} isHe={isHe} onCta={goSignup} isDark={isDark} />
        </main>

        <GlobalFooter />
      </div>
    </ReactLenis>
  )
}

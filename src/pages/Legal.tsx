import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Shield, Zap } from 'lucide-react'
import { useI18n } from '../lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────

type LegalType = 'terms' | 'privacy'

interface Section {
  title: string
  body: string
}

interface LegalContent {
  title: string
  subtitle: string
  effective: string
  sections: Section[]
}

// ─── Content ──────────────────────────────────────────────────────────────────

const content: Record<LegalType, Record<'he' | 'en', LegalContent>> = {
  terms: {
    he: {
      title: 'תנאי שירות',
      subtitle: 'בבקשה קרא בעיון לפני השימוש בפלטפורמה',
      effective: 'תוקף מיום 1 בינואר 2026',
      sections: [
        {
          title: '1. הגדרות וקבלת התנאים',
          body: 'השימוש בפלטפורמת DealSpace ("השירות") מהווה הסכמה מלאה לתנאים אלו. "משתמש" הוא כל אדם או גוף עסקי הנרשם ומשתמש בשירות. "הצעת מחיר" היא מסמך דיגיטלי הנוצר דרך הפלטפורמה. אם אינך מסכים לתנאים, אינך רשאי להשתמש בשירות.',
        },
        {
          title: '2. השירות ומטרתו',
          body: 'DealSpace היא פלטפורמה לניהול הצעות מחיר דיגיטליות המאפשרת ליצירתיים ועסקים להציג הצעות, לקבל חתימות אלקטרוניות ולנהל תהליכי מכירה. השירות מיועד לשימוש עסקי בלבד. השירות אינו מהווה ייעוץ משפטי, פיננסי או רואה חשבון.',
        },
        {
          title: '3. חשבון משתמש ואבטחה',
          body: 'המשתמש אחראי לשמירת סודיות פרטי הגישה לחשבונו. יש להודיע לנו מיידית על כל שימוש בלתי מורשה. DealSpace לא תישא בכל אחריות לנזקים הנגרמים מגישה בלתי מורשית לחשבון שנגרמה עקב רשלנות המשתמש. הרישום מחייב גיל מינימלי של 18 שנה.',
        },
        {
          title: '4. חיוב ותשלומים',
          body: 'השירות מוצע במסגרת מנוי חודשי או שנתי. החיוב מתבצע מראש. ביטול מנוי יכנס לתוקף בתום תקופת החיוב הנוכחית. אין החזרי כספים למנויים שכבר שולמו, אלא במקרים הקבועים בחוק הגנת הצרכן התשמ"א-1981 ותקנותיו.',
        },
        {
          title: '5. חתימה אלקטרונית ותוקפה המשפטי',
          body: 'חתימות אלקטרוניות שנאספות דרך DealSpace כפופות לחוק חתימה אלקטרונית, התשס"א-2001. החתימה האלקטרונית מהווה הסכמה מחייבת בין הצדדים. DealSpace משמשת כמתווך טכנולוגי בלבד ואינה צד להסכמים הנחתמים דרך הפלטפורמה.',
        },
        {
          title: '6. הגבלת אחריות',
          body: 'DealSpace לא תישא בשום אחריות לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים, לרבות אובדן רווחים, אובדן נתונים, פגיעה במוניטין או אובדן הזדמנויות עסקיות. אחריותה המצטברת של DealSpace לא תעלה על הסכום ששולם בפועל על ידי המשתמש ב-12 החודשים שקדמו לאירוע.',
        },
        {
          title: '7. קניין רוחני',
          body: 'כל זכויות הקניין הרוחני בפלטפורמה, לרבות עיצוב, קוד, לוגו וסמלים, שייכים ל-DealSpace. המשתמש מקבל רישיון שימוש מוגבל, לא-בלעדי, שאינו ניתן להעברה, לשימוש בשירות בהתאם לתנאי הרישיון.',
        },
        {
          title: '8. סיום והשעיה',
          body: 'DealSpace רשאית להשעות או לסיים חשבון שהפר את תנאי השירות, ביצע פעילות הונאה, או השתמש בשירות לפגיעה בצדדים שלישיים. בעת סיום, המשתמש רשאי לייצא את נתוניו תוך 30 יום.',
        },
        {
          title: '9. דין וסמכות שיפוט',
          body: 'הסכם זה כפוף לדיני מדינת ישראל. כל סכסוך יובא לפני בית המשפט המוסמך במחוז תל אביב-יפו, ישראל. הצדדים מסכימים לנסות ולפתור סכסוכים בגישור לפני פנייה לבית המשפט.',
        },
        {
          title: '10. שינויים בתנאים',
          body: 'DealSpace רשאית לעדכן תנאים אלו מעת לעת. הודעה תשלח למשתמשים 14 יום לפני כניסת שינויים מהותיים לתוקף. המשך השימוש לאחר מועד השינוי מהווה הסכמה לתנאים המעודכנים.',
        },
      ],
    },
    en: {
      title: 'Terms of Service',
      subtitle: 'Please read carefully before using the platform',
      effective: 'Effective January 1, 2026',
      sections: [
        {
          title: '1. Definitions and Acceptance',
          body: 'Use of the DealSpace platform ("Service") constitutes full agreement to these terms. "User" means any individual or business entity that registers and uses the Service. "Proposal" means a digital document created through the platform. If you do not agree to these terms, you may not use the Service.',
        },
        {
          title: '2. Service Description',
          body: 'DealSpace is a digital proposal management platform enabling creatives and businesses to present proposals, collect electronic signatures, and manage sales processes. The Service is intended for business use only and does not constitute legal, financial, or accounting advice.',
        },
        {
          title: '3. Account and Security',
          body: 'Users are responsible for maintaining the confidentiality of their account credentials. Notify us immediately of any unauthorized use. DealSpace bears no liability for damages resulting from unauthorized account access caused by user negligence. Registration requires a minimum age of 18.',
        },
        {
          title: '4. Billing and Payments',
          body: 'The Service is offered via monthly or annual subscription, billed in advance. Cancellations take effect at the end of the current billing period. No refunds are issued for paid subscription periods, except where required by applicable consumer protection laws.',
        },
        {
          title: '5. Electronic Signatures and Legal Validity',
          body: 'Electronic signatures collected via DealSpace are subject to applicable electronic signature laws. The electronic signature constitutes a binding agreement between the signing parties. DealSpace serves solely as a technology intermediary and is not a party to any agreements signed through the platform.',
        },
        {
          title: '6. Limitation of Liability',
          body: 'DealSpace shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data loss, reputational harm, or loss of business opportunities. DealSpace\'s cumulative liability shall not exceed the amount actually paid by the User in the 12 months preceding the incident.',
        },
        {
          title: '7. Intellectual Property',
          body: 'All intellectual property rights in the platform, including design, code, logos, and marks, belong to DealSpace. Users receive a limited, non-exclusive, non-transferable license to use the Service in accordance with these terms.',
        },
        {
          title: '8. Termination and Suspension',
          body: 'DealSpace may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or use the Service to harm third parties. Upon termination, users may export their data within 30 days.',
        },
        {
          title: '9. Governing Law and Jurisdiction',
          body: 'This Agreement is governed by the laws of the State of Israel. Any dispute shall be brought before the competent court in the Tel Aviv-Jaffa district, Israel. The parties agree to attempt mediation before initiating court proceedings.',
        },
        {
          title: '10. Changes to Terms',
          body: 'DealSpace may update these terms from time to time. Notice will be sent to users 14 days before material changes take effect. Continued use after the effective date constitutes acceptance of the updated terms.',
        },
      ],
    },
  },

  privacy: {
    he: {
      title: 'מדיניות פרטיות',
      subtitle: 'כיצד אנו אוספים, משתמשים ומגנים על המידע שלך',
      effective: 'תוקף מיום 1 בינואר 2026',
      sections: [
        {
          title: '1. מידע שאנו אוספים',
          body: 'אנו אוספים מידע שאתה מספק ישירות: שם, כתובת אימייל, פרטי חשבון, תמונת פרופיל ונתוני הצעות מחיר. בנוסף, אנו אוספים אוטומטית מידע טכני: כתובת IP, סוג דפדפן, מערכת הפעלה, נתוני שימוש ועוגיות. אנו עשויים לאסוף נתוני צד שלישי ממקורות כגון Google OAuth.',
        },
        {
          title: '2. שימוש במידע',
          body: 'המידע שנאסף משמש לאספקת השירות ותחזוקתו, שליחת התראות עסקיות, שיפור הפלטפורמה, מניעת הונאות ועמידה בדרישות חוקיות. לא נשתמש במידע לצורכי פרסום ממוקד ללא הסכמתך המפורשת.',
        },
        {
          title: '3. אחסון ואבטחת מידע',
          body: 'נתוניך מאוחסנים בשרתי Supabase (AWS) הממוקמים באיחוד האירופי. אנו מיישמים הצפנה בתעבורה (TLS 1.3) ובאחסון, בקרת גישה מבוססת תפקידים, ניטור אבטחה רציף ועמידה בתקני SOC 2 Type II. מועד ותנאי מחיקת הנתונים מוגדרים בסעיף 7.',
        },
        {
          title: '4. שיתוף מידע עם צדדים שלישיים',
          body: 'אנו לא מוכרים את נתוניך. נשתף מידע רק עם ספקי שירות הנחוצים לתפעול הפלטפורמה (Supabase, Stripe, ספקי שירות אימייל), רשויות חוק כנדרש על פי צו שיפוטי, ורוכש פוטנציאלי של DealSpace בהתאם להסכמי סודיות.',
        },
        {
          title: '5. עוגיות ומעקב',
          body: 'אנו משתמשים בעוגיות חיוניות לתפעול השירות ועוגיות אנליטיקה (אנונימיות) לשיפור החוויה. איננו משתמשים בעוגיות פרסום. ניתן לנהל העדפות עוגיות דרך הגדרות הדפדפן שלך. אינה כפיפות לתקנת ה-GDPR לא ישפיעו על עוגיות חיוניות.',
        },
        {
          title: '6. זכויות הנושא לפי חוק הגנת הפרטיות',
          body: 'בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותקנותיו, יש לך זכות לעיין במידע האצור אודותיך, לתקנו, לדרוש את מחיקתו, ולהתנגד לעיבודו. פנייה לממונה על הפרטיות: privacy@dealspace.app. נענה לפנייתך תוך 30 ימי עסקים.',
        },
        {
          title: '7. שמירה ומחיקת נתונים',
          body: 'נתוני חשבון פעיל נשמרים לאורך כל תקופת השירות. לאחר סיום המנוי, נשמר המידע 90 יום לצורכי גיבוי, ולאחר מכן נמחק באופן בלתי הפיך. לוגים טכניים נמחקים לאחר 12 חודשים. ניתן לבקש מחיקה מוקדמת.',
        },
        {
          title: '8. העברת מידע בינלאומי',
          body: 'שרתינו ממוקמים באיחוד האירופי. במקרה של העברת מידע מחוץ לגבולות ישראל, נוודא שמתקיימים לכך מנגנוני הגנה מתאימים, לרבות הסכמי העברת נתונים העומדים בתקנות הגנת הפרטיות הישראליות.',
        },
        {
          title: '9. פרטיות ילדים',
          body: 'השירות אינו מיועד לאנשים מתחת לגיל 18. אם הגענו לידיעתנו כי מינור השתמש בשירות, נמחק את נתוניו לאלתר. להתראה: privacy@dealspace.app.',
        },
        {
          title: '10. יצירת קשר',
          body: 'לשאלות, בקשות גישה לנתונים, או תלונות פרטיות: privacy@dealspace.app | DealSpace Technologies Ltd., תל אביב, ישראל. ניתן גם לפנות לרשות להגנת הפרטיות של ישראל בכתובת: www.gov.il/privacy.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      subtitle: 'How we collect, use, and protect your information',
      effective: 'Effective January 1, 2026',
      sections: [
        {
          title: '1. Information We Collect',
          body: 'We collect information you provide directly: name, email address, account details, profile photo, and proposal data. We also collect technical information automatically: IP address, browser type, operating system, usage data, and cookies. We may collect third-party data from sources such as Google OAuth.',
        },
        {
          title: '2. Use of Information',
          body: 'Collected information is used to provide and maintain the Service, send operational notifications, improve the platform, prevent fraud, and comply with legal requirements. We will not use your data for targeted advertising without your explicit consent.',
        },
        {
          title: '3. Data Storage and Security',
          body: 'Your data is stored on Supabase (AWS) servers located in the European Union. We implement encryption in transit (TLS 1.3) and at rest, role-based access control, continuous security monitoring, and compliance with SOC 2 Type II standards.',
        },
        {
          title: '4. Third-Party Data Sharing',
          body: 'We do not sell your data. We share information only with service providers necessary for platform operation (Supabase, Stripe, email service providers), law enforcement as required by court order, and potential DealSpace acquirers under confidentiality agreements.',
        },
        {
          title: '5. Cookies and Tracking',
          body: 'We use essential cookies for Service operation and anonymous analytics cookies to improve the experience. We do not use advertising cookies. Cookie preferences can be managed through your browser settings.',
        },
        {
          title: '6. Your Rights',
          body: 'You have the right to access, correct, delete, and object to the processing of your personal data. Requests may be sent to: privacy@dealspace.app. We will respond within 30 business days.',
        },
        {
          title: '7. Data Retention and Deletion',
          body: 'Active account data is retained for the duration of the Service. After subscription termination, data is retained for 90 days for backup purposes, then permanently deleted. Technical logs are deleted after 12 months. Early deletion may be requested.',
        },
        {
          title: '8. International Data Transfers',
          body: 'Our servers are located in the European Union. For data transfers outside Israel, we ensure appropriate safeguards are in place, including data transfer agreements complying with applicable privacy regulations.',
        },
        {
          title: '9. Children\'s Privacy',
          body: 'The Service is not intended for individuals under 18 years of age. If we learn a minor has used the Service, we will delete their data immediately. Report to: privacy@dealspace.app.',
        },
        {
          title: '10. Contact',
          body: 'For questions, data access requests, or privacy complaints: privacy@dealspace.app | DealSpace Technologies Ltd., Tel Aviv, Israel.',
        },
      ],
    },
  },
}

// ─── Fade-in animation ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

// ─── Legal Page ───────────────────────────────────────────────────────────────

export default function Legal() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { locale } = useI18n()

  const type: LegalType = pathname.startsWith('/privacy') ? 'privacy' : 'terms'
  const c = content[type][locale as 'he' | 'en'] ?? content[type]['en']
  const isHe = locale === 'he'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [type])

  return (
    <div
      className="relative min-h-dvh"
      style={{ background: '#05050A' }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* ── Background ─────────────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 800, height: 400,
            background: type === 'terms'
              ? 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-white/40 transition hover:text-white/80"
        >
          <ArrowRight size={14} className={isHe ? '' : 'rotate-180'} />
          {isHe ? 'חזרה' : 'Back'}
        </button>

        {/* Toggle between terms / privacy */}
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {(['terms', 'privacy'] as const).map(t => (
            <button
              key={t}
              onClick={() => navigate(t === 'terms' ? '/terms' : '/privacy')}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: type === t ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: type === t ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
              }}
            >
              {t === 'terms'
                ? (isHe ? 'תנאי שירות' : 'Terms')
                : (isHe ? 'פרטיות' : 'Privacy')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">

        {/* Header */}
        <motion.div className="mb-12 text-center" {...fadeUp(0)}>
          <div
            className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: type === 'terms'
                ? 'rgba(99,102,241,0.12)'
                : 'rgba(168,85,247,0.12)',
              border: `1px solid ${type === 'terms' ? 'rgba(99,102,241,0.25)' : 'rgba(168,85,247,0.25)'}`,
            }}
          >
            {type === 'terms'
              ? <FileText size={20} style={{ color: '#818cf8' }} />
              : <Shield size={20} style={{ color: '#c084fc' }} />}
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {c.title}
          </h1>
          <p className="text-sm text-white/40 mb-1">{c.subtitle}</p>
          <p className="text-xs text-white/25">{c.effective}</p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {c.sections.map((section, i) => (
            <motion.div
              key={section.title}
              {...fadeUp(0.05 + i * 0.04)}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <h2
                className="text-sm font-bold mb-3"
                style={{ color: type === 'terms' ? '#818cf8' : '#c084fc' }}
              >
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/55">
                {section.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer cta */}
        <motion.div
          className="mt-12 text-center"
          {...fadeUp(0.6)}
        >
          <div
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <Zap size={13} className="text-indigo-400" />
            <span className="text-xs font-medium text-white/50">
              {isHe
                ? 'שאלות? פנה אלינו בכתובת legal@dealspace.app'
                : 'Questions? Contact us at legal@dealspace.app'}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

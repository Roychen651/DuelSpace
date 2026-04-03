import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Shield, Zap, Lock } from 'lucide-react'
import { useI18n } from '../lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────

type LegalType = 'terms' | 'privacy' | 'security'

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
  security: {
    he: {
      title: 'מרכז האבטחה',
      subtitle: 'ארכיטקטורת האבטחה, הפורנזיקה והציות הרגולטורי של DealSpace',
      effective: 'תוקף מיום 1 בינואר 2026',
      sections: [
        {
          title: '1. שרשרת ביקורת בלתי ניתנת לשינוי — מזהה פורנזי בכל חוזה',
          body: 'כל חוזה חתום ב-DealSpace מכיל תעודת אימות פורנזית נעולה ובלתי ניתנת לשינוי, המוטבעת ישירות בקובץ ה-PDF החתום. שרשרת הביקורת כוללת: (א) תמונת PNG של החתימה הידנית של החותם; (ב) חותמת זמן מדויקת ב-UTC ISO 8601; (ג) כתובת ה-IP המלאה של החותם בעת האירוע; (ד) User Agent מלא — דפדפן, מערכת הפעלה וגרסה; (ה) שם מלא וחברה ומספר ח.פ / ע.מ של החותם כפי שהוזנו; (ו) Token ייחודי לזיהוי המסמך. שרשרת ראיות זו עומדת בדרישות חוק חתימה אלקטרונית, התשס"א-2001, ומספקת בסיס ראייתי מוצק לאכיפה משפטית. ה-PDF נוצר ומוחתם אחת ולתמיד — ולא ניתן לשנותו לאחר החתימה.',
        },
        {
          title: '2. תשתית ענן — אבטחת מסד הנתונים',
          body: 'הנתונים מאוחסנים על שרתי Supabase (AWS eu-central-1, פרנקפורט, גרמניה) העומדים בתקן SOC 2 Type II ו-ISO 27001. הגישה לנתונים מוגנת ברמת מסד הנתונים על ידי Row Level Security (RLS) — כל יוצר ניגש אך ורק להצעות שלו; ניסיון גישה לנתוני יוצר אחר נחסם ברמת ה-PostgreSQL, עוד לפני שהבקשה מגיעה לשכבת האפליקציה. אסימוני JWT נחתמים ב-RS256 ופגי תוקפם לאחר שעה אחת, עם רענון אוטומטי. מפתחות API לשירותים חיצוניים מאוחסנים כמשתני סביבה מוצפנים ב-Edge Functions בלבד — אינם נחשפים ל-Client-Side JavaScript לעולם.',
        },
        {
          title: '3. הצפנה מקצה לקצה — TLS 1.3 + AES-256',
          body: 'כל תעבורת הרשת בין הדפדפן לשרת מוצפנת ב-TLS 1.3, הפרוטוקול המאובטח ביותר הזמין, המחייב Perfect Forward Secrecy בכל חיבור. מסדי הנתונים מוצפנים במנוחה באמצעות AES-256. גיבויים מוצפנים עם מפתחות נפרדים שאינם קשורים למפתחות הנתונים הראשיים. מנגנון ה-PKCE (Proof Key for Code Exchange) מגן על תהליכי ה-OAuth ומונע תקיפות CSRF על תהליך ההתחברות. הסיסמאות עוברות Hash עם bcrypt ו-salt ייחודי לכל משתמש; DealSpace לעולם אינה שומרת סיסמה בכתב ברור.',
        },
        {
          title: '4. PCI-DSS Level 1 — אפס אחסון נתוני תשלום',
          body: 'DealSpace לא מאחסנת, לא מעבדת ולא מעבירה נתוני כרטיסי אשראי. כל עסקאות התשלום מנותבות ישירות דרך Stripe Inc., ספק תשלומים המאושר ברמה הגבוהה ביותר PCI-DSS Level 1 Service Provider. מספרי כרטיסים, קודי CVV, ומידע בנקאי אינם חולפים דרך שרתי DealSpace — הם מוזנים ישירות לממשק המוצפן של Stripe. DealSpace מקבלת מ-Stripe אסימוני לקוח (customer_id) ומנוי (subscription_id) בלבד — מזהים שאינם מאפשרים חיוב עצמאי. בדיקת אבטחת תשלומים עצמאית מתבצעת מדי שנה.',
        },
        {
          title: '5. ניטור, זיהוי חדירות ותגובה לאירועים',
          body: 'הפלטפורמה מנוטרת 24/7 לזיהוי חריגות, ניסיונות פריצה ופעילות חשודה. מדיניות נעילת חשבון אוטומטית מופעלת לאחר ניסיונות התחברות כושלים חוזרים. לפי חוק הגנת הפרטיות, התשמ"א-1981, ותקנות הגנת המידע האירופיות (GDPR), DealSpace מתחייבת להודיע לרשויות המוסמכות ולמשתמשים המושפעים תוך 72 שעות מגילוי פרצת אבטחה מהותית. לדיווח על פגיעויות אבטחה: security@dealspace.app. אנו מעריכים ומכבדים גילוי אחראי (Responsible Disclosure).',
        },
        {
          title: '6. ציות רגולטורי מקיף',
          body: 'DealSpace תוכננה מהיסוד לעמוד בדרישות הרגולטוריות הקשוחות ביותר: חוק הגנת הפרטיות, התשמ"א-1981 ותקנות אבטחת מידע, התשע"ז-2017 (ישראל); תקנות הגנת המידע הכלליות (GDPR) לגבי מידע של אזרחי האיחוד האירופי; תקן IS 5568 / WCAG 2.2 AA לנגישות דיגיטלית; חוק חתימה אלקטרונית, התשס"א-2001 לתוקף משפטי של חתימות; חוק הגנת הצרכן, התשמ"א-1981 לתנאי מנוי וביטול. ביקורות אבטחה חיצוניות מתבצעות מדי שנה על ידי גורם מבקר עצמאי.',
        },
        {
          title: '7. שחזור ורציפות עסקית',
          body: 'גיבויים אוטומטיים של מסד הנתונים מתבצעים כל 6 שעות עם שמירה ל-30 יום. ה-RTO (Recovery Time Objective — זמן שחזור מרבי) עומד על 4 שעות, וה-RPO (Recovery Point Objective — מרב אובדן הנתונים) על 6 שעות. מסד הנתונים פרוס בארכיטקטורת High Availability עם Read Replica ועם פייל-אובר אוטומטי, המבטיחים המשך שירות אף בעת כשל בשרת הראשי. קיים תוכן אסון (Disaster Recovery Plan) מתועד ומוכן להפעלה מיידית.',
        },
        {
          title: '8. תוכנית גילוי אחראי (Responsible Disclosure)',
          body: 'DealSpace מעריכה את קהילת מחקר האבטחה ורואה בה שותפה חיונית לשמירה על שלמות המערכת. אנו מזמינים חוקרי אבטחה לדווח על פגיעויות בצורה אחראית דרך: security@dealspace.app. יש לכלול בדיווח: תיאור מפורט של הפגיעות, שלבי שחזור, וסיכום ההשפעה הפוטנציאלית. DealSpace מתחייבת לתגובה ראשונית תוך 72 שעות, לעדכון מתמיד על מצב הטיפול, ולאי-נקיטת צעדים משפטיים כנגד חוקרים שפעלו בתום לב ובהתאם למדיניות זו. דיווחים תקינים שמובילים לתיקון פגיעות קריטיות יזכו בהכרה ציבורית ואפשרות לתגמול כספי.',
        },
      ],
    },
    en: {
      title: 'Security Center',
      subtitle: 'DealSpace\'s security architecture, forensic audit chain, and regulatory compliance',
      effective: 'Effective January 1, 2026',
      sections: [
        {
          title: '1. Immutable Audit Trail — Forensic Certificate in Every Signed Contract',
          body: 'Every contract signed through DealSpace contains a locked, immutable forensic certificate embedded directly in the signed PDF — it cannot be altered after signing. The audit chain captures: (a) a PNG image of the signer\'s handwritten signature; (b) a precise UTC ISO 8601 timestamp; (c) the signer\'s full IP address at the time of the signing event; (d) the complete User Agent string — browser, operating system, and version; (e) the signer\'s full name, company name, and tax ID as entered at signing; (f) a unique document Token for identification. This evidence chain satisfies the requirements of Israeli Electronic Signature Law 5761-2001, providing a robust evidentiary foundation for legal enforcement. The PDF is generated and sealed once — it is technically immutable after signing.',
        },
        {
          title: '2. Cloud Infrastructure — Database-Level Security',
          body: 'Data is stored on Supabase (AWS eu-central-1, Frankfurt, Germany) servers certified to SOC 2 Type II and ISO 27001 standards. Data access is protected at the database level by Row Level Security (RLS) — each Creator accesses only their own proposals; any attempt to access another Creator\'s data is blocked at the PostgreSQL level, before the request ever reaches the application layer. JWTs are signed with RS256 and expire after one hour, with automatic refresh. API keys for external services are stored as encrypted environment variables within Edge Functions only — they are never exposed to client-side JavaScript.',
        },
        {
          title: '3. End-to-End Encryption — TLS 1.3 + AES-256',
          body: 'All network traffic between the browser and server is encrypted with TLS 1.3 — the most secure protocol available — mandating Perfect Forward Secrecy on every connection. Databases are encrypted at rest with AES-256. Backups are encrypted with separate keys independent of primary data keys. The PKCE (Proof Key for Code Exchange) mechanism protects all OAuth flows and prevents CSRF attacks on the sign-in process. Passwords are hashed with bcrypt and a unique per-user salt; DealSpace never stores a password in plaintext.',
        },
        {
          title: '4. PCI-DSS Level 1 — Zero Payment Data Storage',
          body: 'DealSpace does not store, process, or transmit credit card data. All payment transactions are routed exclusively through Stripe Inc., a payment provider certified at the highest level — PCI-DSS Level 1 Service Provider. Card numbers, CVV codes, and banking information never traverse DealSpace\'s servers — they are entered directly into Stripe\'s encrypted interface. DealSpace receives only Stripe customer tokens (customer_id) and subscription identifiers — identifiers that cannot be used to independently initiate a charge. An independent payment security audit is conducted annually.',
        },
        {
          title: '5. Monitoring, Intrusion Detection & Incident Response',
          body: 'The platform is monitored 24/7 for anomalies, intrusion attempts, and suspicious activity. Automatic account lockout policies activate after repeated failed login attempts. Under the Israeli Privacy Protection Law (1981) and GDPR, DealSpace commits to notifying the relevant authorities and affected users within 72 hours of discovering a material security breach. To report a security vulnerability: security@dealspace.app. We appreciate and respect responsible disclosure.',
        },
        {
          title: '6. Comprehensive Regulatory Compliance',
          body: 'DealSpace was designed from the ground up to meet the most demanding regulatory requirements: Israeli Privacy Protection Law 5741-1981 and Information Security Regulations 5777-2017; General Data Protection Regulation (GDPR) for EU citizen data; Israeli Standard IS 5568 / WCAG 2.2 AA for digital accessibility; Israeli Electronic Signature Law 5761-2001 for the legal validity of electronic signatures; Israeli Consumer Protection Law 5741-1981 for subscription and cancellation terms. Independent external security audits are conducted annually.',
        },
        {
          title: '7. Recovery & Business Continuity',
          body: 'Automated database backups run every 6 hours with 30-day retention. Our RTO (Recovery Time Objective — maximum recovery time) is 4 hours, and our RPO (Recovery Point Objective — maximum data loss window) is 6 hours. The database is deployed in a High Availability architecture with a Read Replica and automatic failover, ensuring service continuity even during primary server failure. A documented Disaster Recovery Plan is maintained and ready for immediate activation.',
        },
        {
          title: '8. Responsible Disclosure Program',
          body: 'DealSpace values the security research community as a vital partner in maintaining platform integrity. We invite security researchers to responsibly disclose vulnerabilities via: security@dealspace.app. Please include a detailed description of the vulnerability, reproduction steps, and a summary of potential impact. DealSpace commits to an initial response within 72 hours, ongoing status updates throughout remediation, and no legal action against researchers acting in good faith and in accordance with this policy. Valid reports that lead to the remediation of critical vulnerabilities will receive public recognition and potential monetary rewards.',
        },
      ],
    },
  },
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

  const type: LegalType = pathname.startsWith('/privacy') ? 'privacy' : pathname.startsWith('/security') ? 'security' : 'terms'
  const c = content[type][locale as 'he' | 'en'] ?? content[type]['en']
  const isHe = locale === 'he'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [type])

  return (
    <div
      className="relative min-h-dvh bg-slate-50 dark:bg-[#05050A]"
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
              : type === 'privacy'
                ? 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)'
                : 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/40 transition hover:text-slate-700 dark:hover:text-white/80"
        >
          <ArrowRight size={14} className={isHe ? '' : 'rotate-180'} />
          {isHe ? 'חזרה' : 'Back'}
        </button>

        {/* Toggle between terms / privacy / security */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 dark:border-white/[0.07] dark:bg-white/[0.03] p-1">
          {(['terms', 'privacy', 'security'] as const).map(t => (
            <button
              key={t}
              onClick={() => navigate(`/${t}`, { replace: true })}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${type === t ? 'bg-indigo-500/[0.18] text-indigo-500 dark:text-violet-300' : 'text-slate-400 dark:text-white/30'}`}
            >
              {t === 'terms'
                ? (isHe ? 'תנאי שירות' : 'Terms')
                : t === 'privacy'
                  ? (isHe ? 'פרטיות' : 'Privacy')
                  : (isHe ? 'אבטחה' : 'Security')}
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
                : type === 'privacy'
                  ? 'rgba(168,85,247,0.12)'
                  : 'rgba(34,197,94,0.1)',
              border: `1px solid ${type === 'terms' ? 'rgba(99,102,241,0.25)' : type === 'privacy' ? 'rgba(168,85,247,0.25)' : 'rgba(34,197,94,0.25)'}`,
            }}
          >
            {type === 'terms'
              ? <FileText size={20} style={{ color: '#818cf8' }} />
              : type === 'privacy'
                ? <Shield size={20} style={{ color: '#c084fc' }} />
                : <Lock size={20} style={{ color: '#4ade80' }} />}
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {c.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/40 mb-1">{c.subtitle}</p>
          <p className="text-xs text-slate-400 dark:text-white/25">{c.effective}</p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {c.sections.map((section, i) => (
            <motion.div
              key={section.title}
              {...fadeUp(0.05 + i * 0.04)}
              className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.015] dark:border-white/[0.07] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <h2
                className="text-sm font-bold mb-3"
                style={{ color: type === 'terms' ? '#818cf8' : type === 'privacy' ? '#c084fc' : '#4ade80' }}
              >
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-white/55">
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
            <span className="text-xs font-medium text-slate-600 dark:text-white/50">
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

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Lock } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'

// ─── Shared Card Style ────────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.012) 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  borderRadius: '1.25rem',
}

// ─── Clause Data ──────────────────────────────────────────────────────────────

interface Clause {
  num: string
  title_he: string
  title_en: string
  body_he: string[]
  body_en: string[]
}

const CLAUSES: Clause[] = [
  {
    num: '1',
    title_he: 'מבוא ועקרונות יסוד',
    title_en: 'Introduction & Foundational Principles',
    body_he: [
      'DealSpace Technologies Ltd. ("DealSpace", "אנו") מחויבת לשמירה על פרטיות המשתמשים ולשקיפות מלאה בכל הנוגע לאופן איסוף, עיבוד, ושימוש בנתונים אישיים. מדיניות פרטיות זו ("המדיניות") מפרטת את הנהלים שלנו ואת זכויותיך בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 וכל תקנות שהותקנו מכוחו ("חוק הגנת הפרטיות"), ובמידה הרלוונטית, לתקנות ה-GDPR של האיחוד האירופי.',
      'עקרונות הפרטיות שלנו: (א) מינימום נתונים — אנו אוספים רק מידע הנחוץ לאספקת השירות; (ב) שקיפות — אנו מפרטים במדיניות זו בדיוק אילו נתונים נאספים ולאיזו מטרה; (ג) בחירה — לך יש שליטה על נתוניך; (ד) אבטחה — נתוניך מוגנים בצפנה מתקדמת; (ה) מגבלת מטרה — לא נשתמש בנתוניך לצרכים אחרים מאלו המפורטים כאן.',
      'מדיניות זו חלה על כלל השירותים הדיגיטליים של DealSpace, לרבות אתר האינטרנט, הפלטפורמה, האפליקציה, ממשקי ה-API, וה-Deal Rooms הציבוריים שנוצרים על ידי משתמשים.',
    ],
    body_en: [
      'DealSpace Technologies Ltd. ("DealSpace", "we") is committed to protecting user privacy and maintaining full transparency regarding how personal data is collected, processed, and used. This Privacy Policy ("Policy") details our procedures and your rights pursuant to the Privacy Protection Law, 5741-1981 and any regulations enacted thereunder ("Privacy Law"), and to the extent relevant, the EU GDPR.',
      'Our privacy principles: (a) data minimization — we collect only information necessary to provide the Service; (b) transparency — we detail in this Policy exactly what data is collected and for what purpose; (c) choice — you have control over your data; (d) security — your data is protected with advanced encryption; (e) purpose limitation — we will not use your data for purposes other than those described here.',
      'This Policy applies to all of DealSpace\'s digital services, including the website, platform, application, APIs, and public Deal Rooms created by users.',
    ],
  },
  {
    num: '2',
    title_he: 'מידע שאנו אוספים ומדוע',
    title_en: 'Information We Collect & Why',
    body_he: [
      'מידע שאתה מספק ישירות: (א) נתוני הרשמה — שם מלא, כתובת דוא"ל, סיסמה (מוצפנת), שם חברה; (ב) נתוני עסק (פרופיל) — ח.פ / ת.ז, כתובת, טלפון, שם מורשה חתימה, צבע מותג; (ג) נתוני הצעות מחיר — כותרת הפרויקט, תיאור, מחירים, תוספות, אבני דרך, שם ומייל הלקוח; (ד) מסמכי חוזה — טקסט החוזה שאתה יוצר וממלא; (ה) תמונת פרופיל — אם תבחר להעלות.',
      'מידע שנאסף אוטומטית: (א) נתוני שימוש — עמודים שביקרת, פעולות שביצעת, פיצ\'רים ששימשת, זמן שהייה; (ב) מידע טכני — כתובת IP, סוג דפדפן, גרסת מערכת הפעלה, רזולוציית מסך, שפת הדפדפן; (ג) נתוני Deal Room — עבור Deal Room שנפתח על ידי לקוחך: כתובת IP, User-Agent, זמן פתיחה, זמן שהייה, ותמונת החתימה האלקטרונית.',
      'מידע מצדדים שלישיים: אם בחרת להיכנס עם Google OAuth, אנו מקבלים את שמך ומייל הגוגל שלך. DealSpace אינה מקבלת גישה לנתוני גוגל נוספים, לרשימות אנשי קשר, ליומן, או לכל מידע אחר מחשבון Google שלך.',
    ],
    body_en: [
      'Information you provide directly: (a) registration data — full name, email address, password (encrypted), company name; (b) business data (profile) — tax ID, address, phone, authorized signatory name, brand color; (c) proposal data — project title, description, prices, add-ons, milestones, client name and email; (d) contract documents — contract text you create and populate; (e) profile photo — if you choose to upload one.',
      'Automatically collected information: (a) usage data — pages visited, actions taken, features used, session duration; (b) technical information — IP address, browser type, operating system version, screen resolution, browser language; (c) Deal Room data — for a Deal Room opened by your client: IP address, User-Agent, open time, time spent, and the electronic signature image.',
      'Third-party information: If you chose to log in with Google OAuth, we receive your name and Google email. DealSpace does not receive access to additional Google data, contact lists, calendar, or any other information from your Google account.',
    ],
  },
  {
    num: '3',
    title_he: 'כיצד אנו משתמשים במידע',
    title_en: 'How We Use Your Information',
    body_he: [
      'למטרות אלו בלבד: (א) אספקת שירות — יצירת ועיבוד הצעות מחיר, ניהול חשבון, שיגור Deal Rooms, ייצור PDF חתום; (ב) תקשורת עסקית — אישורי כניסה, עדכוני מנוי, התראות אבטחה, ותמיכה טכנית; (ג) שיפור שירות — אנליטיקה אגרגטיבית ואנונימית על שימוש בפיצ\'רים לצורכי שיפור UX; (ד) ציות לדין — שמירת רשומות כנדרש על פי חוק, מענה לצווים שיפוטיים.',
      'מה שלעולם לא נעשה: (א) לא נמכור נתוניך לצד שלישי; (ב) לא נשתמש בנתוניך לפרסום ממוקד מבוסס פרופיל; (ג) לא נשתף נתוניך עם מתחרים; (ד) לא נשתמש בנתוני הלקוחות שלך לפנייה ישירה אליהם; (ה) לא נעביר נתוניך למדינה שאין בה הגנת פרטיות מתאימה ללא הסכמתך.',
    ],
    body_en: [
      'For these purposes only: (a) service provision — creating and processing proposals, account management, sending Deal Rooms, generating signed PDFs; (b) business communications — login confirmations, subscription updates, security alerts, and technical support; (c) service improvement — aggregated and anonymous analytics on feature usage for UX improvement purposes; (d) legal compliance — maintaining records as required by law, responding to court orders.',
      'What we will never do: (a) sell your data to any third party; (b) use your data for profile-based targeted advertising; (c) share your data with competitors; (d) use your clients\' data to directly contact them; (e) transfer your data to a country without appropriate privacy protections without your consent.',
    ],
  },
  {
    num: '4',
    title_he: 'הבסיס המשפטי לעיבוד הנתונים',
    title_en: 'Legal Basis for Processing',
    body_he: [
      'DealSpace מעבדת נתונים אישיים רק בהתבסס על אחת מהעילות המשפטיות הבאות:',
      '(א) ביצוע חוזה — עיבוד הנדרש לצורך אספקת השירות שביקשת (כגון יצירת הצעת מחיר, שיגור Deal Room, שמירת נתונים עסקיים); (ב) הסכמה — עבור מיילים שיווקיים ועדכוני מוצר שאינם חיוניים לשירות — תמיד בכפוף להסכמה מפורשת עם זכות ביטול פשוטה; (ג) אינטרס לגיטימי — אנליטיקה אנונימית לשיפור המוצר, גילוי הונאות, אבטחת מידע; (ד) ציות לחוק — שמירת רשומות עסקיות, מענה לדרישות רגולטוריות ושיפוטיות.',
    ],
    body_en: [
      'DealSpace processes personal data only based on one of the following legal grounds:',
      '(a) Contract performance — processing required to provide the Service you requested (such as creating a proposal, sending a Deal Room, saving business data); (b) Consent — for marketing emails and non-essential product updates — always subject to explicit consent with a simple opt-out right; (c) Legitimate interest — anonymous analytics for product improvement, fraud detection, information security; (d) Legal compliance — maintaining business records, responding to regulatory and judicial requirements.',
    ],
  },
  {
    num: '5',
    title_he: 'שיתוף מידע עם צדדים שלישיים',
    title_en: 'Sharing Data with Third Parties',
    body_he: [
      'DealSpace לא מוכרת, משכירה, מחכירה, סוחרת, ולא מעבירה את נתוניך האישיים לצדדים שלישיים לצרכי שיווק. שיתוף נתונים מתבצע אך ורק בנסיבות מוגבלות ומפורטות אלה:',
      '(א) ספקי שירות — Supabase (אחסון מסד נתונים ואימות, מוגבל לתפעול שרת), ספק אימייל עסקי (לשיגור עדכונים, מוגבל לכתובת הדוא"ל בלבד), ספק תשלומים (מוגבל לנתוני העסקה — לא יועבר ח.פ. או ת.ז. לספק התשלומים);',
      '(ב) עמידה בחוק — DealSpace עשויה לחשוף מידע אם נדרשת לכך בצו שיפוטי, הוראת רשות מוסמכת, או כנדרש על פי דין. אם חוק מאפשר זאת, נודיע לך על דרישה כזו לפני מתן התגובה;',
      '(ג) העברת שליטה עסקית — במקרה של מכירה, מיזוג, רכישה, או פירוק, נתוניך עשויים לעבור לגורם הנרכש, ובכפוף להתחייבות מפורשת של הגורם הרוכש לעמוד במדיניות פרטיות זו ולהודעה מוקדמת של 30 יום.',
    ],
    body_en: [
      'DealSpace does not sell, rent, lease, trade, or transfer your personal data to third parties for marketing purposes. Data sharing occurs only in these limited and specified circumstances:',
      '(a) Service providers — Supabase (database storage and authentication, limited to server operation), business email provider (for sending updates, limited to email address only), payment provider (limited to transaction data — Tax ID or national ID will not be transferred to the payment provider);',
      '(b) Legal compliance — DealSpace may disclose information if required to do so by court order, competent authority directive, or as required by law. Where law permits, we will notify you of such a request before responding;',
      '(c) Business control transfer — In the event of a sale, merger, acquisition, or dissolution, your data may be transferred to the acquiring entity, subject to an explicit commitment by the acquiring party to comply with this Privacy Policy and 30 days\' prior notice.',
    ],
  },
  {
    num: '6',
    title_he: 'העברות בינלאומיות של נתונים',
    title_en: 'International Data Transfers',
    body_he: [
      'שרתי DealSpace ממוקמים באיחוד האירופי (AWS eu-central-1, פרנקפורט, גרמניה). אחסון הנתונים האירופי מהווה הגנה מהותית עבור משתמשים ישראלים ואירופאים כאחד.',
      'במקרים בהם נתוניך מעובדים מחוץ לתחום השיפוט של ישראל (כגון בשימוש בשירותי צד שלישי מסוימים), DealSpace מוודאת קיום מנגנוני הגנה מתאימים: (א) העברה למדינות בעלות רמת הגנה מספקת לפי תקנות ישראל ו-GDPR; (ב) חוזי עיבוד נתונים הכוללים סעיפים חוזיים סטנדרטיים (SCCs) של האיחוד האירופי; (ג) הסכמי עיבוד נתונים (DPAs) עם כל ספק שירות.',
    ],
    body_en: [
      'DealSpace\'s servers are located in the European Union (AWS eu-central-1, Frankfurt, Germany). European data storage provides meaningful protection for both Israeli and European users.',
      'In cases where your data is processed outside Israel\'s jurisdiction (such as when using certain third-party services), DealSpace ensures appropriate safeguards exist: (a) transfer to countries with adequate protection levels according to Israeli regulations and GDPR; (b) data processing contracts including EU Standard Contractual Clauses (SCCs); (c) Data Processing Agreements (DPAs) with every service provider.',
    ],
  },
  {
    num: '7',
    title_he: 'עוגיות וטכנולוגיות מעקב',
    title_en: 'Cookies & Tracking Technologies',
    body_he: [
      'DealSpace משתמשת בקטגוריות עוגיות ומנגנוני אחסון מקומי אלה:',
      '(א) עוגיות חיוניות — נדרשות לתפקוד השירות: ניהול סשן מאומת, אסימוני רענון, העדפות שפה ונגישות. אלו אינן ניתנות להשבתה ללא פגיעה בתפקוד הבסיסי;',
      '(ב) עוגיות אנליטיקה — מזהי שימוש אנונימיים המסייעים לנו להבין אילו פיצ\'רים פופולריים ואיפה משתמשים נתקלים בקושי. אלו אנונימיות ואינן ניתנות לייחוס לאדם מסוים;',
      '(ג) אחסון מקומי (localStorage) — DealSpace מאחסנת העדפות משתמש מקומיות (שפה, מצב תצוגה, העדפות נגישות) על מכשירך. מידע זה לא נשלח לשרתינו ונמצא בשליטתך המלאה.',
      'DealSpace אינה משתמשת בעוגיות פרסום, עוגיות מעקב בין-אתריות, פיקסלים שיווקיים של גוגל, פייסבוק, TikTok, או כל פלטפורמת פרסום אחרת.',
    ],
    body_en: [
      'DealSpace uses these categories of cookies and local storage mechanisms:',
      '(a) Essential cookies — required for service operation: authenticated session management, refresh tokens, language and accessibility preferences. These cannot be disabled without impairing basic functionality;',
      '(b) Analytics cookies — anonymous usage identifiers that help us understand which features are popular and where users encounter difficulty. These are anonymous and cannot be attributed to any specific individual;',
      '(c) Local storage (localStorage) — DealSpace stores user preferences locally (language, display mode, accessibility preferences) on your device. This information is not sent to our servers and is under your full control.',
      'DealSpace does not use advertising cookies, cross-site tracking cookies, or marketing pixels from Google, Facebook, TikTok, or any other advertising platform.',
    ],
  },
  {
    num: '8',
    title_he: 'זכויותיך כנושא מידע',
    title_en: 'Your Rights as a Data Subject',
    body_he: [
      'בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותיקוניו, ובהתאם ל-GDPR במידה שחל, יש לך זכויות אלו:',
      '(א) זכות עיון — לקבל עותק של כל המידע האצור אודותיך; (ב) זכות תיקון — לדרוש תיקון של מידע שגוי, לא שלם, או לא עדכני; (ג) זכות מחיקה ("הזכות להישכח") — לדרוש מחיקת מידעך כאשר אין עוד צורך לגיטימי להחזיק בו; (ד) זכות הגבלת עיבוד — לדרוש הגבלה של עיבוד מידעך בנסיבות מסוימות; (ה) זכות ניידות נתונים — לקבל את מידעך בפורמט מובנה, שכיח, וקריא-מכונה; (ו) זכות התנגדות — להתנגד לעיבוד מבוסס-אינטרס-לגיטימי; (ז) זכות לנגישות ללא אפליה — מימוש זכויותיך לא ישפיע על איכות השירות שתקבל.',
      'מימוש זכויות: פנה/י ל-privacy@dealspace.app עם הנושא "בקשת פרטיות — [שמך]". נענה לפנייתך תוך 30 ימי עסקים. ייתכן שנבקש לאמת את זהותך לפני מילוי הבקשה.',
      'תלונות: אם אתה סבור שנפגעה פרטיותך, תוכל לפנות לרשות להגנת הפרטיות של ישראל (www.gov.il/privacy) או לסמכות הרגולטורית המוסמכת במדינת מגוריך.',
    ],
    body_en: [
      'Pursuant to the Privacy Protection Law, 5741-1981 and its amendments, and under the GDPR to the extent applicable, you have the following rights:',
      '(a) Right of access — to receive a copy of all information stored about you; (b) Right to rectification — to request correction of incorrect, incomplete, or outdated information; (c) Right to erasure ("Right to be Forgotten") — to request deletion of your data when there is no longer a legitimate need to retain it; (d) Right to restriction of processing — to request restriction of processing of your data in certain circumstances; (e) Right to data portability — to receive your data in a structured, common, machine-readable format; (f) Right to object — to object to processing based on legitimate interest; (g) Right of non-discriminatory access — exercising your rights will not affect the quality of service you receive.',
      'Exercising rights: Contact privacy@dealspace.app with the subject "Privacy Request — [Your Name]". We will respond to your request within 30 business days. We may request to verify your identity before fulfilling the request.',
      'Complaints: If you believe your privacy has been violated, you may contact the Israeli Privacy Protection Authority (www.gov.il/privacy) or the competent regulatory authority in your country of residence.',
    ],
  },
  {
    num: '9',
    title_he: 'שמירה ומחיקת נתונים',
    title_en: 'Data Retention & Deletion',
    body_he: [
      'DealSpace אינה שומרת נתונים אישיים לאחר שפגה הצורך בהם. לוחות הזמנים הבאים חלים:',
      '(א) חשבון פעיל — כל נתוני המשתמש נשמרים לאורך כל תקופת המנוי הפעיל; (ב) לאחר ביטול מנוי — נתוני החשבון נשמרים 90 יום קלנדריים מיום הביטול, ולאחר מכן נמחקים לצמיתות ובאופן בלתי הפיך. הורד את כל נתוניך לפני תום תקופה זו; (ג) לוגים טכניים ואירועי אבטחה — נשמרים 12 חודשים ממועד היווצרם; (ד) רשומות לצרכי ציות משפטי — כפי שנדרש על פי חוק (עד 7 שנים לצרכי מס); (ה) נתוני Deal Room (לאחר חתימה) — חתימה אלקטרונית ונתוני זיהוי הלקוח נשמרים לאורך חיי החשבון הפעיל + 90 יום.',
      'מחיקה יזומה: ניתן לבקש מחיקה מוקדמת של נתוניך בפנייה ל-privacy@dealspace.app. מחיקה מוקדמת תתבצע תוך 14 ימים מהאישור, אלא אם מניעה משפטית קיימת.',
    ],
    body_en: [
      'DealSpace does not retain personal data after the need for it has ended. The following timelines apply:',
      '(a) Active account — all user data is retained throughout the active subscription period; (b) After subscription cancellation — account data is retained for 90 calendar days from the cancellation date, then permanently and irreversibly deleted. Download all your data before this period ends; (c) Technical logs and security events — retained for 12 months from creation; (d) Records for legal compliance — as required by law (up to 7 years for tax purposes); (e) Deal Room data (post-signing) — electronic signature and client identification data is retained for the lifetime of the active account + 90 days.',
      'Proactive deletion: You may request early deletion of your data by contacting privacy@dealspace.app. Early deletion will be completed within 14 days of confirmation, unless a legal impediment exists.',
    ],
  },
  {
    num: '10',
    title_he: 'אבטחת מידע',
    title_en: 'Information Security',
    body_he: [
      'DealSpace מיישמת אמצעי אבטחה טכניים וארגוניים מתאימים להגנה על נתוניך מפני גישה לא מורשית, שינוי, חשיפה, ואובדן. אמצעים אלה כוללים:',
      '(א) הצפנה בתעבורה — TLS 1.3 על כל תעבורת הרשת בין הדפדפן לשרת; (ב) הצפנה באחסון — AES-256 על מסדי הנתונים וגיבויים; (ג) אימות — bcrypt עם salt ייחודי לכל סיסמה, OAuth 2.0 + PKCE לאימות מאובטח; (ד) בקרת גישה — Row Level Security (RLS) מבטיחה שכל משתמש ניגש לנתוליו בלבד, גם ברמת מסד הנתונים; (ה) מפתחות API — מאוחסנים כמשתני סביבה מוצפנים ולא נחשפים ל-JavaScript הצד-לקוח.',
      'מדיניות פרצות אבטחה: DealSpace תודיע למשתמשים המושפעים על כל פרצת נתונים מהותית תוך 72 שעות מגילויה, בהתאם לדרישות חוק הגנת הפרטיות ותקנות ה-GDPR. דיווח על פרצת אבטחה: security@dealspace.app.',
    ],
    body_en: [
      'DealSpace implements appropriate technical and organizational security measures to protect your data from unauthorized access, modification, disclosure, and loss. These measures include:',
      '(a) Encryption in transit — TLS 1.3 on all network traffic between browser and server; (b) Encryption at rest — AES-256 on databases and backups; (c) Authentication — bcrypt with unique salt per password, OAuth 2.0 + PKCE for secure authentication; (d) Access control — Row Level Security (RLS) ensures each user accesses only their own data, even at the database level; (e) API keys — stored as encrypted environment variables and not exposed to client-side JavaScript.',
      'Data breach policy: DealSpace will notify affected users of any material data breach within 72 hours of discovery, in accordance with Privacy Protection Law requirements and GDPR regulations. Report a security breach: security@dealspace.app.',
    ],
  },
  {
    num: '11',
    title_he: 'פרטיות ילדים',
    title_en: 'Children\'s Privacy',
    body_he: [
      'השירות של DealSpace מיועד לאנשים מעל גיל 18 בלבד ואינו מיועד לילדים או לבני נוער. DealSpace אינה אוספת ביודעין מידע אישי מאנשים מתחת לגיל 18.',
      'אם הגיע לידיעתנו כי אדם מתחת לגיל 18 יצר חשבון ומסר מידע אישי, נמחק את הנתונים ואת החשבון לאלתר. אם אתה ההורה או האפוטרופוס של קטין שפתח חשבון ב-DealSpace, אנא פנה אלינו ב-privacy@dealspace.app.',
    ],
    body_en: [
      'DealSpace\'s Service is intended for individuals over the age of 18 only and is not intended for children or teenagers. DealSpace does not knowingly collect personal information from individuals under the age of 18.',
      'If it comes to our attention that a person under the age of 18 has created an account and provided personal information, we will immediately delete the data and the account. If you are the parent or guardian of a minor who opened a DealSpace account, please contact us at privacy@dealspace.app.',
    ],
  },
  {
    num: '12',
    title_he: 'שינויים במדיניות ויצירת קשר',
    title_en: 'Policy Changes & Contact Information',
    body_he: [
      'DealSpace רשאית לעדכן מדיניות פרטיות זו מעת לעת. שינויים מהותיים — כגון הוספת קטגוריה חדשה של נתונים, שינוי מטרת העיבוד, או הוספת שיתוף עם גורם שלישי חדש — יפורסמו באתר וייישלח עליהם עדכון דוא"ל לכל המשתמשים הרשומים, לפחות 14 יום לפני כניסתם לתוקף.',
      'שינויים לא-מהותיים (כגון שיפורי ניסוח, הבהרות, תיקוני שגיאות) עשויים להיכנס לתוקף מיידית עם הפרסום. תאריך "תוקף מיום" בראש מסמך זה יעודכן בהתאם.',
      'ממונה הגנת הפרטיות של DealSpace (DPO): privacy@dealspace.app | DealSpace Technologies Ltd., תל אביב, ישראל.',
      'לשאלות כלליות: support@dealspace.app | לענייני אבטחה: security@dealspace.app | לבקשות משפטיות: legal@dealspace.app.',
    ],
    body_en: [
      'DealSpace may update this Privacy Policy from time to time. Material changes — such as adding a new data category, changing processing purpose, or adding sharing with a new third party — will be published on the website and an email update will be sent to all registered users at least 14 days before they take effect.',
      'Non-material changes (such as wording improvements, clarifications, error corrections) may take effect immediately upon publication. The "Effective from" date at the top of this document will be updated accordingly.',
      'DealSpace Data Protection Officer (DPO): privacy@dealspace.app | DealSpace Technologies Ltd., Tel Aviv, Israel.',
      'General inquiries: support@dealspace.app | Security matters: security@dealspace.app | Legal requests: legal@dealspace.app.',
    ],
  },
]

// ─── PrivacyPolicy ────────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const { locale } = useI18n()
  const isHe = locale === 'he'

  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  return (
    <div
      className="relative min-h-dvh flex flex-col"
      dir={isHe ? 'rtl' : 'ltr'}
      style={{ background: '#05050A', color: '#f0f0f8' }}
    >
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 320,
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.09) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Top nav ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-white/40 transition hover:text-white/80"
        >
          <ArrowRight size={14} className={isHe ? '' : 'rotate-180'} />
          {isHe ? 'חזרה' : 'Back'}
        </button>

        <div className="flex items-center gap-1 rounded-xl p-1" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
          {([
            { path: '/terms',    label_he: 'תנאי שירות', label_en: 'Terms',    active: false },
            { path: '/privacy',  label_he: 'פרטיות',     label_en: 'Privacy',  active: true },
            { path: '/security', label_he: 'אבטחה',      label_en: 'Security', active: false },
          ]).map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path, { replace: true })}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: tab.active ? 'rgba(168,85,247,0.18)' : 'transparent',
                color: tab.active ? '#e9d5ff' : 'rgba(255,255,255,0.3)',
              }}
            >
              {isHe ? tab.label_he : tab.label_en}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 mx-auto max-w-3xl w-full px-6 pb-16">

        {/* Header */}
        <div
          className="mb-12 text-center"
          style={{ animation: 'tos-fade-up 0.45s ease-out both' }}
        >
          <style>{`
            @keyframes tos-fade-up {
              from { opacity: 0; transform: translateY(14px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div
            className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}
          >
            <Shield size={20} style={{ color: '#c084fc' }} />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {isHe ? 'מדיניות פרטיות' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-white/40 mb-1">
            {isHe
              ? 'כיצד אנו אוספים, משתמשים ומגנים על המידע שלך'
              : 'How we collect, use, and protect your information'}
          </p>
          <p className="text-xs text-white/22">
            {isHe ? 'תוקף מיום 1 בינואר 2026 | גרסה 2.0' : 'Effective January 1, 2026 | Version 2.0'}
          </p>
        </div>

        {/* Clauses */}
        <div className="space-y-4">
          {CLAUSES.map((clause, i) => (
            <motion.div
              key={clause.num}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' as const, delay: 0.04 + i * 0.035 }}
              style={CARD_STYLE}
              className="p-6"
            >
              {/* Clause heading */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="flex-none flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    color: '#d8b4fe',
                  }}
                >
                  {clause.num}
                </div>
                <h2
                  className="text-[15px] font-bold leading-tight"
                  style={{ color: '#e9d5ff' }}
                >
                  {isHe ? clause.title_he : clause.title_en}
                </h2>
              </div>

              {/* Body paragraphs */}
              <div className="space-y-3">
                {(isHe ? clause.body_he : clause.body_en).map((para, j) => (
                  <p key={j} className="text-[13.5px] leading-relaxed text-white/55">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}
          >
            <Shield size={13} style={{ color: '#c084fc' }} className="flex-none" />
            <span className="text-xs font-medium text-white/45">
              {isHe
                ? 'שאלות על פרטיות? פנה אלינו בכתובת privacy@dealspace.app'
                : 'Privacy questions? Contact us at privacy@dealspace.app'}
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Lock size={13} style={{ color: 'rgba(255,255,255,0.3)' }} className="flex-none" />
            <span className="text-xs font-medium text-white/35">
              {isHe ? 'עומדת בחוק הגנת הפרטיות ו-GDPR' : 'Compliant with Israeli Privacy Law & GDPR'}
            </span>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Lock } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'

// ─── Shared Card Style ────────────────────────────────────────────────────────

const CARD_CLS = 'bg-white dark:bg-transparent border border-slate-200 shadow-sm rounded-[1.25rem] dark:bg-gradient-to-br dark:from-white/[0.038] dark:to-white/[0.012] dark:border-white/[0.07] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'

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
    title_he: 'מבוא, עקרונות יסוד ותפקידי עיבוד',
    title_en: 'Introduction, Foundational Principles & Processing Roles',
    body_he: [
      'DealSpace Technologies Ltd. ("DealSpace", "אנו") מחויבת לשמירה על פרטיות המשתמשים ולשקיפות מלאה בכל הנוגע לאופן איסוף, עיבוד, ושימוש בנתונים אישיים. מדיניות פרטיות זו ("המדיניות") מפרטת את הנהלים שלנו ואת זכויותיך בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותיקוניו, ובמידה הרלוונטית — לתקנות ה-GDPR של האיחוד האירופי.',
      'תפקידי עיבוד — הבחנה קריטית: (א) DealSpace היא "מעבד מידע" (Data Processor) — אנו מעבדים נתונים טכניים לשם הפעלת הפלטפורמה וזמינותה. אחריותנו מוגבלת לאבטחת הנתונים, שמירתם, ועיבודם לצרכי השירות בלבד; (ב) היוצר (מנוי DealSpace) הוא "בעל מאגר המידע" / "בקר הנתונים" (Data Controller) ביחס לנתוני לקוחותיו — שמות, מיילים, פרטי חוזה, ונתוני זיהוי. היוצר נושא באחריות המלאה לעמוד בדרישות חוק הגנת הפרטיות כלפי לקוחותיו, לרבות קבלת הסכמות נדרשות ומתן זכות עיון.',
      'עקרונות הפרטיות שלנו: (א) מינימום נתונים — אנו אוספים רק מידע הנחוץ לאספקת השירות; (ב) שקיפות — מדיניות ברורה וגלויה; (ג) שליטת משתמש — זכויות גישה, תיקון ומחיקה; (ד) אבטחה — הצפנה מתקדמת, RLS ובקרת גישה; (ה) מגבלת מטרה — לא נשתמש בנתוניך למטרות שאינן מפורטות כאן.',
    ],
    body_en: [
      'DealSpace Technologies Ltd. ("DealSpace", "we") is committed to protecting user privacy and maintaining full transparency regarding how personal data is collected, processed, and used. This Privacy Policy ("Policy") details our procedures and your rights pursuant to the Privacy Protection Law, 5741-1981 and its amendments, and to the extent relevant, the EU GDPR.',
      'Processing roles — a critical distinction: (a) DealSpace is a "Data Processor" — we process technical data for the purpose of operating and maintaining the platform. Our responsibility is limited to data security, retention, and processing for Service purposes only; (b) The Creator (DealSpace subscriber) is the "Data Controller" with respect to their clients\' data — names, emails, contract details, and identification data. The Creator bears full responsibility for complying with privacy law requirements toward their clients, including obtaining required consents and providing access rights.',
      'Our privacy principles: (a) data minimization — we collect only information necessary to provide the Service; (b) transparency — clear and open policy; (c) user control — access, rectification, and deletion rights; (d) security — advanced encryption, RLS, and access control; (e) purpose limitation — we will not use your data for purposes not described here.',
    ],
  },
  {
    num: '2',
    title_he: 'מידע שאנו אוספים ומדוע',
    title_en: 'Information We Collect & Why',
    body_he: [
      'מידע שאתה מספק ישירות: (א) נתוני הרשמה — שם מלא, כתובת דוא"ל, סיסמה (מוצפנת), שם חברה; (ב) נתוני עסק (פרופיל) — ח.פ/ת.ז, כתובת, טלפון, שם מורשה חתימה, צבע מותג, לוגו חברה; (ג) נתוני הצעות מחיר — כותרת הפרויקט, תיאור, מחירים, תוספות, אבני דרך תשלום, שם ומייל הלקוח; (ד) תנאי עסק גלובליים — טקסט תנאי ההתקשרות שאתה מנסח ומצרף לכל הצעה.',
      'מידע שנאסף אוטומטית: (א) נתוני שימוש — דפים שביקרת, פעולות שביצעת, פיצ\'רים ששימשת, זמן שהייה; (ב) מידע טכני — כתובת IP, סוג דפדפן, גרסת מערכת הפעלה, רזולוציית מסך; (ג) נתוני מעקב פתיחת מייל — מתי נפתח מייל הצעת המחיר על ידי לקוחך.',
      'נתוני חתימה — מידע פורנזי לביקורת משפטית: כאשר לקוחך חותם על מסמך דרך DealSpace, אנו אוספים ומתעדים נתונים אלה ליצירת שרשרת ראיות חוקית ובלתי ניתנת לשינוי, לפי חוק חתימה אלקטרונית, התשס"א-2001: (א) כתובת ה-IP של החותם; (ב) User Agent מלא — דפדפן, גרסה, מערכת הפעלה, מכשיר; (ג) חותמת זמן מדויקת (UTC) של החתימה; (ד) תמונת החתימה הגרפית (PNG); (ה) שם מלא, שם חברה, ח.פ/ת.ז של החותם. נתונים אלו מוטבעים ב-PDF החתום, אינם ניתנים לשינוי לאחר החתימה, ומשמשים ראיה לאמיתות ולתקינות ההסכם.',
    ],
    body_en: [
      'Information you provide directly: (a) registration data — full name, email address, password (encrypted), company name; (b) business data (profile) — tax ID, address, phone, authorized signatory name, brand color, company logo; (c) proposal data — project title, description, prices, add-ons, payment milestones, client name and email; (d) Global Business Terms — the contractual terms text you draft and attach to each proposal.',
      'Automatically collected information: (a) usage data — pages visited, actions taken, features used, session duration; (b) technical information — IP address, browser type, operating system version, screen resolution; (c) email open tracking — when your client opened the proposal email.',
      'Signing data — forensic audit information for legal validity: When your client signs a document through DealSpace, we collect and record the following data to create a legally binding and immutable evidence chain, pursuant to the Israeli Electronic Signature Law, 5761-2001: (a) the signer\'s IP address; (b) the signer\'s full User Agent — browser, version, operating system, device; (c) an exact signing timestamp (UTC); (d) the graphical signature image (PNG); (e) the signer\'s full name, company name, and tax ID. This data is embedded in the signed PDF, is immutable after signing, and serves as evidence of agreement authenticity and validity.',
    ],
  },
  {
    num: '3',
    title_he: 'כיצד אנו משתמשים במידע',
    title_en: 'How We Use Your Information',
    body_he: [
      'למטרות אלו בלבד: (א) אספקת שירות — יצירת ועיבוד הצעות מחיר, ניהול חשבון, שיגור Deal Rooms, ייצור PDF חתום; (ב) תקשורת עסקית — אישורי כניסה, עדכוני מנוי, התראות אבטחה, ותמיכה טכנית; (ג) שיפור שירות — אנליטיקה אגרגטיבית ואנונימית לצורכי שיפור UX; (ד) ציות לדין — שמירת רשומות כנדרש על פי חוק, מענה לצווים שיפוטיים.',
      'מה שלעולם לא נעשה: (א) לא נמכור נתוניך לצד שלישי כלשהו; (ב) לא נשתמש בנתוניך לפרסום ממוקד מבוסס פרופיל; (ג) לא נשתף נתוניך עם מתחרים; (ד) לא נשתמש בנתוני הלקוחות שלך לפנייה ישירה אליהם; (ה) לא נעביר נתוניך למדינה שאין בה הגנת פרטיות מתאימה ללא הסכמתך.',
    ],
    body_en: [
      'For these purposes only: (a) service provision — creating and processing proposals, account management, sending Deal Rooms, generating signed PDFs; (b) business communications — login confirmations, subscription updates, security alerts, and technical support; (c) service improvement — aggregated and anonymous analytics for UX improvement; (d) legal compliance — maintaining records as required by law, responding to court orders.',
      'What we will never do: (a) sell your data to any third party; (b) use your data for profile-based targeted advertising; (c) share your data with competitors; (d) use your clients\' data to directly contact them; (e) transfer your data to a country without appropriate privacy protections without your consent.',
    ],
  },
  {
    num: '4',
    title_he: 'הבסיס המשפטי לעיבוד הנתונים',
    title_en: 'Legal Basis for Processing',
    body_he: [
      'DealSpace מעבדת נתונים אישיים רק בהתבסס על אחת מהעילות המשפטיות הבאות:',
      '(א) ביצוע חוזה — עיבוד הנדרש לצורך אספקת השירות שביקשת; (ב) הסכמה — עבור מיילים שיווקיים ועדכוני מוצר שאינם חיוניים, תמיד בכפוף להסכמה מפורשת עם זכות ביטול פשוטה; (ג) אינטרס לגיטימי — אנליטיקה אנונימית, גילוי הונאות, אבטחת מידע; (ד) ציות לחוק — שמירת רשומות עסקיות, מענה לדרישות רגולטוריות ושיפוטיות; (ה) שמירת ראיות חוקיות — נתוני פורנזי חתימה נשמרים על בסיס "אינטרס לגיטימי" של DealSpace ושל היוצרים לקיים ראיות חוקיות מחייבות לפי חוק חתימה אלקטרונית, התשס"א-2001.',
    ],
    body_en: [
      'DealSpace processes personal data only based on one of the following legal grounds:',
      '(a) Contract performance — processing required to provide the Service you requested; (b) Consent — for marketing emails and non-essential product updates, always subject to explicit consent with a simple opt-out right; (c) Legitimate interest — anonymous analytics, fraud detection, information security; (d) Legal compliance — maintaining business records, responding to regulatory and judicial requirements; (e) Preservation of legal evidence — forensic signing data is retained on the basis of "legitimate interest" of DealSpace and Creators to maintain legally binding evidence pursuant to the Israeli Electronic Signature Law, 5761-2001.',
    ],
  },
  {
    num: '5',
    title_he: 'שיתוף מידע עם צדדים שלישיים',
    title_en: 'Sharing Data with Third Parties',
    body_he: [
      'DealSpace לא מוכרת, משכירה, מחכירה, סוחרת, ולא מעבירה את נתוניך האישיים לצדדים שלישיים לכל מטרה שיווקית. DealSpace אינה מוכרת נתונים. שיתוף נתונים מתבצע אך ורק בנסיבות מוגבלות אלה:',
      '(א) ספקי שירות חיוניים — Supabase Inc. (אחסון מסד נתונים ואימות, שרתים ב-AWS eu-central-1, פרנקפורט); Resend Inc. (שירות שליחת דוא"ל לאספקת הצעות מחיר ואישורי מנוי, מוגבל לכתובת הדוא"ל ותוכן ההצעה בלבד); Stripe Inc. (עיבוד תשלומים מאובטח לפי PCI-DSS Level 1, מוגבל לנתוני העסקה בלבד — ח.פ/ת.ז לא מועבר לSprite);',
      '(ב) עמידה בחוק — DealSpace עשויה לחשוף מידע בצו שיפוטי או הוראת רשות מוסמכת. אם החוק מאפשר זאת, נודיע לך לפני מתן התגובה;',
      '(ג) העברת שליטה עסקית — במקרה של מכירה, מיזוג, רכישה, או פירוק, בכפוף להתחייבות הגורם הרוכש לעמוד במדיניות זו ולהודעה מוקדמת של 30 יום.',
    ],
    body_en: [
      'DealSpace does not sell, rent, lease, trade, or transfer your personal data to third parties for any marketing purpose. DealSpace does not sell data. Data sharing occurs only in these limited circumstances:',
      '(a) Essential service providers — Supabase Inc. (database storage and authentication, servers on AWS eu-central-1, Frankfurt); Resend Inc. (email delivery service for proposal delivery and subscription confirmations, limited to email address and proposal content only); Stripe Inc. (secure payment processing to PCI-DSS Level 1, limited to transaction data only — Tax ID is not transferred to Stripe);',
      '(b) Legal compliance — DealSpace may disclose information pursuant to a court order or competent authority directive. Where law permits, we will notify you before responding;',
      '(c) Business control transfer — In the event of a sale, merger, acquisition, or dissolution, subject to the acquiring party\'s commitment to comply with this Policy and 30 days\' prior notice.',
    ],
  },
  {
    num: '6',
    title_he: 'העברות בינלאומיות של נתונים',
    title_en: 'International Data Transfers',
    body_he: [
      'שרתי DealSpace ממוקמים באיחוד האירופי (AWS eu-central-1, פרנקפורט, גרמניה). אחסון הנתונים האירופי מהווה הגנה מהותית עבור משתמשים ישראלים ואירופאים כאחד, בהתאם לתקנות ה-GDPR.',
      'במקרים בהם נתוניך מעובדים מחוץ לתחום השיפוט של ישראל (כגון בשימוש בשירותי צד שלישי מסוימים), DealSpace מוודאת קיום מנגנוני הגנה מתאימים: (א) העברה למדינות בעלות רמת הגנה מספקת לפי תקנות ישראל ו-GDPR; (ב) חוזי עיבוד נתונים הכוללים סעיפים חוזיים סטנדרטיים (SCCs) של האיחוד האירופי; (ג) הסכמי עיבוד נתונים (DPAs) עם כל ספק שירות.',
    ],
    body_en: [
      'DealSpace\'s servers are located in the European Union (AWS eu-central-1, Frankfurt, Germany). European data storage provides meaningful protection for both Israeli and European users, in accordance with GDPR regulations.',
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
      '(ב) עוגיות אנליטיקה — מזהי שימוש אנונימיים המסייעים לנו להבין אילו פיצ\'רים פופולריים ואיפה משתמשים נתקלים בקושי. אינן מאפשרות זיהוי של אדם ספציפי;',
      '(ג) אחסון מקומי (localStorage) — DealSpace מאחסנת העדפות משתמש מקומיות (שפה, מצב תצוגה, העדפות נגישות) על מכשירך. מידע זה אינו נשלח לשרתינו ונמצא בשליטתך המלאה. DealSpace אינה משתמשת בעוגיות פרסום, עוגיות מעקב בין-אתריות, פיקסלים שיווקיים של גוגל, פייסבוק, TikTok, או כל פלטפורמת פרסום אחרת.',
    ],
    body_en: [
      'DealSpace uses these categories of cookies and local storage mechanisms:',
      '(a) Essential cookies — required for service operation: authenticated session management, refresh tokens, language and accessibility preferences. These cannot be disabled without impairing basic functionality;',
      '(b) Analytics cookies — anonymous usage identifiers that help us understand which features are popular and where users encounter difficulty. They do not enable identification of any specific individual;',
      '(c) Local storage (localStorage) — DealSpace stores user preferences locally (language, display mode, accessibility preferences) on your device. This information is not sent to our servers and is under your full control. DealSpace does not use advertising cookies, cross-site tracking cookies, or marketing pixels from Google, Facebook, TikTok, or any other advertising platform.',
    ],
  },
  {
    num: '8',
    title_he: 'זכויותיך כנושא מידע',
    title_en: 'Your Rights as a Data Subject',
    body_he: [
      'בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ותיקוניו, ובהתאם ל-GDPR במידה שחל, יש לך זכויות אלו:',
      '(א) זכות עיון — לקבל עותק של כל המידע האצור אודותיך; (ב) זכות תיקון — לדרוש תיקון של מידע שגוי, לא שלם, או לא עדכני; (ג) זכות מחיקה ("הזכות להישכח") — לדרוש מחיקת מידעך כאשר אין עוד צורך לגיטימי להחזיק בו; (ד) זכות הגבלת עיבוד — לדרוש הגבלת עיבוד מידעך בנסיבות מסוימות; (ה) זכות ניידות נתונים — לקבל את מידעך בפורמט מובנה, שכיח, וקריא-מכונה; (ו) זכות התנגדות — להתנגד לעיבוד מבוסס-אינטרס-לגיטימי; (ז) זכות נגישות ללא אפליה — מימוש זכויותיך לא ישפיע על איכות השירות.',
      'מימוש זכויות: פנה/י ל-privacy@dealspace.app עם הנושא "בקשת פרטיות — [שמך]". נענה תוך 30 ימי עסקים. ייתכן שנבקש לאמת את זהותך. תלונות: ניתן לפנות לרשות להגנת הפרטיות של ישראל (www.gov.il/privacy) או לסמכות הרגולטורית המוסמכת במדינת מגוריך.',
    ],
    body_en: [
      'Pursuant to the Privacy Protection Law, 5741-1981 and its amendments, and under the GDPR to the extent applicable, you have the following rights:',
      '(a) Right of access — to receive a copy of all information stored about you; (b) Right to rectification — to request correction of incorrect, incomplete, or outdated information; (c) Right to erasure ("Right to be Forgotten") — to request deletion of your data when there is no longer a legitimate need to retain it; (d) Right to restriction of processing — to request restriction of processing of your data in certain circumstances; (e) Right to data portability — to receive your data in a structured, common, machine-readable format; (f) Right to object — to object to processing based on legitimate interest; (g) Right of non-discriminatory access — exercising your rights will not affect service quality.',
      'Exercising rights: Contact privacy@dealspace.app with subject "Privacy Request — [Your Name]". We will respond within 30 business days. We may request identity verification. Complaints: You may contact the Israeli Privacy Protection Authority (www.gov.il/privacy) or the competent regulatory authority in your country of residence.',
    ],
  },
  {
    num: '9',
    title_he: 'שמירה ומחיקת נתונים',
    title_en: 'Data Retention & Deletion',
    body_he: [
      'DealSpace אינה שומרת נתונים אישיים לאחר שפגה הצורך בהם. לוחות הזמנים הבאים חלים:',
      '(א) חשבון פעיל — כל נתוני המשתמש נשמרים לאורך כל תקופת המנוי הפעיל; (ב) לאחר ביטול מנוי — נתוני החשבון נשמרים 90 יום קלנדריים מיום הביטול, ולאחר מכן נמחקים לצמיתות ובאופן בלתי הפיך; (ג) לוגים טכניים ואירועי אבטחה — נשמרים 12 חודשים; (ד) רשומות לצרכי ציות משפטי — כפי שנדרש על פי חוק (עד 7 שנים לצרכי מס); (ה) נתוני Deal Room חתומים — נתוני הפורנזי של החתימה (IP, UA, חותמת זמן) נשמרים לאורך חיי החשבון הפעיל + 90 יום, לצורך הוכחת תקינות חוזית.',
      'מחיקה יזומה: ניתן לבקש מחיקה מוקדמת ב-privacy@dealspace.app. מחיקה תתבצע תוך 14 ימים, אלא אם מניעה משפטית קיימת.',
    ],
    body_en: [
      'DealSpace does not retain personal data after the need for it has ended. The following timelines apply:',
      '(a) Active account — all user data is retained throughout the active subscription period; (b) After subscription cancellation — account data is retained for 90 calendar days from the cancellation date, then permanently and irreversibly deleted; (c) Technical logs and security events — retained for 12 months; (d) Records for legal compliance — as required by law (up to 7 years for tax purposes); (e) Signed Deal Room data — forensic signing data (IP, UA, timestamp) is retained for the lifetime of the active account + 90 days, for contractual validity proof.',
      'Proactive deletion: Request early deletion at privacy@dealspace.app. Deletion will be completed within 14 days of confirmation, unless a legal impediment exists.',
    ],
  },
  {
    num: '10',
    title_he: 'אבטחת מידע',
    title_en: 'Information Security',
    body_he: [
      'DealSpace מיישמת אמצעי אבטחה טכניים וארגוניים מתאימים להגנה על נתוניך מפני גישה לא מורשית, שינוי, חשיפה, ואובדן:',
      '(א) הצפנה בתעבורה — TLS 1.3 על כל תעבורת הרשת; (ב) הצפנה באחסון — AES-256 על מסדי הנתונים וגיבויים; (ג) אימות — bcrypt עם salt ייחודי לכל סיסמה, OAuth 2.0 + PKCE לאימות מאובטח; (ד) בקרת גישה — Row Level Security (RLS) ברמת מסד הנתונים מבטיחה שכל משתמש ניגש לנתוליו בלבד — גם ברמה הפנימית; (ה) מפתחות API — מאוחסנים כמשתני סביבה מוצפנים ולא נחשפים לקוד JavaScript הצד-לקוח.',
      'מדיניות פרצות: DealSpace תודיע למשתמשים המושפעים על כל פרצת נתונים מהותית תוך 72 שעות מגילויה, בהתאם לחוק הגנת הפרטיות ותקנות ה-GDPR. לדיווח על פרצת אבטחה: security@dealspace.app.',
    ],
    body_en: [
      'DealSpace implements appropriate technical and organizational security measures to protect your data from unauthorized access, modification, disclosure, and loss:',
      '(a) Encryption in transit — TLS 1.3 on all network traffic; (b) Encryption at rest — AES-256 on databases and backups; (c) Authentication — bcrypt with unique salt per password, OAuth 2.0 + PKCE for secure authentication; (d) Access control — Row Level Security (RLS) at the database level ensures each user accesses only their own data — even at the internal infrastructure level; (e) API keys — stored as encrypted environment variables and not exposed to client-side JavaScript.',
      'Breach policy: DealSpace will notify affected users of any material data breach within 72 hours of discovery, in accordance with Privacy Protection Law requirements and GDPR regulations. To report a security breach: security@dealspace.app.',
    ],
  },
  {
    num: '11',
    title_he: 'פרטיות ילדים',
    title_en: 'Children\'s Privacy',
    body_he: [
      'השירות של DealSpace מיועד לאנשים מעל גיל 18 בלבד ואינו מיועד לילדים או לבני נוער. DealSpace אינה אוספת ביודעין מידע אישי מאנשים מתחת לגיל 18.',
      'אם הגיע לידיעתנו כי אדם מתחת לגיל 18 יצר חשבון ומסר מידע אישי, נמחק את הנתונים ואת החשבון לאלתר. הורה או אפוטרופוס של קטין שפתח חשבון ב-DealSpace מוזמן לפנות ב-privacy@dealspace.app.',
    ],
    body_en: [
      'DealSpace\'s Service is intended for individuals over the age of 18 only and is not intended for children or teenagers. DealSpace does not knowingly collect personal information from individuals under the age of 18.',
      'If it comes to our attention that a person under the age of 18 has created an account and provided personal information, we will immediately delete the data and the account. The parent or guardian of a minor who opened a DealSpace account is invited to contact us at privacy@dealspace.app.',
    ],
  },
  {
    num: '12',
    title_he: 'שינויים במדיניות ויצירת קשר',
    title_en: 'Policy Changes & Contact Information',
    body_he: [
      'DealSpace רשאית לעדכן מדיניות פרטיות זו מעת לעת. שינויים מהותיים — כגון הוספת קטגוריה חדשה של נתונים, שינוי מטרת העיבוד, או הוספת שיתוף עם גורם שלישי חדש — יפורסמו באתר ויישלח עדכון דוא"ל לכל המשתמשים הרשומים לפחות 14 יום לפני כניסתם לתוקף.',
      'שינויים לא-מהותיים (שיפורי ניסוח, הבהרות, תיקוני שגיאות) עשויים להיכנס לתוקף מיידית עם הפרסום. תאריך "תוקף מיום" בראש המסמך יעודכן בהתאם.',
      'ממונה הגנת הפרטיות (DPO): privacy@dealspace.app | DealSpace Technologies Ltd., תל אביב, ישראל | שאלות כלליות: support@dealspace.app | אבטחה: security@dealspace.app | בקשות משפטיות: legal@dealspace.app.',
    ],
    body_en: [
      'DealSpace may update this Privacy Policy from time to time. Material changes — such as adding a new data category, changing processing purpose, or adding sharing with a new third party — will be published on the website and an email update will be sent to all registered users at least 14 days before they take effect.',
      'Non-material changes (wording improvements, clarifications, error corrections) may take effect immediately upon publication. The "Effective from" date at the top of this document will be updated accordingly.',
      'Data Protection Officer (DPO): privacy@dealspace.app | DealSpace Technologies Ltd., Tel Aviv, Israel | General inquiries: support@dealspace.app | Security: security@dealspace.app | Legal requests: legal@dealspace.app.',
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
      className="relative min-h-dvh flex flex-col bg-slate-50 text-slate-900 dark:bg-[#05050A] dark:text-[#f0f0f8]"
      dir={isHe ? 'rtl' : 'ltr'}
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
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/40 transition hover:text-slate-700 dark:hover:text-white/80"
        >
          <ArrowRight size={14} className={isHe ? '' : 'rotate-180'} />
          {isHe ? 'חזרה' : 'Back'}
        </button>

        <div className="flex items-center gap-1 rounded-xl p-1 border border-slate-200 bg-white/80 dark:border-white/[0.07] dark:bg-white/[0.03]">
          {([
            { path: '/terms',    label_he: 'תנאי שירות', label_en: 'Terms',    active: false },
            { path: '/privacy',  label_he: 'פרטיות',     label_en: 'Privacy',  active: true  },
            { path: '/security', label_he: 'אבטחה',      label_en: 'Security', active: false },
          ]).map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path, { replace: true })}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tab.active ? 'bg-purple-500/[0.18] text-purple-600 dark:text-purple-200' : 'text-slate-400 dark:text-white/30'}`}
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
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {isHe ? 'מדיניות פרטיות' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/40 mb-1">
            {isHe
              ? 'כיצד אנו אוספים, משתמשים ומגנים על המידע שלך'
              : 'How we collect, use, and protect your information'}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/22">
            {isHe ? 'תוקף מיום 1 בינואר 2026 | גרסה 3.0' : 'Effective January 1, 2026 | Version 3.0'}
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
              className={`p-6 ${CARD_CLS}`}
            >
              {/* Clause heading */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="flex-none flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black text-purple-700 dark:text-purple-300"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                  }}
                >
                  {clause.num}
                </div>
                <h2
                  className="text-[15px] font-bold leading-tight text-purple-700 dark:text-purple-300"
                >
                  {isHe ? clause.title_he : clause.title_en}
                </h2>
              </div>

              {/* Body paragraphs */}
              <div className="space-y-3">
                {(isHe ? clause.body_he : clause.body_en).map((para, j) => (
                  <p key={j} className="text-[13.5px] leading-relaxed text-slate-600 dark:text-white/55">
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
            <span className="text-xs font-medium text-slate-600 dark:text-white/45">
              {isHe
                ? 'שאלות על פרטיות? פנה אלינו בכתובת privacy@dealspace.app'
                : 'Privacy questions? Contact us at privacy@dealspace.app'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white border border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.07]">
            <Lock size={13} className="text-slate-400 dark:text-white/30 flex-none" />
            <span className="text-xs font-medium text-slate-500 dark:text-white/35">
              {isHe ? 'עומדת בחוק הגנת הפרטיות ו-GDPR' : 'Compliant with Israeli Privacy Law & GDPR'}
            </span>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}

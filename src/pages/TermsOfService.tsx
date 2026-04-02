import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Shield, Lock } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'

// ─── Legal Prose Styles ────────────────────────────────────────────────────────
// Manually approximated since @tailwindcss/typography is not installed.

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
  body_he: string[]    // paragraphs
  body_en: string[]
}

const CLAUSES: Clause[] = [
  {
    num: '1',
    title_he: 'מבוא וקבלת התנאים',
    title_en: 'Introduction & Acceptance of Terms',
    body_he: [
      'ברוכים הבאים ל-DealSpace. הסכם תנאי שירות זה ("ההסכם" או "התנאים") מסדיר את היחסים המשפטיים בינך ("משתמש", "מנוי", "בעל עסק") לבין DealSpace Technologies Ltd. ("DealSpace", "אנו", "החברה"), חברה המפעילה פלטפורמה טכנולוגית ליצירת הצעות מחיר אינטראקטיביות, ניהול חוזים דיגיטליים ואיסוף חתימות אלקטרוניות.',
      'השימוש בפלטפורמה, לרבות גלישה, הרשמה, יצירת חשבון, יצירת הצעת מחיר, שיתוף קישורים עם לקוחות, או כל פעולה אחרת בשירות — מהווה הסכמה מלאה, בלתי מסויגת ומחייבת לתנאים אלו. אם אינך מסכים לכל אחד מהתנאים המפורטים להלן, הינך מחויב להפסיק את השימוש בשירות לאלתר.',
      'גיל מינימלי: השירות מיועד לבגירים בני 18 שנה ומעלה בלבד. שימוש על ידי קטין מהווה הפרה מהותית של הסכם זה, ו-DealSpace תהיה רשאית לסגור את החשבון הנוגע בדבר ללא הודעה מוקדמת.',
    ],
    body_en: [
      'Welcome to DealSpace. This Terms of Service Agreement ("Agreement" or "Terms") governs the legal relationship between you ("User", "Subscriber", "Business Owner") and DealSpace Technologies Ltd. ("DealSpace", "we", "Company"), a company operating a technology platform for interactive proposal creation, digital contract management, and electronic signature collection.',
      'Use of the platform — including browsing, registration, account creation, proposal creation, sharing links with clients, or any other action on the Service — constitutes full, unconditional, and binding agreement to these Terms. If you do not agree to any of the terms set forth herein, you must immediately cease use of the Service.',
      'Minimum Age: The Service is intended for adults aged 18 and older only. Use by a minor constitutes a material breach of this Agreement, and DealSpace may close the account in question without prior notice.',
    ],
  },
  {
    num: '2',
    title_he: 'הגדרות מונחי מפתח',
    title_en: 'Key Term Definitions',
    body_he: [
      '"פלטפורמה" / "השירות" — מכלול הכלים, הממשקים, ממשקי ה-API, הרכיבים ותשתיות הענן המסופקים על ידי DealSpace בכתובת dealspace.app וכל תת-דומיין שלה.',
      '"יוצר" — משתמש רשום המשתמש בפלטפורמה ליצירת הצעות מחיר ושליחתן ללקוחות. היוצר הוא הצד האחראי לתוכן ולתנאים הכלולים בהצעה.',
      '"לקוח" — אדם או ישות שהיוצר שיתף איתם קישור לחדר עסקאות. הלקוח ניגש לפלטפורמה ללא צורך בחשבון רשום.',
      '"חדר עסקאות" — ממשק דיגיטלי ציבורי המיוצר עבור כל הצעת מחיר, המאפשר ללקוח לצפות בהצעה, לבחור תוספות, וחתום עליה.',
      '"חתימה אלקטרונית" — ייצוג גרפי של הסכמה שנאסף דרך ממשק הקנבס של DealSpace, המאוחסן כתמונת PNG ומוטבע ב-PDF החתום.',
      '"תוכן משתמש" — כל מידע, תמונות, מחירים, תנאי חוזה, תיאורי שירות ונתוני לקוחות שמזין המשתמש לפלטפורמה.',
    ],
    body_en: [
      '"Platform" / "Service" — The totality of tools, interfaces, APIs, components, and cloud infrastructure provided by DealSpace at dealspace.app and any subdomains thereof.',
      '"Creator" — A registered user who uses the platform to create proposals and send them to clients. The Creator is the party responsible for the content and terms contained in the proposal.',
      '"Client" — A person or entity with whom the Creator has shared a deal room link. The Client accesses the platform without requiring a registered account.',
      '"Deal Room" — A public digital interface generated for each proposal, allowing the client to view the proposal, select add-ons, and sign it.',
      '"Electronic Signature" — A graphical representation of consent collected through DealSpace\'s canvas interface, stored as a PNG image and embedded in the signed PDF.',
      '"User Content" — All information, images, prices, contract terms, service descriptions, and client data entered by the User into the platform.',
    ],
  },
  {
    num: '3',
    title_he: 'הרישיון ותחום השימוש המותר',
    title_en: 'License & Permitted Use',
    body_he: [
      'DealSpace מעניקה לך בזאת רישיון אישי, מוגבל, לא-בלעדי, שאינו ניתן להעברה ולא ניתן לרישיון-משנה, לשימוש בפלטפורמה אך ורק למטרות עסקיות לגיטימיות ובכפוף לתנאים המפורטים בהסכם זה.',
      'שימושים אסורים במפורש: (א) יצירת הצעות מחיר הכוללות תוכן מטעה, הונאתי, לא-חוקי, פוגעני, מגדיל ראש, מפר זכויות יוצרים, מפר פרטיות, או מהווה לשון הרע; (ב) שימוש בפלטפורמה לשיגור ספאם, הונאות פישינג, או כל פגיעה בצדדים שלישיים; (ג) ניסיון לפרוץ, לעקוף, לחסום, לשבש, להסיח, לפרק לרכיבים, לשכפל, לסרוק, לבצע הנדסה הפוכה, או להעתיק כל חלק מהפלטפורמה; (ד) יצירת חשבונות מרובים לצורכי עקיפת הגבלות מנוי; (ה) שימוש בבוטים, זחלנים, או אמצעי אוטומציה כלשהם ללא אישור מפורש בכתב.',
      'DealSpace שומרת לעצמה את הזכות לשנות, להשעות, לצמצם, או להפסיק את הגישה לשירות בכל עת, בהתאם שיקול דעתה הבלעדי, עבור כל משתמש המפר את תנאי הרישיון.',
    ],
    body_en: [
      'DealSpace hereby grants you a personal, limited, non-exclusive, non-transferable, non-sublicensable license to use the platform solely for legitimate business purposes and subject to the terms set forth in this Agreement.',
      'Expressly prohibited uses: (a) creating proposals containing misleading, fraudulent, illegal, offensive, arrogant, copyright-infringing, privacy-violating, or defamatory content; (b) using the platform to send spam, phishing scams, or any harm to third parties; (c) attempting to break into, bypass, block, disrupt, distract, disassemble, replicate, scan, reverse-engineer, or copy any part of the platform; (d) creating multiple accounts to circumvent subscription restrictions; (e) using bots, crawlers, or any automation means without explicit written authorization.',
      'DealSpace reserves the right to modify, suspend, reduce, or terminate access to the Service at any time, at its sole discretion, for any user violating the license terms.',
    ],
  },
  {
    num: '4',
    title_he: 'אחריות המשתמש לתוכן ולהצעות',
    title_en: 'User Responsibility for Content & Proposals',
    body_he: [
      'המשתמש הוא האחראי הבלעדי לכל תוכן שמועלה, נוצר, נשלח, או מופץ דרך הפלטפורמה. זה כולל, אך אינו מוגבל ל: מחירים, תנאי תשלום, תיאורי שירות, לוחות זמנים, תנאי ביטול, מסמכי חוזה, ופרטי לקוחות.',
      'DealSpace אינה בודקת, מאשרת, מסווגת, מוודאת, מנטרת, ואינה מחויבת לבדוק את תוכן ההצעות שנוצרות על ידי משתמשים. DealSpace פועלת אך ורק כמאחסן פסיבי של תוכן המשתמש.',
      'המשתמש מצהיר ומתחייב כי: (א) הוא בעל כל הזכויות הנדרשות לפרסום התוכן; (ב) התוכן אינו מפר כל חוק, תקנה, או זכות של צד שלישי; (ג) הוא יישא בכל אחריות משפטית, עסקית ומסחרית הנובעת מהצעות המחיר שיצר.',
    ],
    body_en: [
      'The User is solely responsible for all content uploaded, created, sent, or distributed through the platform. This includes, but is not limited to: prices, payment terms, service descriptions, timelines, cancellation terms, contract documents, and client data.',
      'DealSpace does not review, approve, classify, verify, monitor, and is not obligated to review the content of proposals created by users. DealSpace operates solely as a passive host of User Content.',
      'The User declares and undertakes that: (a) they hold all rights necessary to publish the content; (b) the content does not violate any law, regulation, or third-party right; (c) they will bear all legal, business, and commercial responsibility arising from the proposals they created.',
    ],
  },
  {
    num: '5',
    title_he: 'היעדר ייעוץ משפטי — הצהרת ויתור קריטית',
    title_en: 'No Legal Advice — Critical Disclaimer',
    body_he: [
      'הצהרה זו היא מהחשובות ביותר בהסכם זה. אנא קרא אותה בעיון רב.',
      'DealSpace מספקת תבניות חוזה, מסגרות הסכם, ורכיבי טקסט משפטי-עסקי כנקודת פתיחה בלבד לשימושם של בעלי עסקים. DealSpace אינה משרד עורכי דין, אינה מספקת ייעוץ משפטי מכל סוג, ואין להתייחס לתוכן המשפטי המוצע בפלטפורמה כאל תחליף לייעוץ עורך דין מוסמך.',
      'כל הסכם, חוזה, הצעת מחיר, או מסמך שנוצר דרך DealSpace ייחשב כמסמך שנוצר על ידי המשתמש — לא על ידי DealSpace. DealSpace לא בחנה את המסמך, לא אישרה את תקינותו המשפטית, ואינה ערבה לאכיפתו בפני כל ערכאה שיפוטית או מנהלית.',
      'המשתמש מחויב, ובמיוחד לפני חתימה על הסכמים מסחריים מהותיים, להתייעץ עם עורך דין מוסמך הבקיא בדיני החוזים, דיני העבודה, דיני הצרכנות, ובדיני המס הרלוונטיים לתחום עיסוקו. DealSpace לא תישא בכל אחריות לנזקים הנובעים מהסתמכות על תוכן משפטי שנוצר בפלטפורמה ללא בדיקה מקצועית עצמאית.',
    ],
    body_en: [
      'This declaration is among the most important in this Agreement. Please read it carefully.',
      'DealSpace provides contract templates, agreement frameworks, and business-legal text components as a starting point only for use by business owners. DealSpace is not a law firm, does not provide legal advice of any kind, and the legal content offered on the platform should not be treated as a substitute for advice from a qualified attorney.',
      'Any agreement, contract, proposal, or document created through DealSpace shall be considered a document created by the User — not by DealSpace. DealSpace has not reviewed the document, has not approved its legal validity, and does not guarantee its enforceability before any judicial or administrative body.',
      'The User is obligated, and especially before signing material commercial agreements, to consult with a qualified attorney well-versed in contract law, labor law, consumer law, and tax laws relevant to their field of business. DealSpace will not bear any liability for damages arising from reliance on legal content created on the platform without independent professional review.',
    ],
  },
  {
    num: '6',
    title_he: 'חתימה אלקטרונית ותוקפה המשפטי',
    title_en: 'Electronic Signature & Legal Validity',
    body_he: [
      'חתימות אלקטרוניות הנאספות דרך הפלטפורמה של DealSpace כפופות לחוק חתימה אלקטרונית, התשס"א-2001 ("החוק"), ולכל תקנה שתחוקק מכוחו. המשתמש מאשר כי הוא מכיר ומבין את הוראות החוק הנוגעות לתוקפה המחייב של החתימה האלקטרונית.',
      'DealSpace משמשת כמתווכת טכנולוגית בלבד ואינה צד להסכמים, לחוזים, ולהתחייבויות הנחתמים דרך הפלטפורמה. ההסכם המחייב הינו בין היוצר (בעל העסק) לבין הלקוח (החותם) — DealSpace אינה אחראית לקיום, לאכיפה, לפרשנות, ולמחלוקות הנוגעות להסכמים אלו.',
      'כל אירוע חתימה אלקטרוני נרשם עם: (א) חותמת זמן מדויקת; (ב) כתובת ה-IP של הלקוח; (ג) ה-User-Agent של הדפדפן; (ד) תמונת החתימה הגרפית. נתונים אלו מהווים ראיה טכנית לאירוע החתימה ונשמרים לצד מסמך ה-PDF החתום. עם זאת, DealSpace אינה ערבה לאמינות זהות החותם ואינה מספקת שירות אימות זהות.',
      'המשתמש נושא בבלעדיות באחריות לוודא כי הלקוח שחתם על ההסכם הוא אכן האדם המוסמך לעשות כן, וכי החתימה נאספה בהסכמה חופשית וללא כפייה.',
    ],
    body_en: [
      'Electronic signatures collected through the DealSpace platform are subject to the Electronic Signature Law, 5761-2001 ("the Law"), and any regulations enacted thereunder. The User confirms that they know and understand the provisions of the Law regarding the binding validity of the electronic signature.',
      'DealSpace serves solely as a technology intermediary and is not a party to agreements, contracts, and obligations signed through the platform. The binding agreement is between the Creator (business owner) and the Client (signatory) — DealSpace is not responsible for the performance, enforcement, interpretation, or disputes relating to such agreements.',
      'Each electronic signature event is recorded with: (a) precise timestamp; (b) client IP address; (c) browser User-Agent; (d) graphic signature image. This data constitutes technical evidence of the signing event and is stored alongside the signed PDF document. However, DealSpace does not guarantee the reliability of the signatory\'s identity and does not provide identity verification services.',
      'The User bears sole responsibility for verifying that the client who signed the agreement is indeed the person authorized to do so, and that the signature was obtained with free consent and without coercion.',
    ],
  },
  {
    num: '7',
    title_he: 'מנויים, תשלומים וביטולים',
    title_en: 'Subscriptions, Payments & Cancellations',
    body_he: [
      'השירות מוצע במסגרת תוכניות מנוי חודשיות ושנתיות, אשר פרטיהן מפורסמים בדף התמחור בפלטפורמה. DealSpace שומרת לעצמה את הזכות לשנות את מחירי המנוי בכפוף להודעה מוקדמת של 30 יום.',
      'החיוב מתבצע מראש ביום תחילת כל תקופת מנוי. במנוי שנתי, החיוב מתבצע בתשלום אחד עבור שנה מלאה. DealSpace לא מאחסנת פרטי כרטיס אשראי — כל עסקאות התשלום מעובדות על ידי ספק תשלומים חיצוני מאושר.',
      'ביטול מנוי: ניתן לבטל בכל עת דרך הגדרות החשבון. הביטול ייכנס לתוקף בתום תקופת החיוב הנוכחית בלבד — לא ניתן לקבל זיכוי חלקי על תקופה שנרכשה ולא מומשה. אחרי הביטול, הגישה לפלטפורמה תישמר עד לתום התקופה ששולמה.',
      'החזרים כספיים: לא ניתנים החזרים על תקופות מנוי ששולמו, אלא במקרים המנויים מפורשות בחוק הגנת הצרכן, התשמ"א-1981, ובתנאי שניתנה הודעת ביטול בכתב תוך 14 ימים מיום הרכישה הראשונה (לגבי מנוי ראשוני בלבד). פנייה לבקשת החזר: billing@dealspace.app.',
    ],
    body_en: [
      'The Service is offered under monthly and annual subscription plans, the details of which are published on the platform\'s pricing page. DealSpace reserves the right to change subscription prices subject to 30 days\' prior notice.',
      'Billing occurs in advance on the first day of each subscription period. For annual subscriptions, billing occurs in a single payment for a full year. DealSpace does not store credit card details — all payment transactions are processed by an approved external payment provider.',
      'Cancellation: You may cancel at any time through account settings. Cancellation takes effect at the end of the current billing period only — partial credits for purchased but unused periods are not available. After cancellation, platform access is maintained until the end of the paid period.',
      'Refunds: Refunds are not provided for paid subscription periods, except in cases expressly enumerated in the Consumer Protection Law, 5741-1981, provided that written cancellation notice was given within 14 days of the first purchase date (for initial subscriptions only). Contact for refund requests: billing@dealspace.app.',
    ],
  },
  {
    num: '8',
    title_he: 'הגבלת אחריות',
    title_en: 'Limitation of Liability',
    body_he: [
      'הפלטפורמה מסופקת "כפי שהיא" (AS-IS) ו"כפי שהיא זמינה" (AS-AVAILABLE), ללא כל אחריות מכל סוג שהוא, מפורשת או משתמעת, לרבות ואחריות לסחירות, התאמה למטרה מסוימת, אי-הפרה, דיוק, שלמות, זמינות, אמינות, בטיחות, או רציפות של השירות.',
      'DealSpace לא תישא בכל אחריות — בין אם בעוולה, חוזה, אחריות מוחלטת, או כל תאוריה משפטית אחרת — לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים, עונשיים, או לאובדן רווחים ממוניים, אובדן פוטנציאל עסקי, אובדן נתונים, פגיעה במוניטין, אובדן לקוחות, או כל נזק כלכלי אחר, גם אם DealSpace הוזהרה לגבי אפשרות נזקים כאלה.',
      'האחריות המצטברת המרבית של DealSpace כלפי כל משתמש, בגין כל סיבה שהיא ותחת כל תאוריה משפטית, לא תעלה בשום מקרה על הסכום הכולל ששולם בפועל על ידי המשתמש ל-DealSpace במהלך שלושת (3) חודשי המנוי שקדמו ישירות לאירוע שגרם לנזק הנטען.',
      'מדינות מסוימות אינן מאפשרות הגבלה של נזקים תוצאתיים — במקרה כזה ייתכן שחלק מהגבלות לעיל לא יחולו עליך. במקרה כזה, אחריות DealSpace תוגבל למידה המרבית המותרת על פי הדין החל.',
    ],
    body_en: [
      'The platform is provided "AS-IS" and "AS-AVAILABLE", without warranty of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, completeness, availability, reliability, safety, or continuity of the Service.',
      'DealSpace will not be liable — whether in tort, contract, strict liability, or any other legal theory — for indirect, incidental, special, consequential, punitive, or exemplary damages, or for loss of profits, business opportunity, data, reputation, customers, or any other economic damages, even if DealSpace was warned of the possibility of such damages.',
      'DealSpace\'s maximum cumulative liability to any user, for any reason and under any legal theory, shall in no event exceed the total amount actually paid by the User to DealSpace during the three (3) subscription months directly preceding the event that caused the alleged damage.',
      'Some jurisdictions do not allow limitation of consequential damages — in such cases some of the above limitations may not apply to you. In that case, DealSpace\'s liability will be limited to the maximum extent permitted by applicable law.',
    ],
  },
  {
    num: '9',
    title_he: 'שמירת נתונים ואחריות הגיבוי',
    title_en: 'Data Retention & Backup Responsibility',
    body_he: [
      'DealSpace אינה שירות גיבוי ואינה אחראית לאובדן נתונים. על המשתמש לשמור עותקים מקומיים של כל הסכם, חוזה, והצעת מחיר חתומה. כל הסכם שנחתם מייצר PDF להורדה — על המשתמש להוריד ולשמור מסמך זה ללא דיחוי.',
      'תקופות שמירה: נתוני חשבון פעיל נשמרים לאורך כל תקופת המנוי. לאחר ביטול המנוי, נשמרים הנתונים למשך 90 יום קלנדריים, לאחריהם נמחקים באופן בלתי הפיך. לא ניתן לשחזר נתונים שנמחקו לאחר תקופה זו.',
      'DealSpace מבצעת גיבויים תשתיתיים פנימיים לצרכי המשכיות עסקית בלבד ואינה מספקת שירות שחזור נתונים פרטניים למשתמשים. אי-הורדת PDF חתום בעת חתימה, או אי-ייצוא נתונים לפני ביטול המנוי, הינה אחריותו הבלעדית של המשתמש.',
    ],
    body_en: [
      'DealSpace is not a backup service and is not responsible for data loss. The User must maintain local copies of all signed agreements, contracts, and proposals. Each signed agreement generates a downloadable PDF — the User must download and save this document without delay.',
      'Retention periods: Active account data is retained for the duration of the subscription period. After subscription cancellation, data is retained for 90 calendar days, after which it is permanently and irreversibly deleted. Data deleted after this period cannot be recovered.',
      'DealSpace performs internal infrastructure backups for business continuity purposes only and does not provide individual data recovery services to users. Failure to download a signed PDF at the time of signing, or failure to export data before subscription cancellation, is the User\'s sole responsibility.',
    ],
  },
  {
    num: '10',
    title_he: 'קניין רוחני',
    title_en: 'Intellectual Property',
    body_he: [
      'כל זכויות הקניין הרוחני בפלטפורמה — לרבות, אך לא רק: קוד המקור, קוד הביצוע, אדריכלות המערכת, עיצוב ממשק המשתמש, לוגו, שמות מסחריים, סימני מסחר, תמונות, טקסטים, אנימציות, API, ומסדי נתונים — הינן רכושה הבלעדי של DealSpace Technologies Ltd. ומוגנות על פי חוקי זכויות יוצרים ישראליים ובינלאומיים.',
      'תוכן המשתמש שייך למשתמש. DealSpace אינה טוענת לזכויות קניין רוחני בתוכן שמועלה על ידי המשתמשים (הצעות מחיר, חוזים, לוגואים של לקוחות). עם זאת, בעצם העלאת תוכן לפלטפורמה, המשתמש מעניק ל-DealSpace רישיון מוגבל, לא-בלעדי, לאחסן, לעבד, לצג, ולשדר תוכן זה אך ורק לצורך אספקת השירות.',
      'חל איסור מפורש על: העתקה, שכפול, פירוק, הנדסה הפוכה, מכירה, השכרה, העברה, עיבוד, או יצירת עבודות נגזרות מכל חלק של הפלטפורמה ללא רישיון מפורש ובכתב מ-DealSpace.',
    ],
    body_en: [
      'All intellectual property rights in the platform — including but not limited to: source code, executable code, system architecture, user interface design, logo, trade names, trademarks, images, texts, animations, API, and databases — are the exclusive property of DealSpace Technologies Ltd. and are protected under Israeli and international copyright laws.',
      'User Content belongs to the User. DealSpace does not claim intellectual property rights in content uploaded by users (proposals, contracts, client logos). However, by uploading content to the platform, the User grants DealSpace a limited, non-exclusive license to store, process, display, and transmit such content solely for the purpose of providing the Service.',
      'The following are expressly prohibited: copying, duplicating, disassembling, reverse-engineering, selling, renting, transferring, processing, or creating derivative works from any part of the platform without an explicit written license from DealSpace.',
    ],
  },
  {
    num: '11',
    title_he: 'שיפוי',
    title_en: 'Indemnification',
    body_he: [
      'המשתמש ("המשפה") מסכים לשפות, להגן על, ולהחזיק בלא נזק את DealSpace, מנהליה, עובדיה, קבלניה, שותפיה, ובעלי מניותיה ("המשופות") מפני כל תביעה, דרישה, הליך משפטי, נזק, הפסד, חבות, עלות, ו/או הוצאות (לרבות שכר טרחת עורכי דין סביר) שהוגשו על ידי צדדים שלישיים ונובעים מ:',
      '(א) תוכן המשתמש שנוצר, פורסם, שותף, או הופץ דרך הפלטפורמה; (ב) הפרת הסכם זה על ידי המשתמש; (ג) הפרת זכויות של צד שלישי, לרבות זכויות קניין רוחני, פרטיות, או חוזה, על ידי המשתמש; (ד) מחלוקות בין המשתמש לבין לקוחותיו בגין הצעות מחיר, חוזים, אספקת שירותים, מחירים, או כל נושא עסקי אחר; (ה) כל מצג כוזב שנעשה על ידי המשתמש בהצעות שיצר.',
      'DealSpace שומרת לעצמה את הזכות, על חשבונה, לקחת על עצמה את ההגנה הבלעדית על כל עניין הכפוף לשיפוי, ובמקרה כזה המשתמש מסכים לשתף פעולה עם הגנת DealSpace.',
    ],
    body_en: [
      'The User ("Indemnifying Party") agrees to indemnify, defend, and hold harmless DealSpace, its directors, employees, contractors, partners, and shareholders ("Indemnified Parties") from any claim, demand, legal proceeding, damage, loss, liability, cost, and/or expense (including reasonable attorney\'s fees) brought by third parties arising from:',
      '(a) User Content created, published, shared, or distributed through the platform; (b) the User\'s breach of this Agreement; (c) the User\'s infringement of third-party rights, including intellectual property, privacy, or contractual rights; (d) disputes between the User and their clients regarding proposals, contracts, service delivery, prices, or any other business matter; (e) any false representation made by the User in proposals they created.',
      'DealSpace reserves the right, at its own expense, to assume sole defense of any matter subject to indemnification, in which case the User agrees to cooperate with DealSpace\'s defense.',
    ],
  },
  {
    num: '12',
    title_he: 'סיום, שינויים בשירות, דין חל וסמכות שיפוט',
    title_en: 'Termination, Service Changes, Governing Law & Jurisdiction',
    body_he: [
      'DealSpace רשאית לסיים, להשעות, לצמצם, או לשנות את השירות בכל עת, לרבות מחיקת חשבון שהפר את תנאי השירות, ביצע פעילות הונאה, גרם נזק לפלטפורמה, פגע בצד שלישי, או לא שילם את דמי המנוי. עם סיום החשבון, הגישה לפלטפורמה תיחסם לאלתר.',
      'שינויים בתנאים: DealSpace שומרת לעצמה את הזכות לעדכן הסכם זה בכל עת. שינויים מהותיים יפורסמו באתר ויישלח עליהם עדכון דוא"ל 14 יום לפני כניסתם לתוקף. המשך השימוש בשירות לאחר כניסת השינויים לתוקף מהווה הסכמה לתנאים המעודכנים.',
      'דין חל: הסכם זה, וכל מחלוקת הנוגעת לו, כפופים לדיני מדינת ישראל, ללא קשר לכללי ברירת הדין. תחולת אמנת האומות המאוחדות על חוזי מכר בינלאומי של טובין ("CISG") שוללת בזאת במפורש.',
      'סמכות שיפוט: כל תביעה, סכסוך, ומחלוקת הנוגעים להסכם זה, לשירות, ולכל יחס בין הצדדים יובאו לפני בית המשפט המוסמך במחוז תל אביב-יפו בלבד, ולשני הצדדים לא תהיה טענת חוסר סמכות. הצדדים מסכימים לנסות ולפתור כל מחלוקת בגישור מוסכם לפני פנייה לבית המשפט.',
    ],
    body_en: [
      'DealSpace may terminate, suspend, reduce, or modify the Service at any time, including deleting accounts that violated the Terms, engaged in fraudulent activity, damaged the platform, harmed a third party, or failed to pay subscription fees. Upon account termination, platform access will be blocked immediately.',
      'Changes to Terms: DealSpace reserves the right to update this Agreement at any time. Material changes will be published on the website and an email update will be sent 14 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated terms.',
      'Governing Law: This Agreement, and any dispute related to it, is subject to the laws of the State of Israel, regardless of conflict of law rules. The application of the United Nations Convention on Contracts for the International Sale of Goods ("CISG") is hereby expressly excluded.',
      'Jurisdiction: All claims, disputes, and controversies relating to this Agreement, the Service, and any relationship between the parties shall be brought before the competent court in the Tel Aviv-Jaffa district only, and neither party shall have a claim of lack of jurisdiction. The parties agree to attempt to resolve any dispute through agreed mediation before approaching the court.',
    ],
  },
]

// ─── TermsOfService ────────────────────────────────────────────────────────────

export default function TermsOfService() {
  const navigate = useNavigate()
  const { locale } = useI18n()
  const isHe = locale === 'he'

  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  return (
    <div
      className="relative min-h-dvh flex flex-col bg-[#05050A] text-[#f0f0f8]"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <style>{`
        @keyframes tos-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 320,
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, transparent 70%)',
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
            { path: '/terms',   label_he: 'תנאי שירות', label_en: 'Terms',   active: true },
            { path: '/privacy', label_he: 'פרטיות',     label_en: 'Privacy', active: false },
            { path: '/security',label_he: 'אבטחה',      label_en: 'Security',active: false },
          ]).map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path, { replace: true })}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: tab.active ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: tab.active ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
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
        <div className="mb-12 text-center" style={{ animation: 'tos-fade-up 0.45s ease-out both' }}>
          <div
            className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <FileText size={20} style={{ color: '#818cf8' }} />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {isHe ? 'תנאי שירות' : 'Terms of Service'}
          </h1>
          <p className="text-sm text-white/40 mb-1">
            {isHe
              ? 'בבקשה קרא בעיון לפני השימוש בפלטפורמה'
              : 'Please read carefully before using the platform'}
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
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc',
                  }}
                >
                  {clause.num}
                </div>
                <h2
                  className="text-[15px] font-bold leading-tight"
                  style={{ color: '#c4b5fd' }}
                >
                  {isHe ? clause.title_he : clause.title_en}
                </h2>
              </div>

              {/* Body paragraphs */}
              <div className="space-y-3">
                {(isHe ? clause.body_he : clause.body_en).map((para, j) => (
                  <p
                    key={j}
                    className="text-[13.5px] leading-relaxed text-white/55"
                    style={{ fontWeight: j === 0 && clause.num === '5' ? 600 : 400 }}
                  >
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
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <Shield size={13} className="text-indigo-400 flex-none" />
            <span className="text-xs font-medium text-white/45">
              {isHe
                ? 'שאלות משפטיות? פנה אלינו בכתובת legal@dealspace.app'
                : 'Legal questions? Contact us at legal@dealspace.app'}
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Lock size={13} style={{ color: 'rgba(255,255,255,0.3)' }} className="flex-none" />
            <span className="text-xs font-medium text-white/35">
              {isHe ? 'כפוף לדיני מדינת ישראל | סמכות שיפוט: תל אביב-יפו' : 'Governed by Israeli Law | Jurisdiction: Tel Aviv-Jaffa'}
            </span>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}

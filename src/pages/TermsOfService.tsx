import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Shield, Lock } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlobalFooter } from '../components/ui/GlobalFooter'

// ─── Legal Prose Styles ────────────────────────────────────────────────────────

const CARD_CLS = 'bg-white border border-slate-200 shadow-sm rounded-[1.25rem] dark:bg-gradient-to-br dark:from-white/[0.038] dark:to-white/[0.012] dark:border-white/[0.07] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'

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
    title_he: 'מבוא וקבלת התנאים',
    title_en: 'Introduction & Acceptance of Terms',
    body_he: [
      'ברוכים הבאים ל-DealSpace. הסכם תנאי שירות זה ("ההסכם" או "התנאים") מסדיר את היחסים המשפטיים בינך ("משתמש", "מנוי", "יוצר") לבין DealSpace Technologies Ltd. ("DealSpace", "אנו", "החברה") — חברה המפעילה פלטפורמה טכנולוגית ליצירת הצעות מחיר אינטראקטיביות, ניהול מסמכים דיגיטליים ואיסוף חתימות אלקטרוניות.',
      'השימוש בפלטפורמה — לרבות גלישה, הרשמה, יצירת חשבון, יצירת הצעת מחיר, שיתוף קישורים עם לקוחות, או כל פעולה אחרת בשירות — מהווה הסכמה מלאה, בלתי מסויגת ומחייבת לתנאים אלו. אם אינך מסכים לכל אחד מהתנאים המפורטים להלן, הינך מחויב להפסיק את השימוש בשירות לאלתר.',
      'גיל מינימלי: השירות מיועד לבגירים בני 18 שנה ומעלה בלבד. שימוש על ידי קטין מהווה הפרה מהותית של הסכם זה, ו-DealSpace תהיה רשאית לסגור את החשבון הנוגע בדבר ללא הודעה מוקדמת.',
    ],
    body_en: [
      'Welcome to DealSpace. This Terms of Service Agreement ("Agreement" or "Terms") governs the legal relationship between you ("User", "Subscriber", "Creator") and DealSpace Technologies Ltd. ("DealSpace", "we", "Company") — a company operating a technology platform for interactive proposal creation, digital document management, and electronic signature collection.',
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
      '"יוצר" — משתמש רשום המשתמש בפלטפורמה ליצירת הצעות מחיר ושליחתן ללקוחות. היוצר הוא הצד האחראי הבלעדי לתוכן, למחירים, לתנאי ההתקשרות ולתנאי העסק הגלובליים הכלולים בהצעה.',
      '"לקוח" — אדם או ישות שהיוצר שיתף איתם קישור לחדר עסקאות. הלקוח ניגש לפלטפורמה ללא צורך בחשבון רשום.',
      '"חדר עסקאות" — ממשק דיגיטלי ציבורי המיוצר עבור כל הצעת מחיר, המאפשר ללקוח לצפות בהצעה, לבחור תוספות ולחתום עליה אלקטרונית.',
      '"חתימה אלקטרונית" — ייצוג גרפי של הסכמה שנאסף דרך ממשק הקנבס של DealSpace, המאוחסן כתמונת PNG ומוטבע ב-PDF החתום יחד עם נתוני ביקורת פורנזיים (IP, User Agent, חותמת זמן) לפי חוק חתימה אלקטרונית, התשס"א-2001.',
      '"תוכן משתמש" — כל מידע, תמונות, מחירים, תנאי חוזה, תיאורי שירות, נתוני לקוחות ותנאי עסק גלובליים שמזין המשתמש לפלטפורמה.',
      '"AI Ghostwriter" — כלי כתיבה מבוסס בינה מלאכותית המוטמע בפלטפורמה ומייצר הצעות טקסט לתיאורי פרויקטים. הפלט הוא הצעה בלבד ואינו מהווה ייעוץ משפטי, פיננסי, או עסקי מטעם DealSpace.',
    ],
    body_en: [
      '"Platform" / "Service" — The totality of tools, interfaces, APIs, components, and cloud infrastructure provided by DealSpace at dealspace.app and any subdomains thereof.',
      '"Creator" — A registered user who uses the platform to create proposals and send them to clients. The Creator is the sole party responsible for the content, pricing, contractual terms, and Global Business Terms contained in the proposal.',
      '"Client" — A person or entity with whom the Creator has shared a deal room link. The Client accesses the platform without requiring a registered account.',
      '"Deal Room" — A public digital interface generated for each proposal, allowing the client to view the proposal, select add-ons, and electronically sign it.',
      '"Electronic Signature" — A graphical representation of consent collected through DealSpace\'s canvas interface, stored as a PNG image and embedded in the signed PDF alongside forensic audit data (IP address, User Agent, timestamp) pursuant to the Israeli Electronic Signature Law, 5761-2001.',
      '"User Content" — All information, images, prices, contract terms, service descriptions, client data, and Global Business Terms entered by the User into the platform.',
      '"AI Ghostwriter" — An artificial intelligence writing tool embedded in the platform that generates text suggestions for project descriptions. The output is a suggestion only and does not constitute legal, financial, or business advice from DealSpace.',
    ],
  },
  {
    num: '3',
    title_he: 'DealSpace כפלטפורמה טכנולוגית — לא צד לחוזה',
    title_en: 'DealSpace as Technology Platform — Not a Party to Any Contract',
    body_he: [
      'DealSpace מספקת פלטפורמה טכנולוגית בלבד — כלי לניהול הצעות מחיר, חתימות אלקטרוניות ותיעוד עסקי. DealSpace אינה צד לשום הסכם, חוזה, עסקה, או התקשרות הנחתמת בין היוצר לבין הלקוח שלו דרך הפלטפורמה. DealSpace היא "מוביל טכנולוגי" (Technology Conduit) ולא שותפה, ערבה, ממליצה, או מאמתת של כל תוכן עסקי.',
      'היוצר הוא הצד האחראי הבלעדי לכל תוכן שהוא מפרסם, לרבות: (א) מחירים ותנאי תשלום; (ב) תיאורי שירותים ומפרטים; (ג) תנאי ההתקשרות הגלובליים שהוא מצרף לכל הצעה; (ד) ציות לכלל החוקים החלים, לרבות חוק הגנת הצרכן, חוק הרוכלות, חוקי עבודה ומיסוי, חוק הסכמים אחידים; (ה) כל ייצוג, הבטחה, אחריות, מצג, או התחייבות שנכלל בהצעה.',
      'DealSpace אינה בודקת, אינה מאמתת, ואינה ערבה לכשרות המשפטית, לדיוק, לשלמות, לאמיתות, או לאכיפות של כל תוכן שיוצרים מפרסמים על הפלטפורמה, לרבות תנאי עסק גלובליים. DealSpace לא תישא בכל אחריות בגין סכסוך שינבע מהסכם בין יוצר ללקוח.',
    ],
    body_en: [
      'DealSpace provides a technology platform only — a tool for proposal management, electronic signatures, and business documentation. DealSpace is not a party to any agreement, contract, transaction, or arrangement executed between the Creator and their Client through the platform. DealSpace is a "Technology Conduit" and not a partner, guarantor, endorser, or validator of any business content.',
      'The Creator is solely and exclusively responsible for all content they publish, including: (a) pricing and payment terms; (b) service descriptions and specifications; (c) Global Business Terms attached to each proposal; (d) compliance with all applicable laws, including consumer protection law, solicitation law, labor and tax laws, and standard contract laws; (e) any representation, promise, warranty, statement, or commitment included in the proposal.',
      'DealSpace does not review, validate, or guarantee the legal validity, accuracy, completeness, truthfulness, or enforceability of any content published by Creators on the platform, including Global Business Terms. DealSpace shall bear no responsibility for any dispute arising from an agreement between a Creator and a Client.',
    ],
  },
  {
    num: '4',
    title_he: 'חשבון משתמש ואבטחה',
    title_en: 'User Account & Security',
    body_he: [
      'לצורך שימוש בפלטפורמה, עליך ליצור חשבון עם פרטי זיהוי תקינים ואמיתיים. המשתמש אחראי לשמירת סודיות פרטי הגישה לחשבונו (שם משתמש, סיסמה, קודי גישה). יש להודיע ל-DealSpace מיידית על כל שימוש בלתי מורשה בחשבונך בכתובת security@dealspace.app.',
      'DealSpace לא תישא בכל אחריות לנזקים הנגרמים מגישה בלתי מורשית לחשבון שנגרמה עקב: (א) גילוי פרטי הגישה על ידי המשתמש לצדדים שלישיים; (ב) שימוש בסיסמה חלשה; (ג) שימוש ברשת לא מאובטחת; (ד) אי-שימוש במנגנוני אימות רב-שלבי הזמינים; (ה) כל מחדל אחר של המשתמש.',
      'DealSpace שומרת לעצמה את הזכות להשעות, להגביל, או לסגור חשבון שבו זוהתה פעילות חשודה, הפרת תנאי שימוש, פעילות הונאה, ניסיון פריצה, שימוש לרעה בפלטפורמה, או פעילות שעלולה לסכן משתמשים אחרים.',
    ],
    body_en: [
      'To use the platform, you must create an account with valid and truthful identification details. The User is responsible for maintaining the confidentiality of their account access credentials (username, password, access codes). You must immediately notify DealSpace of any unauthorized use of your account at security@dealspace.app.',
      'DealSpace shall not be liable for any damages resulting from unauthorized account access caused by: (a) disclosure of access credentials by the User to third parties; (b) use of a weak password; (c) use of an unsecured network; (d) failure to use available multi-factor authentication mechanisms; (e) any other User negligence.',
      'DealSpace reserves the right to suspend, restrict, or close any account in which suspicious activity, terms violation, fraud, hacking attempt, platform abuse, or activity endangering other users has been identified.',
    ],
  },
  {
    num: '5',
    title_he: 'חתימה אלקטרונית — תוקף משפטי לפי חוק',
    title_en: 'Electronic Signature — Legal Validity under Israeli Law',
    body_he: [
      'חתימות אלקטרוניות שנאספות דרך DealSpace כפופות לחוק חתימה אלקטרונית, התשס"א-2001 (להלן: "חוק החתימה"). בהתאם לחוק, חתימה אלקטרונית שנאספה במתכונת הפלטפורמה מהווה הסכמה מחייבת בין הצדדים לה. DealSpace משמשת כמתווך טכנולוגי בלבד ואינה צד לשום הסכם החתום דרכה.',
      'כל אירוע חתימה מתועד באמצעות שרשרת ראיות אלקטרונית בלתי ניתנת לשינוי, הכוללת: (א) תמונת החתימה הגרפית בפורמט PNG; (ב) חותמת זמן מדויקת (UTC) של מעמד החתימה; (ג) כתובת ה-IP של החותם; (ד) User Agent מלא (דפדפן, גרסה, מערכת הפעלה, מכשיר) של החותם; (ה) שם מלא, שם חברה, וח.פ/ת.ז של החותם שנמסרו בעת חתימה; (ו) מזהה ייחודי (Token) של המסמך החתום. כל הנתונים מוטבעים ב-PDF החתום ומשמשים ראיה לאמיתות החתימה.',
      'DealSpace אינה מייעצת בנוגע לכשרותה המשפטית של חתימה אלקטרונית לשימושים ספציפיים (כגון: עסקאות מקרקעין, צוואות, ייפוי כוח נוטריוני, מסמכים הדורשים עדים). באחריות היוצר לוודא שהשימוש בחתימה אלקטרונית לצורכיו הספציפיים עולה בקנה אחד עם כל הדרישות החוקיות הרלוונטיות.',
    ],
    body_en: [
      'Electronic signatures collected through DealSpace are subject to the Israeli Electronic Signature Law, 5761-2001 (the "Signature Law"). Pursuant to this law, an electronic signature collected via the platform constitutes a binding agreement between the signing parties. DealSpace serves solely as a technological intermediary and is not a party to any agreement signed through it.',
      'Each signing event is documented through an immutable electronic evidence chain, including: (a) the graphical signature image in PNG format; (b) an exact timestamp (UTC) of the signing event; (c) the signer\'s IP address; (d) the signer\'s full User Agent (browser, version, operating system, device); (e) the signer\'s full name, company name, and tax ID provided at signing; (f) a unique Token identifier of the signed document. All data is embedded in the signed PDF and serves as evidence of signature authenticity.',
      'DealSpace does not advise on the legal validity of an electronic signature for specific uses (such as real estate transactions, wills, notarial powers of attorney, or documents requiring witnesses). It is the Creator\'s responsibility to verify that the use of an electronic signature for their specific purposes complies with all relevant legal requirements.',
    ],
  },
  {
    num: '6',
    title_he: 'תוכן משתמש ותנאי עסק גלובליים',
    title_en: 'User Content & Global Business Terms',
    body_he: [
      'היוצר מצהיר ומתחייב כי כל תוכן שהוא מפרסם דרך הפלטפורמה: (א) אינו מפר כל חוק חל; (ב) אינו מפר זכויות קניין רוחני של צד שלישי; (ג) אינו כולל תוכן מטעה, שקרי, מכפיש, פורנוגרפי, מסית, או פוגעני; (ד) הוא בסמכותו לפרסם; (ה) מציג מחירים נכונים ועדכניים.',
      'תנאי עסק גלובליים — DealSpace מאפשרת ליוצרים לנסח תנאי התקשרות גלובליים ("תנאי עסק") ולצרפם לכל הצעת מחיר שישלחו. תנאים אלו נחתמים על ידי לקוח היוצר, וכל ההסכמה שנוצרת היא בין היוצר ללקוח בלבד. DealSpace אינה צד להסכמה זו, אינה מאמתת את תוכן התנאים, ואינה נושאת בכל אחריות משפטית, חוזית, או צרכנית בגינם.',
      'DealSpace שומרת לעצמה את הזכות להסיר כל תוכן שמפר תנאי שימוש אלו, ובמקרה קיצוני — לסגור את חשבון המשתמש. הסרת תוכן לא תקנה למשתמש כל זכות לפיצוי.',
    ],
    body_en: [
      'The Creator represents and warrants that all content they publish through the platform: (a) does not violate any applicable law; (b) does not infringe any third-party intellectual property rights; (c) does not contain misleading, false, defamatory, pornographic, inciting, or offensive content; (d) they have the authority to publish; (e) presents accurate and current pricing.',
      'Global Business Terms — DealSpace enables Creators to draft Global Business Terms ("Business Terms") and attach them to each proposal they send. These terms are signed by the Creator\'s Client, and any agreement formed is solely between the Creator and the Client. DealSpace is not a party to this agreement, does not validate the content of the terms, and bears no legal, contractual, or consumer liability in connection with them.',
      'DealSpace reserves the right to remove any content that violates these Terms of Service, and in extreme cases — to close the User\'s account. Content removal shall not entitle the User to any compensation.',
    ],
  },
  {
    num: '7',
    title_he: 'מנוי, תמחור ותשלומים',
    title_en: 'Subscription, Pricing & Payments',
    body_he: [
      'DealSpace מציעה תוכניות מנוי חודשיות בדרגות שונות (חינם, פרו, פרימיום), הנקובות בשקלים חדשים (₪) כולל מע"מ. המחיר הנקוב הוא המחיר הסופי — אין תוספות מסתורות. תמחור עדכני מפורסם בדף התמחור. DealSpace שומרת לעצמה את הזכות לשנות מחירים עם הודעה מוקדמת של 30 יום לפחות.',
      'עיבוד תשלומים: כל העסקאות הכספיות מעובדות באופן מאובטח על ידי Stripe, Inc. — ספק תשלומים בינלאומי מוביל. DealSpace אינה מאחסנת פרטי כרטיס אשראי, פרטי חשבון בנק, או כל מידע פיננסי רגיש. כל נתוני התשלום מוצפנים ומאובטחים לפי תקן PCI-DSS Level 1 בתשתית Stripe בלבד.',
      'המנוי מחויב מראש בתחילת כל תקופת חיוב. שדרוג תוכנית ייכנס לתוקף מיידי; שינמוך תוכנית ייכנס לתוקף בתחילת תקופת החיוב הבאה. לא ינתן פיצול חלקי עבור תקופה חלקית.',
    ],
    body_en: [
      'DealSpace offers monthly subscription plans at various tiers (Free, Pro, Premium), denominated in New Israeli Shekels (₪) inclusive of VAT. The stated price is the final price — no hidden additions. Current pricing is published on the pricing page. DealSpace reserves the right to change prices with at least 30 days\' advance notice.',
      'Payment processing: All financial transactions are processed securely by Stripe, Inc. — a leading international payment provider. DealSpace does not store credit card details, bank account details, or any sensitive financial information. All payment data is encrypted and secured to PCI-DSS Level 1 standard within Stripe\'s infrastructure only.',
      'Subscriptions are billed in advance at the start of each billing period. Plan upgrades take effect immediately; plan downgrades take effect at the start of the next billing period. No partial proration is provided for partial periods.',
    ],
  },
  {
    num: '8',
    title_he: 'ביטול מנוי וזכות החזרה',
    title_en: 'Subscription Cancellation & Refund Rights',
    body_he: [
      'המשתמש רשאי לבטל את מנויו בכל עת, באופן מיידי ועצמאי, דרך דף "חיוב ומנוי" בממשק DealSpace — ללא קנסות, ללא הסברים, וללא הליכים בירוקרטיים. הביטול ייכנס לתוקף בתום תקופת החיוב הנוכחית, ועד אז תישמר גישה מלאה לשירות.',
      'בהתאם לחוק הגנת הצרכן, התשמ"א-1981 (כפי שתוקן), ובפרט להוראות בדבר ביטול עסקאות שנרכשו דרך האינטרנט: (א) ניתן לבטל עסקה תוך 14 יום מיום ההתקשרות בתנאי שלא נעשה שימוש בשירות — ולקבל החזר מלא; (ב) לאחר שימוש בשירות, הביטול ייכנס לתוקף בתום תקופת החיוב ולא יינתן החזר כספי; (ג) זכויות הצרכן המנויות בחוק גוברות על כל תנאי הסכם זה.',
      'לביטול ייזום, חיוב שגוי, או כל פנייה בענייני חיוב: billing@dealspace.app. נענה תוך 3 ימי עסקים.',
    ],
    body_en: [
      'Users may cancel their subscription at any time, immediately and independently, through the "Billing & Subscription" page in the DealSpace interface — without penalties, without explanations, and without bureaucratic procedures. Cancellation takes effect at the end of the current billing period, during which full access to the Service is maintained.',
      'In accordance with the Consumer Protection Law, 5741-1981 (as amended), and in particular the provisions regarding cancellation of transactions purchased via the internet: (a) a transaction may be cancelled within 14 days of the transaction date provided the Service has not been used — for a full refund; (b) after Service use, cancellation takes effect at the end of the billing period and no refund will be issued; (c) consumer rights specified in applicable law prevail over any terms of this Agreement.',
      'For proactive cancellation, an erroneous charge, or any billing inquiry: billing@dealspace.app. We will respond within 3 business days.',
    ],
  },
  {
    num: '9',
    title_he: 'כלי כתיבת AI (Ghostwriter) — כתב ויתור מלא',
    title_en: 'AI Writing Tool (Ghostwriter) — Full Disclaimer',
    body_he: [
      'DealSpace מספקת כלי כתיבה מבוסס בינה מלאכותית ("AI Ghostwriter") המסייע ביצירת הצעות טקסט עבור תיאורי פרויקטים. חשוב מאוד להבין את מגבלות הכלי לפני השימוש בו בהקשר עסקי.',
      'הפלט של AI Ghostwriter הוא הצעת טקסט בלבד ואינו מהווה: (א) ייעוץ משפטי, פיננסי, חשבונאי, עסקי, או כל ייעוץ מקצועי מוסמך אחר; (ב) תוכן שעבר בדיקת עובדות, אימות, או ביקורת משפטית; (ג) ייצוג של עמדת DealSpace בנוגע לנושאים עסקיים או משפטיים; (ד) תחליף לייעוץ מעורך דין בכל הנוגע לניסוח חוזים, תנאי התקשרות, או מסמכים משפטיים מחייבים.',
      'היוצר אחראי באופן מלא ובלעדי לבחון, לערוך, לאשר, ולהיות בעל הבנה מלאה של כל תוכן שנוצר על ידי AI Ghostwriter לפני שיפרסמו ללקוחות. DealSpace לא תישא בכל אחריות לנזקים עסקיים, משפטיים, כספיים, מוניטיניים, או אחרים שינבעו מהסתמכות על תוכן שנוצר על ידי הבינה המלאכותית — בין אם פורסם כמות שהוא ובין אם לאחר עריכה.',
    ],
    body_en: [
      'DealSpace provides an artificial intelligence writing tool ("AI Ghostwriter") that assists in generating text suggestions for project descriptions. It is critically important to understand the tool\'s limitations before using it in a business context.',
      'The output of AI Ghostwriter is a text suggestion only and does not constitute: (a) legal, financial, accounting, business, or any other qualified professional advisory; (b) content that has undergone fact-checking, verification, or legal review; (c) a representation of DealSpace\'s position on any business or legal matters; (d) a substitute for legal counsel with respect to drafting contracts, engagement terms, or legally binding documents.',
      'The Creator is fully and exclusively responsible for reviewing, editing, approving, and having complete understanding of all content generated by AI Ghostwriter before publishing it to clients. DealSpace shall not be liable for any business, legal, financial, reputational, or other damages arising from reliance on AI-generated content — whether published as-is or after editing.',
    ],
  },
  {
    num: '10',
    title_he: 'הגבלת אחריות ופטור',
    title_en: 'Limitation of Liability & Disclaimer',
    body_he: [
      'השירות ניתן "כפי שהוא" (AS IS) וכ"כפי שזמין" (AS AVAILABLE), ללא כל אחריות מכל סוג שהוא, מפורשת או משתמעת, לרבות אחריות לסחירות, התאמה למטרה ספציפית, אי-הפרה, דיוק, שלמות, אמינות, זמינות, או חופשיות מוירוסים ורכיבים מזיקים.',
      'DealSpace לא תישא בכל אחריות לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים, או עונשיים, לרבות: אובדן רווחים, אובדן הכנסה, אובדן נתונים, פגיעה במוניטין, אובדן לקוחות, הפסד עסקי, עלויות גיוס לקוחות חלופיים — אף אם DealSpace הוזהרה מראש על אפשרות נזק כזה.',
      'אחריות מצטברת מקסימלית: אחריותה הכוללת של DealSpace כלפיך לא תעלה על הסכום הכולל ששילמת ל-DealSpace ב-12 החודשים שקדמו לאירוע המהווה עילת התביעה. אם לא שילמת כלל (חשבון חינמי), אחריות DealSpace מוגבלת ל-₪250.',
    ],
    body_en: [
      'The Service is provided "AS IS" and "AS AVAILABLE", without any warranty of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, completeness, reliability, availability, or freedom from viruses and harmful components.',
      'DealSpace shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including: loss of profits, loss of revenue, loss of data, reputational harm, loss of customers, business loss, costs of procuring substitute services — even if DealSpace was advised in advance of the possibility of such damages.',
      'Maximum cumulative liability: DealSpace\'s total liability to you shall not exceed the total amount you actually paid to DealSpace in the 12-month period preceding the event giving rise to the claim. If you paid nothing (free account), DealSpace\'s liability is limited to ₪250.',
    ],
  },
  {
    num: '11',
    title_he: 'קניין רוחני ורישיון שימוש',
    title_en: 'Intellectual Property & License',
    body_he: [
      'כל זכויות הקניין הרוחני בפלטפורמה — לרבות עיצוב הממשק, קוד המקור, אלגוריתמים, לוגו, סמלים, שמות מותגים, פטנטים (רשומים ובקשות תלויות), ידע קנייני וחדשנות פנימית — הם רכושה הבלעדי של DealSpace Technologies Ltd. ומוגנים בכלל חוקי הקניין הרוחני החלים.',
      'DealSpace מעניקה לך רישיון שימוש אישי, מוגבל, לא-בלעדי, שאינו ניתן להמחאה, שאינו ניתן להעברת רישיון משנה, לשימוש בשירות למטרות עסקיות לגיטימיות בלבד בהתאם לתנאי הסכם זה. אין בזה להעניק לך כל זכות בקניין הרוחני של DealSpace. אינך רשאי להעתיק, לפרוס, לבצע הנדסה לאחור, לתרגם, או להפיץ כל חלק מהפלטפורמה ללא הסכמה מפורשת בכתב.',
      'תוכן שנוצר על ידי המשתמש (הצעות מחיר, תנאי עסק, לוגו חברה) נשאר בבעלות המשתמש. המשתמש מעניק ל-DealSpace רישיון שימוש מוגבל, ללא תמלוגים, לשימוש בתוכן זה אך ורק לצורך אספקת השירות — לעיבוד, אחסון, ושיגור ההצעה.',
    ],
    body_en: [
      'All intellectual property rights in the platform — including interface design, source code, algorithms, logos, marks, brand names, patents (registered and pending applications), proprietary know-how, and internal innovation — are the exclusive property of DealSpace Technologies Ltd. and are protected by all applicable intellectual property laws.',
      'DealSpace grants you a personal, limited, non-exclusive, non-assignable, non-sublicensable license to use the Service for legitimate business purposes only in accordance with the terms of this Agreement. Nothing herein grants you any rights in DealSpace\'s intellectual property. You may not copy, deploy, reverse engineer, translate, or distribute any part of the platform without express written consent.',
      'Content created by the User (proposals, business terms, company logo) remains the property of the User. The User grants DealSpace a limited, royalty-free license to use this content solely for the purpose of providing the Service — to process, store, and deliver the proposal.',
    ],
  },
  {
    num: '12',
    title_he: 'שינויים בתנאים, דין חל וסמכות שיפוט',
    title_en: 'Amendments, Governing Law & Jurisdiction',
    body_he: [
      'שינויים בתנאים: DealSpace רשאית לעדכן הסכם זה מעת לעת. שינויים מהותיים — כגון שינוי מדיניות ביטול, הוספת מגבלות שימוש, שינוי מדיניות אחריות — יפורסמו באתר ויישלח עדכון דוא"ל לכל המשתמשים הפעילים לפחות 14 יום לפני כניסתם לתוקף. המשך השימוש בשירות לאחר מועד השינוי מהווה הסכמה לתנאים המעודכנים.',
      'דין חל: הסכם זה, וכל מחלוקת הנוגעת לו, כפופים לדיני מדינת ישראל בלבד, ללא קשר לכללי ברירת הדין. תחולת אמנת האומות המאוחדות על חוזי מכר בינלאומי של טובין ("CISG") שוללת בזאת במפורש.',
      'סמכות שיפוט: כל תביעה, סכסוך, ומחלוקת הנוגעים להסכם זה, לשירות, ולכל יחסים בין הצדדים יובאו לפני בית המשפט המוסמך במחוז תל אביב-יפו בלבד. שני הצדדים מוותרים בזאת על כל טענת חוסר סמכות מקומית. הצדדים מסכימים לנסות ולפתור כל מחלוקת בגישור מוסכם לפני פנייה לבית המשפט.',
    ],
    body_en: [
      'Amendments: DealSpace reserves the right to update this Agreement from time to time. Material changes — such as changes to the cancellation policy, addition of usage restrictions, or changes to the liability policy — will be published on the website and an email update will be sent to all active users at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance of the updated terms.',
      'Governing Law: This Agreement, and any dispute relating to it, is subject exclusively to the laws of the State of Israel, regardless of conflict of law rules. The application of the United Nations Convention on Contracts for the International Sale of Goods ("CISG") is hereby expressly excluded.',
      'Jurisdiction: All claims, disputes, and controversies relating to this Agreement, the Service, and any relationship between the parties shall be brought before the competent court in the Tel Aviv-Jaffa district only. Both parties hereby waive any claim of lack of local jurisdiction. The parties agree to attempt to resolve any dispute through agreed mediation before approaching the court.',
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
      className="relative min-h-dvh flex flex-col bg-slate-50 text-slate-900 dark:bg-[#05050A] dark:text-[#f0f0f8]"
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
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-white/40 transition hover:text-slate-700 dark:hover:text-white/80"
        >
          <ArrowRight size={14} className={isHe ? '' : 'rotate-180'} />
          {isHe ? 'חזרה' : 'Back'}
        </button>

        <div className="flex items-center gap-1 rounded-xl p-1 border border-slate-200 bg-white/80 dark:border-white/[0.07] dark:bg-white/[0.03]">
          {([
            { path: '/terms',    label_he: 'תנאי שירות', label_en: 'Terms',    active: true  },
            { path: '/privacy',  label_he: 'פרטיות',     label_en: 'Privacy',  active: false },
            { path: '/security', label_he: 'אבטחה',      label_en: 'Security', active: false },
          ]).map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path, { replace: true })}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tab.active ? 'bg-indigo-500/[0.18] text-indigo-500 dark:text-violet-300' : 'text-slate-400 dark:text-white/30'}`}
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
            className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3"
            style={{ letterSpacing: '-0.02em' }}
          >
            {isHe ? 'תנאי שירות' : 'Terms of Service'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/40 mb-1">
            {isHe
              ? 'בבקשה קרא בעיון לפני השימוש בפלטפורמה'
              : 'Please read carefully before using the platform'}
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
                    className="text-[13.5px] leading-relaxed text-slate-600 dark:text-white/55"
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
            <span className="text-xs font-medium text-slate-600 dark:text-white/45">
              {isHe
                ? 'שאלות משפטיות? פנה אלינו בכתובת legal@dealspace.app'
                : 'Legal questions? Contact us at legal@dealspace.app'}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white border border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.07]">
            <Lock size={13} className="text-slate-400 dark:text-white/30 flex-none" />
            <span className="text-xs font-medium text-slate-500 dark:text-white/35">
              {isHe ? 'כפוף לדיני מדינת ישראל | סמכות שיפוט: תל אביב-יפו' : 'Governed by Israeli Law | Jurisdiction: Tel Aviv-Jaffa'}
            </span>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}

// ─── Knowledge Base — DealSpace Help Center ────────────────────────────────────
// 38 bilingual B2B Q&A pairs across 5 categories.
// Used by HelpCenterDrawer; extracted here so the component stays lean.
// Sprint 48.5 — Full accuracy pass: dead features removed, quotas corrected,
// VAT model fixed, new features documented.

export interface KBItem {
  category: string
  q_he: string
  q_en: string
  a_he: string
  a_en: string
}

export const KB_CATEGORIES = [
  { key: 'getting_started',    label_he: 'התחלה מהירה',    label_en: 'Getting Started',        color: '#818cf8' },
  { key: 'creating_proposals', label_he: 'בניית הצעות',    label_en: 'Building Proposals',      color: '#a78bfa' },
  { key: 'sending_tracking',   label_he: 'שליחה ומעקב',    label_en: 'Sending & Tracking',      color: '#fbbf24' },
  { key: 'legal_terms',        label_he: 'משפטי ותנאים',   label_en: 'Legal & Terms',            color: '#34d399' },
  { key: 'settings_billing',   label_he: 'הגדרות וחיוב',   label_en: 'Settings & Billing',      color: '#f87171' },
]

export const KNOWLEDGE_BASE: KBItem[] = [

  // ── Getting Started ────────────────────────────────────────────────────────

  {
    category: 'getting_started',
    q_he: 'מה זה DealSpace ואיך זה עוזר לי?',
    q_en: 'What is DealSpace and how does it help me?',
    a_he: 'DealSpace היא פלטפורמה ישראלית ליצירת "חדרי דיל" — הצעות מחיר אינטראקטיביות שהלקוח יכול לצפות, לבחור תוספות, ולחתום ישירות מהדפדפן. במקום PDF סטטי, הלקוח מקבל דף חי עם פרטי הפרויקט, תוספות אופציונליות, ולחצן חתימה דיגיטלית. לאחר החתימה — PDF משפטי מלא נוצר אוטומטית עם תעודת חתימה, חותמת זמן UTC, כתובת IP, ונתיב ביקורת פורנזי. הסטטוס מתעדכן בלוח הבקרה שלך בזמן אמת.',
    a_en: 'DealSpace is an Israeli platform for creating interactive "Deal Rooms" — proposals your client can view, customize add-ons, and sign directly from their browser. Instead of a static PDF, your client gets a live web page with project details, optional add-ons, and a digital signature button. After signing, a full legal PDF is generated automatically with a signature certificate, UTC timestamp, IP address, and forensic audit trail. Status updates in your Dashboard in real time.',
  },
  {
    category: 'getting_started',
    q_he: 'איך יוצרים הצעת מחיר ראשונה?',
    q_en: 'How do I create my first proposal?',
    a_he: 'לחץ "הצעה חדשה" בלוח הבקרה. בבונה ההצעות מלא: שם הפרויקט (שדה חובה), שם לקוח, מחיר בסיס, ותיאור הפרויקט. הוסף תוספות אופציונליות ואבני דרך לתשלום לפי הצורך. לחץ "שלח" בסרגל הכותרת — תקבל קישור ייחודי לחדר הדיל. שלח ללקוח בוואטסאפ, מייל, או SMS. הלקוח לא צריך חשבון — הוא פותח, בוחר, ומאשר בפחות מ-60 שניות.',
    a_en: 'Click "New Proposal" in the Dashboard. In the Proposal Builder, fill in: project name (required), client name, base price, and project description. Add optional add-ons and payment milestones as needed. Click "Send" in the header — you receive a unique Deal Room link. Share it with your client via WhatsApp, email, or SMS. The client needs no account — they open, choose, and sign in under 60 seconds.',
  },
  {
    category: 'getting_started',
    q_he: 'איך מגדירים את פרופיל העסק?',
    q_en: 'How do I set up my business profile?',
    a_he: 'עבור לפרופיל (אייקון המשתמש → פרופיל). ניתן להגדיר: שם מלא, שם חברה, ח.פ/מספר עוסק, כתובת, טלפון, שם מורשה חתימה, לוגו חברה, וצבע מותג. כל הפרטים מוזרקים אוטומטית לכל הצעה חדשה — הלוגו, צבעי המותג, שם החברה, וח.פ מופיעים בחדר הדיל ובחוזה ה-PDF. הלוגו מוצג בראש עמוד הכיסוי בתוך פיל זכוכית (glassmorphism). עדכון הפרופיל לא משפיע על הצעות שכבר נשלחו — רק על חדשות.',
    a_en: 'Go to Profile (user icon → Profile). You can configure: full name, company name, tax/VAT ID, address, phone, authorized signatory name, company logo, and brand color. All details auto-inject into every new proposal — your logo, brand colors, company name, and tax ID appear in the Deal Room and signed PDF. The logo displays at the top of the cover page inside a glassmorphism pill. Updating your profile does not affect proposals already sent — only new ones.',
  },
  {
    category: 'getting_started',
    q_he: 'מה המשמעות של כל סטטוס הצעה?',
    q_en: 'What does each proposal status mean?',
    a_he: 'טיוטה — לא נשלחה עדיין, ניתן לערוך בחופשיות. נשלחה — הלקוח קיבל קישור, עריכת שדות מבנה ננעלת. נצפתה — הלקוח פתח את חדר הדיל לפחות פעם אחת. מאושרת — הלקוח חתם; ההצעה ננעלת לחלוטין. נדחתה — הלקוח לחץ "דחה הצעה". ניתן לשכפל נדחית ולשלוח גרסה מחודשת. ארכיון — הוסתרה ידנית מהתצוגה הראשית, לא נמחקה.',
    a_en: 'Draft — not yet sent, fully editable. Sent — client received a link; structural fields lock. Viewed — client opened the Deal Room at least once. Accepted — client signed; proposal fully locks. Declined — client clicked "Decline". You can duplicate a declined proposal and send a revised version. Archived — manually hidden from the main view, not deleted.',
  },
  {
    category: 'getting_started',
    q_he: 'איך מארכבים, משכפלים, ומוחקים הצעות?',
    q_en: 'How do I archive, duplicate, and delete proposals?',
    a_he: 'לחץ על תפריט הנקודות (⋯) בכרטיס ההצעה: "ארכיון" — מסתיר את ההצעה לטאב ארכיון (מחיקה רכה, ניתן לשחזר). "שכפל" — יוצר הצעה חדשה עם אותם פרטים, סטטוס חוזר לטיוטה, וקישור ייחודי חדש. "מחק" — מחיקה קבועה ובלתי הפיכה. הצעות בארכיון אינן נספרות במגבלת הקוטה החודשית.',
    a_en: 'Click the dots menu (⋯) on the proposal card: "Archive" — hides the proposal to the Archive tab (soft delete, reversible). "Duplicate" — creates a new proposal with the same details, status resets to Draft, fresh unique link. "Delete" — permanent and irreversible deletion. Archived proposals do not count toward your monthly proposal quota.',
  },
  {
    category: 'getting_started',
    q_he: 'איך משנים שפת ממשק?',
    q_en: 'How do I change the interface language?',
    a_he: 'לחץ על כפתור השפה בניווט (EN / עב). DealSpace תומך בעברית RTL מלאה ואנגלית LTR. הבחירה נשמרת ב-localStorage ומיוחסת לדפדפן הנוכחי. שפת הממשק לא משפיעה על תוכן ההצעות — ניתן לכתוב הצעות בכל שפה ללא קשר לשפת הממשק.',
    a_en: 'Click the language toggle in the navigation (EN / עב). DealSpace supports full Hebrew RTL and English LTR. The choice is saved in localStorage for the current browser. The interface language does not affect proposal content — proposals can be written in any language regardless of the UI language.',
  },

  // ── Building Proposals ─────────────────────────────────────────────────────

  {
    category: 'creating_proposals',
    q_he: 'איך עובדות תוספות (Add-ons) ואפסייל?',
    q_en: 'How do add-ons and upsells work?',
    a_he: 'תוספות הן פריטים אופציונליים שהלקוח יכול להפעיל/לכבות בחדר הדיל. ניתן לאפשר "כמות מתכווננת" — הלקוח מזיז סליידר והסכום הכולל מתעדכן בזמן אמת. כשתוספת מופעלת, מחירה נכלל בסכום הסופי ובחוזה החתום. כשהוצעה מאושרת, כל תוספות פעילות ננעלות — לא ניתן לשנות. מומלץ להוסיף 2-3 תוספות לכל הצעה: "תמיכה חודשית", "עמוד נוסף", "SEO" — זה מגדיל ערך עסקה ממוצע.',
    a_en: 'Add-ons are optional extras the client can toggle in the Deal Room. You can enable "adjustable quantity" — the client moves a slider and the grand total updates in real time. When an add-on is enabled, its price is included in the final total and signed contract. Once a proposal is accepted, all active add-ons lock — they cannot be changed. Recommended: add 2-3 add-ons per proposal ("Monthly Support", "Extra Page", "SEO") — this increases average deal value.',
  },
  {
    category: 'creating_proposals',
    q_he: 'איך עובדים אבני דרך לתשלום?',
    q_en: 'How do Payment Milestones work?',
    a_he: 'אבני דרך מחלקות את התשלום הכולל לשלבים. הוסף שורות עם שם ואחוז — הסכום חייב להיות בדיוק 100% (המערכת מציגה אינדיקטור: ירוק=100%, זהב=פחות, אדום=יותר). הלקוח רואה לוח תשלומים מונפש בחדר הדיל עם הסכום לכל אבן דרך מחושב מהסכום הכולל. לוח התשלומים נכלל ב-PDF החתום. אם לא הוגדרו אבני דרך — הסכום מוצג כתשלום חד-פעמי.',
    a_en: "Milestones split the total into payment stages. Add rows with a name and percentage — they must sum to exactly 100% (the system shows an indicator: green=100%, gold=under, red=over). The client sees an animated payment schedule in the Deal Room with the amount per milestone calculated from the grand total. The schedule is included in the signed PDF. If no milestones are defined — the total is shown as a single payment.",
  },
  {
    category: 'creating_proposals',
    q_he: 'מה זה "מצב מסמך משפטי" ומתי משתמשים בו?',
    q_en: 'What is "Document-Only Mode" and when should I use it?',
    a_he: 'מצב מסמך משפטי מסיר את כל האלמנטים הפיננסיים מחדר הדיל ומה-PDF — אין מחיר בסיס, אין תוספות, אין אבני דרך, אין סכום כולל. ההצעה הופכת לכלי חתימה דיגיטלית טהור. מתאים ל: NDA, הסכמי שמירת סודיות, מסמכי סוכנות, הרשאות, הסכמי ייעוץ, ומסמכים שאין בהם מחיר. הפעל ב"הגדרות מסמך" בבונה. טקסט כפתור החתימה משתנה ל"חתום על המסמך" במקום "אשר וחתום".',
    a_en: 'Document-Only mode removes all financial elements from the Deal Room and PDF — no base price, no add-ons, no milestones, no grand total. The proposal becomes a pure digital e-signing tool. Perfect for: NDAs, confidentiality agreements, agency contracts, authorizations, consulting agreements, and any document without a price. Enable it in "Document Settings" in the Builder. The signature button text changes to "Sign Document" instead of "Approve & Sign".',
  },
  {
    category: 'creating_proposals',
    q_he: 'האם ניתן להגדיר תאריך תפוגה?',
    q_en: 'Can I set an expiry date?',
    a_he: 'כן. בסעיף "תמחור בסיסי" לחץ על שדה "תוקף הצעה" ובחר תאריך. חדר הדיל יציג ספירה לאחור ("פג תוקף בעוד X ימים") ביד הלקוח ליצור לחץ קנייה. כשפג התוקף — אזור המחירים מוטשטש, כפתור החתימה ננעל, ומוצגת הודעה אדומה בולטת. הלקוח מתבקש ליצור קשר עם השולח לחידוש. לחידוש: שכפל ההצעה, הגדר תאריך חדש, שלח קישור מחודש.',
    a_en: 'Yes. In "Base Pricing", click the "Proposal Expiry" field and pick a date. The Deal Room shows a countdown timer ("Expires in X days") to create buying urgency. When expired — the pricing zone is blurred, the signature button locks, and a prominent red banner appears. The client is prompted to contact you to renew. To renew: duplicate the proposal, set a new expiry date, send a fresh link.',
  },
  {
    category: 'creating_proposals',
    q_he: 'איך עובד קוד גישה לחדר הדיל?',
    q_en: 'How does the Deal Room access code work?',
    a_he: 'בסעיף "הגדרות מסמך" בבונה, הזן קוד גישה בן 4 ספרות. הלקוח שפותח את הקישור יראה תחילה מסך הזנת קוד — רק אחרי הקלדת הקוד הנכון הוא ייכנס לחדר הדיל. מגן מפני גישה מקרית של צדדים לא רלוונטיים. הקוד השגוי מחזיר NULL בשקט — לא חושף שהחדר קיים. שלח את הקוד ללקוח בנפרד (SMS/WhatsApp) מהקישור עצמו.',
    a_en: 'In "Document Settings" in the Builder, enter a 4-digit access code. The client who opens the link sees a PIN entry screen first — only after entering the correct code do they enter the Deal Room. This prevents accidental access by unintended parties. A wrong code silently returns NULL — it does not reveal that the Deal Room exists. Send the code to your client separately (SMS/WhatsApp) from the link itself.',
  },
  {
    category: 'creating_proposals',
    q_he: 'איך עובד כותב ה-AI לתיאורים?',
    q_en: 'How does the AI description writer work?',
    a_he: 'בסעיף "פרטי הפרויקט" לחץ על כפתור ה-AI (אייקון ניצוץ). הזן תיאור קצר של הפרויקט ולחץ "יצור". ה-AI מייצר תיאור מקצועי ועשיר שמוכנס ישירות לשדה התיאור. ניתן לייצר מחדש עד שהתוצאה מתאימה. הכלי מבין הקשר עסקי ומייצר תוכן שמתאים לצגייה בפני לקוח ישראלי.',
    a_en: "In 'Project Info', click the AI button (spark icon). Enter a brief project summary and click 'Generate'. The AI produces a professional, polished description that inserts directly into the description field. Regenerate until it fits. The tool understands business context and generates content appropriate for presenting to clients.",
  },
  {
    category: 'creating_proposals',
    q_he: 'האם ניתן לכלול תמונת שער לפרויקט?',
    q_en: 'Can I include a cover image for the project?',
    a_he: 'כן. בסעיף "פרטי הפרויקט" הדבק URL של תמונה בשדה "תמונת שער". התמונה מוצגת כ-hero banner בראש חדר הדיל לפני פרטי הפרויקט. מומלץ: תמונה רחבה ביחס 16:9. Unsplash (unsplash.com) מספק תמונות חינמיות מעולות לשימוש מסחרי ללא קרדיט. שדה זה הוא אופציונלי.',
    a_en: 'Yes. In "Project Info", paste an image URL in the "Cover Image" field. The image appears as a hero banner at the top of the Deal Room before project details. Recommended: a wide image at 16:9 ratio. Unsplash (unsplash.com) provides excellent free images for commercial use with no credit required. This field is optional.',
  },
  {
    category: 'creating_proposals',
    q_he: 'מה ההבדל בין ספריית השירותים לבין תוספות בהצעה?',
    q_en: 'What is the difference between the Services Library and proposal add-ons?',
    a_he: 'ספריית השירותים (תפריט → שירותים שמורים) היא "קטלוג המוצרים" שלך — שירותים חוזרים עם מחירים קבועים. תוספות הן המופעים הספציפיים בתוך הצעה מסוימת. לחיצה על "✨ ספרייה" בסעיף התוספות → בחירה → "הוסף" מכניסה את השירות כהעתק עצמאי עם UUID ייחודי. שינוי מאוחר בספרייה לא ישפיע על הצעות קיימות — כל הזרקה היא עותק נפרד ומנותק.',
    a_en: 'The Services Library (menu → Saved Services) is your "product catalog" — reusable services with fixed prices. Add-ons are specific instances within a particular proposal. Clicking "✨ Library" in the Add-ons section → selecting items → "Inject" inserts each service as an independent copy with a unique UUID. Later changes to the library do not affect existing proposals — each injection is a separate, disconnected copy.',
  },

  // ── Sending & Tracking ─────────────────────────────────────────────────────

  {
    category: 'sending_tracking',
    q_he: 'איך שולחים הצעה ללקוח?',
    q_en: 'How do I send a proposal to a client?',
    a_he: 'לחץ "שלח" בסרגל הכותרת של הבונה. בחלון השליחה יש שתי אפשרויות: (א) העתק קישור ייחודי ושלח בכל ערוץ (וואטסאפ, SMS, לינקדאין). (ב) הזן כתובת מייל — DealSpace שולחת מייל מקצועי עם כפתור CTA מותג ישיר לחדר הדיל, ורושמת timestamp של השליחה בכרטיס ההצעה. בשני המסלולים, הלקוח פותח ללא הרשמה.',
    a_en: 'Click "Send" in the Builder top bar. The send modal offers two options: (a) Copy the unique link and share via any channel (WhatsApp, SMS, LinkedIn). (b) Enter an email address — DealSpace sends a professionally branded email with a direct CTA button to the Deal Room, and records a send timestamp on the proposal card. In both cases, the client opens without registering.',
  },
  {
    category: 'sending_tracking',
    q_he: 'האם הלקוח צריך חשבון ב-DealSpace?',
    q_en: 'Does the client need a DealSpace account?',
    a_he: 'לא. חדר הדיל הוא נתיב ציבורי לחלוטין — ללא הרשמה, ללא אפליקציה, ללא תוסף דפדפן. הלקוח פותח את הקישור בכל דפדפן (מובייל/דסקטופ), ממלא פרטים, ומחתים תוך פחות מ-60 שניות. חסם הרשמה הוא אחת הסיבות המרכזיות לנטישת הצעות — DealSpace מחסלת אותו לחלוטין.',
    a_en: 'No. The Deal Room is fully public — no registration, no app, no browser extension. The client opens the link in any browser (mobile/desktop), fills in their details, and signs in under 60 seconds. Registration friction is one of the main reasons proposals get abandoned — DealSpace eliminates it entirely.',
  },
  {
    category: 'sending_tracking',
    q_he: 'איך יודע אם הלקוח פתח את המייל?',
    q_en: 'How do I know if the client opened the email?',
    a_he: 'כשהלקוח פותח את המייל ולוחץ על כפתור ה-CTA בפעם הראשונה, DealSpace מתעד את הפתיחה ב-timestamp מדויק. כרטיס ההצעה בלוח הבקרה יציג תג "נפתח" בסגול עם חותמת הזמן. שים לב: מעקב הפתיחה מופעל רק כשנשלח מייל דרך הממשק הפנימי (לא כשקישור הועתק ידנית).',
    a_en: 'When the client opens the email and clicks the CTA button for the first time, DealSpace records the open with a precise timestamp. The proposal card in your Dashboard shows a purple "Opened" badge with the timestamp. Note: open tracking only activates when the email is sent via the built-in composer — not when a link is manually copied.',
  },
  {
    category: 'sending_tracking',
    q_he: 'איך עוקבים אחרי מעורבות הלקוח בחדר הדיל?',
    q_en: 'How do I track client engagement in the Deal Room?',
    a_he: 'כרטיס ההצעה מציג בזמן אמת: מספר צפיות כולל, זמן שהייה מצטבר בשניות, ותאריך/שעה של הצפייה האחרונה. "לקוח צפה 4 פעמים ובזבז 14 דקות" — זה סיגנל קנייה חזק מאוד, הגיע הזמן לפנות. "לקוח ביקר 20 שניות ויצא" — כנראה לא קרא, שלח עדכון.',
    a_en: "The proposal card shows in real time: total view count, cumulative time spent in seconds, and the last viewed date/time. 'Client viewed 4 times and spent 14 minutes' — this is a very strong buying signal, time to reach out. 'Client visited for 20 seconds and left' — probably didn't read, send a follow-up.",
  },
  {
    category: 'sending_tracking',
    q_he: 'מעקב חכם — מעקב בוואטסאפ בלחיצה אחת',
    q_en: 'Smart Follow-up — one-click WhatsApp follow-up',
    a_he: 'עבור הצעות בסטטוס "נשלחה" או "נצפתה", תפריט הנקודות (⋯) בכרטיס ההצעה מכיל פריט "מעקב ב-WhatsApp". לחיצה פותחת את WhatsApp עם הודעה מוכנה ומותאמת אישית הכוללת: שם הלקוח, שם הפרויקט, וקישור ישיר לחדר הדיל — מוכנה לשליחה מידית. ללא העתקה ידנית, ללא ניסוח.',
    a_en: "For proposals with status 'Sent' or 'Viewed', the dots menu (⋯) on the proposal card contains a 'Follow Up via WhatsApp' item. Clicking it opens WhatsApp with a ready-made, personalised message containing: the client's name, project name, and a direct link to the Deal Room — ready to send instantly. No manual copying, no drafting.",
  },
  {
    category: 'sending_tracking',
    q_he: 'מה קורה לאחר שהלקוח חותם?',
    q_en: 'What happens after the client signs?',
    a_he: 'לאחר חתימה מתרחש הרצף הבא: (1) סטטוס עובר ל"מאושר" בזמן אמת בלוח הבקרה שלך. (2) PDF משפטי מלא עם תעודת חתימה פורנזית זמין להורדה מיידית. (3) Webhook נורה עם נתוני העסקה אם הגדרת URL באינטגרציות. (4) ההצעה ננעלת לעריכה — ניתן לשכפל ליצירת גרסה חדשה. (5) הלקוח רואה מסך הצלחה עם כפתור הורדת ה-PDF.',
    a_en: 'After signing, the following sequence occurs: (1) Status updates to "Accepted" in real time on your Dashboard. (2) A full legal PDF with a forensic signature certificate is immediately available to download. (3) A webhook fires with deal data if you configured a URL in Integrations. (4) The proposal locks for editing — you can duplicate it to create a new version. (5) The client sees a success screen with a PDF download button.',
  },
  {
    category: 'sending_tracking',
    q_he: 'האם לקוח יכול לדחות הצעה?',
    q_en: 'Can a client decline a proposal?',
    a_he: 'כן. הלקוח יכול ללחוץ "דחה הצעה" בחדר הדיל. הסטטוס עובר ל"נדחתה" בזמן אמת. כפתור הדחייה מוסתר אוטומטית כשמדובר בהצעה במצב "מסמך משפטי" (is_document_only) — אין מה לדחות מסמך שאין בו הצעת מחיר. לאחר דחייה: שכפל, עדכן תמחור/תנאים, שלח גרסה מחודשת.',
    a_en: "Yes. The client can click 'Decline' in the Deal Room. Status updates to 'Declined' in real time. The decline button is automatically hidden when the proposal is in 'Document-Only' mode — there's nothing to decline in a document that has no price. After decline: duplicate, update pricing/terms, send a revised version.",
  },
  {
    category: 'sending_tracking',
    q_he: 'כמה זמן הלקוח שהה בחדר הדיל?',
    q_en: 'How long did the client spend in the Deal Room?',
    a_he: 'DealSpace מצבר זמן שהייה בשניות בכל ביקור. הנתון מוצג בכרטיס ההצעה בלוח הבקרה. זמן שהייה הוא אחד האינדיקטורים החזקים ביותר לכוונת קנייה — לקוח שמבלה 10+ דקות בחדר הדיל כנראה בוחן ברצינות ומשווה אפשרויות. זהו הרגע לפנות אישית.',
    a_en: 'DealSpace accumulates time spent in seconds across all visits. This data is shown on the proposal card in the Dashboard. Time spent is one of the strongest indicators of purchase intent — a client who spends 10+ minutes in the Deal Room is seriously evaluating and comparing options. That is the moment to reach out personally.',
  },

  // ── Legal & Terms ──────────────────────────────────────────────────────────

  {
    category: 'legal_terms',
    q_he: 'האם החתימות אלקטרוניות מחייבות חוקית בישראל?',
    q_en: 'Are electronic signatures legally binding in Israel?',
    a_he: 'כן. לפי חוק חתימה אלקטרונית תשס"א-2001, חתימה אלקטרונית מוכרת ותקפה משפטית בישראל. DealSpace שומרת את כל הרכיבים הנדרשים לתוקף משפטי: תמונת החתימה הייחודית, חותמת זמן UTC מדויקת, שם מלא, שם חברה, ח.פ/ת.ז, כתובת, תפקיד, כתובת IP, ומזהה דפדפן מלא (User-Agent) — כולם ב-Forensic Audit Trail ב-PDF.',
    a_en: "Yes. Under Israel's Electronic Signature Law 5761-2001, electronic signatures are legally recognized and valid. DealSpace captures all components required for legal validity: the unique signature image, precise UTC timestamp, full name, company name, tax/ID number, address, role, IP address, and full browser identifier (User-Agent) — all in the Forensic Audit Trail in the PDF.",
  },
  {
    category: 'legal_terms',
    q_he: 'מה בדיוק מכילה תעודת החתימה הפורנזית?',
    q_en: 'What exactly does the forensic signature certificate contain?',
    a_he: 'תעודת החתימה (העמוד האחרון ב-PDF) מכילה: (1) תמונת החתימה הייחודית שנרשמה. (2) נתוני הזיהוי המשפטיים — שם, חברה, ח.פ/ת.ז, כתובת, תפקיד. (3) חותמת זמן UTC מדויקת. (4) כתובת IP של החותם. (5) מזהה דפדפן מלא (User-Agent) לזיהוי המכשיר. (6) Token ייחודי לאימות המסמך. (7) Audit Trail של 8 שלבים — יצירה, שליחה, צפייה, ועוד. כל הפרטים קבילים כראיה בבית משפט.',
    a_en: 'The signature certificate (last page of the PDF) contains: (1) The unique signature image as drawn. (2) Legal identification data — name, company, tax/ID number, address, role. (3) Precise UTC timestamp. (4) Signer IP address. (5) Full browser identifier (User-Agent) for device identification. (6) Unique document token for authenticity verification. (7) 8-step Audit Trail — creation, sending, viewing, and more. All details are admissible as evidence in court.',
  },
  {
    category: 'legal_terms',
    q_he: 'מה זה "תנאי העסק" ואיך מגדירים אותם?',
    q_en: 'What are "Business Terms" and how do I set them up?',
    a_he: 'תנאי העסק הם תקנון שמגדירים פעם אחת בפרופיל (פרופיל → תנאי העסק) ומוקפאים אוטומטית בכל הצעה חדשה. עורך TipTap עשיר זמין: כותרות H1-H3, מודגש, נטוי, רשימות, קישורים. כתוב: תנאי תשלום, בעלות קניין רוחני, מדיניות ביטולים, הגבלת אחריות ועוד. הלקוח רואה את התנאים בחדר הדיל ומסכים בצ׳קבוקס ייעודי לפני החתימה — אישור זה הוא תנאי סף מחייב.',
    a_en: 'Business Terms are your T&Cs, defined once in Profile (Profile → Business Terms) and automatically frozen into every new proposal. A full TipTap rich-text editor is available: H1-H3 headings, bold, italic, lists, links. Write: payment terms, IP ownership, cancellation policy, liability limitations, and more. The client sees the terms in the Deal Room and must check a dedicated consent checkbox before signing — this consent is a hard mandatory gate.',
  },
  {
    category: 'legal_terms',
    q_he: 'איך תנאי העסק מוזרקים לכל הצעה?',
    q_en: 'How do Business Terms get injected into each proposal?',
    a_he: 'כשאתה שומר הצעה, בונה ההצעות קורא את תנאי העסק מהפרופיל שלך ומקפיא אותם בתוך ההצעה כחותמה. אם תשנה את התנאים בפרופיל אחר כך — הצעות שנשלחו כבר לא ישתנו. רק הצעות חדשות יכילו את הגרסה המעודכנת. כך מובטח שכל עסקה שנחתמה מוגנת בתנאים שהיו בתוקף בעת השליחה.',
    a_en: "When you save a proposal, the Builder reads your current Business Terms from your Profile and freezes them into the proposal as a snapshot. If you later update the terms in your Profile, already-sent proposals won't change. Only new proposals will contain the updated version. This ensures every signed deal is protected by the terms that were in effect at the time of sending.",
  },
  {
    category: 'legal_terms',
    q_he: 'האם תנאי העסק נכנסים ל-PDF החתום?',
    q_en: 'Are Business Terms included in the signed PDF?',
    a_he: 'כן, אוטומטית. מנוע ה-PDF מוסיף עמוד "תנאי העסק" בין תיאור הפרויקט לתעודת החתימה. הפורמט נשמר בנאמנות: כותרות, מודגש, רשימות — בדיוק כפי שכתבת. כך הלקוח מקבל מסמך אחד שלם: הצעה + תנאים + חתימה + ביקורת פורנזית. התנאים מוצגים גם בחדר הדיל לאחר החתימה לכל מי שחוזר לקישור.',
    a_en: "Yes, automatically. The PDF engine adds a 'Business Terms' page between the project description and the signature certificate. Formatting is faithfully preserved: headings, bold, lists — exactly as written. The client receives one complete document: proposal + terms + signature + forensic audit. Terms also remain visible in the Deal Room after signing for anyone who revisits the link.",
  },
  {
    category: 'legal_terms',
    q_he: 'מה ההבדל בין "תנאי DealSpace" לבין "תנאי העסק" שלי?',
    q_en: 'What is the difference between "DealSpace Terms" and my "Business Terms"?',
    a_he: 'תנאי DealSpace הם תנאי השימוש של הפלטפורמה עצמה — הסכם בינך לבין DealSpace כתשתית טכנולוגית. תנאי העסק הם התנאים שאתה — העסק שלך — קובע עם הלקוח: תשלומים, בעלות תוצרים, ביטולים ועוד. שני הסטים מוצגים בנפרד בחדר הדיל ונכללים יחד ב-PDF החתום.',
    a_en: "DealSpace Terms are the platform's own terms of service — the agreement between you and DealSpace as a technology provider. Business Terms are the terms you — your business — set with your client: payments, ownership of deliverables, cancellations, and more. Both sets appear separately in the Deal Room and are included together in the signed PDF.",
  },
  {
    category: 'legal_terms',
    q_he: 'הלקוח רוצה לעיין בתנאים שוב אחרי שחתם — אפשר?',
    q_en: 'The client wants to re-read the terms after signing — is that possible?',
    a_he: 'בהחלט. תנאי העסק מוצגים בחדר הדיל לכל מי שפותח את הקישור — גם לאחר החתימה. הלקוח יכול לחזור לקישור בכל עת ולקרוא את מה שחתם עליו. בנוסף, ה-PDF החתום מכיל את כל התנאים — הלקוח יכול להוריד אותו בכפתור "הורד חוזה חתום" במסך הסיום שמוצג לאחר החתימה.',
    a_en: 'Absolutely. Business Terms are displayed in the Deal Room for anyone who opens the link — even after signing. The client can return to the link at any time and re-read what they agreed to. Additionally, the signed PDF contains all terms — the client can download it via the "Download Signed Contract" button on the success screen shown after signing.',
  },
  {
    category: 'legal_terms',
    q_he: 'מה עושים אם כותבים בעברית ואנגלית יחד?',
    q_en: 'What if I write in both Hebrew and English in the same proposal?',
    a_he: 'DealSpace תומך במצב בילינגואלי. שדה "תיאור הפרויקט" ותנאי העסק מזהים אוטומטית כיוון (RTL/LTR) לפי ה-dir="auto". ניתן לכתוב פסקאות בעברית ופסקאות באנגלית באותו מסמך. ב-PDF — שפת הייצור (ה/EN) נקבעת לפי הגדרת השפה בממשק בעת ייצוא ה-PDF.',
    a_en: 'DealSpace supports bilingual mode. The "Project Description" field and Business Terms auto-detect text direction (RTL/LTR) via dir="auto". You can write Hebrew paragraphs and English paragraphs in the same document. In the PDF — the output language (He/EN) is determined by the UI language setting at the time of PDF generation.',
  },
  {
    category: 'legal_terms',
    q_he: 'מה ניתן לעצב בעורכי הטקסט (תיאור, תנאי העסק)?',
    q_en: 'What formatting is available in the text editors (description, business terms)?',
    a_he: 'שני העורכים (בבונה ובפרופיל) מבוססים על TipTap ותומכים: כותרות H1–H3, מודגש (Bold), נטוי (Italic), רשימות ממוספרות, רשימות נקודות, קישורים. הפורמט מוצג נאמנה בחדר הדיל ובחוזה ה-PDF — ללא מגבלת אורך. מומלץ להשתמש בכותרות לחלוקה לסעיפים ורשימות להבהרת תנאים.',
    a_en: 'Both editors (in the Builder and in Profile) are TipTap-based and support: H1-H3 headings, Bold, Italic, numbered lists, bulleted lists, links. Formatting renders faithfully in the Deal Room and PDF contract — no length limit. Recommended: use headings to divide into sections and lists to clarify terms.',
  },

  // ── Settings & Billing ─────────────────────────────────────────────────────

  {
    category: 'settings_billing',
    q_he: 'מה ההבדל בין תוכנית חינם, פרו, ופרימיום?',
    q_en: 'What is the difference between Free, Pro, and Premium plans?',
    a_he: 'חינם (₪0): עד 5 הצעות בחודש, חדר דיל + חתימה דיגיטלית, יצוא PDF, אנליטיקות בסיסיות — ללא Webhooks. פרו (₪19/חודש, כולל מע"מ): עד 100 הצעות בחודש + הכל כולל חינם + Webhooks ואוטומציות + תמיכה ישירה. פרימיום (₪39/חודש, כולל מע"מ): הצעות ללא הגבלה + הכל כולל פרו + תמיכה בעדיפות גבוהה + השפעה על מפת הדרכים.',
    a_en: 'Free (₪0): up to 5 proposals/month, Deal Room + digital signature, PDF export, basic analytics — no Webhooks. Pro (₪19/mo, VAT incl.): up to 100 proposals/month + everything in Free + Webhooks & automations + direct support. Premium (₪39/mo, VAT incl.): unlimited proposals + everything in Pro + priority support + roadmap influence.',
  },
  {
    category: 'settings_billing',
    q_he: 'איך משדרגים תוכנית?',
    q_en: 'How do I upgrade my plan?',
    a_he: 'לחץ על שם התוכנית הנוכחית שלך בתפריט המשתמש → "חיוב ומנוי", או עבור ישירות לעמוד /billing. משם תוכל לשדרג לפרו או פרימיום. השדרוג מעביר אותך לדף תשלום מאובטח של Stripe. לאחר השלמת התשלום, הסטטוס מתעדכן בחשבון שלך תוך שניות.',
    a_en: "Click your current plan name in the user menu → 'Billing & Subscription', or go directly to /billing. From there you can upgrade to Pro or Premium. The upgrade takes you to a secure Stripe payment page. After completing payment, your account status updates within seconds.",
  },
  {
    category: 'settings_billing',
    q_he: 'איך מבטלים מנוי — ומה מדיניות ההחזרים?',
    q_en: 'How do I cancel my subscription — and what is the refund policy?',
    a_he: 'ניהול וביטול: עבור לפרופיל → חיוב ומנוי (או /billing) ולחץ "ניהול מנוי, חשבוניות וביטול" — תועבר לפורטל לקוחות Stripe המאובטח. ביטול נכנס לתוקף בסוף תקופת החיוב הנוכחית — גישה לכל התכונות נשמרת עד למועד זה. מדיניות החזרים: לא מוצעים החזרים חלקיים או פרופורציונליים בגין זמן שלא נוצל. לאחר החיוב, השירות פעיל עד תום המחזור. לפניות חיוב חריגות: support@dealspace.app',
    a_en: 'Manage and cancel: go to Profile → Billing & Subscription (or /billing) and click "Manage subscription, invoices & cancellation" — you will be redirected to the secure Stripe Customer Portal. Cancellation takes effect at the end of your current billing cycle — full feature access is retained until that date. Refund policy: no partial or pro-rata refunds are issued for unused time within a paid period. Once a charge processes, the service remains active until the cycle ends. For exceptional billing inquiries: support@dealspace.app',
  },
  {
    category: 'settings_billing',
    q_he: 'מה קורה אם כרטיס האשראי נכשל?',
    q_en: 'What happens if my credit card payment fails?',
    a_he: 'Stripe ינסה לחייב שוב אוטומטית. בינתיים, החשבון עובר למצב "תשלום נכשל" — באנר אדום מוצג בלוח הבקרה, ויצירת הצעות חדשות נחסמת. ההצעות הקיימות ממשיכות לפעול במלואן ולקבל חתימות. כדי לפתור: עדכן פרטי תשלום בפורטל Stripe דרך עמוד /billing בהקדם האפשרי.',
    a_en: 'Stripe will automatically retry the charge. In the meantime, your account enters a "payment failed" state — a red banner appears in the Dashboard and creating new proposals is blocked. All existing proposals continue to function fully and accept client signatures. To resolve: update your payment details in the Stripe Customer Portal via the /billing page as soon as possible.',
  },
  {
    category: 'settings_billing',
    q_he: 'מה קורה להצעות שלי אחרי ביטול מנוי?',
    q_en: 'What happens to my proposals after canceling?',
    a_he: 'כל ההצעות הקיימות — כולל חתומות — נשמרות ונגישות. חוזים חתומים ניתנים להורדה כ-PDF בכל עת. לאחר חזרה לתוכנית חינם, תוכל לצפות בכל ההיסטוריה, אך יצירת הצעות חדשות מוגבלת ל-5 בחודש. אין מחיקה אוטומטית של נתונים בעת הורדת תוכנית.',
    a_en: 'All existing proposals — including signed contracts — are preserved and remain accessible. Signed PDFs are downloadable at any time. After returning to the Free plan, your full history remains viewable, but creating new proposals is capped at 5 per month. There is no automatic data deletion when downgrading.',
  },
  {
    category: 'settings_billing',
    q_he: 'כיצד עובדים Webhooks ואוטומציות?',
    q_en: 'How do webhooks and automations work?',
    a_he: 'כשלקוח חותם, DealSpace שולחת HTTP POST אוטומטי לכתובת ה-Webhook שהגדרת עם הנתונים: שם פרויקט, פרטי לקוח (שם, מייל, חברה), סכום כולל, מטבע, ו-token ציבורי. Payload זה מאפשר חיבור ל-Make.com, Zapier, n8n, CRM כלשהו, Slack, שליחת מייל, ויצירת משימות. הגדר את ה-URL בעמוד "אינטגרציות". תכונה זו זמינה בתוכניות פרו ומעלה.',
    a_en: 'When a client signs, DealSpace sends an automatic HTTP POST to your configured Webhook URL with: project name, client details (name, email, company), grand total, currency, and public token. This payload enables connections to Make.com, Zapier, n8n, any CRM, Slack, email senders, and task creation. Configure the URL on the "Integrations" page. This feature is available on Pro plans and above.',
  },
  {
    category: 'settings_billing',
    q_he: 'כיצד מחברים Make.com, Zapier, או n8n?',
    q_en: 'How do I connect Make.com, Zapier, or n8n?',
    a_he: 'ב-Make.com: צור תרחיש חדש → Webhooks → Custom Webhook → העתק URL. ב-Zapier: צור Zap חדש → Trigger → Webhooks by Zapier → Catch Hook → העתק URL. ב-n8n: הוסף Webhook node → העתק URL. בכל המקרים: הדבק את ה-URL בעמוד "אינטגרציות" ב-DealSpace, לחץ "Test Connection" לאימות. מעמוד האינטגרציות יש מדריכים מפורטים שלב-שלב לכל פלטפורמה.',
    a_en: 'In Make.com: create a new scenario → Webhooks → Custom Webhook → copy URL. In Zapier: create a new Zap → Trigger → Webhooks by Zapier → Catch Hook → copy URL. In n8n: add a Webhook node → copy URL. In all cases: paste the URL on the "Integrations" page in DealSpace, click "Test Connection" to verify. The Integrations page includes detailed step-by-step guides for each platform.',
  },
  {
    category: 'settings_billing',
    q_he: 'למה ה-PDF נראה שונה מחדר הדיל?',
    q_en: 'Why does the PDF look different from the Deal Room?',
    a_he: 'זה עיצוב מכוון. חדר הדיל הוא חוויה אינטראקטיבית עם צבעי מותג, אנימציות, ועיצוב חושי מותאם. ה-PDF הוא "White Paper" מקצועי — רקע לבן, טיפוגרפיה ניטרלית, מתאים לתיוק, הגשה לרואה חשבון, ועיון בבית משפט. מסמכים עסקיים שנועדו לחתימה ולארכיון צריכים להיראות כמסמכים רשמיים.',
    a_en: "This is intentional design. The Deal Room is an interactive, branded experience with brand colors, animations, and rich visual design. The PDF is a professional 'White Paper' — white background, neutral typography, suitable for filing, accountant submission, and court review. Business documents intended for signing and archiving should look like official documents.",
  },
  {
    category: 'settings_billing',
    q_he: 'האם DealSpace עובד על מובייל?',
    q_en: 'Does DealSpace work on mobile?',
    a_he: 'חדר הדיל (צד הלקוח) מותאם לחלוטין למובייל — הלקוח יכול לצפות, לבחור תוספות, למלא פרטים, ולחתום בנוחות מהטלפון. לוח הבקרה ובונה ההצעות עובדים על מובייל אך מותאמים אופטימלית לדסקטופ/טאבלט — בוני הצעות מקצועיים ימצאו מסך גדול יעיל יותר.',
    a_en: 'The Deal Room (client side) is fully mobile-optimized — clients can view, select add-ons, fill in details, and sign comfortably from their phone. The Dashboard and Proposal Builder work on mobile but are optimally designed for desktop/tablet — professional proposal writers will find a large screen more efficient.',
  },
  {
    category: 'settings_billing',
    q_he: 'ה-PDF לא מוריד — מה עושים?',
    q_en: 'The PDF is not downloading — what should I do?',
    a_he: 'בדוק שהדפדפן לא חוסם קבצי PDF (הגדרות Popup / Downloads). רענן ונסה שוב. נסה דפדפן שונה (Chrome או Safari). לוגו חברה גדול מאוד (מעל 2MB) עלול להאט את ייצור ה-PDF משמעותית — מומלץ לוגו עד 400×200px ועד 200KB. אם הבעיה נמשכת — פנה ל-support@dealspace.app.',
    a_en: 'Check that your browser is not blocking PDF files (Popup / Downloads settings). Refresh and try again. Try a different browser (Chrome or Safari). A very large company logo (over 2MB) can significantly slow PDF generation — recommended logo size is up to 400×200px and under 200KB. If the issue persists — contact support@dealspace.app.',
  },
  {
    category: 'settings_billing',
    q_he: 'מה זה מנוע המע"מ הישראלי — איך הוא עובד?',
    q_en: 'What is the Israeli VAT engine — how does it work?',
    a_he: 'בישראל, המחיר שמציינים ללקוח הוא תמיד המחיר הסופי הכולל. הפעל "כלול מע"מ" בסעיף התמחור אם אתה עוסק מורשה (חייב מע"מ). המחיר שהזנת הוא הסכום שהלקוח ישלם — DealSpace מחשב מתוכם את רכיב המע"מ (18% ברירת מחדל) ומציג: "מתוכם מע"מ X ₪" ו"לפני מע"מ Y ₪". המע"מ לעולם לא מתווסף על גבי המחיר. שיעור המע"מ ניתן לשינוי בפרופיל → שיעור מע"מ.',
    a_en: 'In Israel, the price you quote to a client is always the final all-inclusive amount. Enable "Include VAT" in Pricing if you are a VAT-registered business (עוסק מורשה). The price you entered IS what the client pays — DealSpace extracts the VAT component (18% default) from within and displays: "Of which VAT: ₪X" and "Before VAT: ₪Y". VAT is never added on top of your entered price. The VAT rate is configurable in Profile → VAT Rate.',
  },
  {
    category: 'settings_billing',
    q_he: 'האם ניתן לשנות מטבע?',
    q_en: 'Can I change the currency?',
    a_he: 'כן. בסעיף "תמחור בסיסי" בחר בין ₪ ILS, $ USD, ו-€ EUR. הסמל המתאים מוצג בחדר הדיל, בחוזה, ובכל חישובי הסכום. DealSpace לא מבצע המרת שערים אוטומטית — ההמרה היא אחריות המשתמש. שינוי מטבע לאחר שליחה אינו מומלץ מסיבות משפטיות.',
    a_en: 'Yes. In "Base Pricing" choose between ₪ ILS, $ USD, and € EUR. The correct symbol is shown in the Deal Room, contract, and all amount calculations. DealSpace does not perform automatic exchange rate conversion — conversion is the user\'s responsibility. Changing currency after sending is not recommended for legal reasons.',
  },

]

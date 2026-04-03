// ─── Knowledge Base — DealSpace Help Center ────────────────────────────────────
// Bilingual B2B Q&A pairs. Used by HelpCenterDrawer.
// Last updated: Sprint 48.5 — Reality check & revenue protection pass.

export interface KBItem {
  category: string
  q_he: string
  q_en: string
  a_he: string
  a_en: string
}

export const KB_CATEGORIES = [
  { key: 'getting_started',  label_he: 'התחלה מהירה',   label_en: 'Getting Started',   color: '#818cf8' },
  { key: 'sending_tracking', label_he: 'שליחה ומעקב',   label_en: 'Sending & Tracking', color: '#fbbf24' },
  { key: 'pricing_vat',      label_he: 'תמחור ומע"מ',   label_en: 'Pricing & VAT',      color: '#34d399' },
  { key: 'legal_terms',      label_he: 'משפטי ותנאים',  label_en: 'Legal & Terms',      color: '#a78bfa' },
  { key: 'settings_billing', label_he: 'הגדרות וחיוב',  label_en: 'Settings & Billing', color: '#f87171' },
]

export const KNOWLEDGE_BASE: KBItem[] = [

  // ── Getting Started ────────────────────────────────────────────────────────

  {
    category: 'getting_started',
    q_he: 'מה זה DealSpace ואיך זה עוזר לי?',
    q_en: 'What is DealSpace and how does it help me?',
    a_he: 'DealSpace היא פלטפורמה ישראלית ליצירת "חדרי דיל" — הצעות מחיר אינטראקטיביות שהלקוח יכול לצפות, לבחור תוספות, ולחתום ישירות מהדפדפן. במקום PDF סטטי, הלקוח מקבל דף חי עם פרטי הפרויקט, תוספות אופציונליות, ולחצן חתימה. לאחר החתימה — PDF משפטי נוצר אוטומטית עם תעודת חתימה, חותמת זמן UTC, כתובת IP, וביקורת פורנזית מלאה.',
    a_en: 'DealSpace is an Israeli platform for creating interactive "Deal Rooms" — proposals your client can view, customize add-ons, and sign directly from their browser. Instead of a static PDF, your client gets a live web page. After signing, a legally valid PDF is generated automatically with a signature certificate, UTC timestamp, IP address, and full forensic audit trail.',
  },
  {
    category: 'getting_started',
    q_he: 'איך יוצרים הצעת מחיר ראשונה?',
    q_en: 'How do I create my first proposal?',
    a_he: 'לחץ "הצעה חדשה" בלוח הבקרה. מלא: שם הפרויקט, שם הלקוח, ומחיר בסיס. הוסף תוספות אופציונליות ואבני דרך לתשלום לפי הצורך. לחץ "שלח" כדי לקבל קישור ייחודי לחדר הדיל — שלח אותו ללקוח בוואטסאפ, מייל, או כל ערוץ שמתאים לך. הלקוח פותח, מאשר, וחותם — הכל תוך פחות מ-60 שניות.',
    a_en: 'Click "New Proposal" in your Dashboard. Fill in: project name, client name, and base price. Add optional add-ons and payment milestones as needed. Click "Send" to get a unique Deal Room link — share it via WhatsApp, email, or any channel. Your client opens, approves, and signs in under 60 seconds.',
  },
  {
    category: 'getting_started',
    q_he: 'איך מגדירים את פרופיל העסק?',
    q_en: 'How do I set up my business profile?',
    a_he: 'עבור לפרופיל (אייקון המשתמש → פרופיל). מלא: שם מלא, שם חברה, ח.פ/מספר עוסק, כתובת, טלפון, ושם מורשה חתימה. הוסף לוגו חברה וצבע מותג. כל הפרטים מוזרקים אוטומטית לכל הצעה חדשה — הלוגו, צבעי המותג, ושמות הצדדים מופיעים בחדר הדיל ובחוזה ה-PDF החתום.',
    a_en: 'Go to Profile (user icon → Profile). Fill in: full name, company name, tax/VAT ID, address, phone, and authorized signatory name. Add a company logo and brand color. All details auto-inject into every new proposal — your logo, brand colors, and party names appear in the Deal Room and signed PDF contract.',
  },
  {
    category: 'getting_started',
    q_he: 'איך עובדת ספריית השירותים?',
    q_en: 'How does the Services Library work?',
    a_he: 'ספריית השירותים (תפריט → שירותים שמורים) מאפשרת להגדיר שירותים חוזרים עם מחירים קבועים. בעת יצירת הצעה, לחץ "✨ ספרייה" בסעיף התוספות — בחר שירותים ולחץ "הוסף לאחד". הם מוכנסים מיידית כהעתק עצמאי. שינוי שירות בספרייה מאוחר יותר לא ישפיע על הצעות קיימות — כל הצעה היא עותק עצמאי עם UUID ייחודי.',
    a_en: "The Services Library (menu → Saved Services) lets you define reusable items with fixed prices. When creating a proposal, click '✨ Library' in the Add-ons section — select items and click 'Inject'. They insert instantly as an independent copy. Editing a library item later does not affect existing proposals — each is an independent copy with a unique UUID.",
  },
  {
    category: 'getting_started',
    q_he: 'מה המשמעות של כל סטטוס הצעה?',
    q_en: 'What does each proposal status mean?',
    a_he: 'טיוטה — לא נשלחה, עדיין ניתן לערוך. נשלחה — הלקוח קיבל קישור. נצפתה — הלקוח פתח את החדר לפחות פעם אחת. מאושרת — הלקוח חתם, ההצעה ננעלת. נדחתה — הלקוח לחץ "דחה". ניתן לשכפל הצעה נדחית ולשלוח גרסה מחודשת בלחיצה אחת.',
    a_en: 'Draft — not yet sent, still editable. Sent — client received the link. Viewed — client opened the Deal Room at least once. Accepted — client signed; proposal locks. Declined — client clicked "Decline". You can duplicate a declined proposal and send a revised version in one click.',
  },

  // ── Sending & Tracking ─────────────────────────────────────────────────────

  {
    category: 'sending_tracking',
    q_he: 'איך שולחים הצעה ללקוח?',
    q_en: 'How do I send a proposal to a client?',
    a_he: 'לחץ "שלח" בסרגל הכותרת של הבונה. בחלון השליחה: (א) העתק את הקישור הייחודי ושלח בוואטסאפ, SMS, או כל ערוץ; (ב) הזן כתובת מייל — DealSpace שולחת מייל מקצועי עם כפתור CTA ישיר לחדר הדיל. המייל מתועד ב-timestamp ומאפשר מעקב פתיחה — כשהלקוח לוחץ על הקישור בפעם הראשונה, כרטיס ההצעה מציג תג "נפתח" בסגול.',
    a_en: 'Click "Send" in the Builder top bar. In the send modal: (a) Copy the unique link and share via WhatsApp, SMS, or any channel; (b) Enter an email address — DealSpace sends a professional branded email with a direct CTA to the Deal Room. The email is timestamped and enables open tracking — when your client clicks the link for the first time, the proposal card shows a purple "Opened" badge.',
  },
  {
    category: 'sending_tracking',
    q_he: 'מה קורה לאחר שהלקוח חותם?',
    q_en: 'What happens after the client signs?',
    a_he: 'לאחר חתימה: (1) הסטטוס עובר ל"מאושר" בזמן אמת בלוח הבקרה, (2) PDF משפטי מלא עם תעודת חתימה פורנזית זמין להורדה, (3) Webhook נורה עם נתוני העסקה (אם הוגדר URL בעמוד האינטגרציות), (4) ההצעה ננעלת לעריכה. ניתן לשכפל כדי ליצור גרסה חדשה.',
    a_en: 'After signing: (1) Status updates to "Accepted" in real time on your Dashboard, (2) A full legal PDF with a forensic signature certificate is ready to download, (3) A webhook fires with deal data (if a URL is configured on the Integrations page), (4) The proposal locks for editing. You can duplicate it to create a new version.',
  },
  {
    category: 'sending_tracking',
    q_he: 'מה קורה כשתאריך תפוגה עבר — "נעילת תוקף"?',
    q_en: 'What happens when an expiry date passes — the "Expiry Lock"?',
    a_he: 'כשתאריך התפוגה שהגדרת עובר וההצעה עדיין לא נחתמה, חדר הדיל נכנס למצב "פג תוקף": אזור התמחור מוטשטש, לחצן החתימה ננעל, ומוצגת הודעה אדומה עם תאריך הפקיעה. הלקוח מתבקש ליצור קשר עם השולח כדי לחדש את ההצעה. כדי לחדש — שכפל את ההצעה, הגדר תאריך תפוגה חדש, ושלח קישור מחודש.',
    a_en: "When the expiry date you set passes and the proposal is still unsigned, the Deal Room enters an 'Expired' state: the pricing zone is blurred, the signature pad is locked, and a prominent red expiry banner is shown with the exact date. The client is prompted to contact you to renew the offer. To renew — duplicate the proposal, set a new expiry date, and send a fresh link.",
  },
  {
    category: 'sending_tracking',
    q_he: 'מעקב חכם — מעקב בוואטסאפ בלחיצה אחת',
    q_en: 'Smart Follow-up — one-click WhatsApp follow-up',
    a_he: 'עבור הצעות בסטטוס "נשלחה" או "נצפתה", תפריט הנקודות (⋯) בכרטיס ההצעה מכיל פריט "מעקב ב-WhatsApp". לחיצה עליו פותחת את WhatsApp עם הודעה מותאמת אישית הכוללת את שם הלקוח, שם הפרויקט, וקישור ישיר לחדר הדיל — מוכן לשליחה. ללא העתקה ידנית, ללא טיוטות.',
    a_en: 'For proposals with status "Sent" or "Viewed", the dots menu (⋯) on the proposal card contains a "Follow Up via WhatsApp" item. Clicking it opens WhatsApp with a personalised message that includes the client\'s name, project name, and a direct link to the Deal Room — ready to send. No manual copying, no drafting.',
  },
  {
    category: 'sending_tracking',
    q_he: 'כיצד עובדים webhooks לאוטומציות?',
    q_en: 'How do webhooks work for automations?',
    a_he: 'כשלקוח חותם, DealSpace שולחת HTTP POST אוטומטי לכתובת ה-webhook שלך עם: שם פרויקט, פרטי לקוח, סכום כולל, מטבע, ו-token ציבורי. זה מאפשר אינטגרציה עם Make.com, Zapier, n8n, ו-CRM כלשהו. הגדר את ה-URL בעמוד "אינטגרציות". תכונה זו זמינה לתוכניות Pro ומעלה.',
    a_en: 'When a client signs, DealSpace sends an automatic HTTP POST to your configured webhook URL with: project name, client details, total amount, currency, and public token. This enables integrations with Make.com, Zapier, n8n, and any CRM. Configure your URL on the "Integrations" page. This feature requires a Pro plan or above.',
  },

  // ── Pricing & VAT ──────────────────────────────────────────────────────────

  {
    category: 'pricing_vat',
    q_he: 'מה זה מנוע המע"מ הישראלי — איך הוא עובד?',
    q_en: 'What is the Israeli VAT engine — how does it work?',
    a_he: 'בישראל, המחיר שמציינים ללקוח הוא תמיד המחיר הסופי הכולל. הפעל "כלול מע"מ" בסעיף התמחור אם אתה עוסק מורשה. המחיר שהזנת הוא הסכום שהלקוח ישלם — DealSpace מחשב מתוכם את רכיב המע"מ (18%) ומציג את הפירוט: לפני מע"מ + מתוכם מע"מ. המע"מ לעולם לא מתווסף על גבי המחיר שהזנת.',
    a_en: 'In Israel, the price you quote is always the final total the client pays. Enable "Include VAT" in Pricing if you are a registered VAT business (עוסק מורשה). The price you enter IS what the client pays — DealSpace extracts the VAT component (18%) from within and shows a breakdown: pre-VAT amount + VAT included. VAT is never added on top of your entered price.',
  },
  {
    category: 'pricing_vat',
    q_he: 'מה זה "מצב מסמך משפטי" ומתי להשתמש בו?',
    q_en: 'What is "Document-Only Mode" and when should I use it?',
    a_he: 'מצב מסמך משפטי (Document-Only) מסיר את כל האלמנטים הפיננסיים מחדר הדיל ומה-PDF — אין מחיר בסיס, אין תוספות, אין סכום כולל. ההצעה הופכת לכלי חתימה דיגיטלית טהור, מתאים ל: NDA, הסכמי שמירת סודיות, מסמכי סוכנות, הרשאות, והסכמי ייעוץ. הגדר ב"הגדרות מסמך" בבונה ההצעות.',
    a_en: 'Document-Only mode removes all financial elements from the Deal Room and PDF — no base price, no add-ons, no grand total. The proposal becomes a pure digital e-signing tool, perfect for: NDAs, confidentiality agreements, agency contracts, authorizations, and consulting agreements. Set it in "Document Settings" in the Proposal Builder.',
  },
  {
    category: 'pricing_vat',
    q_he: 'איך עובדות תוספות (Add-ons) ואפסייל?',
    q_en: 'How do add-ons and upsells work?',
    a_he: 'תוספות הן פריטים אופציונליים שהלקוח יכול להפעיל/לכבות בחדר הדיל. ניתן להפעיל "כמות מתכווננת" — הלקוח מזיז סליידר והסכום מתעדכן בזמן אמת. כשתוספת מופעלת, מחירה נכלל בסכום הסופי ובחוזה. מומלץ להוסיף 2-3 תוספות לכל הצעה: "תמיכה חודשית", "עמוד נוסף", "SEO" — זה מגדיל את ערך העסקה הממוצע.',
    a_en: 'Add-ons are optional extras the client can toggle in the Deal Room. You can enable "adjustable quantity" — the client moves a slider and the total updates in real time. When enabled, the add-on price is included in the final total and contract. Recommended: add 2-3 add-ons per proposal ("Monthly Support", "Extra Page", "SEO") — it increases average deal value.',
  },

  // ── Legal & Terms ──────────────────────────────────────────────────────────

  {
    category: 'legal_terms',
    q_he: 'מה זה "תנאי העסק" ואיך מגדירים אותם?',
    q_en: 'What are "Business Terms" and how do I set them up?',
    a_he: 'תנאי העסק הם תקנון שמגדירים פעם אחת בפרופיל (פרופיל → תנאי העסק) ומוקפאים אוטומטית בכל הצעה חדשה. עורך טקסט עשיר זמין — כתוב: תנאי תשלום, בעלות קניין רוחני, מדיניות ביטולים, הגבלת אחריות ועוד. הלקוח רואה אותם בחדר הדיל ומאשר אותם בצ׳קבוקס ייעודי לפני החתימה. אישור זה הוא תנאי סף — ללא אישור, כפתור החתימה נשאר נעול.',
    a_en: 'Business Terms are a T&C document you define once in your Profile (Profile → Business Terms) and are automatically frozen into every new proposal. A full rich-text editor is available — write: payment terms, IP ownership, cancellation policy, liability limitations, and more. Your client sees them in the Deal Room and must check a dedicated consent box before signing. This consent is a hard gate — without it, the sign button stays locked.',
  },
  {
    category: 'legal_terms',
    q_he: 'האם תנאי העסק שלי נכנסים לקובץ ה-PDF החתום?',
    q_en: 'Are my Business Terms included in the signed PDF?',
    a_he: 'כן, אוטומטית. מנוע ה-PDF מוסיף עמוד "תנאי העסק" לאחר תיאור הפרויקט ולפני תעודת החתימה. הפורמט נשמר: כותרות, מודגש, רשימות — בדיוק כפי שכתבת. כך הלקוח מקבל מסמך אחד שלם הכולל: הצעה + תנאים + חתימה + ביקורת פורנזית. התנאים גם מוצגים בחדר הדיל לאחר החתימה, לכל מי שחוזר לקישור.',
    a_en: "Yes, automatically. The PDF engine adds a 'Business Terms' page after the project description and before the signature certificate. Formatting is preserved: headings, bold, lists — exactly as written. Your client receives one complete document: proposal + terms + signature + forensic audit. Terms remain visible in the Deal Room after signing for anyone who revisits the link.",
  },
  {
    category: 'legal_terms',
    q_he: 'האם החתימות אלקטרוניות מחייבות חוקית בישראל?',
    q_en: 'Are electronic signatures legally binding in Israel?',
    a_he: 'כן. לפי חוק חתימה אלקטרונית תשס"א-2001, חתימה אלקטרונית מוכרת חוקית בישראל. DealSpace שומרת את כל הרכיבים הנדרשים: תמונת החתימה, חותמת זמן UTC מדויקת, שם מלא, חברה, ח.פ, כתובת, תפקיד, כתובת IP, ומזהה דפדפן (User-Agent) — כולם מופיעים בתעודת החתימה הפורנזית ב-PDF.',
    a_en: "Yes. Under Israel's Electronic Signature Law 5761-2001, electronic signatures are legally recognized. DealSpace captures all required components: signature image, precise UTC timestamp, full name, company, tax ID, address, role, IP address, and browser identifier (User-Agent) — all present in the forensic signature certificate in the PDF.",
  },

  // ── Settings & Billing ─────────────────────────────────────────────────────

  {
    category: 'settings_billing',
    q_he: 'אילו תוכניות זמינות ומה ההבדלים?',
    q_en: 'What plans are available and what are the differences?',
    a_he: 'חינם (₪0): עד 5 הצעות בחודש, חדר דיל + חתימה דיגיטלית, יצוא PDF, אנליטיקות בסיסיות — ללא Webhooks. פרו (₪19/חודש): עד 100 הצעות בחודש + הכל כולל חינם + Webhooks ואוטומציות + תמיכה ישירה. פרימיום (₪39/חודש): הצעות ללא הגבלה + הכל כולל פרו + תמיכה בעדיפות גבוהה + השפעה על מפת הדרכים. כל המחירים כוללים מע"מ.',
    a_en: 'Free (₪0): up to 5 proposals/month, Deal Room + digital signature, PDF export, basic analytics — no Webhooks. Pro (₪19/mo): up to 100 proposals/month + everything in Free + Webhooks & automations + direct support. Premium (₪39/mo): unlimited proposals + everything in Pro + priority support + roadmap influence. All prices include VAT.',
  },
  {
    category: 'settings_billing',
    q_he: 'איך מבטלים מנוי — ומה מדיניות ההחזרים?',
    q_en: 'How do I cancel my subscription — and what is the refund policy?',
    a_he: 'ניהול וביטול מנוי: עבור לפרופיל → חיוב ומנוי, או ישירות לדף /billing, ולחץ על "ניהול מנוי, חשבוניות וביטול" — תועבר לפורטל לקוחות Stripe המאובטח. ביטול נכנס לתוקף בסוף תקופת החיוב הנוכחית — תמשיך ליהנות מהתכונות עד למועד זה. **מדיניות החזרים:** לא מוצעים החזרים חלקיים או פרופורציונליים בגין זמן שלא נוצל. לאחר החיוב, השירות פעיל עד תום המחזור. לשאלות חיוב חריגות: support@dealspace.app.',
    a_en: 'Manage and cancel: go to Profile → Billing & Subscription, or directly to /billing, and click "Manage subscription, invoices & cancellation" — you will be redirected to the secure Stripe Customer Portal. Cancellation takes effect at the end of your current billing cycle — you retain full access to all features until that date. **Refund policy:** No partial or pro-rata refunds are issued for unused time within a paid billing period. Once a charge is processed, the service remains active until the cycle ends. For exceptional billing inquiries: support@dealspace.app.',
  },
  {
    category: 'settings_billing',
    q_he: 'מה קורה אם כרטיס האשראי נכשל?',
    q_en: 'What happens if my credit card payment fails?',
    a_he: 'Stripe ינסה לחייב שוב אוטומטית. בינתיים, החשבון עובר למצב "חיוב נכשל" — באנר אדום מוצג בלוח הבקרה ויצירת הצעות חדשות נחסמת. ההצעות הקיימות ממשיכות לפעול במלואן ולקבל חתימות. כדי לפתור: עדכן פרטי תשלום בפורטל לקוחות Stripe דרך דף /billing.',
    a_en: 'Stripe will automatically retry the charge. In the meantime, your account enters a "payment failed" state — a red banner appears in the Dashboard and new proposal creation is blocked. All existing proposals continue to function fully and accept client signatures. To resolve: update your payment details in the Stripe Customer Portal via the /billing page.',
  },
  {
    category: 'settings_billing',
    q_he: 'מה קורה להצעות שלי אחרי ביטול?',
    q_en: 'What happens to my proposals after canceling?',
    a_he: 'כל ההצעות הקיימות — כולל חתומות — נשמרות ונגישות לעיון. חוזים חתומים ניתנים להורדה כ-PDF בכל עת. לאחר המעבר לתוכנית חינם, תוכל לצפות בכל ההיסטוריה, אך יצירת הצעות חדשות תוגבל ל-5 בחודש.',
    a_en: 'All existing proposals — including signed contracts — are preserved and accessible for review. Signed PDFs are downloadable at any time. After your account returns to the Free plan, your full history remains visible, but creating new proposals is capped at 5 per month.',
  },
]

// ─── Knowledge Base — DealSpace Academy ──────────────────────────────────────
// 31 bilingual B2B Q&A pairs across 6 categories.
// Used by HelpCenterDrawer; extracted here so the component stays clean.

export interface KBItem {
  category: string
  q_he: string
  q_en: string
  a_he: string
  a_en: string
}

export const KB_CATEGORIES = [
  { key: 'getting_started',    label_he: 'התחלה מהירה',            label_en: 'Getting Started',           color: '#818cf8' },
  { key: 'creating_proposals', label_he: 'יצירת הצעות',            label_en: 'Creating Proposals',        color: '#a78bfa' },
  { key: 'services_contracts', label_he: 'שירותים וחוזים',         label_en: 'Services & Contracts',      color: '#34d399' },
  { key: 'sending_tracking',   label_he: 'שליחה ומעקב',            label_en: 'Sending & Tracking',        color: '#fbbf24' },
  { key: 'billing',            label_he: 'חיוב ומנויים',           label_en: 'Billing & Subscriptions',   color: '#f87171' },
  { key: 'automations',        label_he: 'אוטומציות ותקלות',       label_en: 'Automations & Troubleshooting', color: '#60a5fa' },
]

export const KNOWLEDGE_BASE: KBItem[] = [

  // ── Getting Started ────────────────────────────────────────────────────────

  {
    category: 'getting_started',
    q_he: 'מה זה DealSpace ואיך זה עוזר לי?',
    q_en: 'What is DealSpace and how does it help me?',
    a_he: 'DealSpace היא פלטפורמה ישראלית ליצירת "חדרי דיל" — הצעות מחיר אינטראקטיביות שהלקוח יכול לצפות, לבחור שדרוגים, ולחתום ישירות מהדפדפן. במקום PDF סטטי, הלקוח מקבל דף אינטרנט חיה עם פרטי הפרויקט, אפשרויות תוספות, ולחצן חתימה. לאחר החתימה — קובץ PDF משפטי נוצר אוטומטית עם תעודת חתימה, חותמת זמן, ונתיב ביקורת מלא.',
    a_en: 'DealSpace is an Israeli platform for creating "Deal Rooms" — interactive proposals your client can view, customize upgrade options, and sign directly from their browser. Instead of a static PDF, the client gets a live web page. After signing, a legally valid PDF is generated automatically with a signature certificate, timestamp, and full forensic audit trail.',
  },
  {
    category: 'getting_started',
    q_he: 'איך יוצרים הצעת מחיר ראשונה?',
    q_en: 'How do I create my first proposal?',
    a_he: 'לחץ "הצעה חדשה" בלוח הבקרה. מלא: שם הפרויקט, שם הלקוח, ומחיר בסיס. הוסף תוספות אופציונליות ואבני דרך לתשלום אם צריך. לחץ "שלח" כדי לקבל קישור ייחודי לחדר הדיל — שלח אותו ללקוח בוואטסאפ, מייל, או כל ערוץ אחר. הלקוח פותח, מאשר, וחותם — הכל ב-60 שניות.',
    a_en: 'Click "New Proposal" in the Dashboard. Fill in: project name, client name, and base price. Add optional add-ons and payment milestones if needed. Click "Send" to get a unique Deal Room link — share it with your client via WhatsApp, email, or any channel. Client opens, approves, and signs — all in 60 seconds.',
  },
  {
    category: 'getting_started',
    q_he: 'איך מגדירים את פרופיל העסק?',
    q_en: 'How do I set up my business profile?',
    a_he: 'עבור לפרופיל (אייקון המשתמש → פרופיל). מלא: שם מלא, שם חברה, ח.פ/מספר עוסק, כתובת, טלפון, ושם מורשה חתימה. הוסף לוגו חברה וצבע מותג. כל הפרטים מוזרקים אוטומטית לכל הצעה חדשה — שם שולח, לוגו, וצבעי המותג מופיעים בחדר הדיל ובחוזה החתום.',
    a_en: "Go to Profile (user icon → Profile). Fill in: full name, company name, tax/VAT ID, address, phone, and authorized signatory name. Add a company logo and brand color. All details auto-inject into every new proposal — your name, logo, and brand colors appear in the Deal Room and signed contract.",
  },
  {
    category: 'getting_started',
    q_he: 'מה ההבדל בין תוכנית חינם לתוכניות בתשלום?',
    q_en: 'What is the difference between free and paid plans?',
    a_he: 'חינם: עד 3 הצעות פעילות במקביל, ללא אינטגרציות. Pro: עד 30 הצעות + webhook automations לחיבור Make.com/Zapier/CRM. Unlimited: הצעות ללא הגבלה + כל תכונות Pro + עדיפות בתמיכה. כל התוכניות כוללות: חתימות דיגיטליות, PDF מקצועי, חדרי דיל אינטראקטיביים, ומעקב engagement.',
    a_en: 'Free: up to 3 active proposals, no integrations. Pro: up to 30 proposals + webhook automations to connect Make.com/Zapier/CRM. Unlimited: unlimited proposals + all Pro features + priority support. All plans include: digital signatures, professional PDF, interactive Deal Rooms, and engagement tracking.',
  },
  {
    category: 'getting_started',
    q_he: 'איך משנים שפת ממשק?',
    q_en: 'How do I change the interface language?',
    a_he: 'לחץ על כפתור השפה בפינת הניווט (EN / עב). DealSpace תומך בעברית RTL ואנגלית LTR. הבחירה נשמרת לוקאלית. שפת הממשק לא משפיעה על תוכן ההצעות — ניתן לכתוב בכל שפה.',
    a_en: "Click the language toggle in the navigation corner (EN / עב). DealSpace supports Hebrew RTL and English LTR. The choice is saved locally. The interface language does not affect proposal content — proposals can be written in any language.",
  },

  // ── Creating Proposals ─────────────────────────────────────────────────────

  {
    category: 'creating_proposals',
    q_he: 'איך עובדות תוספות (Add-ons)?',
    q_en: 'How do add-ons work?',
    a_he: 'תוספות הן פריטים אופציונליים שהלקוח יכול להפעיל/לכבות בחדר הדיל. ניתן לאפשר "כמות מתכווננת" — הלקוח מזיז סליידר והסכום מתעדכן בזמן אמת. כשתוספת מופעלת — מחירה נכלל בסכום הסופי ובחוזה החתום. תוספות הן כלי אפסייל עוצמתי: "תוסף SEO", "עמוד נוסף", "תמיכה חודשית".',
    a_en: 'Add-ons are optional extras the client can toggle in the Deal Room. You can enable "adjustable quantity" — the client moves a slider and the total updates in real time. When an add-on is enabled, its price is included in the final total and signed contract. Add-ons are a powerful upsell tool: "SEO addon", "Extra page", "Monthly support".',
  },
  {
    category: 'creating_proposals',
    q_he: 'איך עובדים אבני דרך לתשלום?',
    q_en: 'How do Payment Milestones work?',
    a_he: 'אבני דרך מחלקות את התשלום הכולל לשלבים. הוסף שורות עם שם ואחוז — הסכום חייב להיות 100% בדיוק. הלקוח רואה את לוח התשלומים בחדר הדיל ובחוזה. דוגמה: "מקדמה 30%", "בסיום האפיון 30%", "בסיום הפרויקט 40%". אם אחוזים לא מסתכמים ל-100%, המערכת מציגה אזהרה.',
    a_en: "Milestones split the total into payment stages. Add rows with name and percentage — they must total exactly 100%. The client sees the payment schedule in the Deal Room and contract. Example: 'Deposit 30%', 'After Scoping 30%', 'Project Completion 40%'. If percentages don't sum to 100%, the system shows a warning.",
  },
  {
    category: 'creating_proposals',
    q_he: 'מה זה מע"מ ואיך מגדירים אותו?',
    q_en: 'What is VAT and how do I configure it?',
    a_he: 'הפעל "כלול מע"מ" בסעיף התמחור אם אתה עוסק מורשה. שיעור המע"מ (ברירת מחדל 18%) ניתן לשינוי בפרופיל ← שיעור מע"מ. חדר הדיל מציג: בסיס + מע"מ = סכום כולל. החוזה החתום כולל שורת מע"מ לצרכי חשבונאות.',
    a_en: 'Enable "Include VAT" in Pricing if you are a registered VAT business. The VAT rate (default 18%) is configurable in Profile → VAT Rate. The Deal Room shows a full breakdown: base + VAT = total. The signed PDF includes the VAT line for accounting purposes.',
  },
  {
    category: 'creating_proposals',
    q_he: 'האם ניתן לשנות מטבע?',
    q_en: 'Can I change the currency?',
    a_he: 'כן. בסעיף "תמחור בסיסי" בחר בין ₪ ILS, $ USD, ו-€ EUR. הסמל המתאים מוצג בחדר הדיל ובחוזה. DealSpace לא מבצע המרת שערים אוטומטית — ההמרה היא אחריותך.',
    a_en: 'Yes. In "Base Pricing" choose between ₪ ILS, $ USD, and € EUR. The correct symbol is shown in the Deal Room and contract. DealSpace does not perform automatic exchange rate conversion.',
  },
  {
    category: 'creating_proposals',
    q_he: 'איך עובד כותב ה-AI לתיאורים?',
    q_en: 'How does the AI description writer work?',
    a_he: 'בסעיף "פרטי הפרויקט" לחץ על כפתור ה-AI (ניצוץ). הזן תיאור קצר של הפרויקט ולחץ "יצור". ה-AI מייצר תיאור מקצועי ועשיר שמתאים ישירות לשדה. ניתן לייצר מחדש עד שהתוצאה מדויקת. חושבי על זה כעוזר כתיבה: אתה מספק את "מה", הוא מחזיר את "איך זה נשמע טוב".',
    a_en: "In 'Project Info' click the AI button (spark icon). Enter a brief project summary and click 'Generate'. The AI produces a professional, detailed description that inserts directly into the field. Regenerate until perfect. Think of it as a writing assistant: you provide the 'what', it returns the 'sounds great'.",
  },
  {
    category: 'creating_proposals',
    q_he: 'האם ניתן להגדיר תאריך תפוגה?',
    q_en: 'Can I set an expiry date?',
    a_he: 'כן. בסעיף "תמחור בסיסי" לחץ על שדה "תוקף הצעה" ובחר תאריך. חדר הדיל יציג ספירה לאחור ("פג תוקף בעוד X ימים"). כשפג התוקף — החדר נעצר ומציג הודעת פקיעה ולא ניתן לחתום.',
    a_en: 'Yes. In "Base Pricing" click the "Proposal Expiry" field and pick a date. The Deal Room shows a countdown ("Expires in X days"). When expired — the room halts and shows an expiry message, preventing signing.',
  },
  {
    category: 'creating_proposals',
    q_he: 'מה זה "Smart Variables" ואיך הם עובדים?',
    q_en: 'What are Smart Variables and how do they work?',
    a_he: 'DealSpace מזריק אוטומטית את פרטי הפרופיל שלך (שם חברה, ח.פ, כתובת, שם מורשה חתימה) לכל הצעה חדשה דרך שדה creator_info. כאשר הלקוח חותם, פרטיו (שם, חברה, ת.ז) נלכדים ומוזרקים לחוזה ולתעודת החתימה. זה מבטיח שהחוזה תמיד מכיל את הפרטים המעודכנים ביותר — ללא קשר מתי יצרת את ההצעה.',
    a_en: 'DealSpace automatically injects your profile details (company name, tax ID, address, authorized signatory) into every new proposal via the creator_info field. When the client signs, their details (name, company, ID) are captured and injected into the contract and signature certificate. This ensures the contract always contains the most up-to-date details — regardless of when you created the proposal.',
  },

  // ── Services & Contracts ───────────────────────────────────────────────────

  {
    category: 'services_contracts',
    q_he: 'איך עובדת ספריית השירותים?',
    q_en: 'How does the Services Library work?',
    a_he: 'ספריית השירותים (תפריט ← שירותים שמורים) מאפשרת להגדיר שירותים חוזרים עם מחירים קבועים. בעת יצירת הצעה, לחץ "✨ Library" בסעיף התוספות — בחר שירותים ולחץ "הוסף". השירותים מוכנסים מיידית. שינוי שירות בספרייה לא משפיע על הצעות קיימות — כל הצעה היא עותק עצמאי.',
    a_en: "The Services Library (menu → Saved Services) lets you define reusable service items with fixed prices. When creating a proposal, click '✨ Library' in the Add-ons section — select services and click 'Add'. Services insert instantly. Editing a library service does not affect existing proposals — each proposal is an independent copy.",
  },
  {
    category: 'services_contracts',
    q_he: 'איך מצרפים תבנית חוזה?',
    q_en: 'How do I attach a contract template?',
    a_he: 'בעורך ההצעה, בסעיף "חוזה ותנאים", לחץ "בחר תבנית חוזה". ספריית החוזים שלך תיפתח. בחר תבנית — הטקסט מוכנס לעורך TipTap. ניתן לערוך ולהתאים לפרויקט. התבנית מופיעה בחדר הדיל ובחוזה החתום.',
    a_en: 'In the Proposal Editor under "Contract & Terms", click "Select Contract Template". Your contract library opens. Choose a template — the text inserts into the TipTap editor. You can edit and customize for the project. The template appears in the Deal Room and signed contract.',
  },
  {
    category: 'services_contracts',
    q_he: 'מה ניתן לעצב בעורך החוזה?',
    q_en: 'What formatting is available in the contract editor?',
    a_he: 'עורך TipTap תומך: כותרות H1-H3, מודגש, נטוי, רשימות ממוספרות ונקודות, קישורים. ניתן לכתוב בעברית ואנגלית. החוזה מופיע ב-PDF בדף תוכן מלא. אין מגבלת אורך.',
    a_en: 'TipTap editor supports: H1-H3 headings, bold, italic, numbered and bulleted lists, links. You can write in Hebrew and English. The contract renders in the PDF on a full content page. No length limit.',
  },
  {
    category: 'services_contracts',
    q_he: 'האם החתימות אלקטרוניות מחייבות חוקית?',
    q_en: 'Are electronic signatures legally binding?',
    a_he: 'כן. לפי חוק חתימה אלקטרונית תשס"א-2001, חתימה אלקטרונית מוכרת חוקית בישראל. DealSpace שומרת: תמונת החתימה, חותמת זמן מדויקת, שם הלקוח, חברה, ת.ז/ח.פ, כתובת IP, ומזהה דפדפן — כל המרכיבים הנדרשים לעמידה בדרישות החוק.',
    a_en: "Yes. Under Israel's Electronic Signature Law 5761-2001, electronic signatures are legally recognized. DealSpace captures: signature image, precise timestamp, client name, company, tax ID, IP address, and browser identifier — all components required by law.",
  },

  // ── Sending & Tracking ─────────────────────────────────────────────────────

  {
    category: 'sending_tracking',
    q_he: 'איך שולחים הצעה ללקוח?',
    q_en: 'How do I send a proposal to a client?',
    a_he: 'לחץ "שלח" בסרגל הכותרת. בחלון השליחה: (א) העתק את הקישור ושלח בוואטסאפ/SMS; (ב) הזן כתובת מייל — DealSpace תשלח מייל מקצועי עם כפתור CTA לחדר הדיל. המייל מתועד ב-timestamp ומאפשר מעקב פתיחה.',
    a_en: 'Click "Send" in the top bar. In the send modal: (a) Copy the link and share via WhatsApp/SMS; (b) Enter an email address — DealSpace sends a professional branded email with a CTA button to the Deal Room. The email is timestamped and allows open tracking.',
  },
  {
    category: 'sending_tracking',
    q_he: 'האם הלקוח צריך חשבון?',
    q_en: 'Does the client need an account?',
    a_he: 'לא. חדר הדיל הוא ציבורי לחלוטין — הלקוח פותח את הקישור, ללא הרשמה, ויכול לחתום מהדפדפן תוך פחות מ-60 שניות. אנחנו מחסלים כל חסם אפשרי בין הלקוח שלך לחתימה.',
    a_en: 'No. The Deal Room is fully public — the client opens the link, no account needed, and can sign from their browser in under 60 seconds. We eliminate every possible barrier between your client and the signature.',
  },
  {
    category: 'sending_tracking',
    q_he: 'איך יודע אם הלקוח פתח את המייל?',
    q_en: 'How do I know if the client opened the email?',
    a_he: 'כשהלקוח פותח את המייל ולוחץ על הקישור לחדר הדיל, DealSpace מתעד זאת בפעם הראשונה. כרטיס ההצעה מציג אז תג "נפתח" בסגול עם חותמת זמן.',
    a_en: 'When the client opens the email and clicks the Deal Room link for the first time, DealSpace records it. The proposal card then shows a purple "Opened" badge with a timestamp.',
  },
  {
    category: 'sending_tracking',
    q_he: 'איך עוקבים אחרי מעורבות הלקוח?',
    q_en: 'How do I track client engagement?',
    a_he: 'כרטיס ההצעה מציג: מספר צפיות, זמן שהייה כולל בשניות, וזמן הצפייה האחרון — בזמן אמת. "הלקוח צפה 3 פעמים וביזבז 8 דקות" = הוא רציני, זה זמן לפון.',
    a_en: "The proposal card shows: view count, total time spent in seconds, and last viewed timestamp — in real time. 'Client viewed 3 times, spent 8 minutes' = they're serious, time to call.",
  },
  {
    category: 'sending_tracking',
    q_he: 'מה קורה לאחר שהלקוח חותם?',
    q_en: 'What happens after the client signs?',
    a_he: 'לאחר חתימה: (1) סטטוס עובר ל"מאושר" בזמן אמת בלוח הבקרה, (2) PDF משפטי מלא זמין להורדה, (3) Webhook נורה עם נתוני העסקה (אם מוגדר), (4) ההצעה ננעלת לעריכה. ניתן לשכפל כדי ליצור גרסה חדשה.',
    a_en: 'After signing: (1) Status changes to "Accepted" in real time on your Dashboard, (2) Full legal PDF is ready to download, (3) Webhook fires with deal data (if configured), (4) Proposal locks for editing. You can duplicate to create a new version.',
  },
  {
    category: 'sending_tracking',
    q_he: 'האם לקוחות יכולים לדחות הצעה?',
    q_en: 'Can clients decline a proposal?',
    a_he: 'כן. הלקוח יכול ללחוץ "דחה הצעה" בחדר הדיל. הסטטוס עובר ל"נדחתה" בזמן אמת. לאחר מכן תוכל לשכפל את ההצעה, לעדכן תמחור/תנאים, ולשלוח גרסה מחודשת.',
    a_en: "Yes. The client can click 'Decline' in the Deal Room. Status updates to 'Declined' in real time. You can then duplicate the proposal, update pricing/terms, and send a revised version.",
  },

  // ── Billing & Subscriptions ────────────────────────────────────────────────

  {
    category: 'billing',
    q_he: 'אילו תוכניות זמינות?',
    q_en: 'What plans are available?',
    a_he: 'חינם: 3 הצעות פעילות. Pro: עד 30 הצעות + webhook automations + עדיפות בתמיכה. Unlimited: הצעות ללא הגבלה + כל תכונות Pro + שירות VIP. כל התוכניות: חתימות דיגיטליות, PDF מקצועי, ניתוח ביצועים.',
    a_en: 'Free: 3 active proposals. Pro: up to 30 proposals + webhook automations + priority support. Unlimited: unlimited proposals + all Pro features + VIP service. All plans: digital signatures, professional PDF, performance analytics.',
  },
  {
    category: 'billing',
    q_he: 'מה קורה אם כרטיס האשראי שלי נכשל?',
    q_en: 'What happens if my credit card payment fails?',
    a_he: 'Stripe ינסה לחייב שוב אוטומטית. בינתיים חשבונך עובר למצב "past_due" — באנר אדום מוצג בלוח הבקרה, ויצירת הצעות חדשות נחסמת. ההצעות הקיימות ממשיכות לפעול ולקבל חתימות. עדכן פרטי תשלום בפורטל לקוחות Stripe.',
    a_en: 'Stripe will automatically retry the charge. In the meantime your account enters "past_due" — a red banner appears in the Dashboard and new proposal creation is blocked. Existing proposals continue to function and accept signatures. Update your payment details in the Stripe customer portal.',
  },
  {
    category: 'billing',
    q_he: 'איך מבטלים מנוי?',
    q_en: 'How do I cancel my subscription?',
    a_he: 'לחץ על תג התוכנית (Pro / Unlimited) בלוח הבקרה ← "ניהול מנוי". תועבר לפורטל Stripe. ביטול מוגדר לסוף תקופת החיוב — תמשיך ליהנות מהתכונות עד תאריך החידוש. לאחר הביטול, החשבון חוזר לתוכנית חינם.',
    a_en: "Click your plan badge (Pro / Unlimited) in the Dashboard → 'Manage Subscription'. You'll be redirected to the Stripe portal. Cancellation takes effect at end of billing period — you keep features until renewal. After cancellation, account returns to free plan.",
  },
  {
    category: 'billing',
    q_he: 'מה קורה להצעות שלי אחרי ביטול?',
    q_en: 'What happens to my proposals after canceling?',
    a_he: 'כל ההצעות הקיימות — כולל חתומות — נשמרות ונגישות. חוזים חתומים ניתנים להורדה כ-PDF בכל עת. לאחר חזרה לתוכנית חינם תוכל לראות את כל ההצעות אך לא ליצור חדשות מעבר למגבלת 3.',
    a_en: 'All existing proposals — including signed ones — are preserved and accessible. Signed contracts are downloadable as PDFs at any time. After returning to free plan you can view all proposals but cannot create new ones beyond the 3-proposal limit.',
  },
  {
    category: 'billing',
    q_he: 'האם יש מדיניות החזר כספי?',
    q_en: 'Is there a refund policy?',
    a_he: 'DealSpace מציעה ניסיון חינם ללא כרטיס אשראי. אם אינך מרוצה מהתוכנית בתשלום, פנה לתמיכה תוך 7 ימים מהחיוב הראשון לקבלת החזר יחסי. אנחנו ישראלים — מדברים ישירות.',
    a_en: 'DealSpace offers a free trial with no credit card required. If unhappy with a paid plan, contact support within 7 days of the first charge for a prorated refund.',
  },

  // ── Automations & Troubleshooting ──────────────────────────────────────────

  {
    category: 'automations',
    q_he: 'כיצד עובדים webhooks?',
    q_en: 'How do webhooks work?',
    a_he: 'כאשר לקוח חותם, DealSpace שולחת HTTP POST אוטומטי לכתובת ה-webhook שלך עם: שם פרויקט, לקוח, סכום, מטבע, ו-token ציבורי. זה מאפשר אינטגרציה עם Make.com, Zapier, n8n, ו-CRM כלשהו. הגדר את ה-URL בעמוד "אינטגרציות".',
    a_en: 'When a client signs, DealSpace sends an automatic HTTP POST to your webhook URL with: project name, client, amount, currency, and public token. This enables integration with Make.com, Zapier, n8n, and any CRM. Configure your URL on the "Integrations" page.',
  },
  {
    category: 'automations',
    q_he: 'כיצד מחברים Make.com או Zapier?',
    q_en: 'How do I connect Make.com or Zapier?',
    a_he: 'ב-Make.com/Zapier: צור תרחיש/Zap חדש עם Webhook → "Catch Hook". העתק את ה-URL שנוצר. הדבק אותו בשדה Webhook URL בעמוד "אינטגרציות" ב-DealSpace. לחץ "Test Connection" לאימות. מעכשיו, כל חתימה תפעיל את האוטומציה שלך.',
    a_en: "In Make.com/Zapier: create a scenario/Zap with Webhook → 'Catch Hook'. Copy the generated URL. Paste it in the Webhook URL field on DealSpace's 'Integrations' page. Click 'Test Connection' to verify. From now on, every signature triggers your automation.",
  },
  {
    category: 'automations',
    q_he: 'למה ה-PDF נראה שונה מחדר הדיל?',
    q_en: 'Why does the PDF look different from the Deal Room?',
    a_he: 'זה עיצוב מכוון. חדר הדיל הוא חוויה אינטראקטיבית עם אנימציות ועיצוב מותג. ה-PDF הוא מסמך "White Paper" עסקי מקצועי — רקע לבן, גופן ניטרלי, מתאים לתיוק ולהצגה בבית משפט. PDFים שמיועדים לחתימה ולארכיב צריכים להיראות כמסמכים רשמיים.',
    a_en: "This is by design. The Deal Room is an interactive branded experience. The PDF is a professional 'White Paper' — white background, neutral typography, suitable for filing and legal proceedings. PDFs intended for signing and archiving should look like official documents.",
  },
  {
    category: 'automations',
    q_he: 'כיצד עובד מעקב IP של החותם?',
    q_en: 'How does signer IP tracking work?',
    a_he: 'ברגע שהלקוח חותם, DealSpace מבצע בקשת IP אנונימית ושומר את כתובת ה-IP ומזהה הדפדפן (User-Agent) יחד עם חותמת הזמן. הנתונים מופיעים בתעודת החתימה ב-PDF בסקשן "Forensic Audit Trail". ראיות אלה ניתנות להצגה בבית משפט.',
    a_en: "At signing, DealSpace performs an anonymous IP lookup and saves the IP address and browser identifier (User-Agent) along with the timestamp. The data appears in the signature certificate PDF's 'Forensic Audit Trail' section. These are legally admissible evidence.",
  },
  {
    category: 'automations',
    q_he: 'ה-PDF לא מוריד — מה עושים?',
    q_en: 'The PDF is not downloading — what should I do?',
    a_he: 'בדוק שהדפדפן לא חוסם קבצי PDF (הגדרות Pop-up / Downloads). רענן ונסה שוב. נסה דפדפן שונה (Chrome/Safari). לוגו חברה גדול מאוד עלול להאט את הייצור — מומלץ 400×200px.',
    a_en: 'Check that your browser is not blocking PDF downloads (Pop-up / Downloads settings). Refresh and try again. Try a different browser (Chrome/Safari). A very large company logo may slow generation — 400×200px is recommended.',
  },
]

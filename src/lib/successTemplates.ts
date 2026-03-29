// ─── Success Templates ────────────────────────────────────────────────────────
// Post-signature success messages shown to the client in the Deal Room.
// Use {{Client_Name}} and {{Total}} as dynamic placeholders.

export type TemplateStyle = 'formal' | 'excited' | 'short' | 'creative' | 'warm'

export interface SuccessTemplate {
  id: string
  style: TemplateStyle
  label_en: string
  label_he: string
  message_en: string
  message_he: string
}

export const SUCCESS_TEMPLATES: SuccessTemplate[] = [
  {
    id: 'formal-corporate',
    style: 'formal',
    label_en: 'Formal Corporate',
    label_he: 'רשמי ועסקי',
    message_en:
      'Agreement Confirmed. Thank you, {{Client_Name}}. Your proposal has been officially signed and recorded. A copy of the signed agreement is available for download. We look forward to delivering outstanding results.',
    message_he:
      'ההסכם אושר רשמית. תודה, {{Client_Name}}. הצעת המחיר נחתמה ונשמרה. עותק ההסכם החתום זמין להורדה. אנו מצפים לספק תוצאות מעולות.',
  },
  {
    id: 'excited-creative',
    style: 'excited',
    label_en: 'Excited & Creative',
    label_he: 'נלהב ויצירתי',
    message_en:
      "🚀 Let's GO, {{Client_Name}}! The deal is DONE — we're officially a team! Get ready for something extraordinary. The signed PDF is yours to keep.",
    message_he:
      '🚀 מתחילים, {{Client_Name}}! הדיל סגור — אנחנו רשמית צוות! תתכונן/י למשהו יוצא מן הכלל. ה-PDF החתום שמור לך.',
  },
  {
    id: 'short-sweet',
    style: 'short',
    label_en: 'Short & Sweet',
    label_he: 'קצר ולעניין',
    message_en: "Signed, sealed, delivered. Welcome aboard, {{Client_Name}}. We'll be in touch soon.",
    message_he: 'חתמנו, אישרנו, צעדנו קדימה. ברוך הבא, {{Client_Name}}. ניצור קשר בקרוב.',
  },
  {
    id: 'warm-personal',
    style: 'warm',
    label_en: 'Warm & Personal',
    label_he: 'חם ואישי',
    message_en:
      "It's official! Thank you so much, {{Client_Name}} — this means a lot. We're genuinely excited to work with you and make this project something special.",
    message_he:
      'סגרנו! תודה רבה, {{Client_Name}} — זה מאוד משמח. אנחנו נרגשים לעבוד איתך ולהפוך את הפרויקט הזה למשהו מיוחד.',
  },
  {
    id: 'professional-brief',
    style: 'formal',
    label_en: 'Professional Brief',
    label_he: 'מקצועי קצר',
    message_en:
      "Proposal accepted. Thank you, {{Client_Name}}. Total confirmed: {{Total}}. We'll reach out within one business day to kick things off.",
    message_he:
      'ההצעה אושרה. תודה, {{Client_Name}}. סה״כ מאושר: {{Total}}. ניצור קשר תוך יום עסקים אחד להתחלת העבודה.',
  },
  {
    id: 'deal-closed',
    style: 'excited',
    label_en: 'Deal Closed!',
    label_he: 'סגרנו דיל!',
    message_en:
      "🎉 Deal closed! {{Client_Name}}, your agreement for {{Total}} is locked in. We can't wait to get started — epic things are coming.",
    message_he:
      '🎉 סגרנו את הדיל! {{Client_Name}}, ההסכם על {{Total}} מאושר ומאובטח. אנחנו ממש מתרגשים — יש לנו עסק גדול לעשות ביחד.',
  },
  {
    id: 'creative-studio',
    style: 'creative',
    label_en: 'Creative Studio',
    label_he: 'סטודיו יצירתי',
    message_en:
      "✨ Magic is about to happen. {{Client_Name}}, your project is officially in motion. We've locked in {{Total}} and our creative engines are already spinning.",
    message_he:
      '✨ הקסם עומד להתחיל. {{Client_Name}}, הפרויקט שלך בדרך. {{Total}} מאושר ומנוע היצירה שלנו כבר מסתובב.',
  },
  {
    id: 'tech-startup',
    style: 'excited',
    label_en: 'Tech Startup',
    label_he: 'סטארטאפ טכנולוגי',
    message_en:
      "Shipped ✓ Contract signed. Scope locked. Budget confirmed at {{Total}}. Welcome to the build, {{Client_Name}} — let's move fast.",
    message_he:
      'נשלח ✓ חוזה חתום. היקף נעול. תקציב מאושר: {{Total}}. ברוך הבא לבנייה, {{Client_Name}} — בואו נזוז מהר.',
  },
]

export const DEFAULT_TEMPLATE_ID = 'deal-closed'

/** Interpolate {{Client_Name}} and {{Total}} placeholders */
export function interpolateSuccess(
  template: SuccessTemplate,
  locale: 'he' | 'en',
  clientName: string,
  total: string,
): string {
  const raw = locale === 'he' ? template.message_he : template.message_en
  return raw
    .replace(/\{\{Client_Name\}\}/g, clientName || (locale === 'he' ? 'לקוח' : 'Client'))
    .replace(/\{\{Total\}\}/g, total)
}

import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ShieldCheck, Monitor, Keyboard, Eye, Phone, Mail, User } from 'lucide-react'
import { useI18n } from '../lib/i18n'

// ─── Section component ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 pb-2 text-slate-900 dark:text-white/90 border-b border-indigo-500/25">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] leading-relaxed mb-3 text-slate-600 dark:text-white/60">
      {children}
    </p>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mb-4 ps-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600 dark:text-white/55">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-none bg-indigo-500" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function InfoBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.07]">
      <span className="text-indigo-400">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">{label}</p>
        <p className="text-[13px] font-semibold text-slate-800 dark:text-white/75">{value}</p>
      </div>
    </div>
  )
}

// ─── Hebrew content ───────────────────────────────────────────────────────────

function HebrewStatement() {
  return (
    <div dir="rtl" lang="he">
      <Section title="הצהרת נגישות — DealSpace">
        <Paragraph>
          אנו ב-DealSpace מחויבים לעקרון השוויון הדיגיטלי ולמתן גישה שווה לכלל המשתמשים, לרבות אנשים עם מוגבלויות מסוגים שונים. אנו רואים בנגישות דיגיטלית ערך מרכזי ולא רק חובה חוקית.
        </Paragraph>
        <Paragraph>
          הצהרה זו נכתבה בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח–1998, ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג–2013, ובהתאם לתקן הישראלי IS 5568 (תקן ת"י 5568) המבוסס על WCAG 2.1 ו-WCAG 2.2 ברמת AA.
        </Paragraph>
      </Section>

      <Section title="רמת הנגישות שהושגה">
        <Paragraph>
          אתר DealSpace עומד ברמת WCAG 2.2 Level AA — רמת הנגישות הנדרשת לפי התקן הישראלי IS 5568. ביצענו סקירה מקיפה של ממשק המשתמש, תהליכי העבודה והמסמכים הדיגיטליים שהמערכת מייצרת.
        </Paragraph>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <ShieldCheck size={20} className="text-indigo-400 flex-none" />
          <div>
            <p className="text-[12px] font-bold text-indigo-300">WCAG 2.2 Level AA | IS 5568 | חוק שוויון זכויות לאנשים עם מוגבלות</p>
            <p className="text-[11px] text-slate-500 dark:text-white/40">עדכון אחרון: מרץ 2026</p>
          </div>
        </div>
      </Section>

      <Section title="התאמות הנגישות שבוצעו">
        <Paragraph>
          להלן ההתאמות שבוצעו באתר DealSpace כדי להבטיח שימוש נוח ונגיש לכלל המשתמשים:
        </Paragraph>

        <h3 className="text-[13px] font-bold mb-2 text-slate-700 dark:text-white/70">
          <Keyboard size={13} className="inline me-2 text-indigo-400" />
          ניווט ושליטה
        </h3>
        <BulletList items={[
          'ניווט מלא במקלדת בכל דפי האתר — ניתן לגשת לכל פונקציה ללא שימוש בעכבר.',
          'סדר טאב (Tab order) לוגי ועקבי המשקף את ההיררכיה החזותית של הדף.',
          'עיצוב focus-visible ברור — כל אלמנט בפוקוס מסומן בגבול ניגוד גבוה.',
          'תמיכה מלאה ב-Skip Links לדילוג על אזורי ניווט חוזרים.',
        ]} />

        <h3 className="text-[13px] font-bold mb-2 mt-4 text-slate-700 dark:text-white/70">
          <Eye size={13} className="inline me-2 text-indigo-400" />
          ראייה וניגוד
        </h3>
        <BulletList items={[
          'יחסי ניגוד צבע עומדים בדרישות WCAG 2.2 AA: לפחות 4.5:1 לטקסט רגיל ו-3:1 לטקסט גדול.',
          'כל הטקסטים ניתנים להגדלה עד 150% ללא איבוד תוכן או פונקציונליות, באמצעות כלי הנגישות המובנה.',
          'אין מידע המועבר באמצעות צבע בלבד — כל מידע חיוני מגובה בטקסט, צורה או ARIA.',
          'תמיכה במצב ניגוד גבוה ומצב גווני אפור (מונוכרום) דרך כלי הנגישות המובנה.',
          'פונט חלופי קריא (Arial) זמין דרך כלי הנגישות להפחתת עומס ויזואלי.',
        ]} />

        <h3 className="text-[13px] font-bold mb-2 mt-4 text-slate-700 dark:text-white/70">
          תוכן ולוגיקה
        </h3>
        <BulletList items={[
          'כל התמונות, האייקונים ואלמנטי הגרפיקה מלווים בתגיות alt או aria-label מתאימות.',
          'כל טפסי הקלט מלווים ב-label מפורש, הוראות שגיאה ברורות ו-aria-describedby לתיאורים מורחבים.',
          'האתר בנוי על HTML סמנטי תקני (h1–h6, nav, main, section, article, footer) לגישה מלאה מתוכנות קריאת מסך.',
          'הודעות שגיאה ואישור מועברות דרך aria-live regions כדי שתוכנות קריאת מסך יקראו אותן באופן מיידי.',
          'האתר דו-לשוני (עברית / אנגלית) עם תמיכה מלאה ב-RTL ובפונטים עבריים נגישים.',
          'ניתן לעצור את כל האנימציות דרך כלי הנגישות לאנשים עם רגישות לתנועה (Vestibular Disorders).',
          'האתר מכבד את הגדרת prefers-reduced-motion של מערכת ההפעלה.',
        ]} />
      </Section>

      <Section title="תאימות דפדפנים ועזרים טכנולוגיים">
        <Paragraph>
          האתר נבדק ונמצא פועל כראוי עם שילובי הדפדפן/תוכנת קריאת מסך הבאים:
        </Paragraph>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { b: 'Google Chrome 120+', s: 'NVDA / JAWS (Windows)' },
            { b: 'Safari 17+', s: 'VoiceOver (macOS / iOS)' },
            { b: 'Microsoft Edge 120+', s: 'Narrator (Windows)' },
            { b: 'Firefox 121+', s: 'NVDA (Windows)' },
          ].map(row => (
            <div key={row.b} className="rounded-xl px-3 py-2 bg-white border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.06]">
              <p className="text-[12px] font-semibold text-slate-700 dark:text-white/70">{row.b}</p>
              <p className="text-[11px] text-slate-500 dark:text-white/35">{row.s}</p>
            </div>
          ))}
        </div>
        <Paragraph>
          <span className="font-medium text-slate-700 dark:text-white/70">הערה:</span> האתר מותאם למסכים מכל הגדלים — נייד, טאבלט ומחשב שולחני, בהתאם לעקרונות Responsive Design.
        </Paragraph>
      </Section>

      <Section title="כלי הנגישות המובנה — 14 פקדי נגישות">
        <Paragraph>
          DealSpace כוללת כלי נגישות מובנה הזמין בכל דפי הפלטפורמה — ללא צורך בהורדה או התקנה. הכלי נגיש דרך כפתור FAB קבוע בפינת המסך. להלן 14 הפקדים הזמינים:
        </Paragraph>
        <BulletList items={[
          'גודל טקסט — הגדלת הגופן בין 100% ל-150% ב-5 רמות, ללא שינוי פריסת הדף.',
          'ניגוד גבוה — מגביר ניגוד, בהירות וצבעוניות לשיפור קריאות עבור לקויי ראייה.',
          'מונוכרום — הצגת כל הממשק בגוני אפור להפחתת עומס ויזואלי.',
          'היפוך צבעים — היפוך מלא של כל צבעי המסך עם סיבוב גוון לשמירת קריאות.',
          'מצב עיוורון צבעים — תיקון מותאם לשלושה סוגים: פרוטנופיה (אדום-ירוק), דאוטרנופיה (ירוק), וטריטנופיה (כחול-צהוב).',
          'גופן דיסלקציה — מעבר לגופן Atkinson Hyperlegible, המיועד לשיפור קריאות עבור לוקים בדיסלקציה.',
          'גופן קריא — מעבר לגופן Arial סטנדרטי להפחתת עומס קוגניטיבי.',
          'מרווח שורות מוגדל — הגדלת גובה השורה ל-2.1 לשיפור הפרדה בין שורות טקסט.',
          'מרווח אותיות — הגדלת ריווח בין אותיות ב-0.06em לשיפור קריאות.',
          'מסכת קריאה — שכבת הדגשה הנעה עם הסמן לסיוע בקריאה ממוקדת שורה אחר שורה.',
          'עצירת אנימציות — השבתת כל האנימציות והמעברים בפלטפורמה עבור אנשים עם רגישות לתנועה (Vestibular Disorders).',
          'הדגשת קישורים — הוספת מסגרת צהובה לכל קישורי הדף ולכפתורים לשיפור מיקומם החזותי.',
          'הדגשת פוקוס — הצגת מסגרת פוקוס עבה וצהובה על כל אלמנט בפוקוס לשיפור ניווט במקלדת.',
          'סמן מוגדל — הגדלת סמן העכבר לנראות מרבית עבור לקויי ראייה ומנועיות.',
        ]} />
        <Paragraph>
          כל ההגדרות נשמרות אוטומטית ב-localStorage ומיושמות באופן מיידי על ה-DOM — הן נשמרות בין ביקורים ופעילות הדפדפן.
        </Paragraph>
      </Section>

      <Section title="מגבלות ידועות">
        <Paragraph>
          על אף מאמצינו לעמוד בכל דרישות התקן, קיימות מגבלות ידועות הנובעות מאופי השירות:
        </Paragraph>
        <BulletList items={[
          'מסמכי PDF המיוצאים מהמערכת (חוזים חתומים) עשויים לדרוש עיבוד נגישות נוסף בתוכנות ייעודיות. אנו עובדים על שיפור הנגישות של קבצי ה-PDF.',
          'תכנים שמשתמשים מזינים ידנית (תיאורי פרויקטים, הצעות מחיר מותאמות) אינם בשליטת DealSpace ועשויים שלא לעמוד בדרישות הנגישות.',
          'תצוגות מורכבות בגרפים ולוחות נתונים עשויות לדרוש מסך רחב לצריכה אופטימלית, אך כל המידע זמין גם בפורמט טקסטואלי.',
        ]} />
      </Section>

      <Section title="רכז הנגישות — יצירת קשר">
        <Paragraph>
          לשאלות, הערות או בקשות לסיוע בנגישות, ניתן לפנות לרכז הנגישות של DealSpace:
        </Paragraph>
        <div className="space-y-2 mb-4">
          <InfoBadge icon={<User size={15} />} label="שם רכז הנגישות" value="נציג נגישות — DealSpace" />
          <InfoBadge icon={<Phone size={15} />} label="טלפון" value="03-000-0000" />
          <InfoBadge icon={<Mail size={15} />} label="דוא&quot;ל" value="accessibility@dealspace.co.il" />
        </div>
        <Paragraph>
          אנו מתחייבים לטפל בכל פנייה בנושא נגישות תוך 5 ימי עסקים.
        </Paragraph>
      </Section>

      <Section title="תאריך עדכון ההצהרה">
        <Paragraph>
          הצהרת הנגישות עודכנה לאחרונה ב-<strong className="text-slate-900 dark:text-white/80">מרץ 2026</strong>. הצהרה זו תעודכן מדי שנה, או בעת שינויים מהותיים בממשק או בדרישות החוק.
        </Paragraph>
      </Section>
    </div>
  )
}

// ─── English content ──────────────────────────────────────────────────────────

function EnglishStatement() {
  return (
    <div dir="ltr" lang="en">
      <Section title="Accessibility Statement — DealSpace">
        <Paragraph>
          DealSpace is committed to ensuring digital equality and providing equal access to all users, including people with disabilities. We regard digital accessibility as a core value, not merely a legal obligation.
        </Paragraph>
        <Paragraph>
          This statement was written in accordance with the Israeli Equal Rights for Persons with Disabilities Law (1998) and its service accessibility regulations (2013), pursuant to Israeli Standard IS 5568, which is based on WCAG 2.1 and WCAG 2.2 Level AA.
        </Paragraph>
      </Section>

      <Section title="Level of Accessibility Achieved">
        <Paragraph>
          DealSpace conforms to WCAG 2.2 Level AA — the level required by Israeli Standard IS 5568. We have conducted a comprehensive review of the user interface, core workflows, and digitally generated documents.
        </Paragraph>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <ShieldCheck size={20} className="text-indigo-400 flex-none" />
          <div>
            <p className="text-[12px] font-bold text-indigo-300">WCAG 2.2 Level AA | IS 5568 | Israeli Disabilities Equal Rights Law</p>
            <p className="text-[11px] text-slate-500 dark:text-white/40">Last updated: March 2026</p>
          </div>
        </div>
      </Section>

      <Section title="Accessibility Adaptations Made">
        <Paragraph>
          The following adaptations have been implemented across DealSpace to ensure a comfortable and accessible experience for all users:
        </Paragraph>

        <h3 className="text-[13px] font-bold mb-2 text-slate-700 dark:text-white/70">
          <Keyboard size={13} className="inline me-2 text-indigo-400" />
          Navigation & Motor
        </h3>
        <BulletList items={[
          'Full keyboard navigation across all pages — every function is accessible without a mouse.',
          'Logical and consistent Tab order that reflects the visual hierarchy of each page.',
          'Clear focus-visible design — all focused elements are highlighted with a high-contrast border.',
          'Skip links support to bypass repeated navigation blocks.',
        ]} />

        <h3 className="text-[13px] font-bold mb-2 mt-4 text-slate-700 dark:text-white/70">
          <Eye size={13} className="inline me-2 text-indigo-400" />
          Vision & Contrast
        </h3>
        <BulletList items={[
          'Color contrast ratios meet WCAG 2.2 AA requirements: at least 4.5:1 for normal text and 3:1 for large text.',
          'All text can be scaled up to 150% without loss of content or functionality, via the built-in accessibility widget.',
          'No information is conveyed through color alone — all critical information is backed by text, shape, or ARIA attributes.',
          'Built-in high contrast mode, greyscale (monochrome) mode, and readable font (Arial) option via the accessibility widget.',
        ]} />

        <h3 className="text-[13px] font-bold mb-2 mt-4 text-slate-700 dark:text-white/70">
          Content & Semantics
        </h3>
        <BulletList items={[
          'All images, icons, and graphical elements include appropriate alt text or aria-label attributes.',
          'All form inputs include explicit labels, clear error messages, and aria-describedby descriptions.',
          'The site is built on semantic HTML (h1–h6, nav, main, section, article, footer) for full screen reader compatibility.',
          'Error and success messages are delivered via aria-live regions so screen readers announce them immediately.',
          'Full bilingual support (Hebrew/English) with RTL layout and accessible Hebrew-optimized fonts.',
          'All animations can be stopped via the accessibility widget for users with vestibular disorders.',
          'The site respects the system-level prefers-reduced-motion setting.',
        ]} />
      </Section>

      <Section title="Browser & Assistive Technology Compatibility">
        <Paragraph>
          DealSpace has been tested and verified to work correctly with the following browser/screen reader combinations:
        </Paragraph>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { b: 'Google Chrome 120+', s: 'NVDA / JAWS (Windows)' },
            { b: 'Safari 17+', s: 'VoiceOver (macOS / iOS)' },
            { b: 'Microsoft Edge 120+', s: 'Narrator (Windows)' },
            { b: 'Firefox 121+', s: 'NVDA (Windows)' },
          ].map(row => (
            <div key={row.b} className="rounded-xl px-3 py-2 bg-white border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.06]">
              <p className="text-[12px] font-semibold text-slate-700 dark:text-white/70">{row.b}</p>
              <p className="text-[11px] text-slate-500 dark:text-white/35">{row.s}</p>
            </div>
          ))}
        </div>
        <Paragraph>
          <span className="font-medium text-slate-700 dark:text-white/70">Note:</span> DealSpace is fully responsive and optimized for all screen sizes — mobile, tablet, and desktop.
        </Paragraph>
      </Section>

      <Section title="Built-in Accessibility Widget — 14 Controls">
        <Paragraph>
          DealSpace includes a built-in accessibility widget available on every page of the platform — no download or installation required. The widget is accessible via a fixed FAB button in the corner of the screen. The following 14 controls are available:
        </Paragraph>
        <BulletList items={[
          'Text Size — Increase font size from 100% to 150% across 5 levels, without altering page layout.',
          'High Contrast — Boosts contrast, brightness, and saturation to improve readability for users with low vision.',
          'Monochrome — Renders the entire interface in greyscale to reduce visual overload.',
          'Invert Colors — Full color inversion with hue rotation to preserve readability.',
          'Color Blind Mode — Tailored correction for three types: Protanopia (red-green), Deuteranopia (green), and Tritanopia (blue-yellow).',
          'Dyslexia Font — Switches to Atkinson Hyperlegible, designed to improve readability for users with dyslexia.',
          'Readable Font — Switches to standard Arial to reduce cognitive load.',
          'Line Height Boost — Increases line height to 2.1 for improved separation between lines of text.',
          'Letter Spacing — Increases inter-character spacing by 0.06em for improved readability.',
          'Reading Mask — A highlight overlay that follows the cursor to assist line-by-line focused reading.',
          'Stop Animations — Disables all animations and transitions on the platform for users with vestibular disorders.',
          'Highlight Links — Adds a yellow border to all page links and buttons for improved visual identification.',
          'Focus Highlight — Displays a thick yellow focus ring on every focused element for improved keyboard navigation.',
          'Big Cursor — Enlarges the mouse cursor for maximum visibility for users with low vision or motor impairments.',
        ]} />
        <Paragraph>
          All settings are automatically saved to localStorage and applied immediately to the DOM — they persist across visits and browser sessions.
        </Paragraph>
      </Section>

      <Section title="Known Limitations">
        <Paragraph>
          Despite our efforts to meet all standard requirements, the following known limitations arise from the nature of the service:
        </Paragraph>
        <BulletList items={[
          'Exported PDF documents (signed contracts) may require additional accessibility processing in dedicated software. We are actively working to improve PDF accessibility.',
          'Content entered manually by users (project descriptions, custom proposals) is outside DealSpace\'s control and may not meet accessibility requirements.',
          'Complex data visualizations in dashboard views are optimized for wide screens, though all underlying data is also available in plain text format.',
        ]} />
      </Section>

      <Section title="Accessibility Coordinator — Contact">
        <Paragraph>
          For questions, feedback, or assistance with accessibility, please contact DealSpace's accessibility coordinator:
        </Paragraph>
        <div className="space-y-2 mb-4">
          <InfoBadge icon={<User size={15} />} label="Accessibility Coordinator" value="Accessibility Representative — DealSpace" />
          <InfoBadge icon={<Phone size={15} />} label="Phone" value="03-000-0000" />
          <InfoBadge icon={<Mail size={15} />} label="Email" value="accessibility@dealspace.co.il" />
        </div>
        <Paragraph>
          We are committed to addressing all accessibility inquiries within 5 business days.
        </Paragraph>
      </Section>

      <Section title="Statement Update Date">
        <Paragraph>
          This accessibility statement was last updated in <strong className="text-slate-900 dark:text-white/80">March 2026</strong>. It will be reviewed annually, or following significant changes to the interface or legal requirements.
        </Paragraph>
      </Section>
    </div>
  )
}

// ─── AccessibilityStatement Page ──────────────────────────────────────────────

export default function AccessibilityStatement() {
  const { locale, setLocale } = useI18n()
  const isHe = locale === 'he'
  const navigate = useNavigate()

  return (
    <div
      className="min-h-dvh bg-slate-50 dark:bg-[#05050A]"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-slate-50/95 border-b border-slate-200 dark:bg-[rgba(5,5,10,0.95)] dark:border-white/[0.06]"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-500 dark:text-white/50 transition hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white/80"
        >
          {isHe ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          {isHe ? 'חזרה' : 'Back'}
        </button>

        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-indigo-400" />
          <span className="text-[13px] font-bold text-slate-800 dark:text-white/80">
            {isHe ? 'הצהרת נגישות' : 'Accessibility Statement'}
          </span>
        </div>

        {/* Language toggle */}
        <button
          type="button"
          onClick={() => setLocale(isHe ? 'en' : 'he')}
          className="rounded-xl px-3 py-1.5 text-[11px] font-bold transition bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-white/[0.08]"
        >
          {isHe ? 'English' : 'עברית'}
        </button>
      </header>

      {/* Hero */}
      <div
        className="px-5 py-10 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-4"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <Monitor size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {isHe ? 'הצהרת נגישות' : 'Accessibility Statement'}
        </h1>
        <p className="text-[13px] max-w-md mx-auto text-slate-500 dark:text-white/40">
          {isHe
            ? 'DealSpace מחויבת לנגישות דיגיטלית מלאה בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקן IS 5568.'
            : 'DealSpace is committed to full digital accessibility in compliance with Israeli Standard IS 5568 and WCAG 2.2 Level AA.'}
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-5 py-10">
        {isHe ? <HebrewStatement /> : <EnglishStatement />}

        {/* Footer note */}
        <div
          className="rounded-2xl px-5 py-4 text-center mt-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[11px] text-slate-400 dark:text-white/25">
            {isHe
              ? 'DealSpace — פלטפורמת הצעות מחיר דיגיטליות לעצמאים ועסקים קטנים בישראל'
              : 'DealSpace — Digital Proposal Platform for Israeli Freelancers & Agencies'}
          </p>
        </div>
      </main>
    </div>
  )
}

// ─── DealSpace Contract Templates — Hebrew Israeli Law ────────────────────────
// All templates are adapted for Israeli law (חוקי מדינת ישראל).
// Variables use {{varName}} syntax for interpolation.

export interface ContractVariable {
  key: string
  labelHe: string
  labelEn: string
  defaultValue?: string
}

export interface ContractTemplate {
  id: string
  category: 'freelance' | 'photography' | 'consulting' | 'construction' | 'marketing' | 'legal' | 'software' | 'design'
  titleHe: string
  titleEn: string
  descHe: string
  bodyHe: string
  variables: ContractVariable[]
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  // ── 1. Freelance Development ───────────────────────────────────────────────
  {
    id: 'freelance-dev',
    category: 'software',
    titleHe: 'חוזה פיתוח תוכנה / אתרים',
    titleEn: 'Software / Web Development Agreement',
    descHe: 'מתאים למפתחים עצמאיים לבניית אתרים ואפליקציות',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'projectTitle', labelHe: 'שם הפרויקט', labelEn: 'Project Title' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'startDate', labelHe: 'תאריך התחלה', labelEn: 'Start Date' },
      { key: 'deliveryDate', labelHe: 'תאריך מסירה', labelEn: 'Delivery Date' },
      { key: 'freelancerName', labelHe: 'שם הפרילנסר', labelEn: 'Freelancer Name' },
    ],
    bodyHe: `הסכם פיתוח תוכנה

נערך ונחתם ביום {{startDate}}

בין: {{freelancerName}} ("נותן השירות")
לבין: {{clientName}} ("הלקוח")

1. נושא ההסכם
נותן השירות מתחייב לפתח עבור הלקוח את {{projectTitle}} ("הפרויקט") בהתאם לדרישות שיסוכמו בין הצדדים בכתב.

2. תמורה ותשלומים
התמורה הכוללת עבור הפרויקט הינה {{currency}}{{totalPrice}}.
לוח תשלומים:
• 30% במועד חתימת הסכם זה
• 40% עם השלמת שלב הפיתוח הראשון
• 30% במסירה הסופית ואישור הלקוח

3. לוח זמנים
הפרויקט יושלם לא יאוחר מתאריך {{deliveryDate}}, בכפוף לקבלת חומרים נדרשים מהלקוח בזמן.

4. שינויים בהיקף העבודה (Change Requests)
כל שינוי שאינו כלול בהגדרת הפרויקט המקורית ידרוש הסכמה בכתב ועשוי לשנות את לוח הזמנים והתמחור.

5. זכויות קניין רוחני
עם השלמת התשלום המלא, כלל זכויות הקניין הרוחני בפרויקט יועברו ללקוח. עד לאותו מועד, הקוד שייך לנותן השירות.

6. אחריות וגרנטיה
נותן השירות מתחייב לתקן באגים שיתגלו תוך 30 יום מתאריך המסירה, ללא עלות נוספת. אחריות זו אינה חלה על שינויים שהוכנסו על ידי הלקוח.

7. סודיות
הצדדים מתחייבים לשמור על סודיות מלאה לגבי מידע עסקי ומסחרי שיועבר ביניהם במסגרת ביצוע הסכם זה.

8. הפסקת ההתקשרות
אחד הצדדים רשאי לבטל את ההסכם בהודעה בכתב של 14 יום. במקרה של ביטול על ידי הלקוח לאחר שכבר הושקעה עבודה, יחויב הלקוח על החלק היחסי שהושלם.

9. דין וסמכות שיפוט
הסכם זה כפוף לדיני מדינת ישראל. כל סכסוך יובא לפני בית המשפט המוסמך בתל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 2. Photography / Events ────────────────────────────────────────────────
  {
    id: 'photography-events',
    category: 'photography',
    titleHe: 'חוזה צילום אירועים ועסקי',
    titleEn: 'Photography & Events Agreement',
    descHe: 'לצלמים עצמאיים — חתונות, אירועי עסקים, פורטרט',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'eventType', labelHe: 'סוג האירוע', labelEn: 'Event Type' },
      { key: 'eventDate', labelHe: 'תאריך האירוע', labelEn: 'Event Date' },
      { key: 'eventLocation', labelHe: 'מיקום האירוע', labelEn: 'Event Location' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'deliveryDays', labelHe: 'ימי עיבוד', labelEn: 'Editing Days', defaultValue: '21' },
      { key: 'photographerName', labelHe: 'שם הצלם', labelEn: 'Photographer Name' },
    ],
    bodyHe: `הסכם שירותי צילום

נערך ונחתם בין:
{{photographerName}} ("הצלם/ת")
לבין: {{clientName}} ("הלקוח/ה")

1. פרטי האירוע
סוג האירוע: {{eventType}}
תאריך: {{eventDate}}
מיקום: {{eventLocation}}

2. שירותים כלולים
הצלם/ת מתחייב/ת לספק שירותי צילום מקצועיים לאורך האירוע, כולל עריכה מלאה ומסירת הקבצים הסופיים.

3. תמורה ותשלומים
התמורה הכוללת: {{currency}}{{totalPrice}}
• מקדמה של 30% בחתימה (לא ניתנת להחזר — שומרת את התאריך)
• יתרה של 70% לא יאוחר מ-7 ימים לפני האירוע

4. מסירת הצילומים
הצלמות הסופיות יימסרו תוך {{deliveryDays}} ימי עסקים ממועד האירוע, דרך גלריה דיגיטלית מוגנת.

5. ביטול ודחייה
• ביטול עד 60 יום לפני האירוע: החזר מלא למעט המקדמה
• ביטול 30–60 יום לפני האירוע: דמי ביטול בשיעור 50% מהסכום הכולל
• ביטול פחות מ-30 יום לפני האירוע: אין החזר כספי

6. זכויות יוצרים
הצלם/ת שומר/ת על זכויות היוצרים המלאות לכל הצילומים. ניתנת ללקוח/ה רישיון שימוש אישי לא מסחרי. פרסום מסחרי מצריך הסכמה בכתב נפרדת.

7. פרסום
הצלם/ת רשאי/ת לפרסם עד 20 תמונות מהאירוע לצורכי תיק עבודות ושיווק, אלא אם הלקוח/ה התנגד/ה בכתב מראש.

8. כוח עליון
הצלם/ת לא יישא/תישא באחריות לביטול או שינוי שירותים עקב נסיבות שאינן בשליטתו/ה (מחלה, מצב חירום, אסון טבע).

9. דין וסמכות שיפוט
הסכם זה כפוף לחוקי מדינת ישראל. סמכות שיפוט — בית משפט השלום בתל אביב-יפו.

חתימת הלקוח/ה: ________________________  תאריך: ___________`,
  },

  // ── 3. Business Consulting ─────────────────────────────────────────────────
  {
    id: 'business-consulting',
    category: 'consulting',
    titleHe: 'הסכם ייעוץ עסקי',
    titleEn: 'Business Consulting Agreement',
    descHe: 'לייעוץ אסטרטגי, כספי ועסקי',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'consultantName', labelHe: 'שם היועץ', labelEn: 'Consultant Name' },
      { key: 'scope', labelHe: 'תחום הייעוץ', labelEn: 'Scope of Consulting' },
      { key: 'monthlyFee', labelHe: 'שכר חודשי', labelEn: 'Monthly Fee' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'startDate', labelHe: 'תאריך התחלה', labelEn: 'Start Date' },
      { key: 'duration', labelHe: 'משך ההסכם (חודשים)', labelEn: 'Duration (months)', defaultValue: '3' },
    ],
    bodyHe: `הסכם ייעוץ עסקי

נערך ונחתם ביום {{startDate}}
בין: {{consultantName}} ("היועץ")
לבין: {{clientName}} ("הלקוח")

1. תחום הייעוץ
היועץ יספק ייעוץ מקצועי בתחום {{scope}} לתקופה של {{duration}} חודשים החל מ-{{startDate}}.

2. שכר טרחה ותנאי תשלום
שכר הייעוץ החודשי: {{currency}}{{monthlyFee}} + מע"מ כחוק.
התשלום ישולם עד ה-10 בכל חודש. איחור בתשלום יחויב בריבית פיגורים בשיעור 1.5% לחודש.

3. היקף השירות
כלול: {{duration}} פגישות עבודה חודשיות, זמינות בוואטסאפ/אימייל בשעות עסקים, דוח התקדמות חודשי.
אינו כלול: ייצוג משפטי, ביצוע עבודה תפעולית, יישום ישיר של המלצות.

4. עצמאות היועץ
היועץ פועל כקבלן עצמאי. אין יחסי עובד-מעביד. היועץ אחראי לדיווח מס עצמאי.

5. סודיות ואי-תחרות
היועץ מתחייב לשמור בסוד כל מידע עסקי שיועבר אליו. אי-תחרות ישירה מול לקוחות הלקוח למשך 12 חודשים לאחר סיום ההסכם.

6. סיום ההסכם
כל צד רשאי לסיים את ההסכם בהודעה בכתב של 30 יום. סיום מוקדם מצד הלקוח מחייב תשלום עבור כל החודש השוטף.

7. הגבלת אחריות
היועץ לא יהיה אחראי לתוצאות עסקיות שנגרמו עקב אי-יישום ההמלצות.

8. דין חל — דיני מדינת ישראל. סמכות שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 4. Construction / Renovation ──────────────────────────────────────────
  {
    id: 'construction-renovation',
    category: 'construction',
    titleHe: 'חוזה שיפוצים / קבלנות בניין',
    titleEn: 'Construction & Renovation Contract',
    descHe: 'לקבלני שיפוצים, אינסטלציה, חשמל ועבודות בנייה',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'contractorName', labelHe: 'שם הקבלן', labelEn: 'Contractor Name' },
      { key: 'contractorLicense', labelHe: 'מספר רישיון קבלן', labelEn: 'Contractor License #' },
      { key: 'workAddress', labelHe: 'כתובת הנכס', labelEn: 'Property Address' },
      { key: 'workScope', labelHe: 'תיאור העבודות', labelEn: 'Scope of Work' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'startDate', labelHe: 'תאריך התחלת עבודה', labelEn: 'Work Start Date' },
      { key: 'completionDate', labelHe: 'תאריך סיום משוער', labelEn: 'Estimated Completion' },
    ],
    bodyHe: `חוזה קבלנות שיפוצים

נערך ונחתם ביום {{startDate}}

בין: {{contractorName}}, רישיון קבלן מס' {{contractorLicense}} ("הקבלן")
לבין: {{clientName}} ("בעל הנכס")

כתובת הנכס: {{workAddress}}

1. תיאור העבודות
הקבלן מתחייב לבצע את העבודות הבאות: {{workScope}}

2. מחיר ולוח תשלומים
מחיר כולל (כולל חומרים ועבודה): {{currency}}{{totalPrice}} + מע"מ כחוק.
לוח תשלומים:
• 20% בחתימת חוזה זה
• 30% עם תחילת העבודות
• 30% בהשלמת שלב הגמר
• 20% בסיום העבודות ואישור בעל הנכס

3. לוח זמנים
העבודות יחלו ב-{{startDate}} וישלמו עד {{completionDate}}, בכפוף לתנאי מזג אוויר ואספקת חומרים.

4. חומרים
הקבלן ישתמש בחומרים איכותיים תואמים לתקן ישראלי. חומרים מיוחדים שידרשו על ידי בעל הנכס ייזקפו בנפרד.

5. שינויים ותוספות
כל שינוי בהיקף העבודה ידרוש הזמנת שינוי חתומה. עלויות תוספות יוסכמו מראש בכתב.

6. אחריות על הבנייה (בדק בית)
הקבלן מעניק אחריות על ליקויי בנייה לפי חוק המכר (דירות) ותקנותיו: שנה לליקויי גמר, 7 שנים לליקויים מבניים.

7. פיקוח ובטיחות
הקבלן אחראי לבטיחות עובדיו ולביטוח צד ג'. בעל הנכס אינו אחראי לנזקים שייגרמו לצד שלישי.

8. סיום מוקדם
במקרה של עזיבת אתר על ידי הקבלן ללא סיבה מוצדקת, יהיה בעל הנכס רשאי לשכור קבלן אחר וכל עלות נוספת תנוכה מיתרת התשלום.

9. בוררות
סכסוכים יובאו תחילה לבוררות מוסכמת. בהיעדר הסכמה — לבית המשפט המוסמך בתל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 5. Monthly Marketing Retainer ─────────────────────────────────────────
  {
    id: 'marketing-retainer',
    category: 'marketing',
    titleHe: 'הסכם ריטיינר שיווק דיגיטלי',
    titleEn: 'Digital Marketing Retainer Agreement',
    descHe: 'לסוכנויות ופרילנסרים בתחום השיווק הדיגיטלי',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'agencyName', labelHe: 'שם הסוכנות', labelEn: 'Agency Name' },
      { key: 'services', labelHe: 'שירותים כלולים', labelEn: 'Included Services' },
      { key: 'monthlyFee', labelHe: 'עמלה חודשית', labelEn: 'Monthly Fee' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'startDate', labelHe: 'תאריך התחלה', labelEn: 'Start Date' },
      { key: 'adBudget', labelHe: 'תקציב פרסום', labelEn: 'Ad Budget' },
    ],
    bodyHe: `הסכם ניהול שיווק דיגיטלי (ריטיינר)

נערך ונחתם ביום {{startDate}}
בין: {{agencyName}} ("הסוכנות")
לבין: {{clientName}} ("הלקוח")

1. השירותים
הסוכנות מתחייבת לספק: {{services}}

2. תקציבי פרסום
תקציב הפרסום החודשי עומד על {{currency}}{{adBudget}} ויועבר לסוכנות עד ה-1 בכל חודש. תקציב הפרסום אינו כלול בשכר הניהול.

3. שכר הניהול
שכר הניהול החודשי: {{currency}}{{monthlyFee}} + מע"מ כחוק. תשלום ב-30 ימים מהוצאת חשבונית.

4. מדידת ביצועים
הסוכנות תספק דוח ביצועים חודשי הכולל: רשת, חשיפות, קליקים, המרות ו-ROI.

5. גישה לחשבונות
הלקוח יעניק גישה מנהל לכל החשבונות הרלוונטיים. הסוכנות לא תהיה אחראית למניעת גישה שלא ביוזמתה.

6. בעלות על תוכן ונתונים
כל תוכן שייוצר עבור הלקוח שייך ללקוח. נתוני הקמפיינים ינוייד בפורמט מקובל בסיום ההתקשרות.

7. תקופת ההסכם
ההסכם בתוקף ל-3 חודשים ומתחדש אוטומטית. ביטול בהודעה בכתב של 30 יום.

8. אי-תחרות
הסוכנות לא תייצג מתחרים ישירים של הלקוח ללא אישור מפורש בכתב.

9. דין חל — דיני מדינת ישראל. סמכות שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 6. UI/UX Design ───────────────────────────────────────────────────────
  {
    id: 'ux-design',
    category: 'design',
    titleHe: 'חוזה עיצוב UI/UX',
    titleEn: 'UI/UX Design Agreement',
    descHe: 'למעצבים גרפיים ועיצוב חווית משתמש',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'designerName', labelHe: 'שם המעצב', labelEn: 'Designer Name' },
      { key: 'projectTitle', labelHe: 'שם הפרויקט', labelEn: 'Project Title' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'revisions', labelHe: 'מספר סבבי תיקונים', labelEn: 'Revision Rounds', defaultValue: '2' },
      { key: 'deliveryDate', labelHe: 'תאריך מסירה', labelEn: 'Delivery Date' },
    ],
    bodyHe: `הסכם שירותי עיצוב UI/UX

נערך ונחתם בין:
{{designerName}} ("המעצב")
לבין: {{clientName}} ("הלקוח")

1. תיאור הפרויקט
המעצב יספק שירותי עיצוב UI/UX עבור {{projectTitle}}.

2. תמורה
מחיר כולל: {{currency}}{{totalPrice}} (לפני מע"מ).
מקדמה של 40% בחתימה; 60% במסירה הסופית.

3. תיקונים ועדכונים
כלולים {{revisions}} סבבי תיקונים. תיקונים נוספים מחויבים לפי שעה בתעריף שיוסכם מראש.

4. מסירה
הפרויקט ייסגר עד {{deliveryDate}} ויימסר כקבצי Figma/Adobe ו-PDF.

5. זכויות יוצרים
על שלמות התשלום, הזכויות עוברות ללקוח. עד לאז — שמורות למעצב.

6. שימוש בתיק עבודות
המעצב רשאי להציג את העבודה בתיק עבודותיו.

7. דין חל — ישראל. שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 7. Video Production ────────────────────────────────────────────────────
  {
    id: 'video-production',
    category: 'photography',
    titleHe: 'חוזה הפקת וידאו',
    titleEn: 'Video Production Agreement',
    descHe: 'לצלמי וידאו, יוצרי תוכן וסרטוני קידום',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'producerName', labelHe: 'שם המפיק', labelEn: 'Producer Name' },
      { key: 'productionType', labelHe: 'סוג ההפקה', labelEn: 'Production Type' },
      { key: 'shootDate', labelHe: 'תאריך הצילום', labelEn: 'Shoot Date' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'deliveryDays', labelHe: 'ימי עריכה', labelEn: 'Editing Days', defaultValue: '14' },
    ],
    bodyHe: `הסכם הפקת וידאו

נערך בין: {{producerName}} ("המפיק") לבין: {{clientName}} ("הלקוח")

1. פרטי ההפקה
סוג: {{productionType}} | תאריך צילום: {{shootDate}}

2. תמורה
{{currency}}{{totalPrice}} (לפני מע"מ). 50% מראש, 50% במסירה הסופית.

3. מסירה
הסרטון יימסר תוך {{deliveryDays}} ימי עסקים מיום הצילום, כולל 2 סבבי תיקונים.

4. רישיון שימוש
ניתן ללקוח רישיון שימוש לא בלעדי בסרטון לצרכי שיווק. שידור בטלוויזיה או הפצה מסחרית רחבה מצריכה הסכם נפרד.

5. זכויות מוזיקה
שימוש במוזיקה מורשית באחריות המפיק. הלקוח לא ישתמש בסרטון עם מוזיקה לא מורשית.

6. דין חל — ישראל. שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 8. Social Media Management ────────────────────────────────────────────
  {
    id: 'social-media',
    category: 'marketing',
    titleHe: 'הסכם ניהול רשתות חברתיות',
    titleEn: 'Social Media Management Agreement',
    descHe: 'לניהול אינסטגרם, פייסבוק, לינקדאין וטיקטוק',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'managerName', labelHe: 'שם המנהל', labelEn: 'Manager Name' },
      { key: 'platforms', labelHe: 'פלטפורמות', labelEn: 'Platforms' },
      { key: 'postsPerMonth', labelHe: 'פוסטים לחודש', labelEn: 'Posts/Month', defaultValue: '12' },
      { key: 'monthlyFee', labelHe: 'עמלה חודשית', labelEn: 'Monthly Fee' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
    ],
    bodyHe: `הסכם ניהול רשתות חברתיות

בין: {{managerName}} ("מנהל הרשתות") לבין: {{clientName}} ("הלקוח")

1. הפלטפורמות: {{platforms}}

2. היקף השירות
{{postsPerMonth}} פוסטים/חודש + ניהול תגובות + דיווח חודשי.

3. שכר חודשי: {{currency}}{{monthlyFee}} + מע"מ. תשלום עד ה-5 בחודש.

4. אישור תוכן
הלקוח יאשר תוכן עד 48 שעות לפני פרסום. איחור באישור עלול לדחות את לוח הפרסום.

5. גישה לחשבונות
הלקוח מעניק גישה לניהול. גישה זו תוחזר מיד עם סיום ההסכם.

6. בעלות תוכן — כל התוכן שייך ללקוח.

7. ביטול — 30 יום הודעה מראש.

8. דין חל — ישראל. שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 9. HR / Training ──────────────────────────────────────────────────────
  {
    id: 'training-hr',
    category: 'consulting',
    titleHe: 'הסכם הדרכה וסדנאות',
    titleEn: 'Training & Workshops Agreement',
    descHe: 'לסדנאות, הכשרות, קואצ\'ינג ופיתוח ארגוני',
    variables: [
      { key: 'clientName', labelHe: 'שם הארגון/לקוח', labelEn: 'Client/Organization' },
      { key: 'trainerName', labelHe: 'שם המדריך', labelEn: 'Trainer Name' },
      { key: 'trainingTopic', labelHe: 'נושא ההדרכה', labelEn: 'Training Topic' },
      { key: 'sessionCount', labelHe: 'מספר מפגשים', labelEn: 'Session Count' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'startDate', labelHe: 'תאריך התחלה', labelEn: 'Start Date' },
    ],
    bodyHe: `הסכם שירותי הדרכה

נערך ב-{{startDate}} בין: {{trainerName}} ("המדריך") לבין: {{clientName}} ("הארגון")

1. נושא ההדרכה: {{trainingTopic}}
2. מספר מפגשים: {{sessionCount}}
3. תמורה: {{currency}}{{totalPrice}} + מע"מ. 50% מראש, 50% בסיום.
4. ביטול מפגש על ידי הארגון בפחות מ-48 שעות מראש — ייחויב במלואו.
5. חומרי ההדרכה שייכים למדריך; לארגון מותר להשתמש בהם לשימוש פנימי בלבד.
6. דין חל — ישראל. שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 10. Legal Services ────────────────────────────────────────────────────
  {
    id: 'legal-services',
    category: 'legal',
    titleHe: 'הסכם שירותים משפטיים (ייעוץ)',
    titleEn: 'Legal Advisory Services Agreement',
    descHe: 'לעורכי דין ויועצים משפטיים — שיעור שכר טרחה',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'lawyerName', labelHe: 'שם עורך הדין', labelEn: 'Lawyer Name' },
      { key: 'barNumber', labelHe: 'מספר רישיון', labelEn: 'Bar Number' },
      { key: 'legalMatter', labelHe: 'נושא הייצוג', labelEn: 'Legal Matter' },
      { key: 'fee', labelHe: 'שכר טרחה', labelEn: 'Fee' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'feeType', labelHe: 'סוג שכר הטרחה', labelEn: 'Fee Type', defaultValue: 'שעתי' },
    ],
    bodyHe: `הסכם שכר טרחה — שירותים משפטיים

בין: {{lawyerName}}, עו"ד (מספר רישיון: {{barNumber}}) ("עורך הדין")
לבין: {{clientName}} ("הלקוח")

1. נושא הייצוג/הייעוץ
עורך הדין יטפל בנושא: {{legalMatter}}

2. שכר טרחה
שכר הטרחה: {{currency}}{{fee}} ({{feeType}}) + מע"מ כחוק.
שכ"ט ישולם עד ה-15 לחודש שלאחר קבלת החשבונית.

3. הסכמת לקוח
הלקוח מסמיך את עורך הדין לייצגו בנושא המפורט לעיל. ייצוג בנושאים נוספים ידרוש הסכם נפרד.

4. חיסיון עו"ד-לקוח
כל מידע שיועבר לעורך הדין מוגן בחיסיון לפי חוק לשכת עורכי הדין, התשכ"א-1961.

5. ניגוד עניינים
עורך הדין הצהיר כי אין לו ניגוד עניינים מוכר בנושא הייצוג נכון לתאריך הסכם זה.

6. דין חל — ישראל. שיפוט — בית המשפט המוסמך בתל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },

  // ── 11. Content Writing / Copywriting ─────────────────────────────────────
  {
    id: 'copywriting',
    category: 'freelance',
    titleHe: 'הסכם כתיבת תוכן ושיווק',
    titleEn: 'Content Writing & Copywriting Agreement',
    descHe: 'לכותבי תוכן, קופירייטרים ומנהלי תוכן',
    variables: [
      { key: 'clientName', labelHe: 'שם הלקוח', labelEn: 'Client Name' },
      { key: 'writerName', labelHe: 'שם הכותב', labelEn: 'Writer Name' },
      { key: 'contentType', labelHe: 'סוג התוכן', labelEn: 'Content Type' },
      { key: 'wordCount', labelHe: 'כמות מילים / יחידות', labelEn: 'Word Count / Units' },
      { key: 'totalPrice', labelHe: 'מחיר כולל', labelEn: 'Total Price' },
      { key: 'currency', labelHe: 'מטבע', labelEn: 'Currency', defaultValue: '₪' },
      { key: 'deliveryDate', labelHe: 'תאריך מסירה', labelEn: 'Delivery Date' },
    ],
    bodyHe: `הסכם שירותי כתיבה ותוכן

בין: {{writerName}} ("הכותב") לבין: {{clientName}} ("הלקוח")

1. סוג התוכן: {{contentType}} | {{wordCount}} מילים/יחידות
2. מסירה עד: {{deliveryDate}}
3. תמורה: {{currency}}{{totalPrice}} + מע"מ. 50% מראש, 50% במסירה.
4. תיקונים: עד 2 סבבי תיקונים כלולים בתעריף.
5. שימוש בתוכן: לאחר תשלום מלא, הלקוח רשאי לפרסם את התוכן בשמו. הכותב רשאי להציגו בתיק עבודות.
6. מקוריות: הכותב מתחייב כי התוכן מקורי ואינו מפר זכויות יוצרים.
7. דין חל — ישראל. שיפוט — תל אביב-יפו.

חתימת הלקוח: ________________________  תאריך: ___________`,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export function getTemplatesByCategory(category: ContractTemplate['category']): ContractTemplate[] {
  return CONTRACT_TEMPLATES.filter(t => t.category === category)
}

export const CATEGORY_LABELS: Record<ContractTemplate['category'], { he: string; en: string }> = {
  freelance:    { he: 'פרילנס', en: 'Freelance' },
  photography:  { he: 'צילום / וידאו', en: 'Photo / Video' },
  consulting:   { he: 'ייעוץ', en: 'Consulting' },
  construction: { he: 'שיפוצים / בנייה', en: 'Construction' },
  marketing:    { he: 'שיווק', en: 'Marketing' },
  legal:        { he: 'שירותים משפטיים', en: 'Legal' },
  software:     { he: 'פיתוח תוכנה', en: 'Software Dev' },
  design:       { he: 'עיצוב', en: 'Design' },
}

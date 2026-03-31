// ─── Legal Terms Modal — Israeli B2B Engagement Agreement ─────────────────────
// Radix Dialog with 6-clause bilingual Israeli corporate legal standard.
// Opens when client clicks the "terms" link in the consent checkbox.

import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Scale, Shield } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LegalTermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
  companyName?: string
}

// ─── Clause block ─────────────────────────────────────────────────────────────

function ClauseBlock({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: string
}) {
  return (
    <div>
      <div className="flex items-start gap-2.5 mb-2">
        <span
          className="flex-none flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black"
          style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          {n}
        </span>
        <h3 className="text-[12px] font-bold leading-snug" style={{ color: 'rgba(255,255,255,0.82)' }}>
          {title}
        </h3>
      </div>
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.45)', paddingInlineStart: '1.75rem' }}
      >
        {children}
      </p>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function LegalTermsModal({ open, onOpenChange, locale, companyName }: LegalTermsModalProps) {
  const isHe = locale === 'he'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[60]"
                  style={{ background: 'rgba(3,3,5,0.88)', backdropFilter: 'blur(18px)' }}
                />
              </Dialog.Overlay>

              {/* Panel */}
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, y: 48, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.97 }}
                  transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
                  dir={isHe ? 'rtl' : 'ltr'}
                  className="fixed z-[61] flex flex-col"
                  style={{
                    inset: '1rem',
                    top: '3.5rem',
                    bottom: '1rem',
                    margin: 'auto',
                    maxWidth: '42rem',
                    left: '50%',
                    right: 'auto',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 2rem)',
                    background: 'linear-gradient(160deg, #0e0e18 0%, #09090f 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 32px 96px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {/* ── Header ───────────────────────────────────────────────── */}
                  <div
                    className="flex items-center gap-3 px-6 py-5 flex-none"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl flex-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }}
                    >
                      <Scale size={16} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Dialog.Title
                        className="text-sm font-black text-white leading-tight"
                      >
                        {isHe ? 'תנאי התקשרות והתקנון המשפטי' : 'Terms of Engagement & Legal Agreement'}
                      </Dialog.Title>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {isHe
                          ? 'חוק חוזים (חלק כללי), תשל"ג-1973 · סמכות שיפוט: ישראל'
                          : 'Contracts Law 5733-1973 · Jurisdiction: Israel'}
                        {companyName ? ` · ${companyName}` : ''}
                      </p>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        aria-label={isHe ? 'סגור' : 'Close'}
                        className="flex-none flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        }}
                      >
                        <X size={14} className="text-white/50" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* ── Scrollable clauses ────────────────────────────────────── */}
                  <div
                    className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}
                  >
                    {/* 1 — מבוא */}
                    <ClauseBlock
                      n="1"
                      title={isHe ? 'מבוא והסכמה לתנאים' : 'Introduction & Acceptance of Terms'}
                    >
                      {isHe
                        ? `בחתימה על הסכם זה, הלקוח ("הלקוח") מאשר כי קרא, הבין, ומסכים לכל תנאי הסכם זה. הסכם זה מחייב משפטית את הצדדים בהתאם לחוק החוזים (חלק כללי), התשל"ג-1973 ולכל דין ישראלי רלוונטי. ספק השירות ("הספק") הינו בעל העסק שיצר הצעה זו באמצעות מערכת DealSpace. DealSpace אינה צד להסכם זה ואינה נושאת בכל אחריות בגין מוצריו, שירותיו או מחדליו של הספק.`
                        : `By signing this agreement, the Client ("Client") confirms that they have read, understood, and agree to all terms of this agreement. This agreement is legally binding on the parties pursuant to the Contracts Law (General Part), 5733-1973 and all applicable Israeli law. The service provider ("Provider") is the business owner who created this proposal using the DealSpace platform. DealSpace is not a party to this agreement and bears no responsibility for the Provider's products, services, or omissions.`}
                    </ClauseBlock>

                    {/* 2 — תמורה ותשלום */}
                    <ClauseBlock
                      n="2"
                      title={isHe ? 'תמורה ותנאי תשלום' : 'Consideration & Payment Terms'}
                    >
                      {isHe
                        ? `הלקוח מתחייב לשלם לספק את הסכום המפורט בהצעה, בהתאם ללוח הזמנים ואמצעי התשלום המוסכמים. תשלום שלא יתקבל במועד יחייב ריבית פיגורים בשיעור הקבוע בחוק פסיקת ריבית והצמדה, התשכ"א-1961. ביטול מצד הלקוח לאחר חתימה על הסכם זה יחייב תשלום של לפחות 30% מסכום ההסכם כדמי ביטול, בנוסף לכל עלויות ישירות שנגרמו לספק. הצדדים רשאים להסכים בכתב על תנאי תשלום שונים.`
                        : `The Client undertakes to pay the Provider the amount specified in the proposal, in accordance with the agreed payment schedule and payment method. Payments not received on time shall accrue interest at the rate prescribed by the Interest and Linkage Law, 5721-1961. Cancellation by the Client following signature of this agreement shall entail payment of at least 30% of the total agreement value as a cancellation fee, in addition to any direct costs incurred by the Provider. The parties may agree in writing to different payment terms.`}
                    </ClauseBlock>

                    {/* 3 — קניין רוחני */}
                    <ClauseBlock
                      n="3"
                      title={isHe ? 'קניין רוחני ובעלות על התוצרים' : 'Intellectual Property & Deliverable Ownership'}
                    >
                      {isHe
                        ? `כל זכויות הקניין הרוחני בתוצרי העבודה, לרבות עיצובים, קוד, תוכן ומסמכים ("התוצרים"), ישארו בבעלות הספק עד לקבלת התשלום המלא. עם השלמת כל התשלומים, יועברו לבעלות הלקוח הזכויות שהוסכמו בהצעה במפורש, אלא אם כן הוסכם אחרת בכתב. שימוש בתוצרים לפני השלמת תשלום מלא מהווה הפרת זכויות יוצרים. הספק זכאי לשמור לעצמו זכות להציג את העבודה כחלק מתיק עבודות, אלא אם כן הוסכם אחרת בכתב.`
                        : `All intellectual property rights in the work product, including designs, code, content, and documents ("Deliverables"), shall remain the property of the Provider until full payment is received. Upon completion of all payments, the rights expressly specified in the proposal shall transfer to the Client, unless otherwise agreed in writing. Use of the Deliverables prior to full payment constitutes copyright infringement. The Provider retains the right to display the work in a portfolio unless otherwise agreed in writing.`}
                    </ClauseBlock>

                    {/* 4 — הגבלת אחריות */}
                    <ClauseBlock
                      n="4"
                      title={isHe ? 'הגבלת אחריות ופיצויים' : 'Limitation of Liability & Indemnification'}
                    >
                      {isHe
                        ? `אחריות הספק כלפי הלקוח בגין כל נזק, לרבות נזק ישיר, עקיף, מקרי או תוצאתי, מוגבלת לסכום ששולם בפועל על-ידי הלקוח על פי הסכם זה. הספק אינו אחראי לנזקים שנגרמו עקב אי-ביצוע, עיכובים, כוח עליון, פעולות צדדי שלישי, או כישלון טכנולוגי מחוץ לשליטתו הסבירה. DealSpace מספקת תשתית טכנולוגית בלבד ואינה אחראית לאיכות השירותים, לדיוק המידע, או לכל נזק הנובע מהשימוש בפלטפורמה.`
                        : `The Provider's liability to the Client for any damage, including direct, indirect, incidental, or consequential damage, is limited to the amount actually paid by the Client under this agreement. The Provider is not liable for damages caused by non-performance, delays, force majeure, third-party actions, or technological failure outside their reasonable control. DealSpace provides technology infrastructure only and is not liable for service quality, information accuracy, or any damage arising from use of the platform.`}
                    </ClauseBlock>

                    {/* 5 — דין וסמכות */}
                    <ClauseBlock
                      n="5"
                      title={isHe ? 'דין חל וסמכות שיפוט' : 'Governing Law & Jurisdiction'}
                    >
                      {isHe
                        ? `הסכם זה כפוף לדין הישראלי בלבד. כל מחלוקת הנובעת מהסכם זה, לרבות שאלות לגבי תוקפו, פרשנותו, הפרתו או ביטולו, תובא לפני בית המשפט המוסמך במחוז תל אביב-יפו בישראל, אשר לו מוקנית סמכות השיפוט הבלעדית. הצדדים מסכימים לוותר על כל טענה בדבר חוסר סמכות מקומית. חתימה אלקטרונית על הסכם זה מהווה חתימה לכל דבר ועניין בהתאם לחוק חתימה אלקטרונית, התשס"א-2001.`
                        : `This agreement is governed solely by Israeli law. Any dispute arising from this agreement, including questions regarding its validity, interpretation, breach, or cancellation, shall be brought before the competent court in the Tel Aviv-Jaffa district in Israel, which shall have exclusive jurisdiction. The parties waive any claim of lack of local jurisdiction. An electronic signature on this agreement constitutes a valid signature pursuant to the Electronic Signature Law, 5761-2001.`}
                    </ClauseBlock>

                    {/* 6 — סודיות */}
                    <ClauseBlock
                      n="6"
                      title={isHe ? 'סודיות' : 'Confidentiality'}
                    >
                      {isHe
                        ? `שני הצדדים מסכימים לשמור בסודיות על כל מידע עסקי, טכני או פיננסי שנחשף במסגרת הסכם זה ואינו ידוע לציבור. התחייבות זו תישאר בתוקף למשך 3 שנים לאחר סיום ההסכם. אין בסעיף זה כדי למנוע גילוי מידע הנדרש על-פי דין או צו בית משפט.`
                        : `Both parties agree to maintain in confidence all business, technical, or financial information disclosed under this agreement that is not publicly known. This obligation shall remain in effect for 3 years after the agreement terminates. This clause does not prevent disclosure of information required by law or court order.`}
                    </ClauseBlock>

                    {/* e-Signature notice */}
                    <div
                      className="rounded-xl px-4 py-3.5"
                      style={{
                        background: 'rgba(99,102,241,0.06)',
                        border: '1px solid rgba(99,102,241,0.18)',
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <Shield size={13} className="text-indigo-400 flex-none mt-0.5" />
                        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {isHe
                            ? 'חתימה אלקטרונית זו שווה ערך לחתימה פיזית בהתאם לחוק חתימה אלקטרונית, התשס"א-2001. כתובת ה-IP, חותמת הזמן, ופרטי החותם נשמרים ומאומתים על-ידי DealSpace לצרכי ביקורת ואכיפה.'
                            : 'This electronic signature is equivalent to a physical signature pursuant to the Electronic Signature Law, 5761-2001. The IP address, timestamp, and signatory identity are recorded and verified by DealSpace for audit and enforcement purposes.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Footer ───────────────────────────────────────────────── */}
                  <div
                    className="px-6 py-4 flex-none"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Dialog.Close asChild>
                      <motion.button
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
                        whileHover={{ scale: 1.015, transition: { type: 'spring' as const, stiffness: 340, damping: 22 } }}
                        whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 18 } }}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                          boxShadow: '0 0 32px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                      >
                        {isHe ? 'הבנתי — סגור' : 'Understood — Close'}
                      </motion.button>
                    </Dialog.Close>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

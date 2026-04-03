import { motion } from 'framer-motion'
import {
  CreditCard, Zap, Star, CheckCircle2, AlertTriangle, Clock,
  RefreshCw, XCircle, Download, Infinity as InfinityIcon,
  ArrowUpRight, Info, ShieldCheck, HelpCircle,
} from 'lucide-react'
import {
  useAuthStore, useTier, useBillingStatus,
  useSubscriptionPeriodEnd, useCancelAtPeriodEnd,
} from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import {
  STRIPE_CUSTOMER_PORTAL, STRIPE_PRO_LINK, STRIPE_PREMIUM_LINK, buildCheckoutUrl,
} from '../lib/stripe'
import { GlobalFooter } from '../components/ui/GlobalFooter'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date, isHe: boolean): string {
  return d.toLocaleDateString(isHe ? 'he-IL' : 'en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

// ─── Billing page ─────────────────────────────────────────────────────────────

export default function Billing() {
  const { user } = useAuthStore()
  const { locale } = useI18n()
  const isHe = locale === 'he'

  const tier            = useTier()
  const billingStatus   = useBillingStatus()
  const periodEnd       = useSubscriptionPeriodEnd()
  const cancelAtEnd     = useCancelAtPeriodEnd()

  const isPaid   = tier === 'pro' || tier === 'unlimited'
  const isPro    = tier === 'pro'
  const isPremium = tier === 'unlimited'

  const tierColor = isPremium ? '#d4af37' : isPro ? '#818cf8' : 'rgba(255,255,255,0.3)'
  const tierBg    = isPremium ? 'rgba(212,175,55,0.1)' : isPro ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)'
  const tierBorder = isPremium ? 'rgba(212,175,55,0.25)' : isPro ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'

  const planNameHe = isPremium ? 'פרימיום' : isPro ? 'פרו' : 'חינם'
  const planNameEn = isPremium ? 'Premium' : isPro ? 'Pro' : 'Free'
  const planPrice  = isPremium ? '₪39' : isPro ? '₪19' : null

  const animBase = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

  return (
    <div className="relative min-h-dvh flex flex-col" dir={isHe ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes billing-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes billing-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>

      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-slate-50 dark:bg-[#040608]" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, ${tierColor}18 0%, transparent 65%)`, filter: 'blur(60px)', animation: 'billing-float 20s ease-in-out infinite' }} />
      </div>

      <main className="relative z-10 px-6 py-10 max-w-2xl mx-auto w-full flex-1">

        {/* Header */}
        <motion.div {...animBase} transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl flex-none"
              style={{ background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`, border: `1px solid ${tierColor}40` }}>
              <CreditCard size={18} style={{ color: tierColor }} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ letterSpacing: '-0.025em' }}>
              {isHe ? 'חיוב ומנוי' : 'Billing & Subscription'}
            </h1>
          </div>
          <p className="text-[14px] text-slate-500 dark:text-white/40 leading-relaxed">
            {isHe
              ? 'מידע על התוכנית שלך, מחזור החיוב, ואפשרויות ניהול'
              : 'Your plan details, billing cycle, and management options'}
          </p>
        </motion.div>

        {/* ── Past Due Banner ───────────────────────────────────────────────── */}
        {billingStatus === 'past_due' && (
          <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.05 }}
            className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-6"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 32px rgba(239,68,68,0.08)' }}>
            <AlertTriangle size={16} className="text-red-400 flex-none mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-red-300 mb-1">
                {isHe ? 'תשלום נכשל — יצירת הצעות חסומה' : 'Payment failed — proposal creation locked'}
              </p>
              <p className="text-[12px] text-red-400/70 leading-relaxed">
                {isHe
                  ? 'עדכן את אמצעי התשלום שלך בפורטל Stripe כדי לחדש את הגישה המלאה.'
                  : 'Update your payment method in the Stripe portal to restore full access.'}
              </p>
              {STRIPE_CUSTOMER_PORTAL && (
                <a href={STRIPE_CUSTOMER_PORTAL}
                  className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold text-red-300">
                  {isHe ? 'עדכן תשלום' : 'Update payment'} <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Cancellation Banner ───────────────────────────────────────────── */}
        {cancelAtEnd && periodEnd && billingStatus === 'active' && (
          <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.05 }}
            className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-6"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Clock size={16} className="text-amber-400 flex-none mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-amber-300 mb-1">
                {isHe ? 'המנוי מתבטל בסוף התקופה' : 'Subscription cancels at period end'}
              </p>
              <p className="text-[12px] text-amber-400/70 leading-relaxed">
                {isHe
                  ? `הגישה לתוכנית ${planNameHe} פעילה עד ${fmtDate(periodEnd, isHe)}. לאחר מכן החשבון יחזור לתוכנית חינם.`
                  : `Your ${planNameEn} access is active until ${fmtDate(periodEnd, isHe)}. After that, the account reverts to the Free plan.`}
              </p>
              {STRIPE_CUSTOMER_PORTAL && (
                <a href={STRIPE_CUSTOMER_PORTAL}
                  className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold text-amber-300">
                  {isHe ? 'בטל את הביטול' : 'Undo cancellation'} <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Current Plan Card ─────────────────────────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-3xl p-6 mb-5"
          style={{ background: tierBg, border: `1px solid ${tierBorder}`, boxShadow: isPaid ? `0 0 40px ${tierColor}12` : 'none' }}>

          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl flex-none"
                style={{ background: `${tierColor}20`, border: `1px solid ${tierColor}35` }}>
                {isPremium ? <InfinityIcon size={18} style={{ color: tierColor }} />
                  : isPro ? <Zap size={18} style={{ color: tierColor }} />
                  : <Star size={18} style={{ color: tierColor }} />}
              </div>
              <div>
                <p className="text-[15px] font-black text-white/90">
                  {isHe ? `תוכנית ${planNameHe}` : `${planNameEn} Plan`}
                </p>
                {planPrice && (
                  <p className="text-[12px] mt-0.5" style={{ color: `${tierColor}99` }}>
                    {planPrice} {isHe ? '/ חודש · כולל מע"מ' : '/ month · VAT incl.'}
                  </p>
                )}
              </div>
            </div>
            <span className="flex-none rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
              style={{ background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}30` }}>
              {isPremium ? 'PREMIUM' : isPro ? 'PRO' : 'FREE'}
            </span>
          </div>

          {/* Billing cycle info */}
          {isPaid && periodEnd && (
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 text-[12px] text-white/50">
                  {cancelAtEnd
                    ? <><XCircle size={13} className="text-amber-400" />{isHe ? 'גישה פעילה עד' : 'Active until'}</>
                    : <><RefreshCw size={13} className="text-emerald-400" />{isHe ? 'חיוב הבא' : 'Next charge'}</>}
                </div>
                <p className="text-[12px] font-bold text-white/80">
                  {fmtDate(periodEnd, isHe)}
                  {!cancelAtEnd && planPrice && (
                    <span className="text-white/40 font-normal"> · {planPrice}</span>
                  )}
                </p>
              </div>

              {/* Billing status */}
              <div className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 text-[12px] text-white/50">
                  <ShieldCheck size={13} />
                  {isHe ? 'מצב חיוב' : 'Billing status'}
                </div>
                <div className="flex items-center gap-1.5">
                  {billingStatus === 'active' && !cancelAtEnd && (
                    <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 block" />
                    <p className="text-[12px] font-bold text-emerald-400">{isHe ? 'פעיל' : 'Active'}</p></>
                  )}
                  {billingStatus === 'active' && cancelAtEnd && (
                    <><span className="h-1.5 w-1.5 rounded-full bg-amber-400 block" />
                    <p className="text-[12px] font-bold text-amber-400">{isHe ? 'מתבטל' : 'Canceling'}</p></>
                  )}
                  {billingStatus === 'past_due' && (
                    <><span className="h-1.5 w-1.5 rounded-full bg-red-400 block" />
                    <p className="text-[12px] font-bold text-red-400">{isHe ? 'תשלום נכשל' : 'Payment failed'}</p></>
                  )}
                </div>
              </div>

              {/* Invoices note */}
              <div className="flex items-start gap-2 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Download size={13} className="text-white/25 flex-none mt-0.5" />
                <p className="text-[12px] text-white/35 leading-relaxed">
                  {isHe
                    ? 'Stripe שולח קבלה אוטומטית למייל שלך לאחר כל חיוב. חשבוניות מס להורדה זמינות בפורטל הניהול.'
                    : 'Stripe sends an automatic receipt to your email after every charge. Tax invoices are available for download in the management portal.'}
                </p>
              </div>
            </div>
          )}

          {/* Invoicing compliance box */}
          {isPaid && (
            <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5 mb-4"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}>
              <Info size={13} className="text-indigo-400/70 flex-none mt-0.5" />
              <p className="text-[11px] text-white/40 leading-relaxed">
                {isHe
                  ? 'חשבונית מס/קבלה מוכרת למס (הכוללת מע"מ ומספר הקצאה) מופקת אוטומטית ונשלחת למייל שלכם לאחר כל חיוב חודשי באמצעות Morning (חשבונית ירוקה).'
                  : 'A recognized Israeli Tax Invoice / Receipt is automatically generated and sent to your email after each successful charge via Morning (Green Invoice).'}
              </p>
            </div>
          )}

          {/* Management CTA */}
          {isPaid && (
            STRIPE_CUSTOMER_PORTAL ? (
              <div className="space-y-2">
                <a
                  href={STRIPE_CUSTOMER_PORTAL}
                  className="flex items-center justify-between w-full rounded-2xl px-4 py-3 text-[13px] font-semibold transition-all"
                  style={{ background: `${tierColor}12`, border: `1px solid ${tierColor}30`, color: tierColor }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${tierColor}22` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${tierColor}12` }}
                >
                  <span className="flex items-center gap-2">
                    <CreditCard size={14} />
                    {isHe
                      ? 'ניהול מנוי, חשבוניות, עדכון אמצעי תשלום וביטול'
                      : 'Manage subscription, invoices, payment method & cancel'}
                  </span>
                  <ArrowUpRight size={14} className="opacity-50" />
                </a>
                <p className="text-[10.5px] leading-relaxed px-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {isHe
                    ? 'שדרוגים מתעדכנים מיידית (חיוב יחסי). ביטול או שנמוך ייכנסו לתוקף בסוף מחזור החיוב הנוכחי. לא יינתנו החזרים יחסיים על תקופה שלא נוצלה.'
                    : 'Upgrades are pro-rated and applied immediately. Downgrades and cancellations take effect at the end of the current billing cycle. No pro-rata refunds are provided.'}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl px-4 py-3 text-[12px] text-white/35 leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {isHe
                  ? 'לניהול מנוי, עדכון תשלום, הורדת חשבוניות או ביטול — פנה לתמיכה: support@dealspace.app'
                  : 'To manage your subscription, update payment, download invoices, or cancel — contact support@dealspace.app'}
              </div>
            )
          )}
        </motion.div>

        {/* ── PRO → upgrade to Premium ──────────────────────────────────────── */}
        {isPro && STRIPE_PREMIUM_LINK && (
          <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.14 }}
            className="rounded-3xl p-5 mb-5"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <InfinityIcon size={15} style={{ color: '#d4af37' }} />
                  <p className="text-[13px] font-bold" style={{ color: '#d4af37' }}>
                    {isHe ? 'שדרג לפרימיום' : 'Upgrade to Premium'}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {(isHe
                    ? ['הצעות ללא הגבלה', 'תמיכה בעדיפות גבוהה', 'השפעה על מפת הדרכים']
                    : ['Unlimited proposals', 'Priority support', 'Roadmap influence']
                  ).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[12px] text-white/50">
                      <CheckCircle2 size={11} style={{ color: '#d4af37' }} className="flex-none" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={buildCheckoutUrl(STRIPE_PREMIUM_LINK, user?.id ?? '', user?.email)}
                className="flex-none flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-bold transition-all whitespace-nowrap"
                style={{ background: 'rgba(212,175,55,0.18)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.35)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.28)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.18)' }}
              >
                {isHe ? '₪39 / חודש' : '₪39 / month'} <ArrowUpRight size={12} />
              </a>
            </div>
          </motion.div>
        )}

        {/* ── FREE: upgrade cards ───────────────────────────────────────────── */}
        {tier === 'free' && (
          <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.14 }} className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">
              {isHe ? 'שדרוגים זמינים' : 'Available upgrades'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRIPE_PRO_LINK && (
                <a
                  href={buildCheckoutUrl(STRIPE_PRO_LINK, user?.id ?? '', user?.email)}
                  className="flex flex-col rounded-2xl p-5 transition-all"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.15)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.08)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={15} style={{ color: '#818cf8' }} />
                    <p className="text-[13px] font-black" style={{ color: '#818cf8' }}>{isHe ? 'פרו' : 'Pro'}</p>
                  </div>
                  <p className="text-[22px] font-black text-white mb-0.5">₪19</p>
                  <p className="text-[10px] text-indigo-400/60 mb-3">{isHe ? '/ חודש · כולל מע"מ' : '/ month · VAT incl.'}</p>
                  {(isHe
                    ? ['עד 100 הצעות', 'Webhooks + אוטומציות', 'תמיכה ישירה']
                    : ['Up to 100 proposals', 'Webhooks + automations', 'Direct support']
                  ).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-white/45 mb-1.5">
                      <CheckCircle2 size={10} style={{ color: '#818cf8' }} className="flex-none" /> {f}
                    </div>
                  ))}
                </a>
              )}
              {STRIPE_PREMIUM_LINK && (
                <a
                  href={buildCheckoutUrl(STRIPE_PREMIUM_LINK, user?.id ?? '', user?.email)}
                  className="flex flex-col rounded-2xl p-5 transition-all"
                  style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,175,55,0.07)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <InfinityIcon size={15} style={{ color: '#d4af37' }} />
                    <p className="text-[13px] font-black" style={{ color: '#d4af37' }}>{isHe ? 'פרימיום' : 'Premium'}</p>
                  </div>
                  <p className="text-[22px] font-black text-white mb-0.5">₪39</p>
                  <p className="text-[10px]  mb-3" style={{ color: 'rgba(212,175,55,0.6)' }}>{isHe ? '/ חודש · כולל מע"מ' : '/ month · VAT incl.'}</p>
                  {(isHe
                    ? ['הצעות ללא הגבלה', 'הכל כולל פרו', 'תמיכה בעדיפות גבוהה']
                    : ['Unlimited proposals', 'Everything in Pro', 'Priority support']
                  ).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-white/45 mb-1.5">
                      <CheckCircle2 size={10} style={{ color: '#d4af37' }} className="flex-none" /> {f}
                    </div>
                  ))}
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── What happens when you cancel ──────────────────────────────────── */}
        {isPaid && (
          <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl p-5 mb-5"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-4">
              {isHe ? 'שאלות נפוצות' : 'FAQ'}
            </p>
            <div className="space-y-4">
              {[
                {
                  q: isHe ? 'מה קורה כשמבטלים את המנוי?' : 'What happens when I cancel?',
                  a: isHe
                    ? `הגישה לתוכנית ${planNameHe} ממשיכה עד סוף תקופת החיוב הנוכחית (${periodEnd ? fmtDate(periodEnd, isHe) : '—'}). לאחר מכן החשבון עובר אוטומטית לתוכנית חינם. לא מחויבים יותר.`
                    : `Your ${planNameEn} access continues until the end of the current billing period (${periodEnd ? fmtDate(periodEnd, isHe) : '—'}). After that, the account automatically switches to the Free plan. No further charges.`,
                },
                {
                  q: isHe ? 'איך מקבלים חשבוניות ומה כתוב בהן?' : 'How do I get invoices?',
                  a: isHe
                    ? 'Stripe שולח קבלה/חשבונית למייל שלך לאחר כל חיוב חודשי. את כל החשבוניות ניתן להוריד גם בפורטל הניהול (לחץ "ניהול מנוי" למעלה).'
                    : 'Stripe emails you a receipt/invoice after each monthly charge. All invoices can also be downloaded from the management portal (click "Manage subscription" above).',
                },
                {
                  q: isHe ? 'איך משנים תוכנית?' : 'How do I change my plan?',
                  a: isHe
                    ? 'לשדרוג מפרו לפרימיום — ישנה כפתור ישיר בדף זה. לשינוי אחר (שנמוך, ביטול) — דרך פורטל Stripe שבלחיצה על "ניהול מנוי".'
                    : 'To upgrade from Pro to Premium — there\'s a direct button on this page. For other changes (downgrade, cancel) — via the Stripe portal by clicking "Manage subscription".',
                },
                {
                  q: isHe ? 'האם ניתן לקבל החזר כספי?' : 'Can I get a refund?',
                  a: isHe
                    ? 'DealSpace לא מציע החזרים אוטומטיים. לבקשת החזר יוצאי דופן — פנה לתמיכה: support@dealspace.app'
                    : 'DealSpace does not offer automatic refunds. For exceptional refund requests — contact support@dealspace.app',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <HelpCircle size={14} className="flex-none mt-0.5 text-indigo-400/60" />
                  <div>
                    <p className="text-[12px] font-bold text-white/70 mb-1">{item.q}</p>
                    <p className="text-[12px] text-white/40 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Security note ─────────────────────────────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.26 }}
          className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-4"
          style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ShieldCheck size={14} className="text-emerald-400/60 flex-none" />
          <p className="text-[11px] text-white/30 leading-relaxed">
            {isHe
              ? 'כל פרטי התשלום מאוחסנים ומנוהלים ישירות ב-Stripe — תקן PCI-DSS. DealSpace לא שומר מספרי כרטיס אשראי.'
              : 'All payment details are stored and managed directly by Stripe — PCI-DSS compliant. DealSpace never stores card numbers.'}
          </p>
        </motion.div>

        {/* ── Israeli invoicing compliance note ─────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-start gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Info size={14} className="text-indigo-400/70 flex-none mt-0.5" />
          <p className="text-[11px] text-white/30 leading-relaxed">
            {isHe
              ? 'חשבונית מס/קבלה מוכרת למס (הכוללת מע"מ ומספר הקצאה) מופקת אוטומטית ונשלחת למייל שלכם לאחר כל חיוב חודשי באמצעות Morning (חשבונית ירוקה).'
              : 'A recognized Israeli Tax Invoice / Receipt is automatically generated and sent to your email after each successful charge via Morning (Green Invoice).'}
          </p>
        </motion.div>

      </main>

      <GlobalFooter />
    </div>
  )
}

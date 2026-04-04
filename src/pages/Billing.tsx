import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Zap, Star, CheckCircle2, AlertTriangle, Clock,
  RefreshCw, XCircle, Download, Infinity as InfinityIcon,
  ArrowUpRight, Info, ShieldCheck, HelpCircle, Settings, RotateCcw, Loader2,
} from 'lucide-react'
import {
  useAuthStore, useTier, useBillingStatus,
  useSubscriptionPeriodEnd, useCancelAtPeriodEnd,
} from '../stores/useAuthStore'
import { useI18n } from '../lib/i18n'
import {
  STRIPE_PRO_LINK, STRIPE_PREMIUM_LINK, buildCheckoutUrl, createPortalSession,
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

  const tier          = useTier()
  const billingStatus = useBillingStatus()
  const periodEnd     = useSubscriptionPeriodEnd()
  const cancelAtEnd   = useCancelAtPeriodEnd()

  const isPaid    = tier === 'pro' || tier === 'unlimited'
  const isPro     = tier === 'pro'
  const isPremium = tier === 'unlimited'

  const tierColor  = isPremium ? '#d4af37' : isPro ? '#818cf8' : 'rgba(255,255,255,0.3)'
  const tierBorder = isPremium ? 'rgba(212,175,55,0.22)' : isPro ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.07)'

  const planNameHe = isPremium ? 'פרימיום' : isPro ? 'פרו' : 'חינם'
  const planNameEn = isPremium ? 'Premium' : isPro ? 'Pro' : 'Free'
  const planPrice  = isPremium ? '₪39' : isPro ? '₪19' : null

  // If user has a Stripe customer ID, ALL billing actions route through a
  // dynamic portal session — prevents duplicate subscriptions on plan changes.
  const hasStripeCustomer = Boolean(user?.user_metadata?.stripe_customer_id)

  // Track which action button is loading (null = idle)
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null)

  const handlePortalAction = React.useCallback(async (action: string) => {
    if (loadingAction) return
    setLoadingAction(action)
    try {
      const url = await createPortalSession()
      window.location.href = url
      // Don't reset — page is navigating away
    } catch (err) {
      console.error('[stripe-portal]', err)
      if (import.meta.env.DEV) {
        alert('Portal session failed. Is the stripe-portal Edge Function deployed?\n\nRun: supabase functions deploy stripe-portal --project-ref aefyytktbpynkbxhzhyt')
      }
      setLoadingAction(null)
    }
  }, [loadingAction])

  const animBase = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  }

  // Derive billing state
  const stateD = billingStatus === 'past_due'
  const stateC = isPaid && cancelAtEnd === true
  const stateB = isPaid && billingStatus === 'active' && !cancelAtEnd

  return (
    <div className="relative min-h-dvh flex flex-col" dir={isHe ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes billing-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes billing-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes billing-float-b {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(12px) scale(0.97); }
        }
        @keyframes billing-banner-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(var(--pulse-rgb), 0.35); }
          60%       { box-shadow: 0 0 0 8px rgba(var(--pulse-rgb), 0); }
        }
        @keyframes billing-status-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      {/* ── Multi-orb aurora background ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[#040608]" />
        {/* Primary tier orb */}
        <div className="absolute -top-32 -end-32 h-[600px] w-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${tierColor}20 0%, transparent 65%)`,
            filter: 'blur(72px)',
            animation: 'billing-float 22s ease-in-out infinite',
          }} />
        {/* Secondary indigo orb */}
        <div className="absolute bottom-0 -start-40 h-[480px] w-[480px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
            filter: 'blur(80px)',
            animation: 'billing-float-b 28s ease-in-out infinite',
          }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      <main className="relative z-10 px-5 sm:px-6 py-12 max-w-2xl mx-auto w-full flex-1">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.5, ease: 'easeOut' as const }} className="mb-10">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl flex-none"
              style={{
                background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}18)`,
                border: `1px solid ${tierColor}40`,
                boxShadow: `0 0 28px ${tierColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}>
              <CreditCard size={20} style={{ color: tierColor }} />
            </div>
            <div>
              <h1 className="text-[26px] font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                {isHe ? 'חיוב ומנוי' : 'Billing & Subscription'}
              </h1>
              <p className="text-[13px] text-white/38 mt-0.5">
                {isHe
                  ? 'מידע על התוכנית, מחזור החיוב, וניהול'
                  : 'Plan details, billing cycle, and management'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── State D: Past Due Banner ──────────────────────────────────────────── */}
        <AnimatePresence>
          {stateD && (
            <motion.div
              key="past-due-banner"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl px-5 py-5 mb-6 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.05) 100%)',
                border: '1px solid rgba(239,68,68,0.28)',
                boxShadow: '0 0 48px rgba(239,68,68,0.1), inset 0 1px 0 rgba(239,68,68,0.12)',
              }}>
              {/* Radial glow behind icon */}
              <div className="absolute top-0 start-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
              <div className="relative flex items-start gap-4 mb-5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    animation: 'billing-banner-pulse 2s ease-out infinite',
                    '--pulse-rgb': '239,68,68',
                  } as React.CSSProperties}>
                  <AlertTriangle size={15} className="text-red-400" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[13.5px] font-bold text-red-300 mb-1 tracking-tight">
                    {isHe ? 'תשלום נכשל — יצירת הצעות חסומה' : 'Payment failed — proposal creation locked'}
                  </p>
                  <p className="text-[12px] text-red-400/65 leading-relaxed">
                    {isHe
                      ? 'עדכן את אמצעי התשלום שלך כדי לחדש את הגישה המלאה.'
                      : 'Update your payment method to restore full access.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePortalAction('past_due')}
                disabled={loadingAction === 'past_due'}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[13px] font-bold transition-all disabled:opacity-70 disabled:cursor-wait"
                style={{ background: 'rgba(239,68,68,0.22)', border: '1px solid rgba(239,68,68,0.42)', color: '#fca5a5' }}
                onMouseEnter={e => { if (!loadingAction) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.32)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.22)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
              >
                {loadingAction === 'past_due' ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                {isHe ? 'עדכון פרטי אשראי' : 'Update Payment Method'}
                {loadingAction !== 'past_due' && <ArrowUpRight size={13} className="opacity-70" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── State C: Cancel-at-End Banner ─────────────────────────────────────── */}
        <AnimatePresence>
          {stateC && periodEnd && (
            <motion.div
              key="cancel-banner"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl px-5 py-5 mb-6 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.04) 100%)',
                border: '1px solid rgba(245,158,11,0.28)',
                boxShadow: '0 0 40px rgba(245,158,11,0.08), inset 0 1px 0 rgba(245,158,11,0.1)',
              }}>
              <div className="absolute top-0 start-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
              <div className="relative flex items-start gap-4 mb-5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(245,158,11,0.2)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    animation: 'billing-banner-pulse 2.4s ease-out infinite',
                    '--pulse-rgb': '245,158,11',
                  } as React.CSSProperties}>
                  <Clock size={15} className="text-amber-400" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[13.5px] font-bold text-amber-300 mb-1 tracking-tight">
                    {isHe ? 'המנוי בוטל — פעיל עד סוף התקופה' : 'Subscription canceled — active until period end'}
                  </p>
                  <p className="text-[12px] text-amber-400/65 leading-relaxed">
                    {isHe
                      ? `המנוי יסתיים ב-${fmtDate(periodEnd, isHe)} ולא יחודש. לאחר מכן החשבון יעבור לתוכנית חינם.`
                      : `Your subscription ends on ${fmtDate(periodEnd, isHe)} and will not renew. After that, the account reverts to the Free plan.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePortalAction('reactivate')}
                disabled={loadingAction === 'reactivate'}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[13px] font-bold transition-all disabled:opacity-70 disabled:cursor-wait"
                style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.38)', color: '#fcd34d' }}
                onMouseEnter={e => { if (!loadingAction) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.28)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.18)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
              >
                {loadingAction === 'reactivate' ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {isHe ? 'חידוש מנוי' : 'Reactivate Subscription'}
                {loadingAction !== 'reactivate' && <ArrowUpRight size={13} className="opacity-70" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Current Plan Card ──────────────────────────────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' as const }}
          className="rounded-3xl p-6 mb-5 overflow-hidden relative"
          style={{
            background: `linear-gradient(160deg, ${tierColor}10 0%, ${tierColor}04 100%)`,
            border: `1px solid ${tierBorder}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.4), ${isPaid ? `0 0 48px ${tierColor}10` : ''}`,
          }}>
          {/* Subtle corner glow */}
          {isPaid && (
            <div className="absolute -top-20 -end-20 h-48 w-48 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${tierColor}20 0%, transparent 65%)`, filter: 'blur(32px)' }} />
          )}

          <div className="relative flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl flex-none"
                style={{
                  background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}12)`,
                  border: `1px solid ${tierColor}35`,
                  boxShadow: `0 0 20px ${tierColor}22`,
                }}>
                {isPremium ? <InfinityIcon size={20} style={{ color: tierColor }} />
                  : isPro ? <Zap size={20} style={{ color: tierColor }} />
                  : <Star size={20} style={{ color: tierColor }} />}
              </div>
              <div>
                <p className="text-[16px] font-black text-white tracking-tight">
                  {isHe ? `תוכנית ${planNameHe}` : `${planNameEn} Plan`}
                </p>
                {planPrice && (
                  <p className="text-[12px] mt-0.5" style={{ color: `${tierColor}90` }}>
                    {planPrice} {isHe ? '/ חודש · כולל מע"מ' : '/ month · VAT incl.'}
                  </p>
                )}
                {!isPaid && (
                  <p className="text-[12px] mt-0.5 text-white/30">
                    {isHe ? 'עד 5 הצעות פעילות' : 'Up to 5 active proposals'}
                  </p>
                )}
              </div>
            </div>
            <span className="flex-none rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
              style={{
                background: `${tierColor}18`,
                color: tierColor,
                border: `1px solid ${tierColor}28`,
                boxShadow: `0 0 12px ${tierColor}15`,
              }}>
              {isPremium ? 'PREMIUM' : isPro ? 'PRO' : 'FREE'}
            </span>
          </div>

          {/* Billing cycle info — paid users */}
          {isPaid && periodEnd && (
            <div className="relative space-y-2">
              <div className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 text-[12px] text-white/40">
                  {cancelAtEnd
                    ? <><XCircle size={12} className="text-amber-400" />{isHe ? 'גישה פעילה עד' : 'Active until'}</>
                    : <><RefreshCw size={12} className="text-emerald-400" />{isHe ? 'חיוב הבא' : 'Next charge'}</>}
                </div>
                <p className="text-[12px] font-bold text-white/75">
                  {fmtDate(periodEnd, isHe)}
                  {!cancelAtEnd && planPrice && (
                    <span className="text-white/35 font-normal"> · {planPrice}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 text-[12px] text-white/40">
                  <ShieldCheck size={12} />
                  {isHe ? 'מצב חיוב' : 'Billing status'}
                </div>
                <div className="flex items-center gap-2">
                  {billingStatus === 'active' && !cancelAtEnd && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 block"
                        style={{ animation: 'billing-status-blink 2.5s ease-in-out infinite' }} />
                      <p className="text-[12px] font-bold text-emerald-400">{isHe ? 'פעיל' : 'Active'}</p>
                    </>
                  )}
                  {billingStatus === 'active' && cancelAtEnd && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 block" />
                      <p className="text-[12px] font-bold text-amber-400">{isHe ? 'מתבטל בסוף התקופה' : 'Cancels at period end'}</p>
                    </>
                  )}
                  {billingStatus === 'past_due' && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 block"
                        style={{ animation: 'billing-status-blink 1.2s ease-in-out infinite' }} />
                      <p className="text-[12px] font-bold text-red-400">{isHe ? 'תשלום נכשל' : 'Payment failed'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── State B: Action Center — Active paid, not canceling ────────────────── */}
        {stateB && (
          <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' as const }} className="mb-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/28 mb-3 px-0.5">
              {isHe ? 'פעולות' : 'Actions'}
            </p>

            {/* Action container */}
            <div className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.35)',
              }}>

              {/* 1. Manage Subscription */}
              <button
                type="button"
                onClick={() => handlePortalAction('manage')}
                disabled={!!loadingAction}
                className="flex items-center justify-between w-full px-5 py-4 transition-all group text-start disabled:cursor-wait"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { if (!loadingAction) (e.currentTarget as HTMLButtonElement).style.background = `${tierColor}10` }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                    style={{ background: `${tierColor}18`, border: `1px solid ${tierColor}28` }}>
                    {loadingAction === 'manage' ? <Loader2 size={13} className="animate-spin" style={{ color: tierColor }} /> : <Settings size={13} style={{ color: tierColor }} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/85">
                      {isHe ? 'ניהול מנוי ושנמוך' : 'Manage Subscription & Downgrade'}
                    </p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {isHe ? 'שנה תוכנית, פרטי תשלום, ועוד' : 'Change plan, payment method, and more'}
                    </p>
                  </div>
                </div>
                <div className="flex-none transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowUpRight size={14} style={{ color: `${tierColor}70` }} />
                </div>
              </button>

              {/* 2. Update Payment Method */}
              <button
                type="button"
                onClick={() => handlePortalAction('payment')}
                disabled={!!loadingAction}
                className="flex items-center justify-between w-full px-5 py-4 transition-all group text-start disabled:cursor-wait"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { if (!loadingAction) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {loadingAction === 'payment' ? <Loader2 size={13} className="animate-spin text-white/55" /> : <CreditCard size={13} className="text-white/55" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/70">
                      {isHe ? 'עדכון אמצעי תשלום' : 'Update Payment Method'}
                    </p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {isHe ? 'שנה כרטיס אשראי או שיטת תשלום' : 'Change credit card or payment method'}
                    </p>
                  </div>
                </div>
                <div className="flex-none transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowUpRight size={14} className="text-white/25" />
                </div>
              </button>

              {/* 3. View Invoices */}
              <button
                type="button"
                onClick={() => handlePortalAction('invoices')}
                disabled={!!loadingAction}
                className="flex items-center justify-between w-full px-5 py-4 transition-all group text-start disabled:cursor-wait"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { if (!loadingAction) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {loadingAction === 'invoices' ? <Loader2 size={13} className="animate-spin text-white/55" /> : <Download size={13} className="text-white/55" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/70">
                      {isHe ? 'חשבוניות וקבלות' : 'View Invoices & Receipts'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full flex-none"
                        style={{ background: '#4ade80', boxShadow: '0 0 5px #4ade8099' }} />
                      <p className="text-[11px] text-white/32">
                        {isHe
                          ? 'מופקות אוטומטית ע״י Morning (חשבונית ירוקה)'
                          : 'Auto-generated via Morning (Green Invoice)'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-none transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowUpRight size={14} className="text-white/25" />
                </div>
              </button>

              {/* 4. Cancel Subscription */}
              <button
                type="button"
                onClick={() => handlePortalAction('cancel')}
                disabled={!!loadingAction}
                className="flex items-center justify-between w-full px-5 py-4 transition-all group text-start disabled:cursor-wait"
                onMouseEnter={e => { if (!loadingAction) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {loadingAction === 'cancel' ? <Loader2 size={13} className="animate-spin text-red-400/70" /> : <XCircle size={13} className="text-red-400/70" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-red-400/75 group-hover:text-red-400 transition-colors">
                      {isHe ? 'ביטול מנוי' : 'Cancel Subscription'}
                    </p>
                    <p className="text-[11px] text-red-400/35 mt-0.5">
                      {isHe
                        ? 'ייכנס לתוקף בסוף מחזור החיוב. ללא החזרים.'
                        : 'Takes effect at end of billing cycle. No refunds.'}
                    </p>
                  </div>
                </div>
                <div className="flex-none transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowUpRight size={14} className="text-red-400/28" />
                </div>
              </button>
            </div>

            {/* Lifecycle transparency note */}
            <p className="text-[10.5px] leading-relaxed px-1 pt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {isHe
                ? 'שדרוגים מתעדכנים מיידית (חיוב יחסי). ביטול או שנמוך ייכנסו לתוקף בסוף מחזור החיוב הנוכחי.'
                : 'Upgrades are pro-rated and applied immediately. Downgrades and cancellations take effect at the end of the current billing cycle.'}
            </p>
          </motion.div>
        )}

        {/* ── PRO → upgrade to Premium ──────────────────────────────────────────── */}
        {isPro && (
          <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' as const }}
            className="rounded-3xl p-5 mb-5 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.03) 100%)',
              border: '1px solid rgba(212,175,55,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.08), 0 0 40px rgba(212,175,55,0.06)',
            }}>
            <div className="absolute -top-16 -end-16 h-40 w-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)', filter: 'blur(24px)' }} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <InfinityIcon size={14} style={{ color: '#d4af37' }} />
                  <p className="text-[13px] font-black tracking-tight" style={{ color: '#d4af37' }}>
                    {isHe ? 'שדרג לפרימיום' : 'Upgrade to Premium'}
                  </p>
                </div>
                <ul className="space-y-2">
                  {(isHe
                    ? ['הצעות ללא הגבלה', 'תמיכה בעדיפות גבוהה', 'השפעה על מפת הדרכים']
                    : ['Unlimited proposals', 'Priority support', 'Roadmap influence']
                  ).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[12px] text-white/45">
                      <CheckCircle2 size={11} style={{ color: '#d4af37' }} className="flex-none" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Existing customers → portal (prevents duplicate subscription) */}
              {hasStripeCustomer ? (
                <button
                  type="button"
                  onClick={() => handlePortalAction('pro_to_premium')}
                  disabled={!!loadingAction}
                  className="flex-none flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-all whitespace-nowrap disabled:opacity-70 disabled:cursor-wait"
                  style={{ background: 'rgba(212,175,55,0.18)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.32)', boxShadow: '0 0 16px rgba(212,175,55,0.12)' }}
                  onMouseEnter={e => { if (!loadingAction) { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(212,175,55,0.28)'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 4px 20px rgba(212,175,55,0.2)' } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(212,175,55,0.18)'; el.style.transform = ''; el.style.boxShadow = '0 0 16px rgba(212,175,55,0.12)' }}
                >
                  {loadingAction === 'pro_to_premium' ? <Loader2 size={12} className="animate-spin" /> : null}
                  {isHe ? 'שדרג — ₪39 / חודש' : 'Upgrade — ₪39 / mo'} {loadingAction !== 'pro_to_premium' && <ArrowUpRight size={12} />}
                </button>
              ) : (
                <a
                  href={STRIPE_PREMIUM_LINK ? buildCheckoutUrl(STRIPE_PREMIUM_LINK, user?.id ?? '', user?.email) : '#'}
                  onClick={e => { if (!STRIPE_PREMIUM_LINK && import.meta.env.DEV) { e.preventDefault(); alert('VITE_STRIPE_PREMIUM_LINK not set') } }}
                  className="flex-none flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-all whitespace-nowrap"
                  style={{ background: 'rgba(212,175,55,0.18)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.32)', boxShadow: '0 0 16px rgba(212,175,55,0.12)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(212,175,55,0.28)'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 4px 20px rgba(212,175,55,0.2)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'rgba(212,175,55,0.18)'; el.style.transform = ''; el.style.boxShadow = '0 0 16px rgba(212,175,55,0.12)' }}
                >
                  {isHe ? 'שדרג — ₪39 / חודש' : 'Upgrade — ₪39 / mo'} <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── FREE: Upgrade cards ────────────────────────────────────────────────── */}
        {tier === 'free' && (
          <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' as const }} className="mb-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/28 mb-3 px-0.5">
              {isHe ? 'שדרוגים זמינים' : 'Available upgrades'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Pro card — portal for returning customers, checkout for new */}
              <a
                href={hasStripeCustomer ? undefined : (STRIPE_PRO_LINK ? buildCheckoutUrl(STRIPE_PRO_LINK, user?.id ?? '', user?.email) : '#')}
                onClick={e => {
                  if (hasStripeCustomer) { e.preventDefault(); handlePortalAction('free_to_pro') }
                  else if (!STRIPE_PRO_LINK && import.meta.env.DEV) { e.preventDefault(); alert('VITE_STRIPE_PRO_LINK not set') }
                }}
                className="flex flex-col rounded-2xl p-5 transition-all"
                style={{
                  background: 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)',
                  border: '1px solid rgba(99,102,241,0.22)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'linear-gradient(160deg, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.07) 100%)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 32px rgba(99,102,241,0.15)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)'; el.style.transform = ''; el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} style={{ color: '#818cf8' }} />
                  <p className="text-[13px] font-black" style={{ color: '#818cf8' }}>{isHe ? 'פרו' : 'Pro'}</p>
                </div>
                <p className="text-[28px] font-black text-white tracking-tight mb-0">₪19</p>
                <p className="text-[11px] text-indigo-400/55 mb-4">{isHe ? '/ חודש · כולל מע"מ' : '/ month · VAT incl.'}</p>
                {(isHe
                  ? ['עד 100 הצעות', 'Webhooks + אוטומציות', 'תמיכה ישירה']
                  : ['Up to 100 proposals', 'Webhooks + automations', 'Direct support']
                ).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11.5px] text-white/42 mb-2">
                    <CheckCircle2 size={10} style={{ color: '#818cf8' }} className="flex-none" /> {f}
                  </div>
                ))}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-center gap-1.5 w-full rounded-xl py-2.5 text-[12.5px] font-bold"
                    style={{ background: 'rgba(99,102,241,0.22)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.32)' }}>
                    {isHe ? 'שדרג עכשיו' : 'Upgrade Now'} <ArrowUpRight size={12} />
                  </div>
                </div>
              </a>

              {/* Premium card — portal for returning customers, checkout for new */}
              <a
                href={hasStripeCustomer ? undefined : (STRIPE_PREMIUM_LINK ? buildCheckoutUrl(STRIPE_PREMIUM_LINK, user?.id ?? '', user?.email) : '#')}
                onClick={e => {
                  if (hasStripeCustomer) { e.preventDefault(); handlePortalAction('free_to_premium') }
                  else if (!STRIPE_PREMIUM_LINK && import.meta.env.DEV) { e.preventDefault(); alert('VITE_STRIPE_PREMIUM_LINK not set') }
                }}
                className="flex flex-col rounded-2xl p-5 transition-all"
                style={{
                  background: 'linear-gradient(160deg, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.03) 100%)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'linear-gradient(160deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.06) 100%)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px rgba(212,175,55,0.1)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'linear-gradient(160deg, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.03) 100%)'; el.style.transform = ''; el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <InfinityIcon size={14} style={{ color: '#d4af37' }} />
                  <p className="text-[13px] font-black" style={{ color: '#d4af37' }}>{isHe ? 'פרימיום' : 'Premium'}</p>
                </div>
                <p className="text-[28px] font-black text-white tracking-tight mb-0">₪39</p>
                <p className="text-[11px] mb-4" style={{ color: 'rgba(212,175,55,0.55)' }}>{isHe ? '/ חודש · כולל מע"מ' : '/ month · VAT incl.'}</p>
                {(isHe
                  ? ['הצעות ללא הגבלה', 'הכל כולל פרו', 'תמיכה בעדיפות גבוהה']
                  : ['Unlimited proposals', 'Everything in Pro', 'Priority support']
                ).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11.5px] text-white/42 mb-2">
                    <CheckCircle2 size={10} style={{ color: '#d4af37' }} className="flex-none" /> {f}
                  </div>
                ))}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-center gap-1.5 w-full rounded-xl py-2.5 text-[12.5px] font-bold"
                    style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.32)' }}>
                    {isHe ? 'שדרג עכשיו' : 'Upgrade Now'} <ArrowUpRight size={12} />
                  </div>
                </div>
              </a>
            </div>
          </motion.div>
        )}

        {/* ── FAQ ────────────────────────────────────────────────────────────────── */}
        {isPaid && (
          <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.22, ease: 'easeOut' as const }}
            className="rounded-3xl p-6 mb-5"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/28 mb-5">
              {isHe ? 'שאלות נפוצות' : 'FAQ'}
            </p>
            <div className="space-y-5">
              {[
                {
                  q: isHe ? 'מה קורה כשמבטלים את המנוי?' : 'What happens when I cancel?',
                  a: isHe
                    ? `הגישה לתוכנית ${planNameHe} ממשיכה עד סוף תקופת החיוב הנוכחית${periodEnd ? ` (${fmtDate(periodEnd, isHe)})` : ''}. לאחר מכן החשבון עובר אוטומטית לתוכנית חינם.`
                    : `Your ${planNameEn} access continues until the end of the current billing period${periodEnd ? ` (${fmtDate(periodEnd, isHe)})` : ''}. After that, the account automatically switches to the Free plan.`,
                },
                {
                  q: isHe ? 'איך מקבלים חשבוניות ומה כתוב בהן?' : 'How do I get invoices?',
                  a: isHe
                    ? 'חשבונית מס/קבלה מוכרת למס מופקת אוטומטית ונשלחת למייל שלך לאחר כל חיוב באמצעות Morning (חשבונית ירוקה). כל החשבוניות זמינות להורדה גם בפורטל הניהול.'
                    : 'A recognized Israeli Tax Invoice / Receipt is automatically generated and sent to your email after each charge via Morning (Green Invoice). All invoices are also available for download in the management portal.',
                },
                {
                  q: isHe ? 'איך משנים תוכנית?' : 'How do I change my plan?',
                  a: isHe
                    ? 'לשדרוג מפרו לפרימיום — יש כפתור ישיר בדף זה. לשינוי אחר (שנמוך, ביטול) — דרך פורטל Stripe (כפתור "ניהול מנוי" למעלה).'
                    : "To upgrade from Pro to Premium — there's a direct button on this page. For other changes (downgrade, cancel) — via the Stripe portal (\"Manage Subscription\" above).",
                },
                {
                  q: isHe ? 'האם ניתן לקבל החזר כספי?' : 'Can I get a refund?',
                  a: isHe
                    ? 'DealSpace לא מציע החזרים יחסיים על תקופה שלא נוצלה. הביטול ייכנס לתוקף בסוף מחזור החיוב הנוכחי בלבד.'
                    : 'DealSpace does not offer pro-rata refunds for unused periods. Cancellation takes effect at the end of the current billing cycle only.',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="flex h-6 w-6 flex-none items-center justify-center rounded-lg mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.18)' }}>
                    <HelpCircle size={11} className="text-indigo-400/70" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-bold text-white/68 mb-1.5">{item.q}</p>
                    <p className="text-[12px] text-white/38 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Security note ──────────────────────────────────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.28, ease: 'easeOut' as const }}
          className="flex items-center gap-3.5 rounded-2xl px-5 py-4 mb-3"
          style={{
            background: 'linear-gradient(160deg, rgba(74,222,128,0.06) 0%, rgba(74,222,128,0.02) 100%)',
            border: '1px solid rgba(74,222,128,0.12)',
          }}>
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-xl"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <ShieldCheck size={13} className="text-emerald-400/80" />
          </div>
          <p className="text-[11.5px] text-white/35 leading-relaxed">
            {isHe
              ? 'כל פרטי התשלום מאוחסנים ומנוהלים ישירות ב-Stripe — תקן PCI-DSS. DealSpace לא שומר מספרי כרטיס אשראי.'
              : 'All payment details are stored and managed directly by Stripe — PCI-DSS compliant. DealSpace never stores card numbers.'}
          </p>
        </motion.div>

        {/* ── Israeli invoicing compliance note ─────────────────────────────────── */}
        <motion.div {...animBase} transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' as const }}
          className="flex items-start gap-3.5 rounded-2xl px-5 py-4"
          style={{
            background: 'linear-gradient(160deg, rgba(99,102,241,0.07) 0%, rgba(99,102,241,0.02) 100%)',
            border: '1px solid rgba(99,102,241,0.14)',
          }}>
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-xl mt-0.5"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Info size={13} className="text-indigo-400/80" />
          </div>
          <p className="text-[11.5px] text-white/35 leading-relaxed">
            {isHe
              ? 'חשבונית מס/קבלה מוכרת למס (הכוללת מע"מ ומספר הקצאה) מופקת אוטומטית ונשלחת למייל שלכם לאחר כל חיוב חודשי באמצעות Morning (חשבונית ירוקה).'
              : 'A recognized Israeli Tax Invoice / Receipt (including VAT and allocation number) is automatically generated and sent to your email after each monthly charge via Morning (Green Invoice).'}
          </p>
        </motion.div>

      </main>

      <GlobalFooter />
    </div>
  )
}

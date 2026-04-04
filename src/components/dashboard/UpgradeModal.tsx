import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Star, Infinity as InfinityIcon, Check, CreditCard, Loader2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useAuthStore, FREE_PROPOSAL_LIMIT } from '../../stores/useAuthStore'
import type { PlanTier } from '../../stores/useAuthStore'
import {
  STRIPE_PRO_LINK,
  STRIPE_PREMIUM_LINK,
  STRIPE_CUSTOMER_PORTAL,
  buildCheckoutUrl,
} from '../../lib/stripe'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  activeCount: number
  currentTier: PlanTier
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

interface PlanDef {
  id: 'free' | 'pro' | 'premium'
  nameEn: string
  nameHe: string
  price: number | null
  periodEn: string
  periodHe: string
  featuresEn: string[]
  featuresHe: string[]
  ctaUpgradeEn: string
  ctaUpgradeHe: string
  popular: boolean
  accent: string
}

const PLAN_RANK: Record<PlanDef['id'], number> = { free: 0, pro: 1, premium: 2 }

const PLANS: PlanDef[] = [
  {
    id: 'free',
    nameEn: 'Free', nameHe: 'חינם',
    price: 0, periodEn: 'forever', periodHe: 'לתמיד',
    featuresEn: [
      `Up to ${FREE_PROPOSAL_LIMIT} active proposals`,
      'Deal Room + digital e-signature',
      'Professional PDF export',
      'View & engagement analytics',
    ],
    featuresHe: [
      `עד ${FREE_PROPOSAL_LIMIT} הצעות פעילות`,
      'Deal Room + חתימה דיגיטלית',
      'ייצוא PDF מקצועי',
      'אנליטיקות צפייה ומעורבות',
    ],
    ctaUpgradeEn: 'Downgrade to Free', ctaUpgradeHe: 'שנמך לחינם',
    popular: false,
    accent: '#6b7280',
  },
  {
    id: 'pro',
    nameEn: 'Pro', nameHe: 'פרו',
    price: 19, periodEn: '/ month', periodHe: '/ חודש',
    featuresEn: [
      'Up to 100 active proposals',
      'Everything in Free',
      'Webhooks + Automations',
      'Direct support',
    ],
    featuresHe: [
      'עד 100 הצעות פעילות',
      'הכל כולל תוכנית חינם',
      'Webhooks + אוטומציות',
      'תמיכה ישירה בדוא"ל',
    ],
    ctaUpgradeEn: 'Upgrade to Pro', ctaUpgradeHe: 'שדרג לפרו',
    popular: true,
    accent: '#6366f1',
  },
  {
    id: 'premium',
    nameEn: 'Premium', nameHe: 'פרימיום',
    price: 39, periodEn: '/ month', periodHe: '/ חודש',
    featuresEn: [
      'Unlimited active proposals',
      'Everything in Pro',
      'Priority support',
      'Input on the product roadmap',
    ],
    featuresHe: [
      'הצעות פעילות ללא הגבלה',
      'הכל כולל תוכנית פרו',
      'תמיכה בעדיפות גבוהה',
      'השפעה על מפת הדרכים',
    ],
    ctaUpgradeEn: 'Upgrade to Premium', ctaUpgradeHe: 'שדרג לפרימיום',
    popular: false,
    accent: '#d4af37',
  },
]

const PLAN_ICONS: Record<PlanDef['id'], React.ReactNode> = {
  free:    <Star size={15} />,
  pro:     <Zap size={15} />,
  premium: <InfinityIcon size={15} />,
}

// ─── UpgradeModal ─────────────────────────────────────────────────────────────

export function UpgradeModal({ open, onClose, activeCount, currentTier }: UpgradeModalProps) {
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const user = useAuthStore(s => s.user)
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  // Map tier → plan id ('unlimited' maps to 'premium')
  const currentPlanId: PlanDef['id'] = currentTier === 'unlimited' ? 'premium' : currentTier
  const isManagedView = currentTier !== 'free'

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose() }}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                key="upgrade-backdrop"
                className="fixed inset-0 z-[9998]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
              />
            </Dialog.Overlay>

            {/* Panel */}
            <Dialog.Content asChild>
              <motion.div
                key="upgrade-panel"
                className="fixed z-[9999] inset-0 flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 12 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                dir={isHe ? 'rtl' : 'ltr'}
              >
                <style>{`
                  @keyframes um-shimmer {
                    0%        { transform: translateX(-130%); }
                    60%, 100% { transform: translateX(130%); }
                  }
                  @keyframes um-glow-pulse {
                    0%, 100% { box-shadow: 0 0 0 2px #a855f740, 0 0 40px #a855f720; }
                    50%       { box-shadow: 0 0 0 2px #a855f7, 0 0 60px #a855f730; }
                  }
                  @keyframes um-badge-float {
                    0%, 100% { transform: translateY(0) translateX(-50%); }
                    50%       { transform: translateY(-2px) translateX(-50%); }
                  }
                  @keyframes um-scan {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(280%); }
                  }
                  @keyframes um-check-draw {
                    from { stroke-dashoffset: 20; }
                    to   { stroke-dashoffset: 0; }
                  }
                `}</style>

                <div
                  className="relative w-full max-w-3xl rounded-3xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, #0a0a18 0%, #060610 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(48px)',
                    maxHeight: '90dvh',
                    overflowY: 'auto',
                  }}
                >
                  {/* Top aurora */}
                  <div
                    className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
                    style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }}
                  />

                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      className="absolute top-4 end-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                      onPointerEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
                      onPointerLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
                    >
                      <X size={14} />
                    </button>
                  </Dialog.Close>

                  {/* Header */}
                  <div className="px-6 pt-8 pb-6 text-center relative">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}
                    >
                      {isManagedView ? '✦' : '🚀'}
                    </div>

                    <Dialog.Title asChild>
                      <h2
                        className="text-xl font-black mb-2 tracking-tight"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}
                      >
                        {isManagedView
                          ? (isHe ? 'ניהול המנוי שלך' : 'Manage your subscription')
                          : (isHe ? 'העסק שלך צומח!' : 'Your business is growing!')}
                      </h2>
                    </Dialog.Title>

                    <Dialog.Description asChild>
                      <p className="text-sm text-white/45 max-w-md mx-auto leading-relaxed">
                        {isManagedView
                          ? (isHe ? 'בחר את התוכנית המתאימה לקצב הצמיחה שלך.' : 'Choose the plan that fits your growth pace.')
                          : (isHe
                            ? `הגעת ל-${activeCount} מתוך ${FREE_PROPOSAL_LIMIT} הצעות פעילות בתוכנית החינמית. שדרג כדי להמשיך לסגור עסקאות ללא הגבלה.`
                            : `You've used ${activeCount} of ${FREE_PROPOSAL_LIMIT} active proposals on the free plan. Upgrade to keep closing deals without limits.`)}
                      </p>
                    </Dialog.Description>
                  </div>

                  {/* Pricing grid */}
                  <div className="px-5 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLANS.map((plan, idx) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        isHe={isHe}
                        delay={idx * 0.06}
                        currentPlanId={currentPlanId}
                        userId={user?.id ?? ''}
                        userEmail={user?.email ?? null}
                        loadingTier={loadingTier}
                        setLoadingTier={setLoadingTier}
                      />
                    ))}
                  </div>

                  {/* Footer note */}
                  <p className="text-center text-[10px] text-white/20 pb-5">
                    {isHe
                      ? 'ביטול בכל עת · ללא התחייבות · מחירים בשקל'
                      : 'Cancel anytime · No commitment · Prices in ILS'}
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, isHe, delay, currentPlanId, userId, userEmail, loadingTier, setLoadingTier }: {
  plan: PlanDef
  isHe: boolean
  delay: number
  currentPlanId: PlanDef['id']
  userId: string
  userEmail: string | null
  loadingTier: string | null
  setLoadingTier: (t: string | null) => void
}) {
  const currentRank = PLAN_RANK[currentPlanId]
  const planRank    = PLAN_RANK[plan.id]
  const isCurrent   = plan.id === currentPlanId
  const isUpgrade   = planRank > currentRank
  const isLoading   = loadingTier === plan.id
  const anyLoading  = loadingTier !== null

  const handleCta = () => {
    if (isCurrent || anyLoading) return

    if (isUpgrade) {
      const baseLink = plan.id === 'pro' ? STRIPE_PRO_LINK : STRIPE_PREMIUM_LINK
      if (!baseLink) {
        if (import.meta.env.DEV) alert(`VITE_STRIPE_${plan.id === 'pro' ? 'PRO' : 'PREMIUM'}_LINK not set in .env.local`)
        return
      }
      setLoadingTier(plan.id)
      window.location.href = buildCheckoutUrl(baseLink, userId, userEmail)
      return
    }

    // Downgrade or manage — redirect to Stripe Customer Portal
    if (STRIPE_CUSTOMER_PORTAL) {
      setLoadingTier(plan.id)
      window.location.href = STRIPE_CUSTOMER_PORTAL
    } else if (import.meta.env.DEV) {
      alert('VITE_STRIPE_CUSTOMER_PORTAL not set in .env.local')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' as const }}
      className="relative flex flex-col rounded-2xl p-5 overflow-hidden"
      style={{
        background: isCurrent
          ? `linear-gradient(160deg, ${plan.accent}18 0%, ${plan.accent}08 100%)`
          : plan.popular
            ? 'linear-gradient(160deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.07) 100%)'
            : 'rgba(255,255,255,0.04)',
        border: isCurrent
          ? `1px solid ${plan.accent}45`
          : plan.popular
            ? 'none'
            : '1px solid rgba(255,255,255,0.07)',
        animation: (!isCurrent && plan.popular) ? 'um-glow-pulse 3s ease-in-out infinite' : undefined,
        transform: plan.popular ? 'scale(1.025)' : undefined,
      }}
    >
      {/* Scan line — only on current plan */}
      {isCurrent && (
        <div className="absolute bottom-0 start-0 end-0 h-[2px] overflow-hidden rounded-b-2xl">
          <motion.div
            className="absolute inset-y-0 w-[40%]"
            style={{ background: `linear-gradient(90deg, transparent, ${plan.accent}, transparent)` }}
            animate={{ x: ['-100%', '350%'] }}
            transition={{ duration: 2.8, ease: 'easeInOut' as const, repeat: Infinity, repeatDelay: 1.4 }}
          />
        </div>
      )}

      {/* "Most Popular" badge — only when not current plan */}
      {plan.popular && !isCurrent && (
        <div
          className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            color: '#fff',
            animation: 'um-badge-float 2.5s ease-in-out infinite',
          }}
        >
          {isHe ? 'הכי פופולרי' : 'Most Popular'}
        </div>
      )}

      {/* "Active Plan" badge — current plan */}
      {isCurrent && (
        <div
          className="absolute -top-px left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-b-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
          style={{
            background: `linear-gradient(90deg, ${plan.accent}cc, ${plan.accent})`,
            color: '#fff',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 20, strokeDashoffset: 0, animation: 'um-check-draw 0.4s ease-out 0.3s both' }}>
            <polyline points="2,6 5,9 10,3" />
          </svg>
          {isHe ? 'תוכנית פעילה' : 'Active Plan'}
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <div
          className="flex h-8 w-8 flex-none items-center justify-center rounded-xl"
          style={{ background: `${plan.accent}20`, color: plan.accent, border: `1px solid ${plan.accent}35` }}
        >
          {PLAN_ICONS[plan.id]}
        </div>
        <p className="text-sm font-black text-white/90">{isHe ? plan.nameHe : plan.nameEn}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        {plan.price === 0 ? (
          <p className="text-3xl font-black text-white/80">{isHe ? 'חינם' : 'Free'}</p>
        ) : (
          <>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-white">₪{plan.price}</span>
              <span className="text-xs text-white/35 mb-1 font-medium">
                {isHe ? plan.periodHe : plan.periodEn}
              </span>
            </div>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: `${plan.accent}99` }}>
              {isHe ? 'כולל מע"מ' : 'VAT incl.'}
            </p>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-6">
        {(isHe ? plan.featuresHe : plan.featuresEn).map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-white/55">
            <span className="mt-0.5 flex-none text-[10px]" style={{ color: plan.accent }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        // ── Current plan — visual indicator, not interactive ──
        <div
          className="relative w-full rounded-xl py-2.5 text-[13px] font-bold flex items-center justify-center gap-2"
          style={{ background: `${plan.accent}12`, color: plan.accent, border: `1px solid ${plan.accent}30` }}
        >
          <Check size={13} strokeWidth={2.5} />
          {isHe ? 'תוכנית פעילה' : 'Active Plan'}
        </div>
      ) : isUpgrade ? (
        // ── Upgrade path ──
        <motion.button
          onClick={handleCta}
          disabled={anyLoading}
          whileTap={anyLoading ? {} : { scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
          className="relative w-full rounded-xl py-2.5 text-[13px] font-bold overflow-hidden transition-all flex items-center justify-center gap-2 disabled:cursor-wait"
          style={
            plan.popular
              ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', opacity: anyLoading && !isLoading ? 0.45 : 1 }
              : { background: `${plan.accent}20`, color: plan.accent, border: `1px solid ${plan.accent}35`, opacity: anyLoading && !isLoading ? 0.45 : 1 }
          }
          onPointerEnter={e => {
            if (!plan.popular && !anyLoading) (e.currentTarget as HTMLElement).style.background = `${plan.accent}35`
          }}
          onPointerLeave={e => {
            if (!plan.popular) (e.currentTarget as HTMLElement).style.background = `${plan.accent}20`
          }}
        >
          {plan.popular && !isLoading && (
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)',
                animation: 'um-shimmer 3s ease-in-out infinite',
              }}
            />
          )}
          {isLoading
            ? <Loader2 size={14} className="animate-spin" />
            : (isHe ? plan.ctaUpgradeHe : plan.ctaUpgradeEn)
          }
        </motion.button>
      ) : (
        // ── Downgrade / manage billing — Stripe Customer Portal ──
        <motion.button
          onClick={handleCta}
          disabled={anyLoading}
          whileTap={anyLoading ? {} : { scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
          className="relative w-full rounded-xl py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors disabled:cursor-wait"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.45)',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: anyLoading && !isLoading ? 0.45 : 1,
          }}
          onPointerEnter={e => {
            if (!anyLoading) {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(255,255,255,0.08)'
              el.style.color = 'rgba(255,255,255,0.7)'
            }
          }}
          onPointerLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.04)'
            el.style.color = 'rgba(255,255,255,0.45)'
          }}
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
          {isHe ? 'ניהול מנוי' : 'Manage Subscription'}
        </motion.button>
      )}
    </motion.div>
  )
}

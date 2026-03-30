import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Star, Infinity } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { FREE_PROPOSAL_LIMIT } from '../../stores/useAuthStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  activeCount: number
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

interface PlanDef {
  id: 'free' | 'pro' | 'premium'
  nameEn: string
  nameHe: string
  price: number | null       // null = free
  periodEn: string
  periodHe: string
  featuresEn: string[]
  featuresHe: string[]
  ctaEn: string
  ctaHe: string
  popular: boolean
  accent: string
}

const PLANS: PlanDef[] = [
  {
    id: 'free',
    nameEn: 'Free', nameHe: 'חינם',
    price: 0, periodEn: 'forever', periodHe: 'לתמיד',
    featuresEn: [
      `Up to ${FREE_PROPOSAL_LIMIT} active proposals`,
      'All core features',
      'DealSpace watermark',
      'Community support',
    ],
    featuresHe: [
      `עד ${FREE_PROPOSAL_LIMIT} הצעות פעילות`,
      'כל הפיצ׳רים הבסיסיים',
      'לוגו DealSpace על המסמכים',
      'תמיכה קהילתית',
    ],
    ctaEn: 'Current plan', ctaHe: 'תוכנית נוכחית',
    popular: false,
    accent: '#6b7280',
  },
  {
    id: 'pro',
    nameEn: 'Pro', nameHe: 'פרו',
    price: 19, periodEn: '/ month', periodHe: '/ חודש',
    featuresEn: [
      'Up to 100 active proposals',
      'Remove DealSpace watermark',
      'Custom brand color',
      'Priority email support',
    ],
    featuresHe: [
      'עד 100 הצעות פעילות',
      'הסרת לוגו DealSpace',
      'צבע מותג מותאם',
      'תמיכה בעדיפות גבוהה',
    ],
    ctaEn: 'Upgrade to Pro', ctaHe: 'שדרג לפרו',
    popular: false,
    accent: '#6366f1',
  },
  {
    id: 'premium',
    nameEn: 'Premium', nameHe: 'פרימיום',
    price: 39, periodEn: '/ month', periodHe: '/ חודש',
    featuresEn: [
      'Unlimited proposals',
      'Everything in Pro',
      'Webhook integrations',
      'Priority phone support',
    ],
    featuresHe: [
      'הצעות ללא הגבלה',
      'הכל כולל תוכנית פרו',
      'אינטגרציות Webhook',
      'תמיכה טלפונית VIP',
    ],
    ctaEn: 'Upgrade to Premium', ctaHe: 'שדרג לפרימיום',
    popular: true,
    accent: '#a855f7',
  },
]

const PLAN_ICONS: Record<PlanDef['id'], React.ReactNode> = {
  free:    <Star size={15} />,
  pro:     <Zap size={15} />,
  premium: <Infinity size={15} />,
}

// ─── UpgradeModal ─────────────────────────────────────────────────────────────

export function UpgradeModal({ open, onClose, activeCount }: UpgradeModalProps) {
  const { locale } = useI18n()
  const isHe = locale === 'he'

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
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-2px); }
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
                    {/* Emoji icon */}
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}
                    >
                      🚀
                    </div>

                    <Dialog.Title asChild>
                      <h2
                        className="text-xl font-black mb-2 tracking-tight"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}
                      >
                        {isHe ? 'העסק שלך צומח!' : 'Your business is growing!'}
                      </h2>
                    </Dialog.Title>

                    <Dialog.Description asChild>
                      <p className="text-sm text-white/45 max-w-md mx-auto leading-relaxed">
                        {isHe
                          ? `הגעת ל-${activeCount} מתוך ${FREE_PROPOSAL_LIMIT} הצעות פעילות בתוכנית החינמית. שדרג כדי להמשיך לסגור עסקאות ללא הגבלה.`
                          : `You've used ${activeCount} of ${FREE_PROPOSAL_LIMIT} active proposals on the free plan. Upgrade to keep closing deals without limits.`}
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
                        onClose={onClose}
                      />
                    ))}
                  </div>

                  {/* Footer note */}
                  <p className="text-center text-[10px] text-white/20 pb-5">
                    {isHe
                      ? 'ביטול בכל עת · ללא דמי ביטול · מחירים כוללים מע"מ'
                      : 'Cancel anytime · No cancellation fees · Prices include VAT'}
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

function PlanCard({ plan, isHe, delay, onClose }: {
  plan: PlanDef; isHe: boolean; delay: number; onClose: () => void
}) {
  const isFree = plan.id === 'free'

  const handleCta = () => {
    if (isFree) { onClose(); return }
    console.log('Initiate Stripe Checkout:', plan.id, plan.price)
    // TODO Sprint 31: replace with real Stripe checkout session
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' as const }}
      className="relative flex flex-col rounded-2xl p-5 overflow-hidden"
      style={{
        background: plan.popular
          ? 'linear-gradient(160deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.07) 100%)'
          : 'rgba(255,255,255,0.035)',
        border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.07)',
        animation: plan.popular ? 'um-glow-pulse 3s ease-in-out infinite' : undefined,
        transform: plan.popular ? 'scale(1.025)' : undefined,
      }}
    >
      {/* "Most Popular" badge */}
      {plan.popular && (
        <div
          className="absolute -top-px start-1/2 -translate-x-1/2 rounded-b-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            color: '#fff',
            animation: 'um-badge-float 2.5s ease-in-out infinite',
          }}
        >
          {isHe ? 'הכי פופולרי' : 'Most Popular'}
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
        <div>
          <p className="text-sm font-black text-white/90">{isHe ? plan.nameHe : plan.nameEn}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-5">
        {plan.price === 0 ? (
          <p className="text-3xl font-black text-white/80">
            {isHe ? 'חינם' : 'Free'}
          </p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white">₪{plan.price}</span>
            <span className="text-xs text-white/35 mb-1 font-medium">
              {isHe ? plan.periodHe : plan.periodEn}
            </span>
          </div>
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
      <motion.button
        onClick={handleCta}
        disabled={isFree}
        whileTap={isFree ? undefined : { scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
        className="relative w-full rounded-xl py-2.5 text-[13px] font-bold overflow-hidden transition-all"
        style={
          isFree
            ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', cursor: 'default', border: '1px solid rgba(255,255,255,0.07)' }
            : plan.popular
              ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }
              : { background: `${plan.accent}20`, color: plan.accent, border: `1px solid ${plan.accent}35` }
        }
        onPointerEnter={e => {
          if (isFree) return
          if (!plan.popular) (e.currentTarget as HTMLElement).style.background = `${plan.accent}35`
        }}
        onPointerLeave={e => {
          if (isFree) return
          if (!plan.popular) (e.currentTarget as HTMLElement).style.background = `${plan.accent}20`
        }}
      >
        {/* Shimmer on popular CTA */}
        {plan.popular && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)',
              animation: 'um-shimmer 3s ease-in-out infinite',
            }}
          />
        )}
        {isHe ? plan.ctaHe : plan.ctaEn}
      </motion.button>
    </motion.div>
  )
}

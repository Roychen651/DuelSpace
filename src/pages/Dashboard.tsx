import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Plus, LogOut, Zap, TrendingUp, Send, Trophy, Globe, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useProposalStore } from '../stores/useProposalStore'
import { useI18n } from '../lib/i18n'
import { ProposalCard, ProposalCardSkeleton } from '../components/dashboard/ProposalCard'
import { proposalTotal } from '../types/proposal'

// ─── Animated number (slot machine count-up) ──────────────────────────────────

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18, mass: 1 })
  const displayed = useTransform(spring, v => `${prefix}${Math.round(v).toLocaleString()}${suffix}`)
  const divRef = useRef<HTMLSpanElement>(null)

  useEffect(() => { motionVal.set(value) }, [value, motionVal])

  return <motion.span ref={divRef}>{displayed}</motion.span>
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  icon, label, value, prefix, suffix, color, delay,
}: {
  icon: React.ReactNode; label: string; value: number
  prefix?: string; suffix?: string; color: string; delay: number
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        animation: `ds-fade-up 0.5s ease-out ${delay}s both`,
      }}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: 'blur(12px)' }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>

      <p className="text-2xl font-bold text-white tabular-nums">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="text-xs text-white/40 mt-1 font-medium">{label}</p>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate, locale }: { onCreate: () => void; locale: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-24 text-center"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* SVG illustration */}
      <motion.div
        style={{ animation: 'ds-float 5s ease-in-out infinite' }}
        className="mb-8"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <circle cx="60" cy="60" r="56" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1"/>
          <rect x="34" y="38" width="52" height="44" rx="6" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"/>
          <rect x="42" y="50" width="36" height="2.5" rx="1.25" fill="rgba(255,255,255,0.25)"/>
          <rect x="42" y="57" width="28" height="2.5" rx="1.25" fill="rgba(255,255,255,0.15)"/>
          <rect x="42" y="64" width="20" height="2.5" rx="1.25" fill="rgba(255,255,255,0.1)"/>
          <circle cx="86" cy="38" r="12" fill="#6366f1" opacity="0.9"/>
          <path d="M82 38l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <h2 className="text-xl font-bold text-white mb-2">
        {locale === 'he' ? 'בואו נסגור את הדיל הראשון שלך' : "Let's close your first deal"}
      </h2>
      <p className="text-sm text-white/40 max-w-xs mb-8 leading-relaxed">
        {locale === 'he'
          ? 'צור הצעת מחיר אינטראקטיבית שתבדיל אותך מהמתחרים ותגרום ללקוחות לאשר מיד.'
          : 'Create an interactive proposal that sets you apart and makes clients approve instantly.'}
      </p>

      <motion.button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          animation: 'ds-pulse-glow 2.5s ease-in-out infinite',
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Plus size={16} />
        {locale === 'he' ? 'צור הצעה ראשונה' : 'Create First Proposal'}
      </motion.button>

      <style>{`
        @keyframes ds-pulse-glow {
          0%, 100% { box-shadow: 0 0 24px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 44px rgba(99,102,241,0.65); }
        }
        @keyframes ds-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes ds-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ds-pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>
    </motion.div>
  )
}

// ─── Aurora background ─────────────────────────────────────────────────────────

function DashboardAurora() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#040608]" />
      <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'ds-float 20s ease-in-out infinite' }} />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'ds-float 25s ease-in-out infinite reverse' }} />
    </div>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ onCreate }: { onCreate: () => void }) {
  const { user, signOut } = useAuthStore()
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()

  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(4,6,8,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
          <Zap size={15} className="text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">{t('brand.name')}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Create button */}
        <motion.button
          onClick={onCreate}
          className="hidden sm:flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={13} />
          {locale === 'he' ? 'הצעה חדשה' : 'New Proposal'}
        </motion.button>

        {/* Lang toggle */}
        <button
          onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/50 transition hover:text-white/80"
        >
          <Globe size={11} />
          {locale === 'he' ? 'EN' : 'עב'}
        </button>

        {/* Avatar / sign out */}
        <div className="relative group">
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white overflow-hidden transition ring-1 ring-white/10 hover:ring-indigo-500/40"
            style={{ background: avatar ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : initials || <User size={14} />}
          </button>
          {/* Sign out tooltip */}
          <div className="absolute end-0 top-full mt-2 hidden group-hover:block z-50">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-[#0d0d14] px-3 py-2 text-xs text-white/60 transition hover:text-red-400"
            >
              <LogOut size={12} />
              {locale === 'he' ? 'התנתק' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { proposals, loading, fetchProposals } = useProposalStore()
  const { locale } = useI18n()
  const navigate = useNavigate()

  useEffect(() => { fetchProposals() }, [fetchProposals])

  // ── KPI calculations ──────────────────────────────────────────────────────
  const sentProposals = proposals.filter(p => p.status !== 'draft')
  const accepted = proposals.filter(p => p.status === 'accepted')
  const winRate = sentProposals.length > 0 ? Math.round((accepted.length / sentProposals.length) * 100) : 0
  const revenuePending = proposals
    .filter(p => p.status === 'sent' || p.status === 'viewed')
    .reduce((sum, p) => sum + proposalTotal(p), 0)

  const handleCreate = () => {
    // Sprint 3: navigate to /proposals/new
    navigate('/proposals/new')
  }

  const handleEdit = (id: string) => {
    navigate(`/proposals/${id}`)
  }

  return (
    <div className="relative min-h-dvh flex flex-col" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes ds-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ds-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes ds-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>

      <DashboardAurora />
      <Navbar onCreate={handleCreate} />

      <main className="relative z-10 flex-1 px-6 py-8 max-w-7xl mx-auto w-full">

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <div className="mb-8" style={{ animation: 'ds-fade-up 0.4s ease-out 0.05s both' }}>
          <h1 className="text-2xl font-bold text-white mb-1">
            {locale === 'he' ? 'לוח הבקרה שלי' : 'My Dashboard'}
          </h1>
          <p className="text-sm text-white/35">
            {locale === 'he' ? 'כל הצעות המחיר שלך במקום אחד.' : 'All your proposals in one place.'}
          </p>
        </div>

        {/* ── KPI Bento Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <KPICard
            icon={<TrendingUp size={16} />}
            label={locale === 'he' ? 'הכנסה בהמתנה' : 'Revenue Pending'}
            value={revenuePending}
            prefix="₪"
            color="#d4af37"
            delay={0.1}
          />
          <KPICard
            icon={<Send size={16} />}
            label={locale === 'he' ? 'הצעות שנשלחו' : 'Proposals Sent'}
            value={sentProposals.length}
            color="#6366f1"
            delay={0.18}
          />
          <KPICard
            icon={<Trophy size={16} />}
            label={locale === 'he' ? 'אחוז הצלחה' : 'Win Rate'}
            value={winRate}
            suffix="%"
            color="#22c55e"
            delay={0.26}
          />
        </div>

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between mb-5"
          style={{ animation: 'ds-fade-up 0.4s ease-out 0.3s both' }}
        >
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">
            {locale === 'he' ? 'ההצעות שלי' : 'My Proposals'}
            {proposals.length > 0 && (
              <span className="ms-2 rounded-full bg-white/8 px-2 py-0.5 text-xs font-normal text-white/40 normal-case tracking-normal">
                {proposals.length}
              </span>
            )}
          </h2>

          {/* Mobile create button */}
          <button
            onClick={handleCreate}
            className="sm:hidden flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60"
          >
            <Plus size={12} />
            {locale === 'he' ? 'חדש' : 'New'}
          </button>
        </div>

        {/* ── Proposals Grid ────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProposalCardSkeleton key={i} />)}
          </div>
        ) : proposals.length === 0 ? (
          <EmptyState onCreate={handleCreate} locale={locale} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {proposals.map((p, i) => (
                <motion.div
                  key={p.id}
                  style={{ animation: `ds-fade-up 0.4s ease-out ${0.35 + i * 0.06}s both` }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                >
                  <ProposalCard proposal={p} onEdit={handleEdit} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Floating create button (mobile) ──────────────────────────── */}
        <motion.button
          onClick={handleCreate}
          className="fixed bottom-6 end-6 z-20 sm:hidden flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 0 30px rgba(99,102,241,0.5)',
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          aria-label={locale === 'he' ? 'הצעה חדשה' : 'New Proposal'}
        >
          <Plus size={22} />
        </motion.button>
      </main>

      {/* Legal footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-3 text-center">
        <p className="text-[10px] text-white/15">
          {locale === 'he'
            ? 'המערכת משמשת ככלי ליצירת הצעות מחיר בלבד ואינה מהווה ייעוץ משפטי או פיננסי.'
            : 'The system is used solely as a proposal generation tool and does not constitute legal or financial advice.'}
        </p>
      </footer>
    </div>
  )
}

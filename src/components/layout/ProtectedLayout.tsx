import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, Zap, Globe, User, Settings, Bookmark, HelpCircle, ChevronLeft, ChevronRight, Webhook, Lock, CreditCard } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useBillingStatus, useTier, FREE_PROPOSAL_LIMIT } from '../../stores/useAuthStore'
import { useProposalStore } from '../../stores/useProposalStore'
import { UpgradeModal } from '../dashboard/UpgradeModal'
import { usePresenceStore } from '../../stores/usePresenceStore'
import { useI18n } from '../../lib/i18n'
import { supabase } from '../../lib/supabase'
import { HelpCenterDrawer } from '../ui/HelpCenterDrawer'
import { NotificationBell } from '../ui/NotificationBell'
import { GuidedTour } from '../onboarding/GuidedTour'

// ─── ProtectedLayout ──────────────────────────────────────────────────────────

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuthStore()
  const { proposals } = useProposalStore()
  const { markActive, markInactive } = usePresenceStore()
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [viewingToast, setViewingToast] = useState<{ title: string; client: string } | null>(null)

  const billingStatus = useBillingStatus()
  const tier = useTier()
  const isDashboard = pathname === '/dashboard'
  const isHe = locale === 'he'
  const isRTL = isHe

  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''
  const firstName = name.split(' ')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const company = user?.user_metadata?.company_name as string | undefined

  // ── Stable refs so channel callback never stales ──────────────────────────
  const proposalsRef    = useRef(proposals)
  const isHeRef         = useRef(isHe)
  const offlineTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const activeSetRef    = useRef<Record<string, boolean>>({})
  const toastTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { proposalsRef.current = proposals }, [proposals])
  useEffect(() => { isHeRef.current = isHe }, [isHe])

  // ── Single global channel: user-activity:{userId} ─────────────────────────
  // DealRoom broadcasts heartbeats here — one subscription covers ALL proposals.
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`user-activity:${user.id}`)
      .on('broadcast', { event: 'heartbeat' }, (msg) => {
        const token = (msg as { payload?: { token?: string } }).payload?.token
        if (!token) return

        const wasInactive = !activeSetRef.current[token]
        activeSetRef.current[token] = true
        markActive(token)

        // Toast only on the transition from inactive → active
        if (wasInactive) {
          const p = proposalsRef.current.find(q => q.public_token === token)
          const title  = p?.project_title  || (isHeRef.current ? 'הצעה' : 'a proposal')
          const client = p?.client_name    || (isHeRef.current ? 'לקוח' : 'Client')
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
          setViewingToast({ title, client })
          toastTimerRef.current = setTimeout(() => setViewingToast(null), 5_000)
        }

        // Reset offline timer — 3 s heartbeat + 7 s grace = 10 s window
        if (offlineTimersRef.current[token]) clearTimeout(offlineTimersRef.current[token])
        offlineTimersRef.current[token] = setTimeout(() => {
          markInactive(token)
          activeSetRef.current[token] = false
          delete offlineTimersRef.current[token]
        }, 10_000)
      })
      .on('broadcast', { event: 'offline' }, (msg) => {
        const token = (msg as { payload?: { token?: string } }).payload?.token
        if (!token) return
        markInactive(token)
        activeSetRef.current[token] = false
        if (offlineTimersRef.current[token]) {
          clearTimeout(offlineTimersRef.current[token])
          delete offlineTimersRef.current[token]
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      Object.values(offlineTimersRef.current).forEach(clearTimeout)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [user?.id, markActive, markInactive])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6
          bg-[var(--nav-bg)] border-b border-[color:var(--nav-border)] shadow-[var(--nav-shadow)]"
        style={{
          height: 58,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        {/* Left side: logo + optional back button */}
        <div className="flex items-center gap-2">

          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 rounded-xl px-1 py-0.5 transition-opacity hover:opacity-80"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl flex-none"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 18px rgba(99,102,241,0.45)' }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[14px] font-black tracking-tight text-main" style={{ letterSpacing: '-0.02em' }}>
                {t('brand.name')}
              </span>
              {company && (
                <span className="text-[10px] text-dim font-medium truncate max-w-[120px]">{company}</span>
              )}
            </div>
          </button>

          {/* Back to Dashboard — shown on all non-dashboard pages */}
          {!isDashboard && (
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors
                border border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600
                dark:border-indigo-500/25 dark:bg-indigo-500/[0.06] dark:text-indigo-300/70 dark:hover:bg-indigo-500/[0.14] dark:hover:text-indigo-300"
              style={{ boxShadow: '0 0 12px rgba(99,102,241,0.08)' }}
              whileTap={{ scale: 0.97 }}
            >
              {isRTL ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
              {isHe ? 'לוח הבקרה' : 'Dashboard'}
            </motion.button>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">

          {/* Lang toggle */}
          <button
            onClick={() => setLocale(isHe ? 'en' : 'he')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors
              border border-[color:var(--border)] bg-card text-muted hover:text-main"
          >
            <Globe size={10} />
            {isHe ? 'EN' : 'עב'}
          </button>

          {/* Help Center */}
          <button
            data-tour="help-btn"
            onClick={() => setHelpOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors
              border border-[color:var(--border)] bg-card text-muted hover:text-main"
            aria-label={isHe ? 'מרכז עזרה' : 'Help Center'}
            title={isHe ? 'מרכז עזרה' : 'Help Center'}
          >
            <HelpCircle size={14} />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notification Bell */}
          <NotificationBell />

          {/* New Proposal button */}
          <motion.button
            data-tour="new-proposal"
            onClick={() => {
              if (billingStatus === 'past_due') return
              if (tier === 'free') {
                const now = new Date()
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                const monthlyCount = proposals.filter(p => new Date(p.created_at) >= monthStart).length
                const bonusQuota = (user?.user_metadata?.bonus_quota as number | undefined) ?? 0
                if (monthlyCount >= (FREE_PROPOSAL_LIMIT + bonusQuota)) {
                  setUpgradeModalOpen(true)
                  return
                }
              }
              navigate('/proposals/new')
            }}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold"
            style={{
              background: billingStatus === 'past_due'
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: billingStatus === 'past_due'
                ? 'none'
                : '0 0 22px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: billingStatus === 'past_due' ? '1px solid rgba(239,68,68,0.3)' : 'none',
              color: billingStatus === 'past_due' ? 'rgba(248,113,113,0.7)' : 'white',
              cursor: billingStatus === 'past_due' ? 'not-allowed' : 'pointer',
              opacity: billingStatus === 'past_due' ? 0.65 : 1,
            }}
            whileHover={billingStatus === 'past_due' ? {} : { scale: 1.03 }}
            whileTap={billingStatus === 'past_due' ? {} : { scale: 0.96 }}
            aria-label={isHe ? 'הצעה חדשה' : 'New Proposal'}
            title={billingStatus === 'past_due' ? (isHe ? 'יצירת הצעות חסומה — עדכן אמצעי תשלום' : 'Proposal creation locked — update billing') : undefined}
          >
            {billingStatus === 'past_due' ? <Lock size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
            <span className="hidden sm:inline">{isHe ? 'הצעה חדשה' : 'New Proposal'}</span>
          </motion.button>

          {/* User identity pill + dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              data-tour="profile-avatar"
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors outline-none
                border border-[color:var(--border)] hover:bg-[var(--bg-card-hover)]"
              style={{
                background: menuOpen ? undefined : undefined,
              }}
            >
              {/* Avatar */}
              <div
                className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-[11px] font-bold text-white overflow-hidden"
                style={{ background: avatar ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : initials || <User size={13} />}
              </div>
              {/* Name — desktop only */}
              {firstName && (
                <span className="hidden md:block text-[12px] font-semibold text-subtle pe-1 max-w-[90px] truncate">
                  {firstName}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute end-0 top-full pt-2 z-50">
                <div
                  className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    width: 200,
                    background: 'var(--dropdown-bg)',
                    border: '1px solid var(--border)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                  }}
                >
                  {/* Identity header */}
                  <div className="px-4 py-3 border-b border-[color:var(--border)]">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[13px] font-semibold text-main truncate">{name || user?.email}</p>
                      {/* Tier badge */}
                      <span
                        className="flex-none rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                        style={
                          tier === 'unlimited'
                            ? { background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }
                            : tier === 'pro'
                            ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }
                            : { background: 'var(--surface-sunken)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }
                        }
                      >
                        {tier === 'unlimited' ? 'PREMIUM' : tier === 'pro' ? 'PRO' : 'FREE'}
                      </span>
                    </div>
                    {company && <p className="text-[11px] text-dim truncate mt-0.5">{company}</p>}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-subtle transition-colors hover:bg-[var(--bg-card-hover)] hover:text-main text-start">
                      <Settings size={13} className="flex-none" />{isHe ? 'פרופיל והגדרות' : 'Profile & Settings'}
                    </button>
                    <button data-tour="services-link" onClick={() => navigate('/services')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-subtle transition-colors hover:bg-[var(--bg-card-hover)] hover:text-main text-start">
                      <Bookmark size={13} className="flex-none" />{isHe ? 'שירותים שמורים' : 'Saved Services'}
                    </button>
                    <button data-tour="integrations-link" onClick={() => navigate('/integrations')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-subtle transition-colors hover:bg-[var(--bg-card-hover)] hover:text-main text-start">
                      <Webhook size={13} className="flex-none" />{isHe ? 'אינטגרציות' : 'Integrations'}
                    </button>
                    {/* Billing & Subscription — all users */}
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/billing') }}
                      className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium transition-colors hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white/90 text-start"
                      style={{ color: tier === 'unlimited' ? '#d4af37' : tier === 'pro' ? '#818cf8' : 'var(--text-tertiary)' }}
                    >
                      <CreditCard size={13} className="flex-none" />
                      {isHe ? 'חיוב ומנוי' : 'Billing & Subscription'}
                    </button>
                  </div>

                  {/* Theme + Sign out */}
                  <div className="border-t border-[color:var(--border)] p-1.5 space-y-0.5">
                    {/* Theme toggle row */}
                    <div className="flex items-center justify-between rounded-xl px-3 py-2">
                      <span className="text-[12px] font-medium text-subtle">
                        {isHe ? 'מצב תצוגה' : 'Appearance'}
                      </span>
                      <ThemeToggle />
                    </div>
                    <button onClick={handleSignOut} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/[0.08] dark:hover:text-red-400 text-start">
                      <LogOut size={13} className="flex-none" />{isHe ? 'התנתק' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── "Viewing Now" toast — fires on any page, any protected route ──────── */}
      <AnimatePresence>
        {viewingToast && (
          <motion.div
            key="viewing-toast"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed top-[66px] end-4 z-[9998] flex items-center gap-3 rounded-2xl px-4 py-3
              bg-card border border-emerald-200 shadow-lg
              dark:border-emerald-500/30 dark:shadow-[0_0_32px_rgba(34,197,94,0.12),0_8px_24px_rgba(0,0,0,0.5)]"
            style={{
              backdropFilter: 'blur(20px)',
              maxWidth: 280,
            }}
          >
            {/* Pulsing dot */}
            <span className="relative flex h-3 w-3 flex-none">
              <span
                className="absolute inline-flex h-full w-full rounded-full"
                style={{ background: '#22c55e', opacity: 0.6, animation: 'pl-ping 1.1s ease-in-out infinite' }}
              />
              <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: '#22c55e' }} />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 leading-none mb-0.5">
                {isHe ? 'לקוח צופה עכשיו' : 'Client viewing now'}
              </p>
              <p className="text-[11px] text-subtle truncate">
                {isHe
                  ? `"${viewingToast.title}" — ${viewingToast.client}`
                  : `"${viewingToast.title}" — ${viewingToast.client}`}
              </p>
            </div>
            <style>{`
              @keyframes pl-ping {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50%       { transform: scale(2.2); opacity: 0; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Center drawer */}
      <HelpCenterDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* First-run guided tour — only fires once, self-dismisses to localStorage */}
      <GuidedTour locale={locale} />

      {/* Upgrade modal — triggered when free user hits quota from navbar */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        activeCount={(() => { const ms = new Date(new Date().getFullYear(), new Date().getMonth(), 1); return proposals.filter(p => new Date(p.created_at) >= ms).length })()}
        currentTier={tier}
      />

      {/* Page content */}
      {children}
    </div>
  )
}

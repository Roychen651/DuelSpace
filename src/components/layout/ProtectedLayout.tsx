import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, Zap, Globe, User, Settings, Bookmark, FileText, HelpCircle, ChevronLeft, ChevronRight, Webhook, Lock } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useBillingStatus } from '../../stores/useAuthStore'
import { useProposalStore } from '../../stores/useProposalStore'
import { usePresenceStore } from '../../stores/usePresenceStore'
import { useI18n } from '../../lib/i18n'
import { supabase } from '../../lib/supabase'
import { HelpCenterDrawer } from '../ui/HelpCenterDrawer'
import { NotificationBell } from '../ui/NotificationBell'

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
  const [viewingToast, setViewingToast] = useState<{ title: string; client: string } | null>(null)

  const billingStatus = useBillingStatus()
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
    <div style={{ minHeight: '100dvh', background: '#040608' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6"
        style={{
          height: 58,
          background: 'linear-gradient(180deg, rgba(3,3,5,0.96) 0%, rgba(4,6,10,0.90) 100%)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 0 rgba(99,102,241,0.08), 0 4px 24px rgba(0,0,0,0.35)',
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
              <span className="text-[14px] font-black tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
                {t('brand.name')}
              </span>
              {company && (
                <span className="text-[10px] text-white/30 font-medium truncate max-w-[120px]">{company}</span>
              )}
            </div>
          </button>

          {/* Back to Dashboard — shown on all non-dashboard pages */}
          {!isDashboard && (
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
              style={{
                border: '1px solid rgba(99,102,241,0.25)',
                background: 'rgba(99,102,241,0.06)',
                color: 'rgba(165,170,255,0.7)',
                boxShadow: '0 0 12px rgba(99,102,241,0.08)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.14)'
                e.currentTarget.style.color = 'rgba(165,170,255,1)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                e.currentTarget.style.color = 'rgba(165,170,255,0.7)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'
              }}
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
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:text-white/70"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <Globe size={10} />
            {isHe ? 'EN' : 'עב'}
          </button>

          {/* Help Center */}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/35 transition-colors hover:text-white/75"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
            aria-label={isHe ? 'מרכז עזרה' : 'Help Center'}
            title={isHe ? 'מרכז עזרה' : 'Help Center'}
          >
            <HelpCircle size={14} />
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* New Proposal button */}
          <motion.button
            data-tour="new-proposal"
            onClick={() => {
              if (billingStatus === 'past_due') return
              navigate('/proposals/new')
            }}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white"
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
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors outline-none"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: menuOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
              }}
              onPointerEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onPointerLeave={e => { (e.currentTarget as HTMLElement).style.background = menuOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)' }}
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
                <span className="hidden md:block text-[12px] font-semibold text-white/70 pe-1 max-w-[90px] truncate">
                  {firstName}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute end-0 top-full pt-2 z-50">
                <div
                  className="flex flex-col rounded-2xl overflow-hidden"
                  style={{
                    width: 200,
                    background: 'linear-gradient(160deg, rgba(12,12,24,0.98) 0%, rgba(8,8,18,0.98) 100%)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(40px)',
                  }}
                >
                  {/* Identity header */}
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[13px] font-semibold text-white/90 truncate">{name || user?.email}</p>
                    {company && <p className="text-[11px] text-white/35 truncate mt-0.5">{company}</p>}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <Settings size={13} className="flex-none" />{isHe ? 'פרופיל והגדרות' : 'Profile & Settings'}
                    </button>
                    <button data-tour="services-link" onClick={() => navigate('/services')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <Bookmark size={13} className="flex-none" />{isHe ? 'שירותים שמורים' : 'Saved Services'}
                    </button>
                    <button onClick={() => navigate('/contracts')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <FileText size={13} className="flex-none" />{isHe ? 'ספריית חוזים' : 'Contracts'}
                    </button>
                    <button data-tour="integrations-link" onClick={() => navigate('/integrations')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <Webhook size={13} className="flex-none" />{isHe ? 'אינטגרציות' : 'Integrations'}
                    </button>
                  </div>

                  {/* Sign out */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="p-1.5">
                    <button onClick={handleSignOut} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/40 transition-colors hover:bg-red-500/8 hover:text-red-400 text-start">
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
            className="fixed top-[66px] end-4 z-[9998] flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(8,18,12,0.96)',
              border: '1px solid rgba(34,197,94,0.3)',
              boxShadow: '0 0 32px rgba(34,197,94,0.12), 0 8px 24px rgba(0,0,0,0.5)',
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
              <p className="text-[12px] font-bold text-emerald-400 leading-none mb-0.5">
                {isHe ? 'לקוח צופה עכשיו' : 'Client viewing now'}
              </p>
              <p className="text-[11px] text-white/45 truncate">
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

      {/* Page content */}
      {children}
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Plus, LogOut, Zap, Globe, User, Settings, Bookmark, FileText, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../lib/i18n'
import { HelpCenterDrawer } from '../ui/HelpCenterDrawer'
import { NotificationBell } from '../ui/NotificationBell'

// ─── ProtectedLayout ──────────────────────────────────────────────────────────

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuthStore()
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const isDashboard = pathname === '/dashboard'
  const isHe = locale === 'he'
  const isRTL = isHe

  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''
  const firstName = name.split(' ')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const company = user?.user_metadata?.company_name as string | undefined

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
              {company && !isDashboard && (
                <span className="text-[10px] text-white/30 font-medium truncate max-w-[120px]">{company}</span>
              )}
              {isDashboard && company && (
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
            onClick={() => navigate('/proposals/new')}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 22px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            aria-label={isHe ? 'הצעה חדשה' : 'New Proposal'}
          >
            <Plus size={13} strokeWidth={2.5} />
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
                    <button onClick={() => navigate('/services')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <Bookmark size={13} className="flex-none" />{isHe ? 'שירותים שמורים' : 'Saved Services'}
                    </button>
                    <button onClick={() => navigate('/contracts')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <FileText size={13} className="flex-none" />{isHe ? 'ספריית חוזים' : 'Contracts'}
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

      {/* Help Center drawer */}
      <HelpCenterDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Page content */}
      {children}
    </div>
  )
}

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Plus, LogOut, Zap, TrendingUp, Send, Trophy, Globe, User, Settings, LayoutGrid, Columns, Bookmark, FileText, Search, Filter, List, ArrowUp, ArrowDown, FileDown, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useProposalStore } from '../stores/useProposalStore'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { ProposalCard, ProposalCardSkeleton } from '../components/dashboard/ProposalCard'
import { KanbanBoard } from '../components/dashboard/KanbanBoard'
import { proposalTotal, formatCurrency, STATUS_META } from '../types/proposal'
import type { ProposalStatus } from '../types/proposal'
import { generateProposalPdf } from '../lib/pdfEngine'
import { GuidedTour, DEFAULT_TOUR_STEPS, TOUR_STORAGE_KEY } from '../components/onboarding/GuidedTour'
import { HelpCenterDrawer } from '../components/ui/HelpCenterDrawer'
import { GlobalFooter } from '../components/ui/GlobalFooter'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

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
    <>
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
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5">
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
        </div>

        {/* ── Right controls ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Lang toggle */}
          <button
            onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:text-white/70"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <Globe size={10} />
            {locale === 'he' ? 'EN' : 'עב'}
          </button>

          {/* Help Center */}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/35 transition-colors hover:text-white/75"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
            aria-label={locale === 'he' ? 'מרכז עזרה' : 'Help Center'}
            title={locale === 'he' ? 'מרכז עזרה' : 'Help Center'}
          >
            <HelpCircle size={14} />
          </button>

          {/* Create button */}
          <motion.button
            data-tour="new-proposal"
            onClick={onCreate}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 22px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            aria-label={locale === 'he' ? 'הצעה חדשה' : 'New Proposal'}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">{locale === 'he' ? 'הצעה חדשה' : 'New Proposal'}</span>
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
                  {/* User identity header */}
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[13px] font-semibold text-white/90 truncate">{name || user?.email}</p>
                    {company && <p className="text-[11px] text-white/35 truncate mt-0.5">{company}</p>}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <Settings size={13} className="flex-none" />{locale === 'he' ? 'פרופיל והגדרות' : 'Profile & Settings'}
                    </button>
                    <button onClick={() => navigate('/services')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <Bookmark size={13} className="flex-none" />{locale === 'he' ? 'שירותים שמורים' : 'Saved Services'}
                    </button>
                    <button onClick={() => navigate('/contracts')} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90 text-start">
                      <FileText size={13} className="flex-none" />{locale === 'he' ? 'ספריית חוזים' : 'Contracts'}
                    </button>
                  </div>

                  {/* Sign out */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="p-1.5">
                    <button onClick={handleSignOut} className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-[12px] font-medium text-white/40 transition-colors hover:bg-red-500/08 hover:text-red-400 text-start">
                      <LogOut size={13} className="flex-none" />{locale === 'he' ? 'התנתק' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Help Center drawer — controlled from navbar button */}
      <HelpCenterDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'kanban' | 'list'
type SortField = 'date' | 'value'
type SortDir = 'asc' | 'desc'

export default function Dashboard() {
  const { proposals, loading, fetchProposals, injectDemoProposal } = useProposalStore()
  const { user } = useAuthStore()
  const { locale } = useI18n()
  const navigate = useNavigate()
  const [showTour, setShowTour] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('dealspace:view-mode') as ViewMode | null) ?? 'grid'
  )
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null)

  useEffect(() => { fetchProposals() }, [fetchProposals])

  // Re-fetch when creator returns to the tab (e.g., after client signs in Deal Room)
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchProposals() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchProposals])

  // Realtime subscription — re-fetch immediately when any proposal row changes (e.g., client accepts)
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`proposals:${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'proposals',
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchProposals() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, fetchProposals])

  // Inject demo proposal for brand-new users (empty dashboard, first visit)
  useEffect(() => {
    if (!loading && proposals.length === 0) {
      injectDemoProposal()
    }
  }, [loading, proposals.length, injectDemoProposal])

  // Show tour once for new users after a short delay
  useEffect(() => {
    if (!loading && !localStorage.getItem(TOUR_STORAGE_KEY)) {
      const t = setTimeout(() => setShowTour(true), 1200)
      return () => clearTimeout(t)
    }
  }, [loading])

  // ── KPI calculations ──────────────────────────────────────────────────────
  const sentProposals = proposals.filter(p => p.status !== 'draft')
  const accepted = proposals.filter(p => p.status === 'accepted')
  const winRate = sentProposals.length > 0 ? Math.round((accepted.length / sentProposals.length) * 100) : 0
  const pendingProposals = proposals.filter(p => p.status === 'sent' || p.status === 'viewed')
  const revenuePending = pendingProposals.reduce((sum, p) => sum + proposalTotal(p), 0)
  const kpiCurrencyPrefix = (() => {
    const cur = pendingProposals[0]?.currency ?? proposals[0]?.currency ?? 'ILS'
    return cur === 'ILS' ? '₪' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur
  })()

  // ── Filtered + sorted proposals ──────────────────────────────────────────
  const filteredProposals = useMemo(() => {
    let list = [...proposals]
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.project_title.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let cmp = 0
      if (sortField === 'date') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        cmp = proposalTotal(a) - proposalTotal(b)
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [proposals, filterStatus, search, sortField, sortDir])

  const handleCreate = () => {
    navigate('/proposals/new')
  }

  const handleEdit = (id: string) => {
    navigate(`/proposals/${id}`)
  }

  const handleDownloadPdf = async (proposalId: string) => {
    if (pdfGenerating) return
    const p = proposals.find(x => x.id === proposalId)
    if (!p) return
    setPdfGenerating(proposalId)
    const total = proposalTotal(p)
    await generateProposalPdf({
      proposal: p,
      totalAmount: total,
      enabledAddOnIds: p.add_ons.filter(a => a.enabled).map(a => a.id),
      signatureDataUrl: '',
      locale,
    })
    setPdfGenerating(null)
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

      <main className="relative z-10 px-6 py-8 pb-8 max-w-7xl mx-auto w-full">

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
            prefix={kpiCurrencyPrefix}
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

        {/* ── Filter / Sort Toolbar ──────────────────────────────────────── */}
        <div
          className="mb-4 space-y-3"
          style={{ animation: 'ds-fade-up 0.4s ease-out 0.28s both' }}
        >
          {/* Search + view toggle row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div
              className="flex items-center gap-2 flex-1 min-w-[160px] rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search size={12} className="flex-none text-white/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'he' ? 'חפש לפי שם לקוח או פרויקט…' : 'Search by client or project…'}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
              />
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'draft', 'sent', 'viewed', 'accepted', 'rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all"
                  style={{
                    background: filterStatus === s ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                    color: filterStatus === s
                      ? '#c4b5fd'
                      : s === 'all'
                        ? 'rgba(255,255,255,0.35)'
                        : STATUS_META[s as ProposalStatus].color + 'aa',
                    border: filterStatus === s ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {s === 'all'
                    ? (locale === 'he' ? 'הכל' : 'All')
                    : (locale === 'he' ? STATUS_META[s as ProposalStatus].label_he : STATUS_META[s as ProposalStatus].label_en)}
                </button>
              ))}
            </div>

            {/* View toggles */}
            <div
              className="flex items-center rounded-xl p-0.5 flex-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {([
                { mode: 'grid' as ViewMode, icon: <LayoutGrid size={13} />, label: locale === 'he' ? 'רשת' : 'Grid' },
                { mode: 'list' as ViewMode, icon: <List size={13} />, label: locale === 'he' ? 'רשימה' : 'List' },
                { mode: 'kanban' as ViewMode, icon: <Columns size={13} />, label: locale === 'he' ? 'לוח קנבן' : 'Kanban' },
              ]).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); localStorage.setItem('dealspace:view-mode', mode) }}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: viewMode === mode ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: viewMode === mode ? '#818cf8' : 'rgba(255,255,255,0.35)',
                    border: viewMode === mode ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  }}
                  title={label}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort row */}
          <div className="flex items-center gap-2">
            <Filter size={11} className="text-white/25 flex-none" />
            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">
              {locale === 'he' ? 'מיון:' : 'Sort:'}
            </span>
            {([
              { field: 'date' as SortField, label_en: 'Date', label_he: 'תאריך' },
              { field: 'value' as SortField, label_en: 'Value', label_he: 'ערך' },
            ]).map(({ field, label_en, label_he }) => (
              <button
                key={field}
                onClick={() => {
                  if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
                  else { setSortField(field); setSortDir('desc') }
                }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all"
                style={{
                  background: sortField === field ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                  color: sortField === field ? '#818cf8' : 'rgba(255,255,255,0.3)',
                  border: sortField === field ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {locale === 'he' ? label_he : label_en}
                {sortField === field && (
                  sortDir === 'desc' ? <ArrowDown size={9} /> : <ArrowUp size={9} />
                )}
              </button>
            ))}

            <span className="ms-auto text-[10px] text-white/25">
              {filteredProposals.length !== proposals.length
                ? `${filteredProposals.length} / ${proposals.length}`
                : `${proposals.length} ${locale === 'he' ? 'הצעות' : 'proposals'}`}
            </span>
          </div>
        </div>

        {/* ── Proposals view ────────────────────────────────────────────── */}
        {loading ? (
          <div data-tour="proposals-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProposalCardSkeleton key={i} />)}
          </div>
        ) : proposals.length === 0 ? (
          <EmptyState onCreate={handleCreate} locale={locale} />
        ) : filteredProposals.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Search size={20} className="text-white/20" />
            </div>
            <p className="text-sm font-semibold text-white/40">
              {locale === 'he' ? 'לא נמצאו תוצאות' : 'No results found'}
            </p>
            <p className="text-xs text-white/20 mt-1">
              {locale === 'he' ? 'נסה לשנות את הסינון או החיפוש' : 'Try adjusting your filters or search'}
            </p>
          </motion.div>
        ) : viewMode === 'kanban' ? (
          <div data-tour="proposals-list">
            <KanbanBoard
              proposals={filteredProposals}
              locale={locale}
              onEdit={handleEdit}
            />
          </div>
        ) : viewMode === 'list' ? (
          <div data-tour="proposals-list">
            {/* ── Column header ─── */}
            <div
              className="hidden md:grid items-center px-4 py-2 mb-1 rounded-xl"
              style={{
                gridTemplateColumns: '8px 1fr 96px 112px 90px 56px',
                gap: '0 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div />
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">
                {locale === 'he' ? 'פרויקט / לקוח' : 'Project / Client'}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 text-center">
                {locale === 'he' ? 'סטטוס' : 'Status'}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 text-end">
                {locale === 'he' ? 'סכום' : 'Amount'}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 text-end">
                {locale === 'he' ? 'תאריך' : 'Date'}
              </p>
              <div />
            </div>

            {/* ── Rows ──────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <AnimatePresence>
                {filteredProposals.map((p, i) => {
                  const total = proposalTotal(p)
                  const meta = STATUS_META[p.status]
                  const isAccepted = p.status === 'accepted'
                  const date = new Date(p.created_at).toLocaleDateString(
                    locale === 'he' ? 'he-IL' : 'en-US',
                    { day: 'numeric', month: 'short' }
                  )
                  const isLast = i === filteredProposals.length - 1

                  return (
                    <motion.div
                      key={p.id}
                      exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
                      className="group relative cursor-pointer"
                      onClick={() => handleEdit(p.id)}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.032)' }}
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        animation: `ds-fade-up 0.25s ease-out ${0.04 + i * 0.03}s both`,
                      }}
                    >
                      {/* Hover accent — left edge */}
                      <div
                        className="absolute inset-y-0 start-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        style={{ background: meta.color }}
                      />

                      {/* Desktop grid row */}
                      <div
                        className="hidden md:grid items-center px-4 py-3.5"
                        style={{ gridTemplateColumns: '8px 1fr 96px 112px 90px 56px', gap: '0 16px' }}
                      >
                        {/* Status dot */}
                        <div
                          className="h-2 w-2 rounded-full flex-none"
                          style={{ background: meta.color, boxShadow: `0 0 6px ${meta.glow}` }}
                        />

                        {/* Title + client */}
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white/90 truncate leading-snug">
                            {p.project_title || (locale === 'he' ? 'הצעה חדשה' : 'New Proposal')}
                          </p>
                          <p className="text-[11px] text-white/35 truncate mt-0.5">
                            {p.client_name || (locale === 'he' ? '—' : '—')}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div className="flex justify-center">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                          >
                            <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
                            {locale === 'he' ? meta.label_he : meta.label_en}
                          </span>
                        </div>

                        {/* Amount */}
                        <p
                          className="text-[13px] font-bold tabular-nums text-end"
                          style={{ color: meta.color, textShadow: `0 0 16px ${meta.glow}` }}
                        >
                          {formatCurrency(total, p.currency)}
                        </p>

                        {/* Date */}
                        <p className="text-[11px] text-white/30 text-end">{date}</p>

                        {/* Actions — visible on hover */}
                        <div
                          className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/8 hover:text-white/75"
                            onClick={() => handleEdit(p.id)}
                            title={locale === 'he' ? 'ערוך' : 'Edit'}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {isAccepted && (
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-emerald-500/10"
                              style={{ color: '#4ade80' }}
                              onClick={() => handleDownloadPdf(p.id)}
                              disabled={pdfGenerating === p.id}
                              title={locale === 'he' ? 'הורד PDF' : 'Download PDF'}
                            >
                              {pdfGenerating === p.id
                                ? <div className="h-3 w-3 rounded-full border border-emerald-400/40 border-t-emerald-400 animate-spin" />
                                : <FileDown size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mobile row — simplified */}
                      <div className="flex md:hidden items-center gap-3 px-4 py-3.5">
                        <div
                          className="h-2 w-2 rounded-full flex-none"
                          style={{ background: meta.color, boxShadow: `0 0 6px ${meta.glow}` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/90 truncate">
                            {p.project_title || (locale === 'he' ? 'הצעה חדשה' : 'New Proposal')}
                          </p>
                          <p className="text-[11px] text-white/35 truncate mt-0.5">
                            {p.client_name || '—'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-none">
                          <p className="text-[13px] font-bold tabular-nums" style={{ color: meta.color }}>
                            {formatCurrency(total, p.currency)}
                          </p>
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                            style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                          >
                            {locale === 'he' ? meta.label_he : meta.label_en}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div data-tour="proposals-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredProposals.map((p, i) => (
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

      </main>

      <GlobalFooter />

      {/* Guided tour — shown once to new users */}
      {showTour && (
        <GuidedTour
          steps={DEFAULT_TOUR_STEPS}
          locale={locale as 'he' | 'en'}
          onComplete={() => {
            localStorage.setItem(TOUR_STORAGE_KEY, '1')
            setShowTour(false)
          }}
          onSkip={() => {
            localStorage.setItem(TOUR_STORAGE_KEY, '1')
            setShowTour(false)
          }}
        />
      )}
    </div>
  )
}

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Plus, TrendingUp, Send, Trophy, LayoutGrid, Columns, Search, Filter, List, ArrowUp, ArrowDown, FileDown, Archive } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
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
  icon, label, tooltip, value, prefix, suffix, color, delay,
}: {
  icon: React.ReactNode; label: string; tooltip: string; value: number
  prefix?: string; suffix?: string; color: string; delay: number
}) {
  const [tipOpen, setTipOpen] = useState(false)
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: `linear-gradient(145deg, ${color}09 0%, rgba(3,3,5,0.55) 100%)`,
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(24px)',
        animation: `ds-fade-up 0.5s ease-out ${delay}s both`,
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = `${color}45`
        el.style.boxShadow = `0 0 40px ${color}18, 0 8px 32px rgba(0,0,0,0.3)`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = `${color}22`
        el.style.boxShadow = 'none'
      }}
    >
      {/* Radial glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse 90% 55% at 50% -5%, ${color}14 0%, transparent 75%)` }}
      />
      {/* Corner orb */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}35 0%, transparent 70%)`, filter: 'blur(18px)' }}
      />

      <div className="relative">
        {/* Icon + pulse dot row */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}`, opacity: 0.55, animation: 'ds-pulse 2.5s ease-in-out infinite' }}
          />
        </div>

        {/* Big animated number */}
        <p className="text-[2rem] font-black text-white tabular-nums tracking-tight leading-none mb-1.5">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </p>

        {/* Label with tooltip */}
        <Tooltip.Provider delayDuration={150} skipDelayDuration={0}>
          <Tooltip.Root open={tipOpen} onOpenChange={setTipOpen}>
            <Tooltip.Trigger asChild>
              <p
                className="flex items-center gap-1 text-xs text-white/40 font-medium w-fit select-none cursor-pointer"
                onClick={() => setTipOpen(o => !o)}
              >
                {label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4m0-4h.01"/>
                </svg>
              </p>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                sideOffset={8}
                className="z-[200] max-w-[210px] rounded-xl px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white/70"
                style={{
                  background: 'rgba(3,3,5,0.97)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                {tooltip}
                <Tooltip.Arrow style={{ fill: 'rgba(3,3,5,0.97)' }} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate, locale }: { onCreate: () => void; locale: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Illustration — floating container with orbit rings */}
      <div
        className="relative mb-10"
        style={{ width: 200, height: 200, animation: 'ds-float 6s ease-in-out infinite' }}
      >
        {/* Outer orbit ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px dashed rgba(99,102,241,0.16)',
            animation: 'ds-spin-slow 22s linear infinite',
          }}
        />
        {/* Orbiting dot on outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 7, height: 7,
            top: -3, left: '50%', marginLeft: -3.5,
            background: '#6366f1',
            boxShadow: '0 0 10px #6366f1',
            animation: 'ds-spin-slow 22s linear infinite',
            transformOrigin: '3.5px 103px',
          }}
        />
        {/* Inner orbit ring */}
        <div
          className="absolute rounded-full"
          style={{
            top: '14%', left: '14%', right: '14%', bottom: '14%',
            border: '1px dashed rgba(168,85,247,0.13)',
            animation: 'ds-spin-slow 15s linear infinite reverse',
          }}
        />
        {/* Orbiting dot on inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 5, height: 5,
            top: '14%', left: '50%', marginLeft: -2.5, marginTop: -2.5,
            background: '#a855f7',
            boxShadow: '0 0 8px #a855f7',
            animation: 'ds-spin-slow 15s linear infinite reverse',
            transformOrigin: '2.5px 84px',
          }}
        />

        {/* Centred SVG illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="148" height="148" viewBox="0 0 148 148" fill="none" aria-hidden="true">
            {/* Background glow circle */}
            <circle cx="74" cy="74" r="66" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.14)" strokeWidth="1"/>

            {/* Main document card */}
            <rect x="36" y="30" width="76" height="88" rx="10" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"/>
            {/* Document lines */}
            <rect x="50" y="48" width="48" height="3" rx="1.5" fill="rgba(255,255,255,0.22)"/>
            <rect x="50" y="57" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.14)"/>
            <rect x="50" y="66" width="42" height="3" rx="1.5" fill="rgba(255,255,255,0.1)"/>
            <rect x="50" y="75" width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.07)"/>

            {/* Price block — gold accent */}
            <rect x="50" y="89" width="48" height="16" rx="5" fill="rgba(212,175,55,0.14)" stroke="rgba(212,175,55,0.28)" strokeWidth="1"/>
            <text x="74" y="100.5" textAnchor="middle" fill="rgba(212,175,55,0.8)" fontSize="7.5" fontWeight="700" fontFamily="monospace">₪ 8,500</text>

            {/* Accept badge */}
            <circle cx="104" cy="44" r="17" fill="#22c55e" fillOpacity="0.93"/>
            <path d="M97.5 44l5 5 8.5-9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Sparkle dots */}
            <circle cx="32" cy="28" r="3.5" fill="#6366f1" opacity="0.45" style={{ animation: 'ds-pulse 2s ease-in-out 0.3s infinite' }}/>
            <circle cx="122" cy="112" r="2.5" fill="#a855f7" opacity="0.45" style={{ animation: 'ds-pulse 2.6s ease-in-out 0.8s infinite' }}/>
            <circle cx="36" cy="108" r="2" fill="#d4af37" opacity="0.4" style={{ animation: 'ds-pulse 3s ease-in-out 0.5s infinite' }}/>
            <circle cx="118" cy="32" r="2" fill="#22c55e" opacity="0.4" style={{ animation: 'ds-pulse 2.3s ease-in-out 1.1s infinite' }}/>
          </svg>
        </div>
      </div>

      {/* Heading + subtext */}
      <div style={{ animation: 'ds-fade-up 0.5s ease-out 0.15s both' }}>
        <h2
          className="text-2xl font-black mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {locale === 'he' ? 'הכל מוכן — סגור את הדיל הראשון' : 'Ready to close your first deal?'}
        </h2>
        <p className="text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
          {locale === 'he'
            ? 'צור הצעת מחיר אינטראקטיבית שתבדיל אותך מהמתחרים. לקוחות מאשרים בקליק אחד — בלי PDF ישן.'
            : 'Create an interactive proposal that stands out. Clients approve in one click — no static PDFs.'}
        </p>
      </div>

      {/* CTA */}
      <div style={{ animation: 'ds-fade-up 0.5s ease-out 0.3s both' }} className="mt-8">
        <motion.button
          onClick={onCreate}
          className="relative flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 0 32px rgba(99,102,241,0.45)',
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
        >
          {/* Shimmer sweep */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)',
              animation: 'ds-shimmer 2.8s ease-in-out infinite',
            }}
          />
          <Plus size={16} />
          {locale === 'he' ? 'צור הצעה ראשונה' : 'Create First Proposal'}
        </motion.button>
      </div>

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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'kanban' | 'list'
type SortField = 'date' | 'value'
type SortDir = 'asc' | 'desc'

export default function Dashboard() {
  const { proposals, loading, fetchProposals, injectDemoProposal } = useProposalStore()
  const { user } = useAuthStore()
  const { locale } = useI18n()
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? '').split(' ')[0] || ''
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
  const [viewArchive, setViewArchive] = useState(false)

  useEffect(() => { fetchProposals() }, [fetchProposals])

  // Re-fetch when creator returns to the tab (e.g., after client signs in Deal Room)
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchProposals() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchProposals])

  // Realtime subscription — re-fetch when any proposal row changes (e.g., client accepts)
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

  // BroadcastChannel — instant same-browser update when a Deal Room tab completes signing.
  // Faster than waiting for Supabase Realtime Postgres Changes to propagate (which can take
  // several seconds, or miss events if the WS connection is warming up).
  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('dealspace:proposals')
      bc.onmessage = () => { fetchProposals() }
    } catch (_) {}
    return () => { try { bc?.close() } catch (_) {} }
  }, [fetchProposals])

  // Inject demo proposal for brand-new users (empty dashboard, first visit)
  useEffect(() => {
    if (!loading && proposals.length === 0) {
      injectDemoProposal()
    }
  }, [loading, proposals.length, injectDemoProposal]) // proposals.length counts all including archived — correct for demo gate

  // Show tour once for new users after a short delay
  useEffect(() => {
    if (!loading && !localStorage.getItem(TOUR_STORAGE_KEY)) {
      const t = setTimeout(() => setShowTour(true), 1200)
      return () => clearTimeout(t)
    }
  }, [loading])

  // ── Active vs archived split ──────────────────────────────────────────────
  const activeProposals  = proposals.filter(p => !p.is_archived)
  const archivedProposals = proposals.filter(p => p.is_archived)

  // ── CRM KPI calculations ──────────────────────────────────────────────────
  // Pipeline Value — active opportunities only (archived = no longer pursuing)
  const pipelineProposals = activeProposals.filter(p => p.status === 'sent' || p.status === 'viewed' || p.status === 'needs_revision')
  // Closed Won — ALL accepted proposals including archived (money already earned, archiving doesn't erase revenue)
  const acceptedProposals = proposals.filter(p => p.status === 'accepted')
  // Win Rate — ALL resolved proposals including archived (true historical conversion rate)
  const rejectedProposals = proposals.filter(p => p.status === 'rejected')

  const pipelineValue = pipelineProposals.reduce((sum, p) => sum + proposalTotal(p), 0)
  const closedWon = acceptedProposals.reduce((sum, p) => sum + proposalTotal(p), 0)
  // Win Rate: accepted / (accepted + rejected) — excludes pending from denominator
  const resolvedCount = acceptedProposals.length + rejectedProposals.length
  const winRate = resolvedCount > 0 ? Math.round((acceptedProposals.length / resolvedCount) * 100) : 0

  const kpiCurrencyPrefix = (() => {
    const cur = pipelineProposals[0]?.currency ?? acceptedProposals[0]?.currency ?? proposals[0]?.currency ?? 'ILS'
    return cur === 'ILS' ? '₪' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur
  })()

  // ── Filtered + sorted proposals ──────────────────────────────────────────
  const filteredProposals = useMemo(() => {
    // Base list depends on active/archive toggle
    let list = viewArchive ? [...archivedProposals] : [...activeProposals]
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.project_title.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q)
      )
    }
    // Pin needs_revision to the top regardless of sort order (active view only)
    list.sort((a, b) => {
      if (!viewArchive) {
        const aNR = a.status === 'needs_revision' ? 0 : 1
        const bNR = b.status === 'needs_revision' ? 0 : 1
        if (aNR !== bNR) return aNR - bNR
      }
      let cmp = 0
      if (sortField === 'date') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        cmp = proposalTotal(a) - proposalTotal(b)
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [proposals, filterStatus, search, sortField, sortDir, viewArchive]) // eslint-disable-line react-hooks/exhaustive-deps

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
        @keyframes ds-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ds-shimmer {
          0%        { transform: translateX(-120%); }
          60%, 100% { transform: translateX(120%); }
        }
      `}</style>

      <DashboardAurora />

      <main className="relative z-10 px-6 py-8 pb-8 max-w-7xl mx-auto w-full">

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <div className="mb-8" style={{ animation: 'ds-fade-up 0.4s ease-out 0.05s both' }}>
          <h1 className="text-2xl font-bold text-white mb-1">
            {locale === 'he'
              ? `שלום${firstName ? `, ${firstName}` : ''}`
              : `Hello${firstName ? `, ${firstName}` : ''}`}
          </h1>
          <p className="text-sm text-white/35">
            {locale === 'he' ? 'כל הצעות המחיר שלך במקום אחד.' : 'All your proposals in one place.'}
          </p>
        </div>

        {/* ── KPI Bento Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <KPICard
            icon={<TrendingUp size={16} />}
            label={locale === 'he' ? 'פייפליין פעיל' : 'Pipeline Value'}
            tooltip={locale === 'he' ? 'סך הכנסות פוטנציאליות מהצעות שנשלחו, נצפו, או בתיקון' : 'Total potential revenue from sent, viewed, and revision-pending proposals'}
            value={pipelineValue}
            prefix={kpiCurrencyPrefix}
            color="#d4af37"
            delay={0.1}
          />
          <KPICard
            icon={<Send size={16} />}
            label={locale === 'he' ? 'עסקאות שנסגרו' : 'Closed Won'}
            tooltip={locale === 'he' ? 'סך ההכנסות שנגבו מהצעות שאושרו וחתמו — הכנסה בפועל' : 'Total revenue from accepted and signed proposals — actual earned income'}
            value={closedWon}
            prefix={kpiCurrencyPrefix}
            color="#6366f1"
            delay={0.18}
          />
          <KPICard
            icon={<Trophy size={16} />}
            label={locale === 'he' ? 'אחוז הצלחה' : 'Win Rate'}
            tooltip={locale === 'he' ? 'הצעות שאושרו מתוך כלל ההצעות שנסגרו (אושרו + נדחו)' : 'Accepted proposals out of all resolved deals (accepted + rejected)'}
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
          {/* Active / Archive toggle */}
          <div
            className="flex items-center rounded-xl p-0.5 w-fit"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <button
              onClick={() => setViewArchive(false)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                background: !viewArchive ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: !viewArchive ? '#818cf8' : 'rgba(255,255,255,0.35)',
                border: !viewArchive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}
            >
              {locale === 'he' ? 'פעיל' : 'Active'}
              {activeProposals.length > 0 && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-[9px] font-black px-1.5 h-4 min-w-[16px]"
                  style={{ background: !viewArchive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)', color: !viewArchive ? '#c4b5fd' : 'rgba(255,255,255,0.4)' }}
                >
                  {activeProposals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setViewArchive(true)
                // Kanban is not suitable for archive view — fall back to grid
                if (viewMode === 'kanban') { setViewMode('grid'); localStorage.setItem('dealspace:view-mode', 'grid') }
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                background: viewArchive ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: viewArchive ? '#fbbf24' : 'rgba(255,255,255,0.35)',
                border: viewArchive ? '1px solid rgba(245,158,11,0.28)' : '1px solid transparent',
              }}
            >
              <Archive size={11} />
              {locale === 'he' ? 'ארכיון' : 'Archive'}
              {archivedProposals.length > 0 && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-[9px] font-black px-1.5 h-4 min-w-[16px]"
                  style={{ background: viewArchive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)', color: viewArchive ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}
                >
                  {archivedProposals.length}
                </span>
              )}
            </button>
          </div>

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
              {(['all', 'needs_revision', 'draft', 'sent', 'viewed', 'accepted', 'rejected'] as const).map(s => (
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
                // Kanban is only available in active view — not appropriate for archive
                ...(!viewArchive ? [{ mode: 'kanban' as ViewMode, icon: <Columns size={13} />, label: locale === 'he' ? 'לוח קנבן' : 'Kanban' }] : []),
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
              {(() => {
                const base = viewArchive ? archivedProposals.length : activeProposals.length
                const total = proposals.length
                if (filteredProposals.length !== base)
                  return `${filteredProposals.length} / ${base}`
                return `${base}${base !== total ? ` / ${total}` : ''} ${locale === 'he' ? 'הצעות' : 'proposals'}`
              })()}
            </span>
          </div>
        </div>

        {/* ── Proposals view ────────────────────────────────────────────── */}
        {loading ? (
          <div data-tour="proposals-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ProposalCardSkeleton key={i} />)}
          </div>
        ) : !viewArchive && activeProposals.length === 0 ? (
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

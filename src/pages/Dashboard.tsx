import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Plus, TrendingUp, Send, Trophy, LayoutGrid, Columns, Search, List, FileDown, FileText, ChevronDown, Check, SlidersHorizontal, X, AlertTriangle, ExternalLink } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useTier, useBillingStatus, FREE_PROPOSAL_LIMIT } from '../stores/useAuthStore'
import { useProposalStore } from '../stores/useProposalStore'
import { supabase } from '../lib/supabase'
import { useI18n } from '../lib/i18n'
import { ProposalCard, ProposalCardSkeleton } from '../components/dashboard/ProposalCard'
import { KanbanBoard } from '../components/dashboard/KanbanBoard'
import { proposalTotal, formatCurrency, STATUS_META } from '../types/proposal'
import { calculateFinancials, ISRAELI_VAT_RATE } from '../lib/financialMath'
import { generateProposalPdf } from '../lib/pdfEngine'
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard'
import { startDashboardTour } from '../lib/tourEngine'
import { GlobalFooter } from '../components/ui/GlobalFooter'
import { UpgradeModal } from '../components/dashboard/UpgradeModal'
import { exportProposalsCsv } from '../lib/csvExport'
import { STRIPE_CUSTOMER_PORTAL } from '../lib/stripe'

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
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse 90% 55% at 50% -5%, ${color}14 0%, transparent 75%)` }} />
      <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}35 0%, transparent 70%)`, filter: 'blur(18px)' }} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <div className="h-2 w-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}`, opacity: 0.55, animation: 'ds-pulse 2.5s ease-in-out infinite' }} />
        </div>

        <p className="text-[2rem] font-black text-white tabular-nums tracking-tight leading-none mb-1.5">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </p>

        <Tooltip.Provider delayDuration={150} skipDelayDuration={0}>
          <Tooltip.Root open={tipOpen} onOpenChange={setTipOpen}>
            <Tooltip.Trigger asChild>
              <p
                className="flex items-center gap-1 text-xs text-white/40 font-medium w-fit select-none cursor-pointer"
                onClick={() => setTipOpen(o => !o)}
              >
                {label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
                </svg>
              </p>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={8} className="z-[200] max-w-[210px] rounded-xl px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white/70"
                style={{ background: 'rgba(3,3,5,0.97)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
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
      <div className="relative mb-10" style={{ width: 200, height: 200, animation: 'ds-float 6s ease-in-out infinite' }}>
        <div className="absolute inset-0 rounded-full" style={{ border: '1px dashed rgba(99,102,241,0.16)', animation: 'ds-spin-slow 22s linear infinite' }} />
        <div className="absolute rounded-full" style={{ width: 7, height: 7, top: -3, left: '50%', marginLeft: -3.5, background: '#6366f1', boxShadow: '0 0 10px #6366f1', animation: 'ds-spin-slow 22s linear infinite', transformOrigin: '3.5px 103px' }} />
        <div className="absolute rounded-full" style={{ top: '14%', left: '14%', right: '14%', bottom: '14%', border: '1px dashed rgba(168,85,247,0.13)', animation: 'ds-spin-slow 15s linear infinite reverse' }} />
        <div className="absolute rounded-full" style={{ width: 5, height: 5, top: '14%', left: '50%', marginLeft: -2.5, marginTop: -2.5, background: '#a855f7', boxShadow: '0 0 8px #a855f7', animation: 'ds-spin-slow 15s linear infinite reverse', transformOrigin: '2.5px 84px' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="148" height="148" viewBox="0 0 148 148" fill="none" aria-hidden="true">
            <circle cx="74" cy="74" r="66" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.14)" strokeWidth="1"/>
            <rect x="36" y="30" width="76" height="88" rx="10" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"/>
            <rect x="50" y="48" width="48" height="3" rx="1.5" fill="rgba(255,255,255,0.22)"/>
            <rect x="50" y="57" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.14)"/>
            <rect x="50" y="66" width="42" height="3" rx="1.5" fill="rgba(255,255,255,0.1)"/>
            <rect x="50" y="75" width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.07)"/>
            <rect x="50" y="89" width="48" height="16" rx="5" fill="rgba(212,175,55,0.14)" stroke="rgba(212,175,55,0.28)" strokeWidth="1"/>
            <text x="74" y="100.5" textAnchor="middle" fill="rgba(212,175,55,0.8)" fontSize="7.5" fontWeight="700" fontFamily="monospace">₪ 8,500</text>
            <circle cx="104" cy="44" r="17" fill="#22c55e" fillOpacity="0.93"/>
            <path d="M97.5 44l5 5 8.5-9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="32" cy="28" r="3.5" fill="#6366f1" opacity="0.45" style={{ animation: 'ds-pulse 2s ease-in-out 0.3s infinite' }}/>
            <circle cx="122" cy="112" r="2.5" fill="#a855f7" opacity="0.45" style={{ animation: 'ds-pulse 2.6s ease-in-out 0.8s infinite' }}/>
            <circle cx="36" cy="108" r="2" fill="#d4af37" opacity="0.4" style={{ animation: 'ds-pulse 3s ease-in-out 0.5s infinite' }}/>
            <circle cx="118" cy="32" r="2" fill="#22c55e" opacity="0.4" style={{ animation: 'ds-pulse 2.3s ease-in-out 1.1s infinite' }}/>
          </svg>
        </div>
      </div>

      <div style={{ animation: 'ds-fade-up 0.5s ease-out 0.15s both' }}>
        <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {locale === 'he' ? 'הכל מוכן — סגור את הדיל הראשון' : 'Ready to close your first deal?'}
        </h2>
        <p className="text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
          {locale === 'he'
            ? 'צור הצעת מחיר אינטראקטיבית שתבדיל אותך מהמתחרים. לקוחות מאשרים בקליק אחד — בלי PDF ישן.'
            : 'Create an interactive proposal that stands out. Clients approve in one click — no static PDFs.'}
        </p>
      </div>

      <div style={{ animation: 'ds-fade-up 0.5s ease-out 0.3s both' }} className="mt-8">
        <motion.button
          onClick={onCreate}
          className="relative flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 32px rgba(99,102,241,0.45)' }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
        >
          <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)', animation: 'ds-shimmer 2.8s ease-in-out infinite' }} />
          <Plus size={16} />
          {locale === 'he' ? 'צור הצעה ראשונה' : 'Create First Proposal'}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Aurora background ────────────────────────────────────────────────────────

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

// ─── Dunning Banner ───────────────────────────────────────────────────────────

function DunningBanner({ isHe }: { isHe: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
      className="relative overflow-hidden rounded-2xl px-5 py-4 mb-6 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row"
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(185,28,28,0.07) 100%)',
        border: '1px solid rgba(239,68,68,0.3)',
        boxShadow: '0 0 40px rgba(239,68,68,0.08), inset 0 1px 0 rgba(239,68,68,0.12)',
      }}
    >
      {/* Subtle pulsing glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{ animation: 'ds-dunning-pulse 3s ease-in-out infinite', borderRadius: 'inherit' }}
        aria-hidden
      />

      {/* Left: icon + text */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl mt-0.5"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.28)' }}
        >
          <AlertTriangle size={16} style={{ color: '#f87171' }} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-black text-white leading-tight mb-0.5">
            {isHe ? 'בעיה בחיוב — יצירת הצעות חסומה' : 'Billing issue — proposal creation locked'}
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isHe
              ? 'לא הצלחנו לחייב את כרטיס האשראי שלך. אנא עדכן פרטי תשלום כדי להמשיך ליצור הצעות.'
              : "We couldn't process your last payment. Please update your billing details to continue creating proposals."}
          </p>
        </div>
      </div>

      {/* Right: CTA */}
      {STRIPE_CUSTOMER_PORTAL && (
        <motion.a
          href={STRIPE_CUSTOMER_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-none flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-black whitespace-nowrap"
          style={{
            background: 'rgba(239,68,68,0.18)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#fca5a5',
            boxShadow: '0 0 16px rgba(239,68,68,0.12)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
          onPointerEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.28)' }}
          onPointerLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)' }}
        >
          <ExternalLink size={11} />
          {isHe ? 'עדכן אמצעי תשלום' : 'Update Payment Method'}
        </motion.a>
      )}
    </motion.div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'kanban' | 'list'
type PipelineTab = 'all' | 'drafts' | 'pending' | 'won' | 'lost'
type SortBy = 'newest' | 'oldest' | 'value'

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { proposals, loading, fetchProposals, injectDemoProposal } = useProposalStore()
  const { user } = useAuthStore()
  const { locale } = useI18n()
  const isHe = locale === 'he'
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? '').split(' ')[0] || ''
  const navigate = useNavigate()
  const [wizardClosed, setWizardClosed] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('dealspace:view-mode') as ViewMode | null) ?? 'grid'
  )
  const [search, setSearch] = useState('')
  const [pipelineTab, setPipelineTab] = useState<PipelineTab>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [csvFlash, setCsvFlash] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const tier = useTier()
  const billingStatus = useBillingStatus()

  useEffect(() => { fetchProposals() }, [fetchProposals])

  useEffect(() => {
    const onVisible = () => { if (!document.hidden) fetchProposals() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchProposals])

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`proposals:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals', filter: `user_id=eq.${user.id}` },
        () => { fetchProposals() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, fetchProposals])

  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('dealspace:proposals')
      bc.onmessage = () => { fetchProposals() }
    } catch (_) {}
    return () => { try { bc?.close() } catch (_) {} }
  }, [fetchProposals])

  useEffect(() => {
    if (!loading && proposals.length === 0) injectDemoProposal()
  }, [loading, proposals.length, injectDemoProposal])

  // Wizard: show for users who haven't completed onboarding
  const showWizard = !wizardClosed && Boolean(user) && user?.user_metadata?.has_completed_onboarding !== true

  // Tour: auto-trigger for users who have onboarded but haven't seen the tour
  useEffect(() => {
    if (!user || loading || showWizard) return
    const hasSeen = user.user_metadata?.has_seen_tour === true
    const localSeen = localStorage.getItem('dealspace:tour-completed') === '1'
    if (!hasSeen && !localSeen) {
      const t = setTimeout(() => {
        startDashboardTour(locale as 'he' | 'en')
        localStorage.setItem('dealspace:tour-completed', '1')
        supabase.rpc('mark_tour_seen').then(() => {})
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [user, loading, locale, showWizard])

  useEffect(() => {
    if (!sortOpen) return
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sortOpen])

  // ── Proposal slices ───────────────────────────────────────────────────────
  const activeProposals = proposals.filter(p => !p.is_archived)

  // ── KPI financial engine ──────────────────────────────────────────────────
  const vatRate = (() => {
    const v = parseFloat(localStorage.getItem('dealspace:vat-rate') ?? '')
    return isNaN(v) ? ISRAELI_VAT_RATE : v
  })()
  const kpiTotal = (p: Parameters<typeof proposalTotal>[0]) =>
    calculateFinancials(p, undefined, vatRate).grandTotal

  const pipelineProposals = activeProposals.filter(p => p.status === 'sent' || p.status === 'viewed' || p.status === 'needs_revision')
  const acceptedProposals = proposals.filter(p => p.status === 'accepted')
  const rejectedProposals = proposals.filter(p => p.status === 'rejected')
  const pipelineValue = pipelineProposals.reduce((sum, p) => sum + kpiTotal(p), 0)
  const closedWon     = acceptedProposals.reduce((sum, p) => sum + kpiTotal(p), 0)
  const resolvedCount = acceptedProposals.length + rejectedProposals.length
  const winRate       = resolvedCount > 0 ? Math.round((acceptedProposals.length / resolvedCount) * 100) : 0

  const kpiCurrencyPrefix = (() => {
    const cur = pipelineProposals[0]?.currency ?? acceptedProposals[0]?.currency ?? proposals[0]?.currency ?? 'ILS'
    return cur === 'ILS' ? '₪' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur
  })()

  // ── Pipeline tab counts ───────────────────────────────────────────────────
  const tabCounts = useMemo(() => ({
    all:     activeProposals.length,
    drafts:  activeProposals.filter(p => p.status === 'draft').length,
    pending: activeProposals.filter(p => p.status === 'sent' || p.status === 'viewed' || p.status === 'needs_revision').length,
    won:     proposals.filter(p => p.status === 'accepted').length,
    lost:    proposals.filter(p => p.status === 'rejected' || p.is_archived).length,
  }), [proposals]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab base pool (before search + sort) ─────────────────────────────────
  const tabPool = useMemo((): typeof proposals => {
    switch (pipelineTab) {
      case 'all':     return activeProposals
      case 'drafts':  return activeProposals.filter(p => p.status === 'draft')
      case 'pending': return activeProposals.filter(p => p.status === 'sent' || p.status === 'viewed' || p.status === 'needs_revision')
      case 'won':     return proposals.filter(p => p.status === 'accepted')
      case 'lost':    return proposals.filter(p => p.status === 'rejected' || p.is_archived)
    }
  }, [pipelineTab, proposals]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered + sorted proposals ───────────────────────────────────────────
  const filteredProposals = useMemo(() => {
    let list = [...tabPool]

    // Fuzzy search across title, client name, and email
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.project_title.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q) ||
        (p.client_email ?? '').toLowerCase().includes(q)
      )
    }

    // Pin needs_revision to top in tabs where it's relevant
    list.sort((a, b) => {
      if (pipelineTab === 'all' || pipelineTab === 'pending') {
        const aNR = a.status === 'needs_revision' ? 0 : 1
        const bNR = b.status === 'needs_revision' ? 0 : 1
        if (aNR !== bNR) return aNR - bNR
      }
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'value':  return proposalTotal(b) - proposalTotal(a)
      }
    })

    return list
  }, [tabPool, search, sortBy, pipelineTab])

  // ── Pipeline tab config ───────────────────────────────────────────────────
  const TABS: Array<{
    key: PipelineTab
    label_en: string; label_he: string
    color: string; activeBg: string; countBg: string
  }> = [
    { key: 'all',     label_en: 'All',            label_he: 'הכל',           color: '#818cf8', activeBg: 'rgba(99,102,241,0.14)',  countBg: 'rgba(99,102,241,0.22)' },
    { key: 'drafts',  label_en: 'Drafts',          label_he: 'טיוטות',        color: 'rgba(255,255,255,0.55)', activeBg: 'rgba(255,255,255,0.07)', countBg: 'rgba(255,255,255,0.14)' },
    { key: 'pending', label_en: 'Pending',          label_he: 'ממתין',         color: '#fbbf24', activeBg: 'rgba(251,191,36,0.12)',  countBg: 'rgba(251,191,36,0.22)' },
    { key: 'won',     label_en: 'Won',             label_he: 'זכו',           color: '#4ade80', activeBg: 'rgba(74,222,128,0.12)',  countBg: 'rgba(74,222,128,0.22)' },
    { key: 'lost',    label_en: 'Lost / Archived', label_he: 'הופסד / ארכיון', color: '#f87171', activeBg: 'rgba(248,113,113,0.12)', countBg: 'rgba(248,113,113,0.22)' },
  ]

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (billingStatus === 'past_due') return
    if (tier === 'free' && activeProposals.length >= FREE_PROPOSAL_LIMIT) {
      setUpgradeModalOpen(true)
      return
    }
    navigate('/proposals/new')
  }

  const handleEdit = (id: string) => navigate(`/proposals/${id}`)

  const handleDownloadPdf = async (proposalId: string) => {
    if (pdfGenerating) return
    const p = proposals.find(x => x.id === proposalId)
    if (!p) return
    setPdfGenerating(proposalId)
    // Priority: DB column → localStorage written by DealRoom at signing time
    const sigFromDb = p.signature_data_url ?? ''
    const signatureDataUrl = sigFromDb || (() => {
      try { return localStorage.getItem(`dealspace:sig:${p.public_token}`) ?? '' } catch { return '' }
    })()
    await generateProposalPdf({
      proposal: p,
      totalAmount: proposalTotal(p),
      enabledAddOnIds: p.add_ons.filter(a => a.enabled).map(a => a.id),
      signatureDataUrl,
      locale,
    })
    setPdfGenerating(null)
  }

  const handleCsvExport = () => {
    exportProposalsCsv(filteredProposals, locale as 'he' | 'en')
    setCsvFlash(true)
    setTimeout(() => setCsvFlash(false), 1800)
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-dvh flex flex-col" dir={isHe ? 'rtl' : 'ltr'}>
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
        @keyframes ds-dunning-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%       { box-shadow: 0 0 24px 4px rgba(239,68,68,0.14); }
        }
        .ds-tab-scroll::-webkit-scrollbar { display: none }
        .ds-tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <DashboardAurora />

      <main className="relative z-10 px-6 py-8 pb-8 max-w-7xl mx-auto w-full">

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <div className="mb-8" style={{ animation: 'ds-fade-up 0.4s ease-out 0.05s both' }}>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-white">
              {isHe
                ? `שלום${firstName ? `, ${firstName}` : ''}`
                : `Hello${firstName ? `, ${firstName}` : ''}`}
            </h1>
            {(() => {
              const cfg = tier === 'unlimited'
                ? { symbol: '∞', labelHe: 'ללא הגבלה', labelEn: 'Unlimited', color: '#d4af37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.28)', glow: 'rgba(212,175,55,0.15)' }
                : tier === 'pro'
                  ? { symbol: '⚡', labelHe: 'פרו', labelEn: 'Pro', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.28)', glow: 'rgba(99,102,241,0.18)' }
                  : { symbol: '◎', labelHe: 'חינם', labelEn: 'Free', color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)', glow: 'rgba(156,163,175,0.06)' }
              const atLimit  = tier === 'free' && activeProposals.length >= FREE_PROPOSAL_LIMIT
              const nearLimit = tier === 'free' && activeProposals.length === FREE_PROPOSAL_LIMIT - 1
              return (
                <motion.button
                  onClick={() => setUpgradeModalOpen(true)}
                  initial={{ opacity: 0, x: isHe ? 6 : -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' as const }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide outline-none"
                  style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 14px ${cfg.glow}`, cursor: 'pointer' }}
                >
                  {(atLimit || nearLimit) && (
                    <span className="h-1.5 w-1.5 rounded-full flex-none"
                      style={{ background: atLimit ? '#f87171' : '#fbbf24', boxShadow: atLimit ? '0 0 6px #f87171' : '0 0 6px #fbbf24', animation: 'ds-pulse 1.4s ease-in-out infinite' }} />
                  )}
                  <span style={{ fontSize: 12, lineHeight: 1 }}>{cfg.symbol}</span>
                  {isHe ? cfg.labelHe : cfg.labelEn}
                  <span style={{ opacity: 0.4, fontSize: 10, lineHeight: 1 }}>›</span>
                </motion.button>
              )
            })()}
          </div>
          <p className="text-sm text-white/35">
            {isHe ? 'כל הצעות המחיר שלך במקום אחד.' : 'All your proposals in one place.'}
          </p>
        </div>

        {/* ── Dunning Banner ────────────────────────────────────────────── */}
        <AnimatePresence>
          {billingStatus === 'past_due' && <DunningBanner isHe={isHe} />}
        </AnimatePresence>

        {/* ── KPI Bento Grid ────────────────────────────────────────────── */}
        <div data-tour="kpi-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <KPICard
            icon={<TrendingUp size={16} />}
            label={isHe ? 'פייפליין פעיל' : 'Pipeline Value'}
            tooltip={isHe ? 'סך הכנסות פוטנציאליות מהצעות שנשלחו, נצפו, או בתיקון' : 'Total potential revenue from sent, viewed, and revision-pending proposals'}
            value={pipelineValue} prefix={kpiCurrencyPrefix} color="#d4af37" delay={0.1}
          />
          <KPICard
            icon={<Send size={16} />}
            label={isHe ? 'עסקאות שנסגרו' : 'Closed Won'}
            tooltip={isHe ? 'סך ההכנסות שנגבו מהצעות שאושרו וחתמו — הכנסה בפועל' : 'Total revenue from accepted and signed proposals — actual earned income'}
            value={closedWon} prefix={kpiCurrencyPrefix} color="#6366f1" delay={0.18}
          />
          <KPICard
            icon={<Trophy size={16} />}
            label={isHe ? 'אחוז הצלחה' : 'Win Rate'}
            tooltip={isHe ? 'הצעות שאושרו מתוך כלל ההצעות שנסגרו (אושרו + נדחו)' : 'Accepted proposals out of all resolved deals (accepted + rejected)'}
            value={winRate} suffix="%" color="#22c55e" delay={0.26}
          />
        </div>

        {/* ── CRM Toolbar ───────────────────────────────────────────────── */}
        <div data-tour="crm-toolbar" className="relative z-20 mb-6 space-y-3" style={{ animation: 'ds-fade-up 0.4s ease-out 0.28s both' }}>

          {/* ── Pipeline Tab Bar ──────────────────────────────────────────── */}
          <div
            data-tour="pipeline-tabs"
            className="flex items-center rounded-2xl p-1 ds-tab-scroll overflow-x-auto"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {TABS.map(tab => {
              const active = pipelineTab === tab.key
              const count  = tabCounts[tab.key]
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setPipelineTab(tab.key)
                    // Kanban is fine in all tabs — no need to fall back
                  }}
                  className="relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 whitespace-nowrap transition-colors duration-150 flex-none"
                  style={{ color: active ? tab.color : 'rgba(255,255,255,0.3)' }}
                >
                  {/* Sliding pill behind active tab */}
                  {active && (
                    <motion.div
                      layoutId="pipeline-tab-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: tab.activeBg, border: `1px solid ${tab.color}30` }}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}

                  <span className="relative z-10 text-[11px] font-semibold">
                    {isHe ? tab.label_he : tab.label_en}
                  </span>

                  {count > 0 && (
                    <span
                      className="relative z-10 inline-flex items-center justify-center rounded-full px-1.5 min-w-[18px] h-[18px] text-[9px] font-black transition-all duration-150"
                      style={{
                        background: active ? tab.countBg : 'rgba(255,255,255,0.07)',
                        color: active ? tab.color : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Quota bar — free tier, active tabs only ─────────────────── */}
          {tier === 'free' && pipelineTab !== 'lost' && (() => {
            const activeCount = activeProposals.length
            const pct = Math.min(100, (activeCount / FREE_PROPOSAL_LIMIT) * 100)
            const isMax  = activeCount >= FREE_PROPOSAL_LIMIT
            const isWarn = activeCount >= FREE_PROPOSAL_LIMIT - 1 && !isMax
            const barColor = isMax ? 'linear-gradient(90deg, #f87171, #ef4444)' : isWarn ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #6366f1, #a855f7)'
            const textColor = isMax ? '#f87171' : isWarn ? '#fbbf24' : 'rgba(255,255,255,0.4)'
            return (
              <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isMax ? 'rgba(239,68,68,0.2)' : isWarn ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: textColor }}>
                      {isHe
                        ? `ניצלת ${activeCount} מתוך ${FREE_PROPOSAL_LIMIT} הצעות חינם`
                        : `Used ${activeCount} of ${FREE_PROPOSAL_LIMIT} free proposals`}
                    </span>
                    <button onClick={() => setUpgradeModalOpen(true)} className="text-[10px] font-black tracking-wide transition-opacity hover:opacity-70 flex-none" style={{ color: '#818cf8' }}>
                      {isHe ? '↑ שדרג' : '↑ Upgrade'}
                    </button>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' as const }} style={{ background: barColor }} />
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── Search ────────────────────────────────────────────────── */}
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center z-10">
              <Search size={13} className="transition-colors duration-200 group-focus-within:text-indigo-400/60" style={{ color: 'rgba(255,255,255,0.28)' }} />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isHe ? 'חפש לפי לקוח, פרויקט, או אימייל…' : 'Search by client, project, or email…'}
              className="w-full h-11 rounded-2xl ps-9 pe-10 text-[13px] font-medium text-white placeholder-white/25 outline-none transition-all duration-200"
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
              onFocus={e => {
                e.currentTarget.style.background = '#0d0d1a'
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.45)'
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.04)'
              }}
              onBlur={e => {
                e.currentTarget.style.background = '#0a0a0a'
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)'
              }}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 end-3 flex items-center justify-center w-6 h-full"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  whileHover={{ opacity: 0.8 }}
                >
                  <X size={13} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ── Controls row: Sort · Views · CSV · Count ──────────────── */}
          <div className="flex items-center gap-2">

            {/* Custom Sort Dropdown */}
            <div className="relative flex-none" ref={sortRef}>
              <motion.button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-2 h-9 rounded-xl px-3 text-[12px] font-semibold outline-none flex-none"
                style={{
                  background: sortOpen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${sortOpen ? 'rgba(99,102,241,0.38)' : 'rgba(255,255,255,0.09)'}`,
                  color: sortOpen ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
                  boxShadow: sortOpen ? '0 0 18px rgba(99,102,241,0.14)' : 'none',
                  transition: 'background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s',
                }}
                whileTap={{ scale: 0.95, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } }}
              >
                <SlidersHorizontal size={12} className="flex-none" />
                <span className="whitespace-nowrap">
                  {sortBy === 'newest'
                    ? (isHe ? 'הכי חדש' : 'Newest')
                    : sortBy === 'oldest'
                      ? (isHe ? 'הכי ישן' : 'Oldest')
                      : (isHe ? 'סכום גבוה' : 'Highest Value')}
                </span>
                <motion.span
                  animate={{ rotate: sortOpen ? 180 : 0 }}
                  transition={{ type: 'spring' as const, stiffness: 380, damping: 26 }}
                  style={{ display: 'flex', opacity: 0.6 }}
                >
                  <ChevronDown size={11} />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: isHe ? -8 : -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -8 }}
                    transition={{ type: 'spring' as const, stiffness: 480, damping: 30 }}
                    className="absolute top-[calc(100%+6px)] start-0 z-[200] min-w-[168px] rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(160deg, rgba(16,16,26,0.98) 0%, rgba(8,8,16,0.98) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(32px)',
                    }}
                  >
                    <div className="p-1.5 space-y-0.5">
                      {([
                        { value: 'newest' as SortBy, label_en: 'Newest First',   label_he: 'הכי חדש',   glyph: '↓' },
                        { value: 'oldest' as SortBy, label_en: 'Oldest First',   label_he: 'הכי ישן',   glyph: '↑' },
                        { value: 'value'  as SortBy, label_en: 'Highest Value',  label_he: 'סכום גבוה', glyph: '◈' },
                      ]).map(opt => {
                        const isActive = sortBy === opt.value
                        return (
                          <motion.button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-start outline-none"
                            style={{
                              background: isActive ? 'rgba(99,102,241,0.16)' : 'transparent',
                              color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.52)',
                              transition: 'background 0.1s, color 0.1s',
                            }}
                            whileHover={{ opacity: 0.9 }}
                          >
                            <span style={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace', lineHeight: 1 }}>{opt.glyph}</span>
                            <span>{isHe ? opt.label_he : opt.label_en}</span>
                            <AnimatePresence>
                              {isActive && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="ms-auto flex-none"
                                >
                                  <Check size={11} style={{ color: '#818cf8' }} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View toggle */}
            <div
              className="flex items-center rounded-xl p-0.5 flex-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {([
                { mode: 'grid'   as ViewMode, icon: <LayoutGrid size={13} />, label_en: 'Grid',   label_he: 'רשת' },
                { mode: 'list'   as ViewMode, icon: <List size={13} />,       label_en: 'List',   label_he: 'רשימה' },
                { mode: 'kanban' as ViewMode, icon: <Columns size={13} />,    label_en: 'Kanban', label_he: 'קנבן' },
              ]).map(({ mode, icon, label_en, label_he }) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); localStorage.setItem('dealspace:view-mode', mode) }}
                  className="flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-150 whitespace-nowrap"
                  style={{
                    background: viewMode === mode ? 'rgba(99,102,241,0.18)' : 'transparent',
                    color:      viewMode === mode ? '#818cf8' : 'rgba(255,255,255,0.3)',
                    boxShadow:  viewMode === mode ? '0 0 12px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
                  }}
                  title={isHe ? label_he : label_en}
                >
                  {icon}
                  <span className="hidden sm:inline">{isHe ? label_he : label_en}</span>
                </button>
              ))}
            </div>

            {/* CSV Export */}
            <motion.button
              onClick={handleCsvExport}
              disabled={filteredProposals.length === 0}
              className="flex items-center gap-1.5 h-9 rounded-xl px-3 text-[11px] font-semibold flex-none transition-all duration-150 outline-none"
              style={{
                background: csvFlash ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${csvFlash ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: csvFlash ? '#4ade80' : 'rgba(255,255,255,0.35)',
                opacity: filteredProposals.length === 0 ? 0.28 : 1,
                cursor: filteredProposals.length === 0 ? 'default' : 'pointer',
                boxShadow: csvFlash ? '0 0 18px rgba(74,222,128,0.18)' : 'none',
              }}
              whileTap={filteredProposals.length > 0 ? { scale: 0.94, transition: { type: 'spring' as const, stiffness: 500, damping: 15 } } : {}}
            >
              <FileDown size={12} />
              <span className="hidden sm:inline whitespace-nowrap">{isHe ? 'ייצוא CSV' : 'Export CSV'}</span>
            </motion.button>

            {/* Count */}
            <span className="ms-auto text-[10px] font-semibold text-white/22 whitespace-nowrap tabular-nums">
              {filteredProposals.length !== tabPool.length
                ? `${filteredProposals.length} / ${tabPool.length}`
                : `${tabPool.length} ${isHe ? 'הצעות' : 'proposals'}`}
            </span>
          </div>
        </div>

        {/* ── Proposals view ────────────────────────────────────────────── */}
        {loading ? (
          <div data-tour="proposals-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {Array.from({ length: 6 }).map((_, i) => <ProposalCardSkeleton key={i} />)}
          </div>
        ) : pipelineTab === 'all' && activeProposals.length === 0 ? (
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
              <FileText size={20} className="text-white/20" />
            </div>
            <p className="text-sm font-semibold text-white/40">
              {isHe ? 'לא נמצאו הצעות בקטגוריה זו' : 'No proposals in this category'}
            </p>
            <p className="text-xs text-white/20 mt-1">
              {search.trim()
                ? (isHe ? 'נסה לשנות את מונחי החיפוש' : 'Try adjusting your search terms')
                : (isHe ? 'נסה לעבור לטאב אחר' : 'Try switching to another tab')}
            </p>
          </motion.div>
        ) : viewMode === 'kanban' ? (
          <div data-tour="proposals-list">
            <KanbanBoard proposals={filteredProposals} locale={locale} onEdit={handleEdit} />
          </div>
        ) : viewMode === 'list' ? (
          <div data-tour="proposals-list">
            {/* Column header */}
            <div className="hidden md:grid items-center px-4 py-2 mb-1 rounded-xl"
              style={{ gridTemplateColumns: '8px 1fr 96px 112px 90px 56px', gap: '0 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div />
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">{isHe ? 'פרויקט / לקוח' : 'Project / Client'}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 text-center">{isHe ? 'סטטוס' : 'Status'}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 text-end">{isHe ? 'סכום' : 'Amount'}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 text-end">{isHe ? 'תאריך' : 'Date'}</p>
              <div />
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <AnimatePresence>
                {filteredProposals.map((p, i) => {
                  const total = proposalTotal(p)
                  const meta = STATUS_META[p.status]
                  const isAccepted = p.status === 'accepted'
                  const date = new Date(p.created_at).toLocaleDateString(
                    isHe ? 'he-IL' : 'en-US',
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
                      style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)', animation: `ds-fade-up 0.25s ease-out ${0.04 + i * 0.03}s both` }}
                    >
                      <div className="absolute inset-y-0 start-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full" style={{ background: meta.color }} />

                      {/* Desktop row */}
                      <div className="hidden md:grid items-center px-4 py-3.5" style={{ gridTemplateColumns: '8px 1fr 96px 112px 90px 56px', gap: '0 16px' }}>
                        <div className="h-2 w-2 rounded-full flex-none" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.glow}` }} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white/90 truncate leading-snug">
                            {p.project_title || (isHe ? 'הצעה חדשה' : 'New Proposal')}
                          </p>
                          <p className="text-[11px] text-white/35 truncate mt-0.5">{p.client_name || '—'}</p>
                        </div>
                        <div className="flex justify-center">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
                            <span className="h-1 w-1 rounded-full" style={{ background: meta.color }} />
                            {isHe ? meta.label_he : meta.label_en}
                          </span>
                        </div>
                        <p className="text-[13px] font-bold tabular-nums text-end" style={{ color: meta.color, textShadow: `0 0 16px ${meta.glow}` }}>
                          {formatCurrency(total, p.currency)}
                        </p>
                        <p className="text-[11px] text-white/30 text-end">{date}</p>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/8 hover:text-white/75" onClick={() => handleEdit(p.id)} title={isHe ? 'ערוך' : 'Edit'}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {isAccepted && (
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-emerald-500/10" style={{ color: '#4ade80' }}
                              onClick={() => handleDownloadPdf(p.id)} disabled={pdfGenerating === p.id} title={isHe ? 'הורד PDF' : 'Download PDF'}>
                              {pdfGenerating === p.id
                                ? <div className="h-3 w-3 rounded-full border border-emerald-400/40 border-t-emerald-400 animate-spin" />
                                : <FileDown size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mobile row */}
                      <div className="flex md:hidden items-center gap-3 px-4 py-3.5">
                        <div className="h-2 w-2 rounded-full flex-none" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.glow}` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/90 truncate">
                            {p.project_title || (isHe ? 'הצעה חדשה' : 'New Proposal')}
                          </p>
                          <p className="text-[11px] text-white/35 truncate mt-0.5">{p.client_name || '—'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-none">
                          <p className="text-[13px] font-bold tabular-nums" style={{ color: meta.color }}>{formatCurrency(total, p.currency)}</p>
                          <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                            style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                            {isHe ? meta.label_he : meta.label_en}
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
          <div data-tour="proposals-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            <AnimatePresence>
              {filteredProposals.map((p, i) => (
                <motion.div
                  key={p.id}
                  style={{ animation: `ds-fade-up 0.4s ease-out ${0.35 + i * 0.06}s both` }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                >
                  <ProposalCard proposal={p} onEdit={handleEdit} onUpgradeRequired={() => setUpgradeModalOpen(true)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>

      <GlobalFooter />

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        activeCount={activeProposals.length}
        currentTier={tier}
      />

      <AnimatePresence>
        {showWizard && (
          <OnboardingWizard onClose={() => setWizardClosed(true)} />
        )}
      </AnimatePresence>
    </div>
  )
}

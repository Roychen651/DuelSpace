import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, Crown, Zap, RefreshCw,
  AlertTriangle, LogOut, BarChart3, TrendingUp,
  Snowflake, Gift,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../lib/i18n'
import { UserOpsDrawer } from './UserOpsDrawer'
import type { AdminUser } from './UserOpsDrawer'

type Tier = 'free' | 'pro' | 'unlimited'
type FilterTier = 'all' | 'free' | 'pro' | 'unlimited' | 'suspended'
type SortBy = 'newest' | 'pipeline' | 'proposals'

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CFG: Record<Tier, {
  label_en: string; label_he: string
  color: string; bg: string; border: string; glow: string
  gradientFrom: string; gradientTo: string
}> = {
  free:      { label_en:'Free',      label_he:'חינם',       color:'rgba(255,255,255,0.5)', bg:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.12)', glow:'none',                          gradientFrom:'rgba(255,255,255,0.04)', gradientTo:'rgba(255,255,255,0.01)' },
  pro:       { label_en:'Pro',       label_he:'פרו',        color:'#a5b4fc',               bg:'rgba(99,102,241,0.14)',  border:'rgba(99,102,241,0.4)',   glow:'0 0 16px rgba(99,102,241,0.3)', gradientFrom:'rgba(99,102,241,0.12)', gradientTo:'rgba(99,102,241,0.03)' },
  unlimited: { label_en:'Unlimited', label_he:'ללא הגבלה', color:'#fbbf24',               bg:'rgba(212,175,55,0.12)', border:'rgba(212,175,55,0.4)',   glow:'0 0 18px rgba(212,175,55,0.25)',gradientFrom:'rgba(212,175,55,0.1)',  gradientTo:'rgba(212,175,55,0.02)' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}
function fmtPipeline(value: number): string {
  if (value === 0)        return '—'
  if (value >= 1_000_000) return `₪${(value/1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `₪${Math.round(value/1_000)}K`
  return `₪${Math.round(value).toLocaleString('en-US')}`
}
function getInitials(email: string, name: string): string {
  if (name.trim()) {
    const p = name.trim().split(' ')
    return p.length >= 2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : p[0].slice(0,2).toUpperCase()
  }
  return email.slice(0,2).toUpperCase()
}

// ─── TierBadge ────────────────────────────────────────────────────────────────

function TierBadge({ tier, isHe, bonusQuota = 0 }: { tier: Tier; isHe: boolean; bonusQuota?: number }) {
  const cfg = TIER_CFG[tier]
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase"
        style={{ color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, boxShadow:cfg.glow }}>
        {tier === 'unlimited' && <Crown size={9} />}
        {tier === 'pro'       && <Zap   size={9} />}
        {isHe ? cfg.label_he : cfg.label_en}
      </span>
      {bonusQuota > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black"
          style={{ background:'rgba(251,146,60,0.12)', border:'1px solid rgba(251,146,60,0.3)', color:'#fb923c' }}>
          <Gift size={8} />+{bonusQuota}
        </span>
      )}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, glowColor, icon, delay=0 }: {
  label:string; value:string|number; sub:string
  color:string; glowColor:string; icon:React.ReactNode; delay?:number
}) {
  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, delay, ease:'easeOut' as const }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background:`linear-gradient(135deg, ${glowColor}18 0%, rgba(255,255,255,0.02) 100%)`,
        border:`1px solid ${glowColor}28`,
        boxShadow:`0 0 40px ${glowColor}0a, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div className="pointer-events-none absolute -top-8 -end-8 h-24 w-24 rounded-full"
        style={{ background:`radial-gradient(circle, ${glowColor}20 0%, transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.3)' }}>{label}</p>
          <p className="mt-2 text-[2rem] font-black tabular-nums leading-none" style={{ color }}>{value}</p>
          <p className="mt-1.5 text-[11px]" style={{ color:'rgba(255,255,255,0.25)' }}>{sub}</p>
        </div>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
          style={{ background:`${glowColor}18`, border:`1px solid ${glowColor}30` }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile User Card ─────────────────────────────────────────────────────────

function MobileUserCard({ user, isHe, onClick }: { user:AdminUser; isHe:boolean; onClick:()=>void }) {
  const cfg      = TIER_CFG[user.plan_tier]
  const initials = getInitials(user.email, user.full_name)

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.97 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-4 space-y-3"
      style={{
        background:`linear-gradient(135deg, ${cfg.gradientFrom} 0%, ${cfg.gradientTo} 100%)`,
        border:`1px solid ${cfg.border}`,
        boxShadow:cfg.glow !== 'none' ? `${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        opacity: user.is_suspended ? 0.6 : 1,
      }}
      dir={isHe ? 'rtl' : 'ltr'}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-black"
              style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, boxShadow:cfg.glow }}>
              {initials}
            </div>
            {user.is_suspended && (
              <div className="absolute -bottom-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full"
                style={{ background:'#ef4444', border:'2px solid rgba(6,6,14,0.99)' }}>
                <Snowflake size={8} color="white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            {user.full_name && <p className="text-[12px] font-bold text-white truncate">{user.full_name}</p>}
            <p className="text-[11px] truncate" style={{ color:'rgba(255,255,255,0.4)' }}>{user.email}</p>
          </div>
        </div>
        <TierBadge tier={user.plan_tier} isHe={isHe} bonusQuota={user.bonus_quota} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: isHe?'הצטרף':'Joined',   value: fmtDate(user.created_at).replace(' 2026','') },
          { label: isHe?'הצעות':'Proposals', value: String(user.proposal_count) },
          { label: isHe?'צפי':'Pipeline',    value: fmtPipeline(user.total_pipeline_value) },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl px-2.5 py-2 text-center"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>{stat.label}</p>
            <p className="mt-0.5 text-[12px] font-bold text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center" style={{ color:'rgba(255,255,255,0.2)' }}>
        {isHe ? 'לחץ לניהול' : 'Tap to manage'}
      </p>
    </motion.div>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { signOut }       = useAuthStore()
  const { locale }        = useI18n()
  const isHe              = locale === 'he'

  const [users,      setUsers]      = useState<AdminUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState<AdminUser | null>(null)
  const [filterTier, setFilterTier] = useState<FilterTier>('all')
  const [sortBy,     setSortBy]     = useState<SortBy>('newest')

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('get_admin_users_data')
      if (rpcError) throw rpcError
      setUsers((data as AdminUser[]) ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch users')
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleUserUpdated = useCallback((patch: Partial<AdminUser> & { id: string }) => {
    setUsers(prev => prev.map(u => u.id === patch.id ? { ...u, ...patch } : u))
    // keep drawer in sync
    setSelected(prev => prev && prev.id === patch.id ? { ...prev, ...patch } : prev)
  }, [])

  const handleDeleted = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
    setSelected(null)
  }, [])

  // KPIs
  const totalUsers     = users.length
  const proUsers       = users.filter(u => u.plan_tier === 'pro').length
  const unlimitedUsers = users.filter(u => u.plan_tier === 'unlimited').length
  const totalProposals = users.reduce((s, u) => s + u.proposal_count, 0)
  const totalPipeline  = users.reduce((s, u) => s + u.total_pipeline_value, 0)

  const filtered = users
    .filter(u => {
      if (filterTier === 'suspended') return u.is_suspended
      if (filterTier !== 'all') return u.plan_tier === filterTier
      return true
    })
    .filter(u => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'pipeline')  return b.total_pipeline_value - a.total_pipeline_value
      if (sortBy === 'proposals') return b.proposal_count - a.proposal_count
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  // ── i18n strings ────────────────────────────────────────────────────────────
  const L = {
    title:        isHe ? 'מנהל DealSpace'             : 'DealSpace Admin',
    restricted:   isHe ? 'גישה מוגבלת — מייסד בלבד'  : 'Restricted Access — Founder Only',
    refresh:      isHe ? 'רענן'                        : 'Refresh',
    signOut:      isHe ? 'יציאה'                       : 'Sign Out',
    kpiUsers:     isHe ? 'סה״כ משתמשים'               : 'Total Users',
    kpiAccounts:  isHe ? 'חשבונות רשומים'             : 'registered accounts',
    kpiUnlimited: isHe ? 'ללא הגבלה'                  : 'Unlimited',
    kpiGold:      isHe ? 'חבילת זהב'                  : 'gold tier',
    kpiPro:       isHe ? 'פרו'                         : 'Pro',
    kpiIndigo:    isHe ? 'חבילת אינדיגו'              : 'indigo tier',
    kpiProposals: isHe ? 'הצעות מחיר'                 : 'Proposals',
    kpiAllUsers:  isHe ? 'בין כל המשתמשים'            : 'across all users',
    kpiPipeline:  isHe ? 'צפי הכנסות פלטפורמה'        : 'Platform Pipeline',
    kpiBasePrice: isHe ? 'סה״כ מחיר בסיס'            : 'total base price',
    registry:     isHe ? 'רשימת משתמשים'              : 'User Registry',
    search:       isHe ? '...חיפוש משתמשים'           : 'Search users…',
    noMatch:      isHe ? 'לא נמצאו משתמשים'           : 'No users match your search',
    noUsers:      isHe ? 'עדיין אין משתמשים'          : 'No users registered yet',
    colUser:      isHe ? 'משתמש'                       : 'User',
    colJoined:    isHe ? 'הצטרף'                       : 'Joined',
    colActive:    isHe ? 'פעילות אחרונה'              : 'Last Active',
    colProposals: isHe ? 'הצעות'                       : 'Proposals',
    colPipeline:  isHe ? 'צפי הכנסות'                 : 'Pipeline',
    colTier:      isHe ? 'חבילה'                       : 'Tier',
    clickRow:      isHe ? 'לחץ לפתיחת פעולות'          : 'Click row to manage',
    retry:         isHe ? 'נסה שוב'                     : 'Retry',
    footer:        isHe ? 'שינויי חבילה נכנסים לתוקף מיד — לא ניתן לזייף בצד הלקוח.' : 'Tier changes take effect immediately — server-authoritative, client cannot spoof.',
    filterAll:     isHe ? 'הכל'                         : 'All',
    filterFree:    isHe ? 'חינם'                        : 'Free',
    filterPro:     isHe ? 'פרו'                         : 'Pro',
    filterUnlim:   isHe ? 'ללא הגבלה'                  : 'Unlimited',
    filterSuspend: isHe ? 'מושעים'                      : 'Suspended',
    sortNewest:    isHe ? 'חדש ביותר'                   : 'Newest',
    sortPipeline:  isHe ? 'לפי צפי'                     : 'By Pipeline',
    sortProposals: isHe ? 'לפי הצעות'                   : 'By Proposals',
  }

  return (
    <div className="min-h-screen" style={{ background:'#030305', fontFamily:"'Outfit', sans-serif" }} dir={isHe?'rtl':'ltr'}>
      <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg) } }
        .adm-spin { animation: adm-spin 0.9s linear infinite }
        .adm-row { transition: background 0.15s ease, opacity 0.15s ease }
        .adm-row:hover { background: rgba(255,255,255,0.03) !important; cursor: pointer }
        .adm-scroll::-webkit-scrollbar { height: 3px }
        .adm-scroll::-webkit-scrollbar-track { background: transparent }
        .adm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px }
      `}</style>

      {/* ── User Operations Drawer ──────────────────────────────────────────── */}
      <UserOpsDrawer
        user={selected}
        isHe={isHe}
        onClose={() => setSelected(null)}
        onUpdated={handleUserUpdated}
        onDeleted={handleDeleted}
      />

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4"
        style={{ background:'rgba(3,3,5,0.88)', borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background:'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))', border:'1px solid rgba(239,68,68,0.35)', boxShadow:'0 0 16px rgba(239,68,68,0.15)' }}>
            <Shield size={13} style={{ color:'#fca5a5' }} />
          </div>
          <div>
            <p className="text-[13px] font-black tracking-tight text-white">{L.title}</p>
            <p className="text-[10px] font-semibold" style={{ color:'rgba(252,165,165,0.7)' }}>{L.restricted}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fetchUsers(true)} disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'}}>
            <RefreshCw size={11} className={refreshing?'adm-spin':''} />
            <span className="hidden sm:inline">{L.refresh}</span>
          </button>
          <button type="button" onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', color:'rgba(252,165,165,0.75)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.06)'}}>
            <LogOut size={11} />
            <span className="hidden sm:inline">{L.signOut}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">

        {/* ── KPIs ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard label={L.kpiUsers}     value={totalUsers}     sub={L.kpiAccounts}  color="white"   glowColor="#ffffff" icon={<Users     size={14} style={{ color:'rgba(255,255,255,0.5)' }} />} delay={0}    />
          <KpiCard label={L.kpiUnlimited} value={unlimitedUsers} sub={L.kpiGold}      color="#fbbf24" glowColor="#d4af37" icon={<Crown     size={14} style={{ color:'#fbbf24' }} />}              delay={0.05} />
          <KpiCard label={L.kpiPro}       value={proUsers}       sub={L.kpiIndigo}    color="#a5b4fc" glowColor="#6366f1" icon={<Zap       size={14} style={{ color:'#a5b4fc' }} />}              delay={0.1}  />
          <KpiCard label={L.kpiProposals} value={totalProposals} sub={L.kpiAllUsers}  color="#34d399" glowColor="#10b981" icon={<BarChart3 size={14} style={{ color:'#34d399' }} />}              delay={0.15} />
          <div className="col-span-2 sm:col-span-1">
            <KpiCard label={L.kpiPipeline} value={fmtPipeline(totalPipeline)} sub={L.kpiBasePrice} color="#fb923c" glowColor="#f97316" icon={<TrendingUp size={14} style={{ color:'#fb923c' }} />} delay={0.2} />
          </div>
        </div>

        {/* ── Registry panel ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4, delay:0.25, ease:'easeOut' as const }}
          className="rounded-2xl overflow-hidden"
          style={{ background:'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          {/* Panel header */}
          <div className="px-4 sm:px-6 py-4 space-y-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            {/* Top row: title + search */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Users size={13} style={{ color:'#818cf8' }} />
                <p className="text-[13px] font-bold text-white">{L.registry}</p>
                {!loading && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{ background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)' }}>
                    {filtered.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="hidden sm:block text-[10px]" style={{ color:'rgba(255,255,255,0.2)' }}>{L.clickRow}</p>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={L.search}
                  className="rounded-xl px-3 py-1.5 text-[12px] outline-none transition-all"
                  style={{ width:190, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.75)' }}
                  onFocus={e=>{ e.currentTarget.style.border='1px solid rgba(99,102,241,0.45)'; e.currentTarget.style.background='rgba(99,102,241,0.07)' }}
                  onBlur={e =>{ e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                />
              </div>
            </div>

            {/* Bottom row: filter pills + sort */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { key: 'all',       label: L.filterAll,     color: '#818cf8', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.4)' },
                  { key: 'free',      label: L.filterFree,    color: 'rgba(255,255,255,0.55)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.18)' },
                  { key: 'pro',       label: L.filterPro,     color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)' },
                  { key: 'unlimited', label: L.filterUnlim,   color: '#fbbf24', bg: 'rgba(212,175,55,0.12)',  border: 'rgba(212,175,55,0.35)' },
                  { key: 'suspended', label: L.filterSuspend, color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)' },
                ] as const).map(pill => {
                  const active = filterTier === pill.key
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => setFilterTier(pill.key)}
                      className="rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide transition-all"
                      style={{
                        color:       active ? pill.color              : 'rgba(255,255,255,0.3)',
                        background:  active ? pill.bg                 : 'rgba(255,255,255,0.03)',
                        border:      active ? `1px solid ${pill.border}` : '1px solid rgba(255,255,255,0.07)',
                        boxShadow:   active ? `0 0 10px ${pill.bg}`  : 'none',
                      }}
                    >
                      {pill.label}
                    </button>
                  )
                })}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
                className="rounded-xl px-2.5 py-1 text-[11px] font-semibold outline-none transition-all cursor-pointer"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.45)' }}
              >
                <option value="newest"    style={{ background:'#0f0f1a' }}>{L.sortNewest}</option>
                <option value="pipeline"  style={{ background:'#0f0f1a' }}>{L.sortPipeline}</option>
                <option value="proposals" style={{ background:'#0f0f1a' }}>{L.sortProposals}</option>
              </select>
            </div>
          </div>

          {/* ── States ────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div style={{ width:28, height:28, borderRadius:'50%', border:'2px solid rgba(99,102,241,0.2)', borderTopColor:'#818cf8', animation:'adm-spin 0.9s linear infinite' }} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 justify-center py-20">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={20} style={{ color:'#f87171' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color:'#f87171' }}>{error}</p>
              <button type="button" onClick={() => fetchUsers()} className="rounded-xl px-4 py-2 text-[12px] font-semibold" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>
                {L.retry}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 justify-center py-20">
              <Users size={28} style={{ color:'rgba(255,255,255,0.1)' }} />
              <p className="text-sm font-semibold" style={{ color:'rgba(255,255,255,0.25)' }}>{search ? L.noMatch : L.noUsers}</p>
            </div>
          ) : (
            <>
              {/* ── Mobile Cards ──────────────────────────────────────────── */}
              <div className="block md:hidden p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {filtered.map(user => (
                    <MobileUserCard key={user.id} user={user} isHe={isHe} onClick={() => setSelected(user)} />
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Desktop Table ─────────────────────────────────────────── */}
              <div className="adm-scroll hidden md:block overflow-x-auto">
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:860 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      {[L.colUser, L.colJoined, L.colActive, L.colProposals, L.colPipeline, L.colTier].map(col => (
                        <th key={col} className="px-6 py-3 text-start text-[10px] font-black uppercase tracking-widest"
                          style={{ color:'rgba(255,255,255,0.22)' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {filtered.map((user, idx) => {
                        const cfg      = TIER_CFG[user.plan_tier]
                        const initials = getInitials(user.email, user.full_name)
                        const isSuspended = user.is_suspended
                        return (
                          <motion.tr
                            key={user.id}
                            className="adm-row"
                            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                            transition={{ duration:0.2, delay:idx*0.03, ease:'easeOut' as const }}
                            onClick={() => setSelected(user)}
                            style={{
                              borderBottom:'1px solid rgba(255,255,255,0.04)',
                              opacity: isSuspended ? 0.5 : 1,
                              background: selected?.id === user.id ? 'rgba(99,102,241,0.07)' : 'transparent',
                            }}
                          >
                            {/* User */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative flex-none">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black"
                                    style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, boxShadow:cfg.glow }}>
                                    {initials}
                                  </div>
                                  {isSuspended && (
                                    <div className="absolute -bottom-1 -end-1 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                                      style={{ background:'#ef4444', border:'2px solid #030305' }}>
                                      <Snowflake size={7} color="white" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  {user.full_name && <p className="text-[12px] font-semibold text-white truncate">{user.full_name}</p>}
                                  <p className="text-[11px] truncate" style={{ color:'rgba(255,255,255,0.38)' }}>{user.email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Joined */}
                            <td className="px-6 py-4">
                              <span className="text-[11px] tabular-nums" style={{ color:'rgba(255,255,255,0.45)' }}>{fmtDate(user.created_at)}</span>
                            </td>
                            {/* Last active */}
                            <td className="px-6 py-4">
                              <span className="text-[11px] tabular-nums" style={{ color:'rgba(255,255,255,0.3)' }}>
                                {user.last_sign_in_at ? fmtDate(user.last_sign_in_at) : '—'}
                              </span>
                            </td>
                            {/* Proposals */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1 rounded-full"
                                  style={{ width:Math.max(Math.min(user.proposal_count*10,52),4), background:user.proposal_count>0?'linear-gradient(90deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.08)' }} />
                                <span className="text-[12px] font-bold tabular-nums" style={{ color:'rgba(255,255,255,0.6)' }}>{user.proposal_count}</span>
                              </div>
                            </td>
                            {/* Pipeline */}
                            <td className="px-6 py-4">
                              <span className="text-[12px] font-bold tabular-nums"
                                style={{ color:user.total_pipeline_value>0?'#fb923c':'rgba(255,255,255,0.2)' }}>
                                {fmtPipeline(user.total_pipeline_value)}
                              </span>
                            </td>
                            {/* Tier + bonus */}
                            <td className="px-6 py-4">
                              <TierBadge tier={user.plan_tier} isHe={isHe} bonusQuota={user.bonus_quota} />
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        <p className="pb-4 text-center text-[10px]" style={{ color:'rgba(255,255,255,0.12)' }}>{L.footer}</p>
      </main>
    </div>
  )
}

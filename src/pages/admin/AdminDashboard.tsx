import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Shield, Users, Crown, Zap, RefreshCw,
  AlertTriangle, Check, Loader2, LogOut, BarChart3, TrendingUp,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string
  email: string
  full_name: string
  plan_tier: 'free' | 'pro' | 'unlimited'
  created_at: string
  last_sign_in_at: string | null
  proposal_count: number
  total_pipeline_value: number
}

type Tier = 'free' | 'pro' | 'unlimited'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<Tier, {
  label: string
  color: string
  bg: string
  border: string
  glow: string
  gradientFrom: string
  gradientTo: string
}> = {
  free: {
    label: 'Free',
    color: 'rgba(255,255,255,0.5)',
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.12)',
    glow: 'none',
    gradientFrom: 'rgba(255,255,255,0.04)',
    gradientTo: 'rgba(255,255,255,0.01)',
  },
  pro: {
    label: 'Pro',
    color: '#a5b4fc',
    bg: 'rgba(99,102,241,0.14)',
    border: 'rgba(99,102,241,0.4)',
    glow: '0 0 16px rgba(99,102,241,0.3)',
    gradientFrom: 'rgba(99,102,241,0.12)',
    gradientTo: 'rgba(99,102,241,0.03)',
  },
  unlimited: {
    label: 'Unlimited',
    color: '#fbbf24',
    bg: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.4)',
    glow: '0 0 18px rgba(212,175,55,0.25)',
    gradientFrom: 'rgba(212,175,55,0.1)',
    gradientTo: 'rgba(212,175,55,0.02)',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtPipeline(value: number): string {
  if (value === 0) return '—'
  if (value >= 1_000_000) return `₪${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `₪${Math.round(value / 1_000)}K`
  return `₪${Math.round(value).toLocaleString('en-US')}`
}

function getInitials(email: string, name: string): string {
  if (name.trim()) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

// ─── TierBadge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: Tier }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {tier === 'unlimited' && <Crown size={9} />}
      {tier === 'pro'       && <Zap size={9} />}
      {cfg.label}
    </span>
  )
}

// ─── TierDropdown (Radix Portal — never clips) ────────────────────────────────

interface TierDropdownProps {
  userId: string
  currentTier: Tier
  onSuccess: (userId: string, tier: Tier) => void
}

function TierDropdown({ userId, currentTier, onSuccess }: TierDropdownProps) {
  const [loading, setLoading]   = useState(false)
  const [feedback, setFeedback] = useState<'ok' | 'err' | null>(null)

  const setTier = useCallback(async (tier: Tier) => {
    if (tier === currentTier) return
    setLoading(true)
    try {
      const { error } = await supabase.rpc('admin_set_user_tier', {
        p_target_user_id: userId,
        p_new_tier: tier,
      })
      if (error) throw error
      setFeedback('ok')
      setTimeout(() => setFeedback(null), 1800)
      onSuccess(userId, tier)
    } catch {
      setFeedback('err')
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setLoading(false)
    }
  }, [userId, currentTier, onSuccess])

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          {loading   && <Loader2 size={10} className="animate-spin" />}
          {!loading && feedback === 'ok'  && <Check         size={10} style={{ color: '#4ade80' }} />}
          {!loading && feedback === 'err' && <AlertTriangle size={10} style={{ color: '#f87171' }} />}
          {!loading && !feedback          && <Zap           size={10} style={{ opacity: 0.5 }} />}
          Set Tier
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="end"
          className="z-[9999] min-w-[140px] rounded-2xl overflow-hidden outline-none"
          style={{
            background: 'rgba(8,8,18,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            padding: '6px',
          }}
        >
          {(['free', 'pro', 'unlimited'] as Tier[]).map(tier => {
            const cfg       = TIER_CONFIG[tier]
            const isCurrent = tier === currentTier
            return (
              <DropdownMenu.Item
                key={tier}
                onSelect={() => setTier(tier)}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold outline-none transition-all"
                style={{
                  color:      isCurrent ? cfg.color : 'rgba(255,255,255,0.55)',
                  background: isCurrent ? cfg.bg    : 'transparent',
                }}
                onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {tier === 'unlimited' && <Crown size={11} style={{ color: cfg.color }} />}
                {tier === 'pro'       && <Zap   size={11} style={{ color: cfg.color }} />}
                {tier === 'free'      && <div   style={{ width: 11 }} />}
                <span style={{ color: cfg.color }}>{cfg.label}</span>
                {isCurrent && <Check size={10} style={{ marginInlineStart: 'auto', color: cfg.color }} />}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
  color: string
  glowColor: string
  icon: React.ReactNode
  delay?: number
}

function KpiCard({ label, value, sub, color, glowColor, icon, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' as const }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg, ${glowColor}18 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${glowColor}28`,
        boxShadow: `0 0 40px ${glowColor}0a, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Background glow blob */}
      <div
        className="pointer-events-none absolute -top-8 -end-8 h-24 w-24 rounded-full"
        style={{ background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {label}
          </p>
          <p className="mt-2 text-[2rem] font-black tabular-nums leading-none" style={{ color }}>
            {value}
          </p>
          <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</p>
        </div>
        <div
          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
          style={{
            background: `${glowColor}18`,
            border: `1px solid ${glowColor}30`,
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile User Card ─────────────────────────────────────────────────────────

function MobileUserCard({ user, onTierChange }: { user: AdminUser; onTierChange: (id: string, tier: Tier) => void }) {
  const cfg      = TIER_CONFIG[user.plan_tier]
  const initials = getInitials(user.email, user.full_name)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: `linear-gradient(135deg, ${cfg.gradientFrom} 0%, ${cfg.gradientTo} 100%)`,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow !== 'none' ? `${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Top row: avatar + email + tier */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[11px] font-black"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, boxShadow: cfg.glow }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            {user.full_name && (
              <p className="text-[12px] font-bold text-white truncate">{user.full_name}</p>
            )}
            <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
          </div>
        </div>
        <TierBadge tier={user.plan_tier} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Joined',     value: fmtDate(user.created_at).replace(' 2026','') },
          { label: 'Proposals',  value: String(user.proposal_count) },
          { label: 'Pipeline',   value: fmtPipeline(user.total_pipeline_value) },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl px-2.5 py-2 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
            <p className="mt-0.5 text-[12px] font-bold text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <TierDropdown userId={user.id} currentTier={user.plan_tier} onSuccess={onTierChange} />
      </div>
    </motion.div>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { signOut }   = useAuthStore()
  const [users,       setUsers]       = useState<AdminUser[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [refreshing,  setRefreshing]  = useState(false)
  const [search,      setSearch]      = useState('')

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('get_admin_users_data')
      if (rpcError) throw rpcError
      setUsers((data as AdminUser[]) ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleTierChange = useCallback((userId: string, tier: Tier) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan_tier: tier } : u))
  }, [])

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const totalUsers       = users.length
  const proUsers         = users.filter(u => u.plan_tier === 'pro').length
  const unlimitedUsers   = users.filter(u => u.plan_tier === 'unlimited').length
  const totalProposals   = users.reduce((s, u) => s + u.proposal_count, 0)
  const totalPipeline    = users.reduce((s, u) => s + u.total_pipeline_value, 0)

  const filtered = search.trim()
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : users

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#030305', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg) } }
        .adm-spin { animation: adm-spin 0.9s linear infinite }
        .adm-row { transition: background 0.15s ease }
        .adm-row:hover { background: rgba(255,255,255,0.025) }
        .adm-scroll::-webkit-scrollbar { height: 3px }
        .adm-scroll::-webkit-scrollbar-track { background: transparent }
        .adm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px }
      `}</style>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4"
        style={{
          background: 'rgba(3,3,5,0.88)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))',
              border: '1px solid rgba(239,68,68,0.35)',
              boxShadow: '0 0 16px rgba(239,68,68,0.15)',
            }}
          >
            <Shield size={13} style={{ color: '#fca5a5' }} />
          </div>
          <div>
            <p className="text-[13px] font-black tracking-tight text-white">DealSpace Admin</p>
            <p className="text-[10px] font-semibold" style={{ color: 'rgba(252,165,165,0.7)' }}>
              Restricted Access — Founder Only
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            <RefreshCw size={11} className={refreshing ? 'adm-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'rgba(252,165,165,0.75)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          >
            <LogOut size={11} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">

        {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            label="Total Users"
            value={totalUsers}
            sub="registered accounts"
            color="white"
            glowColor="#ffffff"
            icon={<Users size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />}
            delay={0}
          />
          <KpiCard
            label="Unlimited"
            value={unlimitedUsers}
            sub="gold tier"
            color="#fbbf24"
            glowColor="#d4af37"
            icon={<Crown size={14} style={{ color: '#fbbf24' }} />}
            delay={0.05}
          />
          <KpiCard
            label="Pro"
            value={proUsers}
            sub="indigo tier"
            color="#a5b4fc"
            glowColor="#6366f1"
            icon={<Zap size={14} style={{ color: '#a5b4fc' }} />}
            delay={0.1}
          />
          <KpiCard
            label="Proposals"
            value={totalProposals}
            sub="across all users"
            color="#34d399"
            glowColor="#10b981"
            icon={<BarChart3 size={14} style={{ color: '#34d399' }} />}
            delay={0.15}
          />
          <div className="col-span-2 sm:col-span-1">
            <KpiCard
              label="Platform Pipeline"
              value={fmtPipeline(totalPipeline)}
              sub="total base price"
              color="#fb923c"
              glowColor="#f97316"
              icon={<TrendingUp size={14} style={{ color: '#fb923c' }} />}
              delay={0.2}
            />
          </div>
        </div>

        {/* ── User Registry panel ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' as const }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2.5">
              <Users size={13} style={{ color: '#818cf8' }} />
              <p className="text-[13px] font-bold text-white">User Registry</p>
              {!loading && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  {filtered.length}
                </span>
              )}
            </div>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="rounded-xl px-3 py-1.5 text-[12px] outline-none transition-all"
              style={{
                width: 180,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.75)',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.45)'
                e.currentTarget.style.background = 'rgba(99,102,241,0.07)'
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
            />
          </div>

          {/* ── Loading ──────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid rgba(99,102,241,0.2)',
                  borderTopColor: '#818cf8',
                  animation: 'adm-spin 0.9s linear infinite',
                }}
              />
            </div>

          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertTriangle size={20} style={{ color: '#f87171' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#f87171' }}>{error}</p>
              <button
                type="button"
                onClick={() => fetchUsers()}
                className="rounded-xl px-4 py-2 text-[12px] font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                Retry
              </button>
            </div>

          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <Users size={28} style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {search ? 'No users match your search' : 'No users registered yet'}
              </p>
            </div>

          ) : (
            <>
              {/* ── Mobile: Card Stack ──────────────────────────────────────── */}
              <div className="block md:hidden p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {filtered.map(user => (
                    <MobileUserCard key={user.id} user={user} onTierChange={handleTierChange} />
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Desktop: Table ──────────────────────────────────────────── */}
              <div className="adm-scroll hidden md:block overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['User', 'Joined', 'Last Active', 'Proposals', 'Pipeline', 'Tier', 'Actions'].map(col => (
                        <th
                          key={col}
                          className="px-6 py-3 text-start text-[10px] font-black uppercase tracking-widest"
                          style={{ color: 'rgba(255,255,255,0.22)' }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {filtered.map((user, idx) => {
                        const cfg      = TIER_CONFIG[user.plan_tier]
                        const initials = getInitials(user.email, user.full_name)
                        return (
                          <motion.tr
                            key={user.id}
                            className="adm-row"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.04, ease: 'easeOut' as const }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          >
                            {/* User */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-[10px] font-black"
                                  style={{
                                    background: cfg.bg,
                                    border: `1px solid ${cfg.border}`,
                                    color: cfg.color,
                                    boxShadow: cfg.glow,
                                  }}
                                >
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  {user.full_name && (
                                    <p className="text-[12px] font-semibold text-white truncate">{user.full_name}</p>
                                  )}
                                  <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Joined */}
                            <td className="px-6 py-4">
                              <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                {fmtDate(user.created_at)}
                              </span>
                            </td>

                            {/* Last Active */}
                            <td className="px-6 py-4">
                              <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {user.last_sign_in_at ? fmtDate(user.last_sign_in_at) : '—'}
                              </span>
                            </td>

                            {/* Proposals */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-1 rounded-full"
                                  style={{
                                    width: Math.max(Math.min(user.proposal_count * 10, 52), 4),
                                    background: user.proposal_count > 0
                                      ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                                      : 'rgba(255,255,255,0.08)',
                                  }}
                                />
                                <span
                                  className="text-[12px] font-bold tabular-nums"
                                  style={{ color: 'rgba(255,255,255,0.6)' }}
                                >
                                  {user.proposal_count}
                                </span>
                              </div>
                            </td>

                            {/* Pipeline */}
                            <td className="px-6 py-4">
                              <span
                                className="text-[12px] font-bold tabular-nums"
                                style={{ color: user.total_pipeline_value > 0 ? '#fb923c' : 'rgba(255,255,255,0.2)' }}
                              >
                                {fmtPipeline(user.total_pipeline_value)}
                              </span>
                            </td>

                            {/* Tier */}
                            <td className="px-6 py-4">
                              <TierBadge tier={user.plan_tier} />
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <TierDropdown
                                userId={user.id}
                                currentTier={user.plan_tier}
                                onSuccess={handleTierChange}
                              />
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

        {/* Footer */}
        <p className="pb-4 text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
          Tier changes take effect immediately — server-authoritative, client cannot spoof.
        </p>
      </main>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, Crown, Zap, RefreshCw, ChevronDown,
  AlertTriangle, Check, Loader2, LogOut, BarChart3,
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
}

type Tier = 'free' | 'pro' | 'unlimited'

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; border: string; glow: string }> = {
  free: {
    label: 'Free',
    color: 'rgba(255,255,255,0.4)',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    glow: 'none',
  },
  pro: {
    label: 'Pro',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.35)',
    glow: '0 0 12px rgba(99,102,241,0.25)',
  },
  unlimited: {
    label: 'Unlimited',
    color: '#d4af37',
    bg: 'rgba(212,175,55,0.1)',
    border: 'rgba(212,175,55,0.35)',
    glow: '0 0 14px rgba(212,175,55,0.2)',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(email: string, name: string): string {
  if (name) {
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
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase"
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {tier === 'unlimited' && <Crown size={9} />}
      {tier === 'pro' && <Zap size={9} />}
      {cfg.label}
    </span>
  )
}

// ─── TierDropdown ─────────────────────────────────────────────────────────────

interface TierDropdownProps {
  userId: string
  currentTier: Tier
  onSuccess: (userId: string, tier: Tier) => void
}

function TierDropdown({ userId, currentTier, onSuccess }: TierDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const setTier = useCallback(async (tier: Tier) => {
    if (tier === currentTier) { setOpen(false); return }
    setLoading(true)
    setError(null)
    try {
      const { error: rpcError } = await supabase.rpc('admin_set_user_tier', {
        p_target_user_id: userId,
        p_new_tier: tier,
      })
      if (rpcError) throw rpcError
      setDone(true)
      setTimeout(() => setDone(false), 1800)
      onSuccess(userId, tier)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }, [userId, currentTier, onSuccess])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.65)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      >
        {loading ? (
          <Loader2 size={11} className="animate-spin" />
        ) : done ? (
          <Check size={11} style={{ color: '#22c55e' }} />
        ) : error ? (
          <AlertTriangle size={11} style={{ color: '#f87171' }} />
        ) : null}
        Set Tier
        <ChevronDown size={11} style={{ opacity: 0.5 }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12, ease: 'easeOut' as const }}
              className="absolute end-0 z-50 mt-1.5 min-w-[130px] rounded-xl overflow-hidden"
              style={{
                background: 'rgba(10,10,20,0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {(['free', 'pro', 'unlimited'] as Tier[]).map((tier) => {
                const cfg = TIER_CONFIG[tier]
                const isCurrent = tier === currentTier
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTier(tier)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[12px] font-semibold transition-colors"
                    style={{
                      color: isCurrent ? cfg.color : 'rgba(255,255,255,0.55)',
                      background: isCurrent ? cfg.bg : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
                  >
                    {tier === 'unlimited' && <Crown size={11} style={{ color: cfg.color }} />}
                    {tier === 'pro' && <Zap size={11} style={{ color: cfg.color }} />}
                    {tier === 'free' && <div style={{ width: 11, height: 11 }} />}
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                    {isCurrent && <Check size={10} style={{ marginInlineStart: 'auto', color: cfg.color }} />}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tabular-nums" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</p>
      )}
    </div>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { signOut } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

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

  // ── Computed KPIs ─────────────────────────────────────────────────────────
  const totalUsers     = users.length
  const proUsers       = users.filter(u => u.plan_tier === 'pro').length
  const unlimitedUsers = users.filter(u => u.plan_tier === 'unlimited').length
  const totalProposals = users.reduce((s, u) => s + u.proposal_count, 0)

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = search.trim()
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : users

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: '#030305', fontFamily: "'Outfit', sans-serif" }}
    >
      <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg) } }
        @keyframes adm-fade { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .adm-row { animation: adm-fade 0.22s ease both }
        .adm-table-scroll::-webkit-scrollbar { height: 4px }
        .adm-table-scroll::-webkit-scrollbar-track { background: transparent }
        .adm-table-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(3,3,5,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <Shield size={14} style={{ color: '#f87171' }} />
          </div>
          <div>
            <p className="text-[13px] font-black text-white tracking-tight">DealSpace Admin</p>
            <p className="text-[10px]" style={{ color: 'rgba(239,68,68,0.7)' }}>Restricted Access — Founder Only</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            <RefreshCw size={11} style={{ animation: refreshing ? 'adm-spin 0.9s linear infinite' : 'none' }} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.18)',
              color: 'rgba(239,68,68,0.65)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          >
            <LogOut size={11} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* ── KPIs ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total Users"      value={totalUsers}     sub="registered accounts"  color="white" />
          <KpiCard label="Unlimited"        value={unlimitedUsers} sub="gold tier"             color="#d4af37" />
          <KpiCard label="Pro"              value={proUsers}       sub="indigo tier"           color="#818cf8" />
          <KpiCard label="Total Proposals"  value={totalProposals} sub="across all users"      color="#34d399" />
        </div>

        {/* ── Table panel ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.012) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2.5">
              <Users size={14} style={{ color: '#818cf8' }} />
              <p className="text-[13px] font-bold text-white">User Registry</p>
              {!loading && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  {filtered.length}
                </span>
              )}
            </div>

            {/* Search */}
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
                color: 'rgba(255,255,255,0.7)',
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            />
          </div>

          {/* ── States ─────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'adm-spin 0.9s linear infinite' }} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
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
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <BarChart3 size={28} style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {search ? 'No users match your search' : 'No users registered yet'}
              </p>
            </div>
          ) : (
            // ── Table ──────────────────────────────────────────────────────
            <div className="adm-table-scroll overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['User', 'Joined', 'Last Active', 'Proposals', 'Tier', 'Actions'].map(col => (
                      <th
                        key={col}
                        className="px-6 py-3 text-start text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map((user, idx) => {
                      const initials = getInitials(user.email, user.full_name)
                      const tierCfg  = TIER_CONFIG[user.plan_tier]

                      return (
                        <motion.tr
                          key={user.id}
                          className="adm-row group"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            animationDelay: `${idx * 0.03}s`,
                          }}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                        >
                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-[11px] font-black"
                                style={{
                                  background: tierCfg.bg,
                                  border: `1px solid ${tierCfg.border}`,
                                  color: tierCfg.color,
                                  boxShadow: tierCfg.glow,
                                }}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                {user.full_name && (
                                  <p className="text-[12px] font-semibold text-white truncate">{user.full_name}</p>
                                )}
                                <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Joined */}
                          <td className="px-6 py-4">
                            <span className="text-[12px] tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              {fmtDate(user.created_at)}
                            </span>
                          </td>

                          {/* Last Active */}
                          <td className="px-6 py-4">
                            <span className="text-[12px] tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {user.last_sign_in_at ? fmtDate(user.last_sign_in_at) : '—'}
                            </span>
                          </td>

                          {/* Proposals */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: Math.min(user.proposal_count * 8, 48),
                                  background: user.proposal_count > 0
                                    ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                                    : 'rgba(255,255,255,0.1)',
                                  minWidth: 4,
                                }}
                              />
                              <span className="text-[12px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                {user.proposal_count}
                              </span>
                            </div>
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
          )}
        </div>

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          All tier changes take effect immediately via Supabase RPC. Server-authoritative — client cannot spoof.
        </p>
      </main>
    </div>
  )
}

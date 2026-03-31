import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Shield, Users, Crown, Zap, RefreshCw,
  AlertTriangle, Check, Loader2, LogOut, BarChart3, TrendingUp,
  MoreHorizontal, Trash2, Pencil, Ghost, ChevronRight, X,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../lib/i18n'

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

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<Tier, {
  label_en: string; label_he: string
  color: string; bg: string; border: string; glow: string
  gradientFrom: string; gradientTo: string
}> = {
  free: {
    label_en: 'Free',    label_he: 'חינם',
    color: 'rgba(255,255,255,0.5)',
    bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', glow: 'none',
    gradientFrom: 'rgba(255,255,255,0.04)', gradientTo: 'rgba(255,255,255,0.01)',
  },
  pro: {
    label_en: 'Pro',     label_he: 'פרו',
    color: '#a5b4fc',
    bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.4)', glow: '0 0 16px rgba(99,102,241,0.3)',
    gradientFrom: 'rgba(99,102,241,0.12)', gradientTo: 'rgba(99,102,241,0.03)',
  },
  unlimited: {
    label_en: 'Unlimited', label_he: 'ללא הגבלה',
    color: '#fbbf24',
    bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.4)', glow: '0 0 18px rgba(212,175,55,0.25)',
    gradientFrom: 'rgba(212,175,55,0.1)', gradientTo: 'rgba(212,175,55,0.02)',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtPipeline(value: number): string {
  if (value === 0)            return '—'
  if (value >= 1_000_000)     return `₪${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)         return `₪${Math.round(value / 1_000)}K`
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

// ─── Shared dropdown content style ───────────────────────────────────────────

const MENU_CONTENT_STYLE: React.CSSProperties = {
  background: 'rgba(8,8,18,0.98)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.92), 0 4px 16px rgba(0,0,0,0.6)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  borderRadius: '1rem',
  padding: '6px',
  minWidth: 180,
  zIndex: 9999,
}

// ─── TierBadge ────────────────────────────────────────────────────────────────

function TierBadge({ tier, isHe }: { tier: Tier; isHe: boolean }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}
    >
      {tier === 'unlimited' && <Crown size={9} />}
      {tier === 'pro'       && <Zap   size={9} />}
      {isHe ? cfg.label_he : cfg.label_en}
    </span>
  )
}

// ─── EditUserModal ─────────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: AdminUser | null
  isHe: boolean
  onClose: () => void
  onSaved: (userId: string, name: string) => void
}

function EditUserModal({ user, isHe, onClose, onSaved }: EditUserModalProps) {
  const [name,    setName]    = useState(user?.full_name ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // reset when user changes
  useEffect(() => {
    setName(user?.full_name ?? '')
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [user])

  const handleSave = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { error: rpcError } = await supabase.rpc('admin_update_user_profile', {
        p_target_user_id: user.id,
        p_full_name: name.trim(),
      })
      if (rpcError) throw rpcError
      onSaved(user.id, name.trim())
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [user, name, onSaved, onClose])

  const open = !!user

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) onClose() }}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-[10000]"
                  style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, y: 32, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: 'easeOut' as const }}
                  className="fixed z-[10001] w-full outline-none"
                  style={{ maxWidth: 420, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  dir={isHe ? 'rtl' : 'ltr'}
                >
                  <div
                    className="rounded-2xl p-6 space-y-5"
                    style={{
                      background: 'rgba(8,8,18,0.99)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
                        >
                          <Pencil size={12} style={{ color: '#a5b4fc' }} />
                        </div>
                        <p className="text-[14px] font-bold text-white">
                          {isHe ? 'עריכת משתמש' : 'Edit User'}
                        </p>
                      </div>
                      <button type="button" onClick={onClose} className="rounded-lg p-1.5 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }} onMouseEnter={e=>{e.currentTarget.style.color='rgba(255,255,255,0.7)'}} onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.3)'}}>
                        <X size={14} />
                      </button>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {isHe ? 'אימייל' : 'Email'}
                      </label>
                      <p className="rounded-xl px-4 py-3 text-[13px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                        {user?.email}
                      </p>
                    </div>

                    {/* Full name */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {isHe ? 'שם מלא' : 'Full Name'}
                      </label>
                      <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                        placeholder={isHe ? 'הכנס שם...' : 'Enter name…'}
                        className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-all"
                        style={{
                          background: '#0a0a0a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                        }}
                        onFocus={e => { e.currentTarget.style.border='1px solid rgba(99,102,241,0.5)'; e.currentTarget.style.background='#0f0f1a' }}
                        onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='#0a0a0a' }}
                      />
                    </div>

                    {error && (
                      <p className="text-[12px] font-semibold" style={{ color: '#f87171' }}>{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)'}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'}}>
                        {isHe ? 'ביטול' : 'Cancel'}
                      </button>
                      <button type="button" onClick={handleSave} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', opacity: loading ? 0.7 : 1 }}>
                        {loading && <Loader2 size={13} className="animate-spin" />}
                        {isHe ? 'שמור' : 'Save'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── PowerDropdown ─────────────────────────────────────────────────────────────

interface PowerDropdownProps {
  user: AdminUser
  isHe: boolean
  onTierChange: (userId: string, tier: Tier) => void
  onEditOpen:  (user: AdminUser) => void
  onDeleted:   (userId: string) => void
  trigger?: React.ReactNode
}

function PowerDropdown({ user, isHe, onTierChange, onEditOpen, onDeleted, trigger }: PowerDropdownProps) {
  const [tierLoading, setTierLoading] = useState(false)
  const [deleting,    setDeleting]    = useState(false)

  const setTier = useCallback(async (tier: Tier) => {
    if (tier === user.plan_tier) return
    setTierLoading(true)
    try {
      const { error } = await supabase.rpc('admin_set_user_tier', { p_target_user_id: user.id, p_new_tier: tier })
      if (error) throw error
      onTierChange(user.id, tier)
    } finally {
      setTierLoading(false)
    }
  }, [user, onTierChange])

  const handleDelete = useCallback(async () => {
    const msg = isHe
      ? `האם אתה בטוח? פעולה זו תמחק את המשתמש ${user.email} וכל הצעותיו לנצח.`
      : `Are you sure? This permanently deletes ${user.email} and all their proposals. This cannot be undone.`
    if (!window.confirm(msg)) return
    setDeleting(true)
    try {
      const { error } = await supabase.rpc('admin_delete_user', { p_target_user_id: user.id })
      if (error) throw error
      onDeleted(user.id)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }, [user, isHe, onDeleted])

  const handleImpersonate = useCallback(() => {
    navigator.clipboard.writeText(user.email).catch(() => {})
    alert(
      isHe
        ? `האימייל ${user.email} הועתק. התחזות למשתמש דורשת Edge Function עם Service Role (בתכנון).`
        : `Copied ${user.email}. Full impersonation requires a Service Role Edge Function (planned).`
    )
  }, [user.email, isHe])

  const itemClass = 'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold outline-none transition-colors select-none'
  const itemStyle = { color: 'rgba(255,255,255,0.65)', background: 'transparent' }
  const itemHover = (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }
  const itemLeave = (e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }

  const defaultTrigger = (
    <button
      type="button"
      disabled={deleting}
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
    >
      {deleting || tierLoading
        ? <Loader2 size={11} className="animate-spin" />
        : <MoreHorizontal size={11} />}
      <span className="hidden sm:inline">{isHe ? 'פעולות' : 'Actions'}</span>
    </button>
  )

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? defaultTrigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="end"
          style={{ ...MENU_CONTENT_STYLE, zIndex: 9999 }}
        >
          {/* ── Change Tier submenu ───────────────────────────────────────── */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger
              className={itemClass}
              style={itemStyle}
              onMouseEnter={itemHover}
              onMouseLeave={itemLeave}
            >
              <Crown size={12} style={{ color: '#fbbf24' }} />
              <span className="flex-1">{isHe ? 'שנה חבילה' : 'Change Tier'}</span>
              <ChevronRight size={10} style={{ opacity: 0.4, marginInlineStart: 'auto' }} />
            </DropdownMenu.SubTrigger>

            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                sideOffset={4}
                style={{ ...MENU_CONTENT_STYLE, minWidth: 150, zIndex: 10000 }}
              >
                {(['free', 'pro', 'unlimited'] as Tier[]).map(tier => {
                  const cfg       = TIER_CONFIG[tier]
                  const isCurrent = tier === user.plan_tier
                  return (
                    <DropdownMenu.Item
                      key={tier}
                      onSelect={() => setTier(tier)}
                      className={itemClass}
                      style={{ color: cfg.color, background: isCurrent ? cfg.bg : 'transparent' }}
                      onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      {tier === 'unlimited' && <Crown size={11} style={{ color: cfg.color }} />}
                      {tier === 'pro'       && <Zap   size={11} style={{ color: cfg.color }} />}
                      {tier === 'free'      && <div   style={{ width: 11 }} />}
                      <span style={{ color: cfg.color }}>{isHe ? cfg.label_he : cfg.label_en}</span>
                      {isCurrent && <Check size={10} style={{ marginInlineStart: 'auto', color: cfg.color }} />}
                    </DropdownMenu.Item>
                  )
                })}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          {/* ── Edit ─────────────────────────────────────────────────────── */}
          <DropdownMenu.Item
            onSelect={() => onEditOpen(user)}
            className={itemClass}
            style={itemStyle}
            onMouseEnter={itemHover}
            onMouseLeave={itemLeave}
          >
            <Pencil size={12} style={{ color: '#818cf8' }} />
            {isHe ? 'ערוך משתמש' : 'Edit User'}
          </DropdownMenu.Item>

          {/* ── Impersonate ───────────────────────────────────────────────── */}
          <DropdownMenu.Item
            onSelect={handleImpersonate}
            className={itemClass}
            style={itemStyle}
            onMouseEnter={itemHover}
            onMouseLeave={itemLeave}
          >
            <Ghost size={12} style={{ color: '#34d399' }} />
            {isHe ? 'כניסה כמשתמש' : 'Impersonate'}
          </DropdownMenu.Item>

          <DropdownMenu.Separator style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />

          {/* ── Delete ───────────────────────────────────────────────────── */}
          <DropdownMenu.Item
            onSelect={handleDelete}
            className={itemClass}
            style={{ color: 'rgba(248,113,113,0.8)', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#f87171' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.8)' }}
          >
            <Trash2 size={12} />
            {isHe ? 'מחק משתמש' : 'Delete User'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, glowColor, icon, delay = 0 }: {
  label: string; value: string | number; sub: string
  color: string; glowColor: string; icon: React.ReactNode; delay?: number
}) {
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
      <div className="pointer-events-none absolute -top-8 -end-8 h-24 w-24 rounded-full"
        style={{ background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
          <p className="mt-2 text-[2rem] font-black tabular-nums leading-none" style={{ color }}>{value}</p>
          <p className="mt-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</p>
        </div>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
          style={{ background: `${glowColor}18`, border: `1px solid ${glowColor}30` }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile User Card ─────────────────────────────────────────────────────────

function MobileUserCard({ user, isHe, onTierChange, onEditOpen, onDeleted }: {
  user: AdminUser; isHe: boolean
  onTierChange: (id: string, tier: Tier) => void
  onEditOpen:   (u: AdminUser) => void
  onDeleted:    (id: string) => void
}) {
  const cfg      = TIER_CONFIG[user.plan_tier]
  const initials = getInitials(user.email, user.full_name)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: `linear-gradient(135deg, ${cfg.gradientFrom} 0%, ${cfg.gradientTo} 100%)`,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow !== 'none' ? `${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[11px] font-black"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, boxShadow: cfg.glow }}>
            {initials}
          </div>
          <div className="min-w-0">
            {user.full_name && <p className="text-[12px] font-bold text-white truncate">{user.full_name}</p>}
            <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <TierBadge tier={user.plan_tier} isHe={isHe} />
          <PowerDropdown
            user={user} isHe={isHe}
            onTierChange={onTierChange} onEditOpen={onEditOpen} onDeleted={onDeleted}
            trigger={
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-xl outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)' }}>
                <MoreHorizontal size={13} />
              </button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: isHe ? 'הצטרף'     : 'Joined',    value: fmtDate(user.created_at).replace(' 2026','') },
          { label: isHe ? 'הצעות'      : 'Proposals', value: String(user.proposal_count) },
          { label: isHe ? 'צפי הכנסות' : 'Pipeline',  value: fmtPipeline(user.total_pipeline_value) },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl px-2.5 py-2 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
            <p className="mt-0.5 text-[12px] font-bold text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { signOut }       = useAuthStore()
  const { locale }        = useI18n()
  const isHe              = locale === 'he'

  const [users,       setUsers]      = useState<AdminUser[]>([])
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState<string | null>(null)
  const [refreshing,  setRefreshing] = useState(false)
  const [search,      setSearch]     = useState('')
  const [editTarget,  setEditTarget] = useState<AdminUser | null>(null)

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

  const handleTierChange = useCallback((userId: string, tier: Tier) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan_tier: tier } : u))
  }, [])

  const handleNameSaved = useCallback((userId: string, name: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, full_name: name } : u))
  }, [])

  const handleDeleted = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  // KPIs
  const totalUsers     = users.length
  const proUsers       = users.filter(u => u.plan_tier === 'pro').length
  const unlimitedUsers = users.filter(u => u.plan_tier === 'unlimited').length
  const totalProposals = users.reduce((s, u) => s + u.proposal_count, 0)
  const totalPipeline  = users.reduce((s, u) => s + u.total_pipeline_value, 0)

  const filtered = search.trim()
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : users

  // ── i18n strings ────────────────────────────────────────────────────────────
  const L = {
    title:         isHe ? 'מנהל DealSpace'             : 'DealSpace Admin',
    restricted:    isHe ? 'גישה מוגבלת — מייסד בלבד'  : 'Restricted Access — Founder Only',
    refresh:       isHe ? 'רענן'                        : 'Refresh',
    signOut:       isHe ? 'יציאה'                       : 'Sign Out',
    kpiUsers:      isHe ? 'סה״כ משתמשים'               : 'Total Users',
    kpiAccounts:   isHe ? 'חשבונות רשומים'             : 'registered accounts',
    kpiUnlimited:  isHe ? 'ללא הגבלה'                  : 'Unlimited',
    kpiGold:       isHe ? 'חבילת זהב'                  : 'gold tier',
    kpiPro:        isHe ? 'פרו'                         : 'Pro',
    kpiIndigo:     isHe ? 'חבילת אינדיגו'              : 'indigo tier',
    kpiProposals:  isHe ? 'הצעות מחיר'                 : 'Proposals',
    kpiAllUsers:   isHe ? 'בין כל המשתמשים'            : 'across all users',
    kpiPipeline:   isHe ? 'צפי הכנסות פלטפורמה'        : 'Platform Pipeline',
    kpiBasePrice:  isHe ? 'סה״כ מחיר בסיס'            : 'total base price',
    registry:      isHe ? 'רשימת משתמשים'              : 'User Registry',
    search:        isHe ? '...חיפוש משתמשים'           : 'Search users…',
    noMatch:       isHe ? 'לא נמצאו משתמשים'           : 'No users match your search',
    noUsers:       isHe ? 'עדיין אין משתמשים'          : 'No users registered yet',
    colUser:       isHe ? 'משתמש'                       : 'User',
    colJoined:     isHe ? 'הצטרף'                       : 'Joined',
    colActive:     isHe ? 'פעילות אחרונה'              : 'Last Active',
    colProposals:  isHe ? 'הצעות'                       : 'Proposals',
    colPipeline:   isHe ? 'צפי הכנסות'                 : 'Pipeline',
    colTier:       isHe ? 'חבילה'                       : 'Tier',
    colActions:    isHe ? 'פעולות'                      : 'Actions',
    footer:        isHe ? 'שינויי חבילה נכנסים לתוקף מיד — לא ניתן לזייף בצד הלקוח.' : 'Tier changes take effect immediately — server-authoritative, client cannot spoof.',
    retry:         isHe ? 'נסה שוב'                    : 'Retry',
  }

  return (
    <div className="min-h-screen" style={{ background: '#030305', fontFamily: "'Outfit', sans-serif" }} dir={isHe ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg) } }
        .adm-spin { animation: adm-spin 0.9s linear infinite }
        .adm-row { transition: background 0.15s ease }
        .adm-row:hover { background: rgba(255,255,255,0.025) }
        .adm-scroll::-webkit-scrollbar { height: 3px }
        .adm-scroll::-webkit-scrollbar-track { background: transparent }
        .adm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px }
      `}</style>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <EditUserModal
        user={editTarget}
        isHe={isHe}
        onClose={() => setEditTarget(null)}
        onSaved={handleNameSaved}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4"
        style={{
          background: 'rgba(3,3,5,0.88)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 0 16px rgba(239,68,68,0.15)' }}>
            <Shield size={13} style={{ color: '#fca5a5' }} />
          </div>
          <div>
            <p className="text-[13px] font-black tracking-tight text-white">{L.title}</p>
            <p className="text-[10px] font-semibold" style={{ color: 'rgba(252,165,165,0.7)' }}>{L.restricted}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fetchUsers(true)} disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)'}}>
            <RefreshCw size={11} className={refreshing ? 'adm-spin' : ''} />
            <span className="hidden sm:inline">{L.refresh}</span>
          </button>

          <button type="button" onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(252,165,165,0.75)' }}
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
          <KpiCard label={L.kpiUsers}     value={totalUsers}     sub={L.kpiAccounts}  color="white"    glowColor="#ffffff" icon={<Users      size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />} delay={0}    />
          <KpiCard label={L.kpiUnlimited} value={unlimitedUsers} sub={L.kpiGold}      color="#fbbf24"  glowColor="#d4af37" icon={<Crown      size={14} style={{ color: '#fbbf24' }} />}              delay={0.05} />
          <KpiCard label={L.kpiPro}       value={proUsers}       sub={L.kpiIndigo}    color="#a5b4fc"  glowColor="#6366f1" icon={<Zap        size={14} style={{ color: '#a5b4fc' }} />}              delay={0.1}  />
          <KpiCard label={L.kpiProposals} value={totalProposals} sub={L.kpiAllUsers}  color="#34d399"  glowColor="#10b981" icon={<BarChart3  size={14} style={{ color: '#34d399' }} />}              delay={0.15} />
          <div className="col-span-2 sm:col-span-1">
            <KpiCard label={L.kpiPipeline} value={fmtPipeline(totalPipeline)} sub={L.kpiBasePrice} color="#fb923c" glowColor="#f97316" icon={<TrendingUp size={14} style={{ color: '#fb923c' }} />} delay={0.2} />
          </div>
        </div>

        {/* ── Registry panel ────────────────────────────────────────────────── */}
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
              <p className="text-[13px] font-bold text-white">{L.registry}</p>
              {!loading && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                  {filtered.length}
                </span>
              )}
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={L.search}
              className="rounded-xl px-3 py-1.5 text-[12px] outline-none transition-all"
              style={{ width: 190, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
              onFocus={e => { e.currentTarget.style.border='1px solid rgba(99,102,241,0.45)'; e.currentTarget.style.background='rgba(99,102,241,0.07)' }}
              onBlur={e  => { e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
            />
          </div>

          {/* States */}
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
              <p className="text-sm font-semibold" style={{ color:'rgba(255,255,255,0.25)' }}>
                {search ? L.noMatch : L.noUsers}
              </p>
            </div>
          ) : (
            <>
              {/* ── Mobile: Card Stack ──────────────────────────────────────── */}
              <div className="block md:hidden p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {filtered.map(user => (
                    <MobileUserCard
                      key={user.id} user={user} isHe={isHe}
                      onTierChange={handleTierChange}
                      onEditOpen={u => setEditTarget(u)}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Desktop: Table ──────────────────────────────────────────── */}
              <div className="adm-scroll hidden md:block overflow-x-auto">
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:860 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      {[L.colUser, L.colJoined, L.colActive, L.colProposals, L.colPipeline, L.colTier, L.colActions].map(col => (
                        <th key={col} className="px-6 py-3 text-start text-[10px] font-black uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.22)' }}>
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
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.03, ease: 'easeOut' as const }}
                            style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                          >
                            {/* User */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-[10px] font-black"
                                  style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, boxShadow:cfg.glow }}>
                                  {initials}
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
                            {/* Last Active */}
                            <td className="px-6 py-4">
                              <span className="text-[11px] tabular-nums" style={{ color:'rgba(255,255,255,0.3)' }}>
                                {user.last_sign_in_at ? fmtDate(user.last_sign_in_at) : '—'}
                              </span>
                            </td>
                            {/* Proposals */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1 rounded-full" style={{ width:Math.max(Math.min(user.proposal_count*10,52),4), background:user.proposal_count>0?'linear-gradient(90deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.08)' }} />
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
                            {/* Tier */}
                            <td className="px-6 py-4">
                              <TierBadge tier={user.plan_tier} isHe={isHe} />
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4">
                              <PowerDropdown
                                user={user} isHe={isHe}
                                onTierChange={handleTierChange}
                                onEditOpen={u => setEditTarget(u)}
                                onDeleted={handleDeleted}
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
        <p className="pb-4 text-center text-[10px]" style={{ color:'rgba(255,255,255,0.12)' }}>
          {L.footer}
        </p>
      </main>
    </div>
  )
}
